#!/usr/bin/env node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const tool = path.join(repoRoot, 'tools/validate_schema.mjs');
const schema = path.join(repoRoot, 'data/reference_bibliographique/tools/schema_references.json');
const officialReferences = path.join(repoRoot, 'data/reference_bibliographique/json/references.json');
const checks = [];

async function main() {
  const officialResult = await run('node', [tool, '--file', officialReferences, '--schema', schema], repoRoot);
  record('schema.official.command', officialResult.code === 0 && officialResult.stdout.includes('REFSCILINK_SCHEMA_VALIDATION_PASS') ? 'pass' : 'fail', officialResult.stderr || officialResult.stdout);
  record('schema.official.report', officialResult.stdout.includes('"status": "pass"') ? 'pass' : 'fail', 'Official references.json produces a passing schema report.');

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'refscilink-schema-'));
  const validPath = path.join(tempDir, 'valid.json');
  const validPayload = JSON.parse(await fs.readFile(officialReferences, 'utf8'));
  await fs.writeFile(validPath, `${JSON.stringify(validPayload, null, 2)}\n`, 'utf8');

  const validCopyResult = await run('node', [tool, '--file', validPath, '--schema', schema], repoRoot);
  record('schema.valid_copy', validCopyResult.code === 0 ? 'pass' : 'fail', validCopyResult.stderr || validCopyResult.stdout);

  await writeFixture(tempDir, 'invalid-status.json', mutate(validPayload, payload => {
    payload.references[0].validation_status = 'done';
  }));
  const invalidStatus = await runFixture(tempDir, 'invalid-status.json');
  record('schema.invalid_status', invalidStatus.code !== 0 && invalidStatus.stdout.includes('REFSCILINK_SCHEMA_ENUM_INVALID') ? 'pass' : 'fail', 'Invalid controlled status values fail schema validation.');

  await writeFixture(tempDir, 'missing-required.json', mutate(validPayload, payload => {
    delete payload.references[0].source_location;
  }));
  const missingRequired = await runFixture(tempDir, 'missing-required.json');
  record('schema.missing_required', missingRequired.code !== 0 && missingRequired.stdout.includes('REFSCILINK_SCHEMA_REQUIRED_MISSING') ? 'pass' : 'fail', 'Missing required reference fields fail schema validation.');

  await writeFixture(tempDir, 'duplicate-id.json', mutate(validPayload, payload => {
    payload.references[1].id = payload.references[0].id;
  }));
  const duplicateId = await runFixture(tempDir, 'duplicate-id.json');
  record('schema.duplicate_id', duplicateId.code !== 0 && duplicateId.stdout.includes('REFSCILINK_SCHEMA_ID_DUPLICATE') ? 'pass' : 'fail', 'Duplicate reference IDs fail RefSciLink semantic validation.');

  await writeFixture(tempDir, 'count-mismatch.json', mutate(validPayload, payload => {
    payload.metadata.reference_count = 999;
  }));
  const countMismatch = await runFixture(tempDir, 'count-mismatch.json');
  record('schema.reference_count', countMismatch.code !== 0 && countMismatch.stdout.includes('REFSCILINK_SCHEMA_REFERENCE_COUNT_MISMATCH') ? 'pass' : 'fail', 'metadata.reference_count mismatches fail validation.');

  await writeFixture(tempDir, 'validation-inconsistent.json', mutate(validPayload, payload => {
    payload.references[0].validated = true;
  }));
  const inconsistent = await runFixture(tempDir, 'validation-inconsistent.json');
  record('schema.validation_consistency', inconsistent.code !== 0 && inconsistent.stdout.includes('REFSCILINK_SCHEMA_VALIDATION_INCONSISTENT') ? 'pass' : 'fail', 'validated must mirror validation_status.');

  await writeFixture(tempDir, 'localized-key.json', mutate(validPayload, payload => {
    payload.references[0].titre = 'Interdit';
  }));
  const localizedKey = await runFixture(tempDir, 'localized-key.json');
  record('schema.localized_key', localizedKey.code !== 0 && localizedKey.stdout.includes('REFSCILINK_SCHEMA_LOCALIZED_KEY_FORBIDDEN') ? 'pass' : 'fail', 'Localized internal keys fail semantic validation.');

  await writeFixture(tempDir, 'legacy-root-array.json', validPayload.references);
  const legacyRoot = await runFixture(tempDir, 'legacy-root-array.json');
  record('schema.legacy_root_array', legacyRoot.code !== 0 && legacyRoot.stdout.includes('REFSCILINK_SCHEMA_TYPE_MISMATCH') ? 'pass' : 'fail', 'Legacy root-array references fail new-generation schema validation.');

  printReport();
}

function mutate(payload, callback) {
  const copy = structuredClone(payload);
  callback(copy);
  return copy;
}

async function writeFixture(tempDir, name, payload) {
  await fs.writeFile(path.join(tempDir, name), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function runFixture(tempDir, name) {
  return run('node', [tool, '--file', path.join(tempDir, name), '--schema', schema], repoRoot);
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
