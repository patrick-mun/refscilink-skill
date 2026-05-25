#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
import process from 'node:process';

const ROOT = path.resolve('data/reference_bibliographique');
const OUTPUT = path.join(ROOT, 'json/references.json');
const REF_HEADINGS = new Set([
  'references',
  'bibliography',
  'bibliographic references',
  'cited references',
  'literature cited',
  'cited literature',
  'works cited',
  'sources',
  'references bibliographiques',
  'bibliographie',
  'sources bibliographiques',
  'litterature citee',
  'travaux cites'
]);
const BIBLIOGRAPHY_SUBSECTIONS = new Set([
  'articles',
  'journal articles',
  'scientific articles',
  'books',
  'book chapters',
  'chapters',
  'preprints',
  'reports',
  'theses',
  'dissertations',
  'datasets',
  'websites',
  'web resources',
  'standards',
  'guidelines',
  'patents',
  'clinical trials',
  'articles scientifiques',
  'livres',
  'chapitres',
  'prepublications',
  'rapports',
  'donnees',
  'sites web',
  'ressources web',
  'normes',
  'recommandations',
  'brevets',
  'essais cliniques'
]);
const BIBLIOGRAPHY_STOP_HEADINGS = new Set([
  'annexe',
  'annexes',
  'appendix',
  'appendices',
  'notes',
  'internal notes',
  'notes internes',
  'acknowledgements',
  'acknowledgments',
  'remerciements',
  'todo',
  'to do',
  'tasks',
  'a faire',
  'further reading',
  'other resources',
  'autres ressources',
  'supplementary material',
  'materiel supplementaire'
]);

const rl = readline.createInterface({ input, output });
const PRESERVED_IF_PRESENT_FIELDS = [
  'title',
  'authors',
  'year',
  'journal',
  'publisher',
  'volume',
  'issue',
  'pages',
  'doi',
  'pmid',
  'pmcid',
  'url',
  'pdf_url',
  'source_url',
  'theme',
  'keywords',
  'short_summary',
  'detailed_summary',
  'key_points',
  'project_relevance',
  'limitations',
  'metadata_status'
];
const HUMAN_VALIDATION_FIELDS = [
  'validated',
  'validation_status',
  'validated_by',
  'validation_date'
];
const VALIDATION_STATUSES = new Set(['pending_validation', 'validated', 'rejected', 'needs_revision']);
const EXTRACTION_STATUSES = new Set(['extracted', 'partially_extracted', 'incomplete', 'duplicate_suspected', 'manual_review_required']);
const METADATA_STATUSES = new Set(['not_enriched', 'metadata_found', 'metadata_partial', 'metadata_not_found', 'metadata_to_verify', 'enrichment_failed']);
const ACCESS_TYPES = new Set(['open_access', 'abstract_only', 'accepted_author_version', 'preprint', 'paywalled', 'unknown']);
const REVIEW_EXTRACTION_STATUSES = new Set(['partially_extracted', 'incomplete', 'duplicate_suspected', 'manual_review_required']);
const REVIEW_METADATA_STATUSES = new Set(['metadata_partial', 'metadata_not_found', 'metadata_to_verify', 'enrichment_failed']);

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const diagnostics = [
    createDiagnostic('info', 'REFSCILINK_RUN_STARTED', 'Reference extraction started.')
  ];
  if (options.dryRun) {
    diagnostics.push(createDiagnostic('info', 'REFSCILINK_DRY_RUN_ENABLED', 'Dry-run mode is active.'));
  }
  const filePath = options.markdownFile || await question('Path to the Markdown file containing references: ');
  rl.close();
  if (!filePath.trim()) throw new Error('No Markdown file provided.');

  const absolutePath = path.resolve(filePath.trim());
  const markdown = await fs.readFile(absolutePath, 'utf8');
  diagnostics.push(createDiagnostic('success', 'REFSCILINK_MARKDOWN_READ', 'Markdown source was read.', {
    source_markdown: filePath.trim()
  }));
  const previousPayload = await readExistingReferences(diagnostics);
  const previousReferences = previousPayload?.references || [];
  const extracted = extractReferences(markdown);
  const numberingPlan = createNumberingPlan(extracted, previousReferences);
  const references = extracted.map((entry, index) => {
    const plan = numberingPlan.entries[index];
    const reference = normalizeReference(entry, index + 1, filePath.trim(), plan.id);
    const merged = plan.previousReference ? mergePreviousReference(reference, plan.previousReference) : reference;
    return normalizeStatusFields(markDuplicateReference(merged, numberingPlan.activeSeenKeys));
  });
  diagnostics.push(createDiagnostic(references.length ? 'success' : 'review_required', references.length ? 'REFSCILINK_EXTRACT_OK' : 'REFSCILINK_NO_REFERENCES_FOUND', references.length ? `Extracted ${references.length} references from Markdown.` : 'No references were extracted from Markdown.', {
    reference_count: references.length
  }));
  if (numberingPlan.reusedIds.length) {
    diagnostics.push(createDiagnostic('info', 'REFSCILINK_IDS_REUSED', `${numberingPlan.reusedIds.length} existing reference IDs were reused.`, {
      ids: numberingPlan.reusedIds
    }));
  }
  if (numberingPlan.newIds.length) {
    diagnostics.push(createDiagnostic('info', 'REFSCILINK_IDS_CREATED', `${numberingPlan.newIds.length} new reference IDs were assigned.`, {
      ids: numberingPlan.newIds
    }));
  }
  if (numberingPlan.removedIds.length) {
    diagnostics.push(createDiagnostic('review_required', 'REFSCILINK_REFERENCES_REMOVED', `${numberingPlan.removedIds.length} previous reference IDs were not found in the current Markdown.`, {
      ids: numberingPlan.removedIds
    }));
  }
  diagnostics.push(...collectReviewRequiredDiagnostics(references));

  if (previousPayload) {
    const backupPath = getBackupPath();
    if (options.dryRun) {
      diagnostics.push(createDiagnostic('info', 'REFSCILINK_DRY_RUN_WOULD_BACKUP', 'Dry-run: existing references.json would be backed up before overwrite.', {
        action: 'would_backup',
        path: path.relative(process.cwd(), backupPath)
      }));
    } else {
      await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
      await backupExistingReferences(backupPath);
      diagnostics.push(createDiagnostic('success', 'REFSCILINK_BACKUP_CREATED', 'Existing references.json was backed up before overwrite.', {
        path: path.relative(process.cwd(), backupPath)
      }));
    }
  } else if (options.dryRun) {
    diagnostics.push(createDiagnostic('info', 'REFSCILINK_DRY_RUN_WOULD_CREATE_DIR', 'Dry-run: output directory would be created if missing.', {
      action: 'would_create',
      path: path.relative(process.cwd(), path.dirname(OUTPUT))
    }));
  }
  diagnostics.push(createDiagnostic(options.dryRun ? 'info' : 'success', options.dryRun ? 'REFSCILINK_DRY_RUN_WOULD_WRITE_JSON' : 'REFSCILINK_JSON_WRITTEN', options.dryRun ? 'Dry-run: references.json would be written.' : 'references.json was written.', {
    action: options.dryRun ? 'would_write_json' : 'write_json',
    path: path.relative(process.cwd(), OUTPUT),
    reference_count: references.length
  }));
  if (options.dryRun) {
    diagnostics.push(createDiagnostic('success', 'REFSCILINK_DRY_RUN_NO_WRITE', 'Dry-run completed without writing files.'));
  }

  const generatedAt = new Date().toISOString();
  const payload = {
    metadata: {
      generated_by: 'RefSciLink Skill',
      module_version: '0.4.0-dev',
      schema_version: '1.0.0',
      generated_at: generatedAt,
      updated_at: generatedAt,
      language: 'fr',
      source_markdown: filePath.trim(),
      source_markdown_sha256: crypto.createHash('sha256').update(markdown).digest('hex'),
      enrichment_mode: 'extract_only',
      reference_count: references.length,
      numbering_strategy: 'stable_ids_source_order_numbers',
      previous_reference_count: previousReferences.length,
      reused_reference_ids: numberingPlan.reusedIds,
      new_reference_ids: numberingPlan.newIds,
      removed_reference_ids: numberingPlan.removedIds,
      diagnostics
    },
    references
  };

  if (!options.dryRun) {
    await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
    await fs.writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  }
  emitDiagnostics(diagnostics);
}

function parseOptions(args) {
  const options = {
    dryRun: false,
    markdownFile: ''
  };
  args.forEach(arg => {
    if (arg === '--dry-run') {
      options.dryRun = true;
      return;
    }
    if (arg === '--no-dry-run') {
      options.dryRun = false;
      return;
    }
    if (!arg.startsWith('-') && !options.markdownFile) {
      options.markdownFile = arg;
    }
  });
  return options;
}

function question(label) {
  return new Promise(resolve => rl.question(label, resolve));
}

async function readExistingReferences(diagnostics) {
  try {
    const raw = await fs.readFile(OUTPUT, 'utf8');
    const payload = JSON.parse(raw);
    if (Array.isArray(payload)) {
      diagnostics.push(createDiagnostic('warning', 'REFSCILINK_LEGACY_JSON_READ', 'Legacy root-array references.json was read for compatibility.', {
        reference_count: payload.length
      }));
      return { metadata: {}, references: payload };
    }
    if (payload && Array.isArray(payload.references)) {
      diagnostics.push(createDiagnostic('info', 'REFSCILINK_EXISTING_JSON_READ', 'Existing references.json was read for rerun preservation.', {
        reference_count: payload.references.length
      }));
      return payload;
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      diagnostics.push(createDiagnostic('warning', 'REFSCILINK_EXISTING_JSON_INVALID', 'Existing references.json could not be parsed or reused.', {
        message: error.message
      }));
    }
  }
  return null;
}

function getBackupPath() {
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '_');
  return path.resolve(`backup/refscilink/reference_bibliographique_${now}/json/references.json`);
}

async function backupExistingReferences(backupPath) {
  await fs.mkdir(path.dirname(backupPath), { recursive: true });
  await fs.copyFile(OUTPUT, backupPath);
}

function createDiagnostic(severity, code, message, details = {}) {
  return { severity, code, message, details };
}

function emitDiagnostics(diagnostics) {
  diagnostics.forEach(diagnostic => {
    const line = `[${diagnostic.severity}] ${diagnostic.code}: ${diagnostic.message}`;
    if (diagnostic.severity === 'error') {
      console.error(line);
      return;
    }
    console.log(line);
  });
}

function collectReviewRequiredDiagnostics(references) {
  const extractionStatuses = countBy(references.map(reference => reference.extraction_status).filter(status => REVIEW_EXTRACTION_STATUSES.has(status)));
  const metadataStatuses = countBy(references.map(reference => reference.metadata_status).filter(status => REVIEW_METADATA_STATUSES.has(status)));
  const validationStatuses = countBy(references.map(reference => reference.validation_status).filter(status => status !== 'validated'));
  if (!Object.keys(extractionStatuses).length && !Object.keys(metadataStatuses).length && !Object.keys(validationStatuses).length) {
    return [];
  }
  return [
    createDiagnostic('review_required', 'REFSCILINK_STATUS_REVIEW_REQUIRED', 'Generated references include states requiring human review.', {
      extraction_statuses: extractionStatuses,
      metadata_statuses: metadataStatuses,
      validation_statuses: validationStatuses
    })
  ];
}

function countBy(values) {
  return values.reduce((counts, value) => {
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function extractReferences(markdown) {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let capture = false;
  let currentLevel = 99;
  let sectionTitle = '';
  let activeSectionTitle = '';
  let sectionLevel = 0;
  let buffer = [];
  let bufferStart = 0;
  let bufferHasMarker = false;
  let markerFound = false;

  const flushBuffer = (lineEnd, extractionStatus = '') => {
    if (!buffer.length) return;
    const raw = buffer.join(' ').replace(REFERENCE_MARKER_PATTERN, '').trim();
    const status = extractionStatus || classifyExtractionStatus(raw, bufferHasMarker);
    if (raw.length > 20 || hasIdentifierSignal(raw)) {
      blocks.push(toEntry(buffer, bufferStart, lineEnd, activeSectionTitle || sectionTitle, sectionLevel, status));
    }
    buffer = [];
    bufferHasMarker = false;
  };

  lines.forEach((line, index) => {
    const heading = parseMarkdownHeading(line);
    if (heading && isBibliographyHeading(heading.normalizedTitle)) {
      flushBuffer(index);
      capture = true;
      currentLevel = heading.level;
      sectionTitle = heading.title;
      activeSectionTitle = sectionTitle;
      sectionLevel = currentLevel;
      return;
    }

    if (capture && heading) {
      if (heading.level <= currentLevel || isStopHeading(heading.normalizedTitle)) {
        flushBuffer(index);
        capture = false;
        activeSectionTitle = '';
        return;
      }
      if (isBibliographySubsection(heading.normalizedTitle)) {
        flushBuffer(index);
        activeSectionTitle = `${sectionTitle} / ${heading.title}`;
        return;
      }
      flushBuffer(index);
      capture = false;
      activeSectionTitle = '';
      return;
    }

    if (!capture) return;
    const startsReference = isReferenceStart(line);
    if (startsReference && buffer.length) {
      flushBuffer(index);
    }
    if (startsReference) markerFound = true;
    if (line.trim()) {
      if (!buffer.length) bufferStart = index + 1;
      if (startsReference) bufferHasMarker = true;
      buffer.push(line);
      return;
    }
    flushBuffer(index);
  });

  flushBuffer(lines.length);
  if (blocks.length) {
    return blocks
      .filter(entry => entry.raw_reference.length > 20)
      .map(entry => ({
        ...entry,
        extraction_status: entry.extraction_status || (markerFound ? 'extracted' : 'manual_review_required')
      }));
  }

  return lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => hasIdentifierSignal(line))
    .map(({ line, index }) => ({
      raw_reference: line.trim(),
      line_start: index + 1,
      line_end: index + 1,
      section_title: '',
      section_level: 0,
      extraction_status: 'manual_review_required'
    }));
}

const REFERENCE_MARKER_PATTERN = /^\s*(?:[-*+]\s+|\d+[.)]\s+|\[[0-9]+\]\s*)/;

function isReferenceStart(line) {
  return REFERENCE_MARKER_PATTERN.test(line);
}

function classifyExtractionStatus(raw, hasMarker) {
  if (hasMarker) return 'extracted';
  if (hasStrongBibliographicSignal(raw)) return 'extracted';
  if (hasWeakBibliographicSignal(raw)) return 'partially_extracted';
  return 'manual_review_required';
}

function hasStrongBibliographicSignal(text) {
  return hasIdentifierSignal(text)
    || (/\b(19|20)\d{2}\b/.test(text) && /\b(?:Journal|Nature|Science|Cell|Proceedings|PLoS|Genome|Genetics|Lancet|JAMA|BMJ|Revue|Press|University|Université)\b/i.test(text));
}

function hasWeakBibliographicSignal(text) {
  const sentenceCount = (text.match(/\./g) || []).length;
  return /\b(19|20)\d{2}\b/.test(text) && sentenceCount >= 2 && /[A-Z][a-z]+(?:\s+[A-Z]\.)?/.test(text);
}

function parseMarkdownHeading(line) {
  const match = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
  if (!match) return null;
  const title = match[2].trim().replace(/\s+#+$/, '').trim();
  return {
    level: match[1].length,
    title,
    normalizedTitle: normalizeHeadingTitle(title)
  };
}

function normalizeHeadingTitle(title) {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[：:.\-—–]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function isBibliographyHeading(normalizedTitle) {
  return REF_HEADINGS.has(normalizedTitle);
}

function isBibliographySubsection(normalizedTitle) {
  return BIBLIOGRAPHY_SUBSECTIONS.has(normalizedTitle);
}

function isStopHeading(normalizedTitle) {
  return BIBLIOGRAPHY_STOP_HEADINGS.has(normalizedTitle);
}

function toEntry(buffer, lineStart, lineEnd, sectionTitle, sectionLevel, extractionStatus = 'extracted') {
  return {
    raw_reference: buffer.join(' ').replace(REFERENCE_MARKER_PATTERN, '').trim(),
    line_start: lineStart,
    line_end: lineEnd,
    section_title: sectionTitle,
    section_level: sectionLevel,
    extraction_status: extractionStatus
  };
}

function normalizeReference(entry, number, sourceMarkdown, id = `ref${String(number).padStart(3, '0')}`) {
  const raw = entry.raw_reference;
  const identifiers = extractIdentifiers(raw);
  const reviewNotes = [];
  if (identifiers.additional_dois.length) {
    reviewNotes.push(`Multiple DOI values detected: ${[identifiers.doi, ...identifiers.additional_dois].filter(Boolean).join('; ')}.`);
  }
  if (identifiers.additional_urls.length) {
    reviewNotes.push(`Multiple URLs detected; primary URL selected automatically: ${identifiers.additional_urls.join('; ')}.`);
  }
  return {
    id,
    number,
    raw_reference: raw,
    title: guessTitle(raw),
    authors: [],
    year: guessYear(raw),
    journal: '',
    publisher: '',
    volume: '',
    issue: '',
    pages: '',
    doi: identifiers.doi,
    pmid: identifiers.pmid,
    pmcid: identifiers.pmcid,
    url: identifiers.url,
    pdf_url: identifiers.pdf_url,
    source_url: identifiers.source_url,
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
    extraction_status: entry.extraction_status || (raw.length > 20 ? 'extracted' : 'manual_review_required'),
    metadata_status: reviewNotes.length ? 'metadata_to_verify' : 'not_enriched',
    review_notes: reviewNotes.join(' '),
    source_markdown: sourceMarkdown,
    source_location: {
      line_start: entry.line_start,
      line_end: entry.line_end,
      section_title: entry.section_title,
      section_level: entry.section_level
    },
    duplicate_of: '',
    duplicate_confidence: ''
  };
}

function createNumberingPlan(extractedEntries, previousReferences) {
  const previousIndex = buildPreviousReferenceIndex(previousReferences);
  const usedPreviousIndexes = new Set();
  const usedIds = new Set(previousReferences.map(reference => reference.id).filter(Boolean));
  const activeSeenKeys = new Map();
  let nextIdNumber = findHighestReferenceId(previousReferences) + 1;
  const entries = extractedEntries.map(entry => {
    const matched = findPreviousReference(entry, previousIndex, usedPreviousIndexes);
    if (matched) {
      usedPreviousIndexes.add(matched.index);
      return { id: matched.reference.id, previousReference: matched.reference, reused: true };
    }
    while (usedIds.has(formatReferenceId(nextIdNumber))) nextIdNumber += 1;
    const id = formatReferenceId(nextIdNumber);
    usedIds.add(id);
    nextIdNumber += 1;
    return { id, previousReference: null, reused: false };
  });
  const reusedIds = entries.filter(entry => entry.reused).map(entry => entry.id);
  const newIds = entries.filter(entry => !entry.reused).map(entry => entry.id);
  const activeIds = new Set(entries.map(entry => entry.id));
  return {
    entries,
    reusedIds,
    newIds,
    removedIds: previousReferences.map(reference => reference.id).filter(Boolean).filter(id => !activeIds.has(id)),
    activeSeenKeys
  };
}

function buildPreviousReferenceIndex(previousReferences) {
  const index = new Map();
  previousReferences.forEach((reference, position) => {
    getReferenceMatchKeys(reference).forEach(key => {
      if (!index.has(key)) index.set(key, []);
      index.get(key).push({ reference, index: position });
    });
  });
  return index;
}

function findPreviousReference(entry, previousIndex, usedPreviousIndexes) {
  const keys = getReferenceMatchKeys({ raw_reference: entry.raw_reference });
  for (const key of keys) {
    const candidates = previousIndex.get(key) || [];
    const matched = candidates.find(candidate => !usedPreviousIndexes.has(candidate.index));
    if (matched) return matched;
  }
  return null;
}

function getReferenceMatchKeys(reference) {
  const raw = reference.raw_reference || '';
  const identifiers = extractIdentifiers(raw);
  return unique([
    reference.doi || identifiers.doi ? `doi:${normalizeDOI(reference.doi || identifiers.doi).toLowerCase()}` : '',
    reference.pmid || identifiers.pmid ? `pmid:${reference.pmid || identifiers.pmid}` : '',
    reference.pmcid || identifiers.pmcid ? `pmcid:${String(reference.pmcid || identifiers.pmcid).toUpperCase()}` : '',
    reference.url || identifiers.url ? `url:${trimIdentifier(reference.url || identifiers.url).toLowerCase()}` : '',
    raw ? `raw:${normalizeReferenceFingerprint(raw)}` : ''
  ].filter(Boolean));
}

function normalizeReferenceFingerprint(raw) {
  return raw
    .replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+|\[[0-9]+\]\s*)/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function findHighestReferenceId(references) {
  return references.reduce((highest, reference) => {
    const match = String(reference.id || '').match(/^ref(\d+)$/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
}

function formatReferenceId(number) {
  return `ref${String(number).padStart(3, '0')}`;
}

function mergePreviousReference(reference, previousReference) {
  const merged = { ...reference, id: previousReference.id };
  PRESERVED_IF_PRESENT_FIELDS.forEach(field => {
    if (hasMeaningfulValue(previousReference[field]) && !hasMeaningfulValue(reference[field])) {
      merged[field] = previousReference[field];
    }
  });
  if (previousReference.access_type && previousReference.access_type !== 'unknown' && reference.access_type === 'unknown') {
    merged.access_type = previousReference.access_type;
  }
  if (previousReference.metadata_status && previousReference.metadata_status !== 'not_enriched' && reference.metadata_status === 'not_enriched') {
    merged.metadata_status = previousReference.metadata_status;
  }
  HUMAN_VALIDATION_FIELDS.forEach(field => {
    if (Object.prototype.hasOwnProperty.call(previousReference, field)) {
      merged[field] = previousReference[field];
    }
  });
  if (hasMeaningfulValue(previousReference.review_notes) && hasMeaningfulValue(reference.review_notes)) {
    merged.review_notes = `${reference.review_notes} Previous review notes: ${previousReference.review_notes}`;
  } else if (hasMeaningfulValue(previousReference.review_notes)) {
    merged.review_notes = previousReference.review_notes;
  }
  return merged;
}

function normalizeStatusFields(reference) {
  const validationStatus = VALIDATION_STATUSES.has(reference.validation_status) ? reference.validation_status : 'pending_validation';
  const extractionStatus = EXTRACTION_STATUSES.has(reference.extraction_status) ? reference.extraction_status : 'manual_review_required';
  const metadataStatus = METADATA_STATUSES.has(reference.metadata_status) ? reference.metadata_status : 'metadata_to_verify';
  const accessType = ACCESS_TYPES.has(reference.access_type) ? reference.access_type : 'unknown';
  return {
    ...reference,
    validated: validationStatus === 'validated',
    validation_status: validationStatus,
    validated_by: validationStatus === 'validated' ? reference.validated_by || 'human' : '',
    validation_date: validationStatus === 'validated' ? reference.validation_date || new Date().toISOString() : '',
    extraction_status: extractionStatus,
    metadata_status: metadataStatus,
    access_type: accessType
  };
}

function hasMeaningfulValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return value !== undefined && value !== null && value !== false;
}

function markDuplicateReference(reference, activeSeenKeys) {
  const duplicateKeys = getReferenceMatchKeys(reference).filter(key => !key.startsWith('raw:') || normalizeReferenceFingerprint(reference.raw_reference).length > 20);
  for (const key of duplicateKeys) {
    if (!activeSeenKeys.has(key)) continue;
    const previousId = activeSeenKeys.get(key);
    return {
      ...reference,
      extraction_status: 'duplicate_suspected',
      duplicate_of: previousId,
      duplicate_confidence: key.startsWith('raw:') ? 'medium' : 'high'
    };
  }
  duplicateKeys.forEach(key => activeSeenKeys.set(key, reference.id));
  return reference;
}

function hasIdentifierSignal(text) {
  return Boolean(extractDOIs(text).length || detectPMID(text) || detectPMCID(text) || extractURLs(text).length);
}

function extractIdentifiers(text) {
  const dois = extractDOIs(text);
  const urls = extractURLs(text);
  const doi = dois[0] || '';
  const pdfUrls = urls.filter(isPDFUrl);
  const doiUrls = urls.filter(url => extractDOIs(url).length);
  const nonDoiNonPdfUrls = urls.filter(url => !isPDFUrl(url) && !extractDOIs(url).length);
  const url = nonDoiNonPdfUrls[0] || (doi ? `https://doi.org/${doi}` : '');
  const pdfUrl = pdfUrls[0] || '';
  const sourceUrl = nonDoiNonPdfUrls.slice(1)[0] || doiUrls.find(url => !doi || !url.toLowerCase().includes(doi.toLowerCase())) || '';
  const selectedUrls = new Set([url, pdfUrl, sourceUrl].filter(Boolean));
  return {
    doi,
    additional_dois: dois.slice(1),
    pmid: detectPMID(text),
    pmcid: detectPMCID(text),
    url,
    pdf_url: pdfUrl,
    source_url: sourceUrl,
    additional_urls: urls.filter(url => !selectedUrls.has(url))
  };
}

function extractDOIs(text) {
  const matches = text.match(/(?:doi\s*:?\s*|https?:\/\/(?:dx\.)?doi\.org\/)?(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)/gi) || [];
  return unique(matches.map(match => normalizeDOI(match)).filter(Boolean));
}

function normalizeDOI(value) {
  return trimIdentifier(value)
    .replace(/^doi\s*:?\s*/i, '')
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
    .trim();
}

function extractURLs(text) {
  const matches = text.match(/https?:\/\/[^\s<>"']+/gi) || [];
  return unique(matches.map(trimIdentifier).filter(Boolean));
}

function isPDFUrl(url) {
  return /\.pdf(?:$|[?#])/i.test(url) || /(?:^|\b)(pdf|download)(?:\b|=|\/)/i.test(url);
}

function trimIdentifier(value) {
  let normalized = String(value).trim();
  while (/[.,;:)\]]$/.test(normalized)) normalized = normalized.slice(0, -1);
  return normalized;
}

function unique(values) {
  return [...new Set(values)];
}

function detectPMID(text) {
  const match = text.match(/\b(?:PubMed\s+)?PMID\s*:?\s*(\d+)\b|\bpubmed\s*:?\s*(\d+)\b/i);
  return match ? (match[1] || match[2]) : '';
}

function detectPMCID(text) {
  const match = text.match(/\b(?:PubMed\s+Central\s+)?PMCID\s*:?\s*(PMC\s*\d+|\d+)\b|\b(PMC\s*\d+)\b/i);
  if (!match) return '';
  const value = (match[1] || match[2]).replace(/\s+/g, '');
  return value.toUpperCase().startsWith('PMC') ? value.toUpperCase() : `PMC${value}`;
}

function detectDOI(text) {
  return extractDOIs(text)[0] || '';
}

function detectURL(text) {
  return extractURLs(text)[0] || '';
}

function guessYear(raw) {
  const match = raw.match(/\b(19|20)\d{2}\b/);
  return match ? match[0] : '';
}

function guessTitle(raw) {
  const parts = raw.split('.').map(part => part.trim()).filter(Boolean);
  return parts.length > 1 ? parts[1] : raw.slice(0, 140);
}

main().catch(error => {
  emitDiagnostics([
    createDiagnostic('error', 'REFSCILINK_RUN_FAILED', 'Reference extraction failed.', {
      message: error.message
    })
  ]);
  process.exit(1);
});
