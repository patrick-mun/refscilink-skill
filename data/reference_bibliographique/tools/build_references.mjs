#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';

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

async function main() {
  const filePath = await question('Path to the Markdown file containing references: ');
  rl.close();
  if (!filePath.trim()) throw new Error('No Markdown file provided.');

  const absolutePath = path.resolve(filePath.trim());
  const markdown = await fs.readFile(absolutePath, 'utf8');
  const previousPayload = await readExistingReferences();
  const previousReferences = previousPayload?.references || [];
  const extracted = extractReferences(markdown);
  const numberingPlan = createNumberingPlan(extracted, previousReferences);
  const references = extracted.map((entry, index) => {
    const plan = numberingPlan.entries[index];
    const reference = normalizeReference(entry, index + 1, filePath.trim(), plan.id);
    const merged = plan.previousReference ? mergePreviousReference(reference, plan.previousReference) : reference;
    return normalizeStatusFields(markDuplicateReference(merged, numberingPlan.activeSeenKeys));
  });

  const payload = {
    metadata: {
      generated_by: 'RefSciLink Skill',
      version: '0.2.0-dev',
      schema_version: '1.0.0',
      generated_at: new Date().toISOString(),
      language: 'fr',
      source_markdown: filePath.trim(),
      source_markdown_sha256: crypto.createHash('sha256').update(markdown).digest('hex'),
      enrichment_mode: 'extract_only',
      reference_count: references.length,
      numbering_strategy: 'stable_ids_source_order_numbers',
      previous_reference_count: previousReferences.length,
      reused_reference_ids: numberingPlan.reusedIds,
      new_reference_ids: numberingPlan.newIds,
      removed_reference_ids: numberingPlan.removedIds
    },
    references
  };

  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  if (previousPayload) await backupExistingReferences();
  await fs.writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`OK: ${references.length} references written to ${OUTPUT}`);
  if (numberingPlan.removedIds.length) {
    console.log(`Review: ${numberingPlan.removedIds.length} previous reference IDs were not found in the current Markdown: ${numberingPlan.removedIds.join(', ')}`);
  }
}

function question(label) {
  return new Promise(resolve => rl.question(label, resolve));
}

async function readExistingReferences() {
  try {
    const raw = await fs.readFile(OUTPUT, 'utf8');
    const payload = JSON.parse(raw);
    if (Array.isArray(payload)) return { metadata: {}, references: payload };
    if (payload && Array.isArray(payload.references)) return payload;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`Warning: existing references.json could not be reused: ${error.message}`);
    }
  }
  return null;
}

async function backupExistingReferences() {
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '_');
  const backupPath = path.resolve(`backup/refscilink/reference_bibliographique_${now}/json/references.json`);
  await fs.mkdir(path.dirname(backupPath), { recursive: true });
  await fs.copyFile(OUTPUT, backupPath);
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
  let markerFound = false;

  const flushBuffer = (lineEnd, extractionStatus = 'extracted') => {
    if (!buffer.length) return;
    blocks.push(toEntry(buffer, bufferStart, lineEnd, activeSectionTitle || sectionTitle, sectionLevel, extractionStatus));
    buffer = [];
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
    const startsReference = /^\s*(?:[-*+]\s+|\d+[.)]\s+|\[[0-9]+\]\s*)/.test(line);
    if (startsReference && buffer.length) {
      flushBuffer(index);
      buffer = [];
    }
    if (startsReference) markerFound = true;
    if (line.trim()) {
      if (!buffer.length) bufferStart = index + 1;
      buffer.push(line);
      return;
    }
    if (!markerFound && buffer.length) {
      flushBuffer(index, 'manual_review_required');
      buffer = [];
    }
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
    raw_reference: buffer.join(' ').replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+|\[[0-9]+\]\s*)/, '').trim(),
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
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
