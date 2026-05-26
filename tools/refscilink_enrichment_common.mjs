import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

export const DEFAULT_REFERENCES_FILE = 'data/reference_bibliographique/json/references.json';
export const MODULE_VERSION = '0.4.0-dev';

export function parseCommonOptions(args, provider) {
  const options = {
    provider,
    file: DEFAULT_REFERENCES_FILE,
    fixture: '',
    dryRun: false,
    offline: false,
    noExternalApi: false,
    id: ''
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--file') {
      options.file = readValue(args, ++index, '--file');
    } else if (arg === '--fixture') {
      options.fixture = readValue(args, ++index, '--fixture');
    } else if (arg === '--id') {
      options.id = readValue(args, ++index, '--id');
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--offline') {
      options.offline = true;
    } else if (arg === '--no-external-api') {
      options.noExternalApi = true;
    } else if (arg === '--help' || arg === '-h') {
      printCommonHelp(provider);
      process.exit(0);
    } else {
      throw new UsageError(`Unknown option: ${arg}`);
    }
  }

  return options;
}

export async function runEnrichment(options, lookup) {
  const diagnostics = [
    createDiagnostic('info', 'REFSCILINK_DEFERRED_ENRICHMENT_STARTED', `${options.provider} enrichment started.`, {
      provider: options.provider
    })
  ];

  if (options.offline || options.noExternalApi) {
    addSkippedModeDiagnostics(options, diagnostics);
    emitDiagnostics(diagnostics);
    emitSummaryReport({ options, diagnostics, updatedIds: [], skipped: [], reviewRequiredIds: [] });
    return;
  }

  const filePath = path.resolve(options.file);
  const payload = JSON.parse(await fs.readFile(filePath, 'utf8'));
  const references = Array.isArray(payload.references) ? payload.references : [];
  const targets = options.id ? references.filter(reference => reference.id === options.id) : references;
  const updatedIds = [];
  const skipped = [];
  const reviewRequiredIds = [];

  for (const reference of targets) {
    const result = await lookup(reference, options);
    if (!result.metadata) {
      const status = result.status || 'metadata_not_found';
      reference.metadata_status = status;
      skipped.push({ id: reference.id, reason: result.reason || status });
      diagnostics.push(createDiagnostic('warning', 'REFSCILINK_ENRICHMENT_REFERENCE_SKIPPED', 'Reference enrichment was skipped or found no metadata.', {
        id: reference.id,
        provider: options.provider,
        reason: result.reason || status
      }));
      continue;
    }

    const mergeResult = mergeMetadata(reference, result.metadata, options.provider);
    reference.metadata_status = mergeResult.conflicts.length ? 'metadata_to_verify' : mergeResult.changed ? 'metadata_found' : 'metadata_partial';
    if (mergeResult.changed) updatedIds.push(reference.id);
    if (mergeResult.conflicts.length) reviewRequiredIds.push(reference.id);
    diagnostics.push(createDiagnostic(mergeResult.conflicts.length ? 'review_required' : 'info', mergeResult.changed ? 'REFSCILINK_ENRICHMENT_REFERENCE_UPDATED' : 'REFSCILINK_ENRICHMENT_REFERENCE_SKIPPED', mergeResult.changed ? 'Reference metadata was enriched.' : 'Reference metadata already had equivalent values.', {
      id: reference.id,
      provider: options.provider,
      changed_fields: mergeResult.changedFields,
      conflicts: mergeResult.conflicts
    }));
  }

  updatePayloadMetadata(payload, options.provider, diagnostics);

  if (options.dryRun) {
    diagnostics.push(createDiagnostic('info', 'REFSCILINK_DRY_RUN_WOULD_BACKUP', 'Dry-run: references.json would be backed up before enrichment write.', {
      action: 'would_backup',
      path: relativePath(getBackupPath(filePath))
    }));
    diagnostics.push(createDiagnostic('info', 'REFSCILINK_DRY_RUN_WOULD_WRITE_JSON', 'Dry-run: enriched references.json would be written.', {
      action: 'would_write_json',
      path: relativePath(filePath)
    }));
    diagnostics.push(createDiagnostic('success', 'REFSCILINK_DRY_RUN_NO_WRITE', 'Dry-run completed without writing files.'));
  } else if (updatedIds.length || reviewRequiredIds.length || skipped.length) {
    const backupPath = getBackupPath(filePath);
    await createBackup(filePath, backupPath);
    diagnostics.push(createDiagnostic('success', 'REFSCILINK_BACKUP_CREATED', 'Existing references.json was backed up before enrichment write.', {
      path: relativePath(backupPath)
    }));
    await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    diagnostics.push(createDiagnostic('success', 'REFSCILINK_JSON_WRITTEN', 'references.json was written after enrichment.', {
      path: relativePath(filePath)
    }));
  }

  diagnostics.push(createDiagnostic(reviewRequiredIds.length ? 'warning' : 'success', reviewRequiredIds.length ? 'REFSCILINK_DEFERRED_ENRICHMENT_PARTIAL' : 'REFSCILINK_DEFERRED_ENRICHMENT_COMPLETED', `${options.provider} enrichment completed.`, {
    updated_count: updatedIds.length,
    skipped_count: skipped.length,
    review_required_count: reviewRequiredIds.length
  }));

  emitDiagnostics(diagnostics);
  emitSummaryReport({ options, diagnostics, updatedIds, skipped, reviewRequiredIds });
}

export async function readFixtureMap(fixturePath) {
  if (!fixturePath) return null;
  return JSON.parse(await fs.readFile(path.resolve(fixturePath), 'utf8'));
}

export function normalizeFixtureMetadata(entry) {
  if (!entry) return null;
  return {
    title: entry.title || '',
    authors: Array.isArray(entry.authors) ? entry.authors : [],
    year: entry.year || '',
    journal: entry.journal || '',
    publisher: entry.publisher || '',
    volume: entry.volume || '',
    issue: entry.issue || '',
    pages: entry.pages || '',
    doi: normalizeDoi(entry.doi || ''),
    pmid: entry.pmid ? String(entry.pmid) : '',
    pmcid: normalizePmcid(entry.pmcid || ''),
    source_url: entry.source_url || '',
    url: entry.url || ''
  };
}

export function normalizeDoi(value) {
  return String(value || '').replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').replace(/^doi:\s*/i, '').trim().replace(/[.,;)\]]+$/, '');
}

export function normalizePmcid(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const digits = raw.replace(/^PMC\s*/i, '');
  return `PMC${digits}`;
}

export function createDiagnostic(severity, code, message, details = {}) {
  return { severity, code, message, details };
}

export class UsageError extends Error {}

function mergeMetadata(reference, metadata, provider) {
  const changedFields = [];
  const conflicts = [];
  const fillableFields = ['title', 'year', 'journal', 'publisher', 'volume', 'issue', 'pages', 'doi', 'pmid', 'pmcid', 'source_url', 'url'];

  for (const field of fillableFields) {
    const incoming = metadata[field];
    if (!incoming) continue;
    if (!reference[field]) {
      reference[field] = incoming;
      changedFields.push(field);
    } else if (String(reference[field]).trim() !== String(incoming).trim()) {
      conflicts.push(field);
    }
  }

  if ((!Array.isArray(reference.authors) || reference.authors.length === 0) && metadata.authors?.length) {
    reference.authors = metadata.authors;
    changedFields.push('authors');
  } else if (metadata.authors?.length && JSON.stringify(reference.authors) !== JSON.stringify(metadata.authors)) {
    conflicts.push('authors');
  }

  if (conflicts.length) {
    reference.review_notes = appendReviewNote(reference.review_notes, `${provider} metadata conflict requires review: ${conflicts.join(', ')}.`);
  }

  return { changed: changedFields.length > 0, changedFields, conflicts };
}

function updatePayloadMetadata(payload, provider, diagnostics) {
  const timestamp = new Date().toISOString();
  payload.metadata = payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : {};
  payload.metadata.module_version = payload.metadata.module_version || MODULE_VERSION;
  payload.metadata.updated_at = timestamp;
  payload.metadata.enrichment_mode = 'deferred_enrichment';
  payload.metadata.last_enrichment = {
    provider,
    updated_at: timestamp
  };
  payload.metadata.diagnostics = [
    ...(Array.isArray(payload.metadata.diagnostics) ? payload.metadata.diagnostics : []),
    ...diagnostics
  ];
}

function addSkippedModeDiagnostics(options, diagnostics) {
  if (options.offline) {
    diagnostics.push(createDiagnostic('info', 'REFSCILINK_OFFLINE_MODE_ENABLED', 'Offline mode is active.'));
    diagnostics.push(createDiagnostic('warning', 'REFSCILINK_ENRICHMENT_SKIPPED_OFFLINE', 'Scientific enrichment was skipped because offline mode is active.'));
    diagnostics.push(createDiagnostic('info', 'REFSCILINK_METADATA_LOOKUP_DEFERRED', 'Metadata lookup can be resumed later.'));
  }
  if (options.noExternalApi) {
    diagnostics.push(createDiagnostic('info', 'REFSCILINK_NO_EXTERNAL_API_MODE_ENABLED', 'No-external-API mode is active.'));
    diagnostics.push(createDiagnostic('warning', 'REFSCILINK_EXTERNAL_API_SKIPPED', 'External scientific API lookup was skipped.'));
    diagnostics.push(createDiagnostic('info', 'REFSCILINK_METADATA_LOOKUP_DEFERRED', 'Metadata lookup can be resumed later.'));
  }
}

function appendReviewNote(existingNotes, note) {
  const previous = typeof existingNotes === 'string' ? existingNotes.trim() : '';
  const next = `[${new Date().toISOString()}] ${note}`;
  return previous ? `${previous}\n${next}` : next;
}

async function createBackup(filePath, backupPath) {
  await fs.mkdir(path.dirname(backupPath), { recursive: true });
  await fs.copyFile(filePath, backupPath);
  await fs.access(backupPath);
}

function getBackupPath(filePath) {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const relativeTarget = path.relative(process.cwd(), filePath);
  const safeRelativeTarget = relativeTarget.startsWith('..') ? path.basename(filePath) : relativeTarget;
  return path.join(process.cwd(), 'backup/refscilink', `enrichment_${timestamp}`, safeRelativeTarget);
}

function readValue(args, index, optionName) {
  const value = args[index];
  if (!value || value.startsWith('--')) throw new UsageError(`Missing value for ${optionName}.`);
  return value;
}

function printCommonHelp(provider) {
  console.log(`Usage:
  node tools/enrich_${provider.toLowerCase().replace(' ', '')}.mjs --fixture tests/fixtures/${provider}.json

Options:
  --file <path>          references.json path. Defaults to ${DEFAULT_REFERENCES_FILE}
  --fixture <path>       Deterministic local metadata fixture for tests or offline review.
  --id <reference-id>    Enrich only one reference ID.
  --dry-run              Report backup/write actions without modifying files.
  --offline              Skip external lookup and report deferred enrichment.
  --no-external-api      Skip external scientific APIs while keeping local workflow usable.
`);
}

function emitDiagnostics(diagnostics) {
  diagnostics.forEach(diagnostic => {
    console.log(`[${diagnostic.severity}] ${diagnostic.code}: ${diagnostic.message}`);
  });
}

function emitSummaryReport({ options, diagnostics, updatedIds, skipped, reviewRequiredIds }) {
  const report = {
    status: diagnostics.some(item => item.severity === 'error') ? 'fail' : reviewRequiredIds.length ? 'warning' : 'pass',
    provider: options.provider,
    summary: {
      updated: updatedIds.length,
      skipped: skipped.length,
      review_required: reviewRequiredIds.length
    },
    updated_ids: updatedIds,
    skipped,
    review_required_ids: reviewRequiredIds,
    diagnostics
  };
  console.log(JSON.stringify(report, null, 2));
}

function relativePath(filePath) {
  const relative = path.relative(process.cwd(), filePath);
  return relative.startsWith('..') ? path.basename(filePath) : relative;
}
