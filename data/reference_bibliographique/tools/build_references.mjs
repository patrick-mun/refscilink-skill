#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const ROOT = path.resolve('data/reference_bibliographique');
const OUTPUT = path.join(ROOT, 'json/references.json');
const REF_HEADINGS = /^(#{1,6})\s*(références bibliographiques|references bibliographiques|références|references|bibliographie|bibliography|sources|literature cited)\s*$/i;

const rl = readline.createInterface({ input, output });

async function main() {
  const filePath = await rl.question('Path to the Markdown file containing references: ');
  rl.close();
  if (!filePath.trim()) throw new Error('Aucun fichier fourni.');
  const absolutePath = path.resolve(filePath.trim());
  const markdown = await fs.readFile(absolutePath, 'utf8');
  const refs = extractReferences(markdown);
  const enriched = [];

  for (let index = 0; index < refs.length; index++) {
    const raw = refs[index];
    const doi = detectDOI(raw);
    const meta = doi ? await fetchCrossref(doi).catch(() => ({})) : {};
    enriched.push(normalizeReference(raw, index + 1, absolutePath, doi, meta));
  }

  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  await fs.writeFile(OUTPUT, JSON.stringify(enriched, null, 2), 'utf8');
  console.log(`OK: ${enriched.length} références écrites dans ${OUTPUT}`);
}

function extractReferences(markdown) {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let capture = false;
  let currentLevel = 99;
  let buffer = [];

  for (const line of lines) {
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (REF_HEADINGS.test(line.trim())) {
      capture = true;
      currentLevel = line.match(/^(#{1,6})/)[1].length;
      continue;
    }
    if (capture && heading && heading[1].length <= currentLevel) break;
    if (capture) buffer.push(line);
  }

  const text = buffer.join('\n').trim();
  const candidates = text
    .split(/\n(?=\s*(?:[-*+]\s+|\d+[.)]\s+|\[[0-9]+\]))/g)
    .map(s => s.replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+|\[[0-9]+\])\s*/, '').trim())
    .filter(s => s.length > 20);

  if (candidates.length) return candidates;
  const doiLines = markdown.split(/\r?\n/).filter(line => detectDOI(line));
  return doiLines.map(line => line.trim());
}

function detectDOI(text) {
  const match = text.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
  return match ? match[0].replace(/[).,;]+$/, '') : '';
}

async function fetchCrossref(doi) {
  const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
  const response = await fetch(url, { headers: { 'User-Agent': 'RefSciLinkSkill/0.1 (mailto:example@example.org)' } });
  if (!response.ok) return {};
  const data = await response.json();
  return data.message || {};
}

function normalizeReference(raw, numero, source, doi, meta = {}) {
  const title = Array.isArray(meta.title) ? meta.title[0] : guessTitle(raw);
  const authors = Array.isArray(meta.author) ? meta.author.map(a => [a.given, a.family].filter(Boolean).join(' ')) : [];
  const year = meta?.published?.['date-parts']?.[0]?.[0] || meta?.issued?.['date-parts']?.[0]?.[0] || guessYear(raw);
  const journal = Array.isArray(meta['container-title']) ? meta['container-title'][0] : '';
  return {
    id: `ref${String(numero).padStart(3, '0')}`,
    numero,
    raw_reference: raw,
    titre: title || raw,
    auteurs: authors,
    annee: year ? String(year) : '',
    journal,
    doi: doi || meta.DOI || '',
    pmid: '',
    url: meta.URL || (doi ? `https://doi.org/${doi}` : ''),
    pdf_url: '',
    theme: 'À classer',
    access_type: 'unknown',
    resume_court: 'Résumé court à générer par IA puis à valider.',
    resume_detaille: 'Résumé détaillé à générer par IA après recherche dans les bases bibliographiques.',
    points_cles: [],
    interet_pour_le_projet: 'À compléter selon le sujet du site ou de la présentation.',
    limites: 'À compléter après lecture critique.',
    validated: false,
    validation_status: 'a_valider',
    source_markdown: source
  };
}

function guessYear(raw) {
  const match = raw.match(/\b(19|20)\d{2}\b/);
  return match ? match[0] : '';
}

function guessTitle(raw) {
  const parts = raw.split('.').map(s => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts[1] : raw.slice(0, 140);
}

main().catch(error => {
  console.error(`Erreur: ${error.message}`);
  process.exit(1);
});
