#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const ROOT = path.resolve('data/reference_bibliographique');
const OUTPUT = path.join(ROOT, 'json/references.json');
const REF_HEADINGS = /^(#{1,6})\s*(références bibliographiques|references bibliographiques|références|references|bibliographie|bibliography|sources|literature cited)\s*$/i;

const rl = readline.createInterface({ input, output });

async function main() {
  const filePath = await rl.question('Path to the Markdown file containing references: ');
  rl.close();
  if (!filePath.trim()) throw new Error('No Markdown file provided.');

  const absolutePath = path.resolve(filePath.trim());
  const markdown = await fs.readFile(absolutePath, 'utf8');
  const extracted = extractReferences(markdown);
  const references = extracted.map((entry, index) => normalizeReference(entry, index + 1, filePath.trim()));

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
      reference_count: references.length
    },
    references
  };

  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  await fs.writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`OK: ${references.length} references written to ${OUTPUT}`);
}

function extractReferences(markdown) {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let capture = false;
  let currentLevel = 99;
  let sectionTitle = '';
  let sectionLevel = 0;
  let buffer = [];
  let bufferStart = 0;
  let markerFound = false;

  lines.forEach((line, index) => {
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (REF_HEADINGS.test(line.trim())) {
      capture = true;
      currentLevel = line.match(/^(#{1,6})/)[1].length;
      sectionTitle = line.replace(/^#{1,6}\s*/, '').trim();
      sectionLevel = currentLevel;
      return;
    }
    if (capture && heading && heading[1].length <= currentLevel) {
      capture = false;
    }
    if (!capture) return;
    const startsReference = /^\s*(?:[-*+]\s+|\d+[.)]\s+|\[[0-9]+\]\s*)/.test(line);
    if (startsReference && buffer.length) {
      blocks.push(toEntry(buffer, bufferStart, index, sectionTitle, sectionLevel));
      buffer = [];
    }
    if (startsReference) markerFound = true;
    if (line.trim()) {
      if (!buffer.length) bufferStart = index + 1;
      buffer.push(line);
      return;
    }
    if (!markerFound && buffer.length) {
      blocks.push(toEntry(buffer, bufferStart, index, sectionTitle, sectionLevel, 'manual_review_required'));
      buffer = [];
    }
  });

  if (buffer.length) blocks.push(toEntry(buffer, bufferStart, lines.length, sectionTitle, sectionLevel));
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
    .filter(({ line }) => detectDOI(line))
    .map(({ line, index }) => ({
      raw_reference: line.trim(),
      line_start: index + 1,
      line_end: index + 1,
      section_title: '',
      section_level: 0,
      extraction_status: 'manual_review_required'
    }));
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

function normalizeReference(entry, number, sourceMarkdown) {
  const raw = entry.raw_reference;
  const doi = detectDOI(raw);
  const url = detectURL(raw);
  return {
    id: `ref${String(number).padStart(3, '0')}`,
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
    doi,
    pmid: detectPMID(raw),
    pmcid: detectPMCID(raw),
    url: url || (doi ? `https://doi.org/${doi}` : ''),
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
    extraction_status: entry.extraction_status || (raw.length > 20 ? 'extracted' : 'manual_review_required'),
    metadata_status: 'not_enriched',
    review_notes: '',
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

function detectDOI(text) {
  const match = text.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
  return match ? match[0].replace(/[).,;]+$/, '') : '';
}

function detectURL(text) {
  const match = text.match(/https?:\/\/[^\s)]+/i);
  return match ? match[0].replace(/[).,;]+$/, '') : '';
}

function detectPMID(text) {
  const match = text.match(/\bPMID\s*:?\s*(\d+)\b/i);
  return match ? match[1] : '';
}

function detectPMCID(text) {
  const match = text.match(/\bPMC(?:ID)?\s*:?\s*(PMC\d+|\d+)\b/i);
  if (!match) return '';
  return match[1].startsWith('PMC') ? match[1] : `PMC${match[1]}`;
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
