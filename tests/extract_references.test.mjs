#!/usr/bin/env node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const buildTool = path.join(repoRoot, 'data/reference_bibliographique/tools/build_references.mjs');
const checks = [];

async function main() {
  await testIdentifierExtraction();
  await testStableNumberingOnRerun();
  await testFreeFormAndBoundaries();
  await testNoHeadingIdentifierFallback();
  await testDryRunSafety();
  printReport();
}

async function testIdentifierExtraction() {
  const root = await createFixture(`## References

1. Alpha A. DOI article. Journal of Tests. 2024. https://doi.org/10.1234/ABC.2024.001.
2. Beta B. PubMed article. Nature. 2023. PMID: 34567890. PMCID: 7654321.
3. Gamma C. URL article. Science. 2022. https://example.org/article https://example.org/article.pdf
`);
  const { payload, result } = await runExtraction(root);
  record('extract.identifiers.command', result.code === 0 ? 'pass' : 'fail', result.code === 0 ? 'Identifier extraction fixture runs.' : result.stderr || result.stdout);
  const [doiRef, pubmedRef, urlRef] = payload.references || [];
  record('extract.identifiers.doi', doiRef?.doi === '10.1234/ABC.2024.001' && doiRef?.url === 'https://doi.org/10.1234/ABC.2024.001' ? 'pass' : 'fail', 'DOI URLs are normalized to DOI and display URL fields.');
  record('extract.identifiers.pmid_pmcid', pubmedRef?.pmid === '34567890' && pubmedRef?.pmcid === 'PMC7654321' ? 'pass' : 'fail', 'PMID and PMCID are extracted and normalized as strings.');
  record('extract.identifiers.urls', urlRef?.url === 'https://example.org/article' && urlRef?.pdf_url === 'https://example.org/article.pdf' ? 'pass' : 'fail', 'Article URLs and PDF URLs are separated.');
}

async function testStableNumberingOnRerun() {
  const root = await createFixture(`## References

1. Alpha A. Stable first. Journal. 2024. doi:10.1000/stable-a.
2. Beta B. Stable second. Journal. 2023. doi:10.1000/stable-b.
`);
  const first = await runExtraction(root);
  const firstIds = first.payload.references.map(reference => reference.id);
  await fs.writeFile(path.join(root, 'bibliographie.md'), `## References

1. Alpha A. Stable first. Journal. 2024. doi:10.1000/stable-a.
2. Inserted I. New middle reference. Journal. 2022. doi:10.1000/stable-new.
3. Beta B. Stable second. Journal. 2023. doi:10.1000/stable-b.
`, 'utf8');
  const second = await runExtraction(root);
  const refs = second.payload.references;
  record('extract.numbering.initial_ids', firstIds.join(',') === 'ref001,ref002' ? 'pass' : 'fail', 'Initial extraction creates sequential IDs.');
  record('extract.numbering.reuses_ids', refs[0]?.id === 'ref001' && refs[2]?.id === 'ref002' ? 'pass' : 'fail', 'Rerun preserves IDs for matching references.');
  record('extract.numbering.new_id', refs[1]?.id === 'ref003' && refs[1]?.number === 2 ? 'pass' : 'fail', 'Inserted references receive a new stable ID while display numbers follow source order.');
  record('extract.numbering.diagnostics', hasDiagnostic(second.payload, 'REFSCILINK_IDS_REUSED') && hasDiagnostic(second.payload, 'REFSCILINK_IDS_CREATED') ? 'pass' : 'fail', 'Rerun records reused and created ID diagnostics.');
}

async function testFreeFormAndBoundaries() {
  const root = await createFixture(`# Project

## Bibliographie

### Articles

Freeform One. Unmarked article. Genome Biology. 2024. doi:10.2000/free-one.

Freeform Two. Another unmarked article. Journal of Markdown Tests. 2023. https://example.org/free-two

### Notes internes

This note has doi:10.9999/not-a-reference but must not be captured.
`);
  const { payload } = await runExtraction(root);
  const raw = payload.references.map(reference => reference.raw_reference).join(' ');
  record('extract.freeform.count', payload.references.length === 2 ? 'pass' : 'fail', `Expected 2 free-form references, got ${payload.references.length}.`);
  record('extract.freeform.statuses', payload.references.every(reference => reference.extraction_status === 'extracted') ? 'pass' : 'fail', 'Strong free-form references are extracted without marker requirements.');
  record('extract.freeform.boundary', !raw.includes('not-a-reference') ? 'pass' : 'fail', 'Explicit stop headings prevent over-capture.');
  record('extract.freeform.subsection', payload.references[0]?.source_location?.section_title === 'Bibliographie / Articles' ? 'pass' : 'fail', 'Allowed subsection metadata is preserved.');
}

async function testNoHeadingIdentifierFallback() {
  const root = await createFixture(`# Notes

This project narrative is not a reference.
Identifier line only: doi:10.3000/fallback-one.
Another candidate PMID: 45678901.
Plain text after identifiers should not be captured.
`);
  const { payload } = await runExtraction(root);
  record('extract.fallback.count', payload.references.length === 2 ? 'pass' : 'fail', `Expected 2 fallback identifier lines, got ${payload.references.length}.`);
  record('extract.fallback.statuses', payload.references.every(reference => reference.extraction_status === 'manual_review_required') ? 'pass' : 'fail', 'No-heading fallback marks extracted lines for manual review.');
  record('extract.fallback.location', payload.references.every(reference => reference.source_location.section_level === 0 && reference.source_location.section_title === '') ? 'pass' : 'fail', 'No-heading fallback uses empty section metadata.');
}

async function testDryRunSafety() {
  const root = await createFixture(`## References

1. Dry D. Dry run article. Journal. 2024. doi:10.4000/dry-run.
`);
  const result = await run('node', [buildTool, '--dry-run', 'bibliographie.md'], root);
  const outputPath = path.join(root, 'data/reference_bibliographique/json/references.json');
  const backupPath = path.join(root, 'backup');
  record('extract.dry_run.command', result.code === 0 ? 'pass' : 'fail', result.code === 0 ? 'Extraction dry-run command succeeds.' : result.stderr || result.stdout);
  record('extract.dry_run.no_json', !await exists(outputPath) ? 'pass' : 'fail', 'Extraction dry-run does not write references.json.');
  record('extract.dry_run.no_backup', !await exists(backupPath) ? 'pass' : 'fail', 'Extraction dry-run does not create backups.');
  record('extract.dry_run.diagnostics', result.stdout.includes('REFSCILINK_DRY_RUN_ENABLED') && result.stdout.includes('REFSCILINK_DRY_RUN_NO_WRITE') ? 'pass' : 'fail', 'Extraction dry-run emits required diagnostics.');
}

async function createFixture(markdown) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'refscilink-extract-test-'));
  await fs.writeFile(path.join(root, 'bibliographie.md'), markdown, 'utf8');
  return root;
}

async function runExtraction(root) {
  const result = await run('node', [buildTool, 'bibliographie.md'], root);
  if (result.code !== 0) return { result, payload: { references: [] } };
  const payload = JSON.parse(await fs.readFile(path.join(root, 'data/reference_bibliographique/json/references.json'), 'utf8'));
  return { result, payload };
}

function run(command, args, cwd) {
  return new Promise(resolve => {
    const child = spawn(command, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('close', code => resolve({ code, stdout, stderr }));
  });
}

async function exists(target) {
  try {
    await fs.stat(target);
    return true;
  } catch {
    return false;
  }
}

function hasDiagnostic(payload, code) {
  return Array.isArray(payload.metadata?.diagnostics) && payload.metadata.diagnostics.some(diagnostic => diagnostic.code === code);
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

main().catch(error => {
  console.error(error);
  process.exit(1);
});
