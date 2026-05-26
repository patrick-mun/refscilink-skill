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
  const options = parseCommonOptions(process.argv.slice(2), 'EuropePMC');
  const fixture = await readFixtureMap(options.fixture);
  await runEnrichment(options, reference => lookupEuropePmc(reference, fixture));
}

async function lookupEuropePmc(reference, fixture) {
  const key = reference.pmcid || reference.pmid || reference.doi || '';
  if (!key) return { metadata: null, status: 'metadata_not_found', reason: 'missing_identifier' };
  if (fixture) return { metadata: normalizeFixtureMetadata(fixture[key]), status: fixture[key] ? 'metadata_found' : 'metadata_not_found', reason: fixture[key] ? '' : 'fixture_missing_identifier' };

  const query = buildEuropePmcQuery(reference);
  const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&format=json&pageSize=1`;
  const response = await fetch(url);
  if (!response.ok) return { metadata: null, status: 'enrichment_failed', reason: `europepmc_http_${response.status}` };
  const data = await response.json();
  return { metadata: normalizeEuropePmcResult(data.resultList?.result?.[0]), status: data.resultList?.result?.[0] ? 'metadata_found' : 'metadata_not_found' };
}

function buildEuropePmcQuery(reference) {
  if (reference.pmcid) return `PMCID:${reference.pmcid}`;
  if (reference.pmid) return `EXT_ID:${reference.pmid}`;
  return `DOI:"${reference.doi}"`;
}

function normalizeEuropePmcResult(result) {
  if (!result) return null;
  return {
    title: result.title || '',
    authors: splitAuthors(result.authorString || ''),
    year: result.pubYear || '',
    journal: result.journalTitle || '',
    volume: result.journalVolume || '',
    issue: result.issue || '',
    pages: result.pageInfo || '',
    doi: result.doi || '',
    pmid: result.pmid || '',
    pmcid: result.pmcid || '',
    source_url: result.pmid ? `https://europepmc.org/article/MED/${result.pmid}` : '',
    url: result.fullTextUrlList?.fullTextUrl?.[0]?.url || ''
  };
}

function splitAuthors(authorString) {
  return authorString
    .split(/\s*,\s*/)
    .map(author => author.trim())
    .filter(Boolean);
}

main().catch(error => {
  const code = error instanceof UsageError ? 'REFSCILINK_ENRICHMENT_USAGE_ERROR' : 'REFSCILINK_DEFERRED_ENRICHMENT_FAILED';
  console.error(`[error] ${code}: ${error.message}`);
  process.exit(1);
});
