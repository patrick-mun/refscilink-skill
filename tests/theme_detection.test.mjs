#!/usr/bin/env node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectTheme, writeThemeFile } from '../tools/theme_detector.mjs';

const repoRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const checks = [];

async function main() {
  await testCssVariableDetection();
  await testSelectorDetection();
  await testNestedStylesheetPathDetection();
  await testFallbackDetection();
  await testManualOverridePreservation();
  printReport();
}

async function testCssVariableDetection() {
  const root = await createFixture({
    html: htmlWithStylesheet('style.css'),
    css: `
      :root {
        --primary: #13579b;
        --secondary: #2468ac;
        --background: #f4f7fb;
        --surface: #ffffff;
        --text: #102030;
        --muted: #667788;
        --border: #ccddee;
        --radius: 20px;
        --button-radius: 10px;
        --shadow: 0 8px 18px rgba(10, 20, 30, 0.16);
        --font-main: Inter, system-ui, sans-serif;
      }
      body { font-family: var(--font-main); line-height: 1.7; }
    `
  });
  const { theme } = await detectTheme({ targetRoot: root, htmlEntry: 'index.html' });
  record('theme.variables.status', theme.detection.status === 'detected' ? 'pass' : 'fail', 'CSS variable fixture is detected.');
  record('theme.variables.colors', theme.primary === '#13579B' && theme.secondary === '#2468AC' && theme.background === '#F4F7FB' ? 'pass' : 'fail', 'CSS variables provide normalized colors.');
  record('theme.variables.shape', theme.radius === '20px' && theme.button_radius === '10px' && theme.shadow === '0 8px 18px rgba(10, 20, 30, 0.16)' ? 'pass' : 'fail', 'CSS variables provide radius, button radius and shadow.');
  record('theme.variables.font', theme.font_family === 'Inter, system-ui, sans-serif' && theme.line_height === '1.7' ? 'pass' : 'fail', 'CSS variables and body selector provide typography.');
}

async function testSelectorDetection() {
  const root = await createFixture({
    html: htmlWithStylesheet('style.css'),
    css: `
      body {
        background-color: rgb(12, 18, 28);
        color: #f6f8fb;
        font-family: Georgia, serif;
        line-height: 1.55;
      }
      a { color: #ffcc66; }
      .eyebrow { color: #88ddee; }
      .hero-content { background-color: #182233; border-radius: 24px; box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35); }
      .hero-text { color: #b7c0cc; }
      .navbar { border-color: #334455; }
      .button { border-radius: 4px; }
    `
  });
  const { theme } = await detectTheme({ targetRoot: root, htmlEntry: 'index.html' });
  record('theme.selectors.status', theme.detection.status === 'detected' ? 'pass' : 'fail', 'Selector-only fixture is detected.');
  record('theme.selectors.colors', theme.primary === '#FFCC66' && theme.secondary === '#88DDEE' && theme.background === '#0C121C' && theme.text === '#F6F8FB' ? 'pass' : 'fail', 'Selectors provide colors when variables are absent.');
  record('theme.selectors.dark', theme.color_scheme === 'dark' ? 'pass' : 'fail', 'Dark color scheme is inferred from selector colors.');
  record('theme.selectors.shape', theme.radius === '24px' && theme.button_radius === '4px' && theme.shadow === '0 12px 24px rgba(0, 0, 0, 0.35)' ? 'pass' : 'fail', 'Selectors provide radius, button radius and shadow.');
}

async function testNestedStylesheetPathDetection() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'refscilink-theme-nested-'));
  await fs.mkdir(path.join(root, 'pages'), { recursive: true });
  await fs.writeFile(path.join(root, 'pages/index.html'), htmlWithStylesheet('../assets/site.css'), 'utf8');
  await fs.mkdir(path.join(root, 'assets'), { recursive: true });
  await fs.writeFile(path.join(root, 'assets/site.css'), `
    :root {
      --primary: #8844aa;
      --secondary: #44aa88;
      --background: #fafafa;
      --surface: #ffffff;
      --text: #111111;
      --muted: #555555;
      --border: #dddddd;
      --radius: 14px;
      --button-radius: 999px;
      --shadow: none;
    }
    body { font-family: system-ui; line-height: 1.6; }
  `, 'utf8');
  const { theme } = await detectTheme({ targetRoot: root, htmlEntry: 'pages/index.html' });
  record('theme.paths.relative_css', theme.detected_from.includes('assets/site.css') && theme.primary === '#8844AA' ? 'pass' : 'fail', 'Nested HTML resolves relative stylesheet paths safely.');
}

async function testFallbackDetection() {
  const root = await createFixture({
    html: '<!doctype html><html lang="en"><head><link rel="stylesheet" href="https://example.invalid/theme.css"></head><body></body></html>',
    css: ''
  });
  const { theme, diagnostics } = await detectTheme({ targetRoot: root, htmlEntry: 'index.html' });
  const ignoredExternal = !theme.detected_from.some(source => source.includes('example.invalid'));
  record('theme.fallback.status', theme.detection.status === 'fallback' && theme.primary === '#007B83' ? 'pass' : 'fail', 'Missing local CSS falls back to RefSciLink defaults.');
  record('theme.fallback.external_ignored', ignoredExternal ? 'pass' : 'fail', 'External stylesheet hrefs are ignored by local theme detection.');
  record('theme.fallback.diagnostic', diagnostics.some(item => item.code === 'REFSCILINK_THEME_CSS_NOT_FOUND') ? 'pass' : 'fail', 'Fallback detection reports missing CSS.');
}

async function testManualOverridePreservation() {
  const root = await createFixture({
    html: htmlWithStylesheet('style.css'),
    css: `
      :root {
        --primary: #007b83;
        --secondary: #00a6b2;
        --background: #f7fafb;
        --surface: #ffffff;
        --text: #102027;
        --muted: #607d8b;
        --border: #d8e3e7;
        --radius: 18px;
        --button-radius: 999px;
        --shadow: 0 16px 40px rgba(0, 65, 70, 0.12);
      }
      body { font-family: system-ui; line-height: 1.6; }
    `
  });
  const output = 'data/reference_bibliographique/json/theme_refscilink.json';
  const target = path.join(root, output);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${JSON.stringify({
    metadata: { generated_at: '2026-05-24T12:00:00.000Z' },
    manual_overrides: {
      primary: '#123456',
      radius: '6px',
      css_variables: {
        '--refscilink-color-primary': '#123456'
      }
    },
    maintainer_note: 'keep this'
  }, null, 2)}\n`, 'utf8');
  const { theme } = await detectTheme({ targetRoot: root, htmlEntry: 'index.html', outputRelative: output });
  await writeThemeFile({ targetRoot: root, outputRelative: output, theme });
  const written = JSON.parse(await fs.readFile(target, 'utf8'));
  record('theme.overrides.manual_fields', written.primary === '#123456' && written.radius === '6px' ? 'pass' : 'fail', 'Manual root overrides survive regeneration.');
  record('theme.overrides.css_variables', written.css_variables['--refscilink-color-primary'] === '#123456' ? 'pass' : 'fail', 'Manual CSS variable overrides update generated variable mapping.');
  record('theme.overrides.unknown_keys', written.maintainer_note === 'keep this' ? 'pass' : 'fail', 'Unknown maintainer keys survive regeneration.');
  record('theme.overrides.generated_at', written.metadata.generated_at === '2026-05-24T12:00:00.000Z' ? 'pass' : 'fail', 'Original generated_at timestamp is preserved.');
}

async function createFixture({ html, css }) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'refscilink-theme-test-'));
  await fs.writeFile(path.join(root, 'index.html'), html, 'utf8');
  if (css) await fs.writeFile(path.join(root, 'style.css'), css, 'utf8');
  return root;
}

function htmlWithStylesheet(href) {
  return `<!doctype html><html lang="fr"><head><link rel="stylesheet" href="${href}"></head><body><main></main></body></html>`;
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

main().catch(error => {
  console.error(error);
  process.exit(1);
});
