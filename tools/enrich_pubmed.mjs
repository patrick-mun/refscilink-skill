#!/usr/bin/env node
import process from 'node:process';
import {
  UsageError,
  normalizeFixtureMetadata,
  parseCommonOptions,
  readFixtureMap,
  runEnrichment
} from './refscilink_enrichment_common.mjs';

async function main() {
  const options = parseCommonOptions(process.argv.slice(2), 'PubMed');
  const fixture = await readFixtureMap(options.fixture);
  await runEnrichment(options, reference => lookupPubMed(reference, fixture));
}

async function lookupPubMed(reference, fixture) {
  const pmid = reference.pmid || '';
  if (!pmid) return { metadata: null, status: 'metadata_not_found', reason: 'missing_pmid' };
  if (fixture) return { metadata: normalizeFixtureMetadata(fixture[pmid]), status: fixture[pmid] ? 'metadata_found' : 'metadata_not_found', reason: fixture[pmid] ? '' : 'fixture_missing_pmid' };

  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${encodeURIComponent(pmid)}&retmode=xml`;
  const response = await fetch(url);
  if (!response.ok) return { metadata: null, status: 'enrichment_failed', reason: `pubmed_http_${response.status}` };
  return { metadata: parsePubMedXml(await response.text(), pmid), status: 'metadata_found' };
}

function parsePubMedXml(xml, pmid) {
  // PubMed EFetch returns XML; these small extractors intentionally cover only
  // stable bibliographic fields used by RefSciLink's current schema.
  const authors = [...xml.matchAll(/<Author\b[\s\S]*?<\/Author>/g)].map(match => {
    const block = match[0];
    const last = text(block, 'LastName');
    const initials = text(block, 'Initials');
    return [last, initials].filter(Boolean).join(' ');
  }).filter(Boolean);
  return {
    title: text(xml, 'ArticleTitle'),
    authors,
    year: text(xml, 'Year'),
    journal: text(xml, 'Title'),
    volume: text(xml, 'Volume'),
    issue: text(xml, 'Issue'),
    pages: text(xml, 'MedlinePgn'),
    doi: articleId(xml, 'doi'),
    pmid,
    pmcid: articleId(xml, 'pmc'),
    source_url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
  };
}

function text(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeXml(match[1].replace(/<[^>]+>/g, '').trim()) : '';
}

function articleId(xml, type) {
  const match = xml.match(new RegExp(`<ArticleId\\s+IdType=["']${type}["'][^>]*>([\\s\\S]*?)<\\/ArticleId>`, 'i'));
  return match ? decodeXml(match[1].trim()) : '';
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

main().catch(error => {
  const code = error instanceof UsageError ? 'REFSCILINK_ENRICHMENT_USAGE_ERROR' : 'REFSCILINK_DEFERRED_ENRICHMENT_FAILED';
  console.error(`[error] ${code}: ${error.message}`);
  process.exit(1);
});
