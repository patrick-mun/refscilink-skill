#!/usr/bin/env node
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const tool = path.join(repoRoot, 'tools/validate_reference.mjs');
const checks = [];

async function main() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'refscilink-validate-'));
  const jsonDir = path.join(tempDir, 'data/reference_bibliographique/json');
  const referencesPath = path.join(jsonDir, 'references.json');
  await fs.mkdir(jsonDir, { recursive: true });
  await fs.writeFile(referencesPath, `${JSON.stringify(createFixture(), null, 2)}\n`, 'utf8');

  const validateResult = await run('node', [tool, '--file', 'data/reference_bibliographique/json/references.json', '--id', 'ref001', '--status', 'validated', '--validated-by', 'Dr Test', '--note', 'Checked against source'], tempDir);
  record('validate.command', validateResult.code === 0 ? 'pass' : 'fail', validateResult.stderr || validateResult.stdout);

  const payload = JSON.parse(await fs.readFile(referencesPath, 'utf8'));
  const ref001 = payload.references.find(reference => reference.id === 'ref001');
  const ref002 = payload.references.find(reference => reference.id === 'ref002');
  record('validate.backup_created', existsSync(path.join(tempDir, 'backup/refscilink')) ? 'pass' : 'fail', 'Validation creates a backup before writing references.json.');
  record('validate.fields', ref001.validated === true && ref001.validation_status === 'validated' && ref001.validated_by === 'Dr Test' && Boolean(ref001.validation_date) ? 'pass' : 'fail', 'Validation updates only the human validation fields consistently.');
  record('validate.notes_appended', ref001.review_notes.includes('Original note') && ref001.review_notes.includes('Checked against source') ? 'pass' : 'fail', 'Validation appends review notes instead of overwriting them.');
  record('validate.preserves_reference_content', ref001.short_summary === 'Keep this summary' && ref001.theme === 'manual-theme' && ref001.keywords.includes('manual') ? 'pass' : 'fail', 'Validation preserves summaries, theme and keywords.');
  record('validate.preserves_unknown_root', payload.maintainer_note === 'preserve root key' ? 'pass' : 'fail', 'Validation preserves unknown root keys.');
  record('validate.untouched_reference', ref002.validated === false && ref002.review_notes === '' ? 'pass' : 'fail', 'Validation leaves other references untouched.');

  const revisionResult = await run('node', [tool, '--file', 'data/reference_bibliographique/json/references.json', '--id', 'ref002', '--status', 'needs_revision', '--validated-by', 'Reviewer Two', '--note', 'Missing full text'], tempDir);
  const revisionPayload = JSON.parse(await fs.readFile(referencesPath, 'utf8'));
  const revisedRef002 = revisionPayload.references.find(reference => reference.id === 'ref002');
  record('revision.command', revisionResult.code === 0 ? 'pass' : 'fail', revisionResult.stderr || revisionResult.stdout);
  record('revision.fields', revisedRef002.validated === false && revisedRef002.validation_status === 'needs_revision' && revisedRef002.validated_by === 'Reviewer Two' && revisedRef002.review_notes.includes('Missing full text') ? 'pass' : 'fail', 'Non-validated review statuses keep validated false and record the reviewer note.');

  const beforeDryRun = await fs.readFile(referencesPath, 'utf8');
  const backupBeforeDryRun = await countFiles(path.join(tempDir, 'backup/refscilink'));
  const dryRunResult = await run('node', [tool, '--file', 'data/reference_bibliographique/json/references.json', '--id', 'ref001', '--status', 'pending_validation', '--dry-run'], tempDir);
  const afterDryRun = await fs.readFile(referencesPath, 'utf8');
  const backupAfterDryRun = await countFiles(path.join(tempDir, 'backup/refscilink'));
  record('dry_run.command', dryRunResult.code === 0 && dryRunResult.stdout.includes('REFSCILINK_DRY_RUN_NO_WRITE') ? 'pass' : 'fail', dryRunResult.stderr || dryRunResult.stdout);
  record('dry_run.no_json_mutation', beforeDryRun === afterDryRun ? 'pass' : 'fail', 'Dry-run must not mutate references.json.');
  record('dry_run.no_backup', backupBeforeDryRun === backupAfterDryRun ? 'pass' : 'fail', 'Dry-run must not create backups.');

  const missingResult = await run('node', [tool, '--file', 'data/reference_bibliographique/json/references.json', '--id', 'ref999'], tempDir);
  record('errors.missing_id', missingResult.code !== 0 && missingResult.stdout.includes('REFSCILINK_VALIDATION_REFERENCE_NOT_FOUND') ? 'pass' : 'fail', 'Missing reference IDs fail with a stable diagnostic.');

  const invalidStatusResult = await run('node', [tool, '--file', 'data/reference_bibliographique/json/references.json', '--id', 'ref001', '--status', 'done'], tempDir);
  record('errors.invalid_status', invalidStatusResult.code !== 0 && invalidStatusResult.stderr.includes('REFSCILINK_VALIDATION_USAGE_ERROR') ? 'pass' : 'fail', 'Invalid validation statuses fail before writing.');

  printReport();
}

function createFixture() {
  return {
    metadata: {
      generated_by: 'RefSciLink Skill',
      module_version: '0.2.0-dev',
      schema_version: '1.0.0',
      generated_at: '2026-05-25T10:00:00.000Z',
      updated_at: '2026-05-25T10:00:00.000Z',
      reference_count: 2
    },
    maintainer_note: 'preserve root key',
    references: [
      {
        id: 'ref001',
        number: 1,
        title: 'Alpha',
        authors: [],
        year: '2024',
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
        theme: 'manual-theme',
        keywords: ['manual'],
        raw_reference: 'Alpha. 2024.',
        short_summary: 'Keep this summary',
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
        review_notes: 'Original note',
        source_markdown: 'bibliographie.md'
      },
      {
        id: 'ref002',
        number: 2,
        title: 'Beta',
        authors: [],
        year: '2023',
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
        raw_reference: 'Beta. 2023.',
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
        source_markdown: 'bibliographie.md'
      }
    ]
  };
}

async function countFiles(directory) {
  if (!existsSync(directory)) return 0;
  const entries = await fs.readdir(directory, { recursive: true, withFileTypes: true });
  return entries.filter(entry => entry.isFile()).length;
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
