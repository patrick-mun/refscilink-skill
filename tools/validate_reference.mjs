#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const DEFAULT_REFERENCES_FILE = 'data/reference_bibliographique/json/references.json';
const VALIDATION_STATUSES = new Set(['pending_validation', 'validated', 'needs_revision', 'rejected']);

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const diagnostics = [
    createDiagnostic('info', 'REFSCILINK_VALIDATION_STARTED', 'Local reference validation started.')
  ];
  if (options.dryRun) {
    diagnostics.push(createDiagnostic('info', 'REFSCILINK_DRY_RUN_ENABLED', 'Dry-run mode is active.'));
  }
  if (!options.id) throw new UsageError('Missing required --id <reference-id>.');
  if (!VALIDATION_STATUSES.has(options.status)) {
    throw new UsageError(`Invalid --status "${options.status}". Allowed values: ${[...VALIDATION_STATUSES].join(', ')}.`);
  }

  const filePath = path.resolve(options.file);
  const raw = await fs.readFile(filePath, 'utf8');
  const payload = JSON.parse(raw);
  const references = getReferences(payload);
  diagnostics.push(createDiagnostic('info', 'REFSCILINK_EXISTING_JSON_READ', 'Existing references.json was read for local validation.', {
    path: relativePath(filePath),
    reference_count: references.length
  }));

  const reference = references.find(item => item?.id === options.id);
  if (!reference) {
    diagnostics.push(createDiagnostic('error', 'REFSCILINK_VALIDATION_REFERENCE_NOT_FOUND', 'Requested reference ID was not found.', {
      id: options.id
    }));
    emitDiagnostics(diagnostics);
    process.exitCode = 1;
    return;
  }

  const updatedAt = new Date().toISOString();
  applyValidation(reference, options, updatedAt);
  updateMetadata(payload, options, diagnostics, updatedAt);
  diagnostics.push(createDiagnostic('success', 'REFSCILINK_REFERENCE_VALIDATION_UPDATED', 'Reference validation fields were updated.', {
    id: reference.id,
    validation_status: reference.validation_status,
    validated: reference.validated
  }));

  if (options.dryRun) {
    diagnostics.push(createDiagnostic('info', 'REFSCILINK_DRY_RUN_WOULD_BACKUP', 'Dry-run: existing references.json would be backed up before validation write.', {
      action: 'would_backup',
      path: relativePath(getBackupPath(filePath, updatedAt))
    }));
    diagnostics.push(createDiagnostic('info', 'REFSCILINK_DRY_RUN_WOULD_WRITE_JSON', 'Dry-run: references.json would be written with local validation fields.', {
      action: 'would_write_json',
      path: relativePath(filePath),
      id: reference.id
    }));
    diagnostics.push(createDiagnostic('success', 'REFSCILINK_DRY_RUN_NO_WRITE', 'Dry-run completed without writing files.'));
  } else {
    const backupPath = getBackupPath(filePath, updatedAt);
    await createBackup(filePath, backupPath);
    diagnostics.push(createDiagnostic('success', 'REFSCILINK_BACKUP_CREATED', 'Existing references.json was backed up before validation write.', {
      path: relativePath(backupPath)
    }));
    await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    diagnostics.push(createDiagnostic('success', 'REFSCILINK_JSON_WRITTEN', 'references.json was written with local validation fields.', {
      path: relativePath(filePath),
      id: reference.id
    }));
  }

  emitDiagnostics(diagnostics);
}

function parseOptions(args) {
  const options = {
    file: DEFAULT_REFERENCES_FILE,
    id: '',
    status: 'validated',
    validatedBy: '',
    note: '',
    dryRun: false
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--no-dry-run') {
      options.dryRun = false;
    } else if (arg === '--file') {
      options.file = readValue(args, ++index, '--file');
    } else if (arg === '--id') {
      options.id = readValue(args, ++index, '--id');
    } else if (arg === '--status') {
      options.status = readValue(args, ++index, '--status');
    } else if (arg === '--validated-by') {
      options.validatedBy = readValue(args, ++index, '--validated-by');
    } else if (arg === '--note') {
      options.note = readValue(args, ++index, '--note');
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new UsageError(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function readValue(args, index, optionName) {
  const value = args[index];
  if (!value || value.startsWith('--')) throw new UsageError(`Missing value for ${optionName}.`);
  return value;
}

function printHelp() {
  console.log(`Usage:
  node tools/validate_reference.mjs --id ref001 --status validated --validated-by "Reviewer" --note "Checked manually"

Options:
  --file <path>              references.json path. Defaults to ${DEFAULT_REFERENCES_FILE}
  --id <reference-id>        Reference ID to update. Required.
  --status <status>          validated, pending_validation, needs_revision or rejected. Defaults to validated.
  --validated-by <name>      Human validator name recorded in validated_by.
  --note <text>              Review note appended to review_notes.
  --dry-run                  Report backup/write actions without modifying files.
`);
}

function getReferences(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.references)) return payload.references;
  throw new Error('references.json must be either a references array or an object with a references array.');
}

function applyValidation(reference, options, timestamp) {
  reference.validation_status = options.status;
  reference.validated = options.status === 'validated';

  if (options.validatedBy.trim()) {
    reference.validated_by = options.validatedBy.trim();
  } else if (reference.validated && !reference.validated_by) {
    reference.validated_by = 'local_user';
  } else if (typeof reference.validated_by !== 'string') {
    reference.validated_by = '';
  }

  if (reference.validated || options.validatedBy.trim() || options.note.trim()) {
    reference.validation_date = timestamp;
  } else if (typeof reference.validation_date !== 'string') {
    reference.validation_date = '';
  }

  if (options.note.trim()) {
    reference.review_notes = appendReviewNote(reference.review_notes, options.note.trim(), timestamp);
  } else if (typeof reference.review_notes !== 'string') {
    reference.review_notes = '';
  }
}

function appendReviewNote(existingNotes, note, timestamp) {
  const previous = typeof existingNotes === 'string' ? existingNotes.trim() : '';
  const next = `[${timestamp}] ${note}`;
  return previous ? `${previous}\n${next}` : next;
}

function updateMetadata(payload, options, diagnostics, timestamp) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return;
  payload.metadata = payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : {};
  payload.metadata.updated_at = timestamp;
  payload.metadata.reference_count = Array.isArray(payload.references) ? payload.references.length : payload.metadata.reference_count;
  payload.metadata.last_validation_update = {
    id: options.id,
    validation_status: options.status,
    validated_by: options.validatedBy.trim() || ''
  };
  const existingDiagnostics = Array.isArray(payload.metadata.diagnostics) ? payload.metadata.diagnostics : [];
  payload.metadata.diagnostics = [...existingDiagnostics, ...diagnostics];
}

async function createBackup(filePath, backupPath) {
  await fs.mkdir(path.dirname(backupPath), { recursive: true });
  await fs.copyFile(filePath, backupPath);
  await fs.access(backupPath);
}

function getBackupPath(filePath, timestamp) {
  const safeTimestamp = timestamp.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const relativeTarget = path.relative(process.cwd(), filePath);
  const safeRelativeTarget = relativeTarget.startsWith('..') ? path.basename(filePath) : relativeTarget;
  return path.join(process.cwd(), 'backup/refscilink', `validation_${safeTimestamp}`, safeRelativeTarget);
}

function relativePath(filePath) {
  const relative = path.relative(process.cwd(), filePath);
  return relative.startsWith('..') ? filePath : relative;
}

function createDiagnostic(severity, code, message, details = {}) {
  return { severity, code, message, details };
}

function emitDiagnostics(diagnostics) {
  diagnostics.forEach(diagnostic => {
    console.log(`[${diagnostic.severity}] ${diagnostic.code}: ${diagnostic.message}`);
  });
}

class UsageError extends Error {}

main().catch(error => {
  const code = error instanceof UsageError ? 'REFSCILINK_VALIDATION_USAGE_ERROR' : 'REFSCILINK_RUN_FAILED';
  console.error(`[error] ${code}: ${error.message}`);
  process.exit(1);
});
