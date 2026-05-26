#!/usr/bin/env node
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const pubmedTool = path.join(repoRoot, 'tools/enrich_pubmed.mjs');
const europePmcTool = path.join(repoRoot, 'tools/enrich_europepmc.mjs');
const checks = [];

async function main() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'refscilink-enrich-'));
  const refsPath = path.join(tempDir, 'data/reference_bibliographique/json/references.json');
  const fixtureDir = path.join(tempDir, 'fixtures');
  await fs.mkdir(path.dirname(refsPath), { recursive: true });
  await fs.mkdir(fixtureDir, { recursive: true });
  await fs.writeFile(refsPath, `${JSON.stringify(createReferencesFixture(), null, 2)}\n`, 'utf8');
  await fs.writeFile(path.join(fixtureDir, 'pubmed.json'), `${JSON.stringify(createPubMedFixture(), null, 2)}\n`, 'utf8');
  await fs.writeFile(path.join(fixtureDir, 'europepmc.json'), `${JSON.stringify(createEuropePmcFixture(), null, 2)}\n`, 'utf8');

  const pubmed = await run('node', [pubmedTool, '--file', refsPath, '--fixture', path.join(fixtureDir, 'pubmed.json')], tempDir);
  record('enrich.pubmed.command', pubmed.code === 0 && pubmed.stdout.includes('REFSCILINK_DEFERRED_ENRICHMENT_COMPLETED') ? 'pass' : 'fail', pubmed.stderr || pubmed.stdout);
  const afterPubMed = JSON.parse(await fs.readFile(refsPath, 'utf8'));
  const ref001 = afterPubMed.references.find(reference => reference.id === 'ref001');
  record('enrich.pubmed.fields', ref001.title === 'PubMed title' && ref001.journal === 'PubMed Journal' && ref001.doi === '10.1000/pubmed' ? 'pass' : 'fail', 'PubMed enrichment fills missing bibliographic fields from PMID.');
  record('enrich.pubmed.validation_preserved', ref001.validated === false && ref001.validation_status === 'pending_validation' && ref001.short_summary === 'Keep me' ? 'pass' : 'fail', 'PubMed enrichment preserves validation state and summaries.');
  record('enrich.pubmed.backup', existsSync(path.join(tempDir, 'backup/refscilink')) ? 'pass' : 'fail', 'PubMed enrichment creates a backup before writing.');

  const europe = await run('node', [europePmcTool, '--file', refsPath, '--fixture', path.join(fixtureDir, 'europepmc.json')], tempDir);
  record('enrich.europepmc.command', europe.code === 0 ? 'pass' : 'fail', europe.stderr || europe.stdout);
  const afterEurope = JSON.parse(await fs.readFile(refsPath, 'utf8'));
  const ref002 = afterEurope.references.find(reference => reference.id === 'ref002');
  record('enrich.europepmc.fields', ref002.title === 'Europe PMC title' && ref002.pmcid === 'PMC1234567' && ref002.source_url.includes('europepmc.org') ? 'pass' : 'fail', 'Europe PMC enrichment fills missing metadata from PMCID/PMID/DOI identifiers.');

  const beforeDryRun = await fs.readFile(refsPath, 'utf8');
  const dryRun = await run('node', [europePmcTool, '--file', refsPath, '--fixture', path.join(fixtureDir, 'europepmc.json'), '--dry-run'], tempDir);
  const afterDryRun = await fs.readFile(refsPath, 'utf8');
  record('enrich.dry_run.command', dryRun.code === 0 && dryRun.stdout.includes('REFSCILINK_DRY_RUN_NO_WRITE') ? 'pass' : 'fail', dryRun.stderr || dryRun.stdout);
  record('enrich.dry_run.no_write', beforeDryRun === afterDryRun ? 'pass' : 'fail', 'Dry-run enrichment must not mutate references.json.');

  const offline = await run('node', [pubmedTool, '--file', refsPath, '--offline'], tempDir);
  record('enrich.offline.skip', offline.code === 0 && offline.stdout.includes('REFSCILINK_ENRICHMENT_SKIPPED_OFFLINE') ? 'pass' : 'fail', 'Offline mode skips external enrichment.');

  const noExternal = await run('node', [europePmcTool, '--file', refsPath, '--no-external-api'], tempDir);
  record('enrich.no_external_api.skip', noExternal.code === 0 && noExternal.stdout.includes('REFSCILINK_EXTERNAL_API_SKIPPED') ? 'pass' : 'fail', 'No-external-API mode skips scientific enrichment APIs.');

  const conflictDir = await fs.mkdtemp(path.join(os.tmpdir(), 'refscilink-enrich-conflict-'));
  const conflictRefs = path.join(conflictDir, 'data/reference_bibliographique/json/references.json');
  await fs.mkdir(path.dirname(conflictRefs), { recursive: true });
  await fs.writeFile(conflictRefs, `${JSON.stringify(createReferencesFixture({ conflictingTitle: true }), null, 2)}\n`, 'utf8');
  const conflict = await run('node', [pubmedTool, '--file', conflictRefs, '--fixture', path.join(fixtureDir, 'pubmed.json')], conflictDir);
  const conflictPayload = JSON.parse(await fs.readFile(conflictRefs, 'utf8'));
  record('enrich.conflict.review_required', conflict.code === 0 && conflictPayload.references[0].metadata_status === 'metadata_to_verify' && conflictPayload.references[0].review_notes.includes('metadata conflict') ? 'pass' : 'fail', 'Conflicting metadata is preserved and marked for review.');

  printReport();
}

function createReferencesFixture({ conflictingTitle = false } = {}) {
  return {
    metadata: {
      generated_by: 'RefSciLink Skill',
      module_version: '0.4.0-dev',
      schema_version: '1.0.0',
      generated_at: '2026-05-26T08:00:00.000Z',
      updated_at: '2026-05-26T08:00:00.000Z',
      language: 'fr',
      source_markdown: 'bibliographie.md',
      source_markdown_sha256: '',
      enrichment_mode: 'extract_only',
      reference_count: 2
    },
    references: [
      createReference({ id: 'ref001', number: 1, pmid: '111111', title: conflictingTitle ? 'Existing title' : '', short_summary: 'Keep me' }),
      createReference({ id: 'ref002', number: 2, doi: '10.1000/europe', pmcid: 'PMC1234567' })
    ]
  };
}

function createReference(overrides) {
  return {
    id: '',
    number: 0,
    raw_reference: 'Example reference.',
    title: '',
    authors: [],
    year: '',
    journal: '',
    publisher: '',
    volume: '',
    issue: '',
    pages: '',
    doi: '',
    pmid: '',
    pmcid: '',
    url: '',
    pdf_url: '',
    source_url: '',
    access_type: 'unknown',
    theme: 'unclassified',
    keywords: [],
    short_summary: '',
    detailed_summary: '',
    key_points: [],
    project_relevance: '',
    limitations: '',
    validated: false,
    validation_status: 'pending_validation',
    validated_by: '',
    validation_date: '',
    extraction_status: 'extracted',
    metadata_status: 'not_enriched',
    review_notes: '',
    source_markdown: 'bibliographie.md',
    source_location: {
      line_start: 1,
      line_end: 1,
      section_title: 'Références',
      section_level: 2
    },
    duplicate_of: '',
    duplicate_confidence: '',
    ...overrides
  };
}

function createPubMedFixture() {
  return {
    '111111': {
      title: 'PubMed title',
      authors: ['Curie M', 'Pasteur L'],
      year: '2024',
      journal: 'PubMed Journal',
      doi: '10.1000/pubmed',
      pmid: '111111',
      source_url: 'https://pubmed.ncbi.nlm.nih.gov/111111/'
    }
  };
}

function createEuropePmcFixture() {
  return {
    PMC1234567: {
      title: 'Europe PMC title',
      authors: ['Franklin R'],
      year: '2023',
      journal: 'Europe PMC Journal',
      doi: '10.1000/europe',
      pmcid: 'PMC1234567',
      source_url: 'https://europepmc.org/article/MED/222222'
    }
  };
}

function record(id, status, message) {
  checks.push({ id, status, message });
}

function printReport() {
  const summary = checks.reduce((counts, check) => {
    counts[check.status] = (counts[check.status] || 0) + 1;
    return counts;
  }, { pass: 0, fail: 0, warning: 0, manual_review_required: 0 });
  const status = summary.fail ? 'fail' : summary.manual_review_required ? 'manual_review_required' : summary.warning ? 'warning' : 'pass';
  console.log(JSON.stringify({ status, checks, summary }, null, 2));
  if (status === 'fail') process.exit(1);
}

function run(command, args, cwd) {
  return new Promise(resolve => {
    const child = spawn(command, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => {
      stdout += chunk;
    });
    child.stderr.on('data', chunk => {
      stderr += chunk;
    });
    child.on('close', code => {
      resolve({ code, stdout, stderr });
    });
  });
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
