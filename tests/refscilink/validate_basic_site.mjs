#!/usr/bin/env node
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const buildTool = path.join(repoRoot, 'data/reference_bibliographique/tools/build_references.mjs');
const exampleMarkdown = path.join(repoRoot, 'examples/basic-site/bibliographie.md');
const expectedReferenceCount = 10;

const validationStatuses = new Set(['pending_validation', 'validated', 'rejected', 'needs_revision']);
const extractionStatuses = new Set(['extracted', 'partially_extracted', 'incomplete', 'duplicate_suspected', 'manual_review_required']);
const metadataStatuses = new Set(['not_enriched', 'metadata_found', 'metadata_partial', 'metadata_not_found', 'metadata_to_verify', 'enrichment_failed']);
const accessTypes = new Set(['open_access', 'abstract_only', 'accepted_author_version', 'preprint', 'paywalled', 'unknown']);

const checks = [];

async function main() {
  await checkRequiredFiles();
  await checkJsonFiles();
  await checkBuildToolSyntax();
  await checkRootReferencesStructure();
  await checkGeneratedMetadata();
  await checkExternalLinkSafety();
  await checkOfficialExtraction();
  await checkDryRunNoMutation();
  printReport();
}

async function checkRequiredFiles() {
  const requiredFiles = [
    'data/reference_bibliographique/index_ref.html',
    'data/reference_bibliographique/reference.html',
    'data/reference_bibliographique/assets/css/reference.css',
    'data/reference_bibliographique/assets/js/reference.js',
    'data/reference_bibliographique/json/references.json',
    'data/reference_bibliographique/json/theme_refscilink.json',
    'data/reference_bibliographique/tools/build_references.mjs',
    'data/reference_bibliographique/tools/prompt_recherche_ia.md',
    'data/reference_bibliographique/tools/schema_references.json',
    'refscilink.config.json'
  ];
  const missing = requiredFiles.filter(file => !existsSync(path.join(repoRoot, file)));
  record('files.required', missing.length ? 'fail' : 'pass', missing.length ? `Missing files: ${missing.join(', ')}` : 'All mandatory files exist.');
}

async function checkJsonFiles() {
  const jsonFiles = [
    'data/reference_bibliographique/json/references.json',
    'data/reference_bibliographique/json/theme_refscilink.json',
    'data/reference_bibliographique/tools/schema_references.json',
    'refscilink.config.json'
  ];
  for (const file of jsonFiles) {
    try {
      JSON.parse(await fs.readFile(path.join(repoRoot, file), 'utf8'));
      record(`json.parse.${file}`, 'pass', `${file} parses as JSON.`);
    } catch (error) {
      record(`json.parse.${file}`, 'fail', `${file} is invalid JSON: ${error.message}`);
    }
  }
}

async function checkBuildToolSyntax() {
  const result = await run('node', ['--check', buildTool], repoRoot);
  record('tool.syntax.build_references', result.code === 0 ? 'pass' : 'fail', result.code === 0 ? 'build_references.mjs syntax is valid.' : result.stderr || result.stdout);
}

async function checkRootReferencesStructure() {
  const payload = JSON.parse(await fs.readFile(path.join(repoRoot, 'data/reference_bibliographique/json/references.json'), 'utf8'));
  validateReferencesPayload(payload, 'json.references.root');
}

async function checkGeneratedMetadata() {
  const metadataFiles = [
    ['data/reference_bibliographique/json/references.json', 'generated_at'],
    ['data/reference_bibliographique/json/theme_refscilink.json', 'generated_at'],
    ['refscilink.config.json', 'created_at']
  ];
  for (const [file, creationTimestamp] of metadataFiles) {
    const payload = JSON.parse(await fs.readFile(path.join(repoRoot, file), 'utf8'));
    const metadata = payload.metadata || {};
    const hasModuleVersion = typeof metadata.module_version === 'string' && metadata.module_version.length > 0;
    const hasSchemaVersion = typeof metadata.schema_version === 'string' && metadata.schema_version.length > 0;
    const hasCreationTimestamp = typeof metadata[creationTimestamp] === 'string' && metadata[creationTimestamp].length > 0;
    const hasUpdatedAt = file.endsWith('references.json') || file.endsWith('theme_refscilink.json')
      ? typeof metadata.updated_at === 'string' && metadata.updated_at.length > 0
      : typeof metadata.updated_at === 'string' && metadata.updated_at.length > 0;
    record(`metadata.versioning.${file}`, hasModuleVersion && hasSchemaVersion && hasCreationTimestamp && hasUpdatedAt ? 'pass' : 'fail', `${file} includes module_version, schema_version and timestamps.`);
  }
}

async function checkExternalLinkSafety() {
  const script = await fs.readFile(path.join(repoRoot, 'data/reference_bibliographique/assets/js/reference.js'), 'utf8');
  record('external_links.allowed_protocols', script.includes('REFSCILINK_ALLOWED_EXTERNAL_PROTOCOLS') && script.includes('"http:"') && script.includes('"https:"') ? 'pass' : 'fail', 'reference.js defines allowed external URL protocols.');
  record('external_links.url_parser', script.includes('new URL(') && script.includes('getSafeExternalHref') ? 'pass' : 'fail', 'reference.js validates external hrefs before rendering.');
  record('external_links.noopener_noreferrer', script.includes('target = "_blank"') && script.includes('rel = "noopener noreferrer"') ? 'pass' : 'fail', 'External new-tab links include noopener noreferrer.');
}

async function checkOfficialExtraction() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'refscilink-basic-site-'));
  await fs.copyFile(exampleMarkdown, path.join(tempDir, 'bibliographie.md'));
  const result = await run('node', [buildTool, 'bibliographie.md'], tempDir);
  record('example.extract.command', result.code === 0 ? 'pass' : 'fail', result.code === 0 ? 'Official extraction command succeeded.' : result.stderr || result.stdout);
  if (result.code !== 0) return;

  const outputPath = path.join(tempDir, 'data/reference_bibliographique/json/references.json');
  const payload = JSON.parse(await fs.readFile(outputPath, 'utf8'));
  validateReferencesPayload(payload, 'example.extract.references');
  record('example.extract.count', payload.references.length === expectedReferenceCount ? 'pass' : 'fail', `Expected ${expectedReferenceCount} references, got ${payload.references.length}.`);
  record('example.extract.diagnostics', hasDiagnostic(payload, 'REFSCILINK_EXTRACT_OK') ? 'pass' : 'fail', 'Extraction diagnostics include REFSCILINK_EXTRACT_OK.');
}

async function checkDryRunNoMutation() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'refscilink-basic-site-dry-'));
  await fs.copyFile(exampleMarkdown, path.join(tempDir, 'bibliographie.md'));
  const result = await run('node', [buildTool, '--dry-run', 'bibliographie.md'], tempDir);
  record('example.dry_run.command', result.code === 0 ? 'pass' : 'fail', result.code === 0 ? 'Dry-run command succeeded.' : result.stderr || result.stdout);
  record('example.dry_run.no_references_json', !existsSync(path.join(tempDir, 'data/reference_bibliographique/json/references.json')) ? 'pass' : 'fail', 'Dry-run must not write references.json.');
  record('example.dry_run.no_backup', !existsSync(path.join(tempDir, 'backup')) ? 'pass' : 'fail', 'Dry-run must not create backup files.');
  for (const code of ['REFSCILINK_DRY_RUN_ENABLED', 'REFSCILINK_DRY_RUN_WOULD_WRITE_JSON', 'REFSCILINK_DRY_RUN_NO_WRITE']) {
    record(`example.dry_run.diagnostic.${code}`, result.stdout.includes(code) ? 'pass' : 'fail', `Dry-run console output includes ${code}.`);
  }
}

function validateReferencesPayload(payload, prefix) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    record(prefix, 'fail', 'references.json root must be an object.');
    return;
  }
  record(`${prefix}.root`, payload.metadata && Array.isArray(payload.references) ? 'pass' : 'fail', 'references.json has metadata and references array.');
  if (!payload.metadata || !Array.isArray(payload.references)) return;
  record(`${prefix}.reference_count`, payload.metadata.reference_count === payload.references.length ? 'pass' : 'fail', 'metadata.reference_count matches references length.');
  record(`${prefix}.metadata.module_version`, typeof payload.metadata.module_version === 'string' && payload.metadata.module_version.length > 0 ? 'pass' : 'fail', 'metadata.module_version is present.');
  record(`${prefix}.metadata.schema_version`, typeof payload.metadata.schema_version === 'string' && payload.metadata.schema_version.length > 0 ? 'pass' : 'fail', 'metadata.schema_version is present.');

  const ids = new Set();
  const numbers = new Set();
  let validReferences = true;
  for (const reference of payload.references) {
    validReferences = validateReference(reference, ids, numbers) && validReferences;
  }
  record(`${prefix}.items`, validReferences ? 'pass' : 'fail', validReferences ? 'All reference items satisfy structural checks.' : 'One or more references failed structural checks.');
}

function validateReference(reference, ids, numbers) {
  let valid = true;
  valid = typeof reference.raw_reference === 'string' && reference.raw_reference.length > 0 && valid;
  valid = /^ref\d{3,}$/.test(reference.id) && !ids.has(reference.id) && valid;
  ids.add(reference.id);
  valid = Number.isInteger(reference.number) && reference.number > 0 && !numbers.has(reference.number) && valid;
  numbers.add(reference.number);
  valid = Array.isArray(reference.authors) && valid;
  valid = validationStatuses.has(reference.validation_status) && valid;
  valid = extractionStatuses.has(reference.extraction_status) && valid;
  valid = metadataStatuses.has(reference.metadata_status) && valid;
  valid = accessTypes.has(reference.access_type) && valid;
  valid = reference.validated === (reference.validation_status === 'validated') && valid;
  valid = reference.source_location && Number.isInteger(reference.source_location.line_start) && valid;
  return valid;
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
  const report = { status, checks, summary };
  console.log(JSON.stringify(report, null, 2));
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
