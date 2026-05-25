#!/usr/bin/env node
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const defaultOutput = 'data/reference_bibliographique/json/theme_refscilink.json';
const defaultBackupDir = 'backup/refscilink';

const fallbackTheme = {
  primary: '#007B83',
  secondary: '#00A6B2',
  background: '#f7fafb',
  surface: '#ffffff',
  text: '#102027',
  muted: '#607d8b',
  border: '#d8e3e7',
  error: '#b00020',
  success: '#176b3a',
  font_family: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  font_size_base: '16px',
  line_height: '1.6',
  radius: '12px',
  button_radius: '999px',
  card_radius: '18px',
  shadow: '0 12px 30px rgba(0, 0, 0, 0.08)',
  spacing_density: 'normal',
  color_scheme: 'light'
};

export async function detectTheme(options = {}) {
  const targetRoot = path.resolve(options.targetRoot || repoRoot);
  const htmlEntry = normalizeRelativePath(options.htmlEntry || 'index.html');
  const outputRelative = normalizeRelativePath(options.outputRelative || defaultOutput);
  const htmlPath = path.join(targetRoot, htmlEntry);
  const diagnostics = [];
  const detectedFrom = [];

  let html = '';
  if (existsSync(htmlPath)) {
    html = await fs.readFile(htmlPath, 'utf8');
    detectedFrom.push(htmlEntry);
  } else {
    diagnostics.push(diagnostic('warning', 'REFSCILINK_THEME_HTML_NOT_FOUND', 'HTML entry point was not found; theme detection will use fallback values.', { path: htmlEntry }));
  }

  const cssCandidates = unique([
    ...(options.cssFiles || []).map(normalizeRelativePath),
    ...extractStylesheetHrefs(html, htmlEntry)
  ]);
  const cssSources = [];
  for (const cssRelative of cssCandidates) {
    if (!isSafeRelativePath(cssRelative)) continue;
    const cssPath = path.join(targetRoot, cssRelative);
    if (!existsSync(cssPath)) continue;
    cssSources.push({ relative: cssRelative, content: await fs.readFile(cssPath, 'utf8') });
    detectedFrom.push(cssRelative);
  }

  if (!cssSources.length) {
    diagnostics.push(diagnostic('warning', 'REFSCILINK_THEME_CSS_NOT_FOUND', 'No readable stylesheet was found; theme detection will use fallback values.'));
  }

  const css = cssSources.map(source => source.content).join('\n\n');
  const variables = extractCssVariables(css);
  const selectors = extractSelectorDeclarations(css);
  const theme = buildTheme({ variables, selectors, html, detectedFrom, targetRoot, htmlEntry, outputRelative });
  diagnostics.push(diagnostic(theme.detection.status === 'detected' ? 'success' : 'warning', theme.detection.status === 'detected' ? 'REFSCILINK_THEME_DETECTED' : 'REFSCILINK_THEME_FALLBACK_USED', theme.detection.host_style_summary, {
    confidence: theme.detection.confidence,
    detected_from: detectedFrom
  }));

  return { theme, diagnostics };
}

export async function writeThemeFile({ targetRoot = repoRoot, outputRelative = defaultOutput, theme, dryRun = false } = {}) {
  const normalizedOutput = normalizeRelativePath(outputRelative);
  const target = path.join(targetRoot, normalizedOutput);
  const diagnostics = [];
  const existing = await readJsonIfValid(target);
  const outputTheme = mergeExistingTheme(theme, existing);
  if (dryRun) {
    diagnostics.push(diagnostic('info', existsSync(target) ? 'REFSCILINK_DRY_RUN_WOULD_BACKUP' : 'REFSCILINK_DRY_RUN_WOULD_WRITE_JSON', 'Dry-run: theme JSON would be written.', { path: normalizedOutput }));
    return { diagnostics };
  }

  if (existsSync(target)) {
    const backupPath = await backupFile(targetRoot, normalizedOutput);
    diagnostics.push(diagnostic('success', 'REFSCILINK_BACKUP_CREATED', 'Existing theme JSON was backed up before update.', { path: backupPath }));
  }

  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${JSON.stringify(outputTheme, null, 2)}\n`, 'utf8');
  diagnostics.push(diagnostic('success', 'REFSCILINK_THEME_WRITTEN', 'Theme JSON was written.', { path: normalizedOutput }));
  return { diagnostics };
}

async function readJsonIfValid(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return null;
  }
}

function mergeExistingTheme(theme, existing) {
  if (!existing || typeof existing !== 'object' || Array.isArray(existing)) return theme;
  const merged = {
    ...preserveUnknownThemeKeys(existing),
    ...theme,
    metadata: {
      ...(existing.metadata || {}),
      ...theme.metadata,
      generated_at: existing.metadata?.generated_at || theme.metadata.generated_at
    },
    manual_overrides: normalizeManualOverrides(existing.manual_overrides),
    detection: {
      ...theme.detection,
      preserved_manual_overrides: Boolean(existing.manual_overrides && Object.keys(existing.manual_overrides).length)
    }
  };
  applyManualOverrides(merged);
  merged.css_variables = buildCssVariables(merged);
  return merged;
}

function preserveUnknownThemeKeys(existing) {
  const known = new Set([
    'metadata',
    'theme_mode',
    'detected_from',
    'primary',
    'secondary',
    'background',
    'surface',
    'text',
    'muted',
    'border',
    'error',
    'success',
    'font_family',
    'font_size_base',
    'line_height',
    'radius',
    'button_radius',
    'card_radius',
    'shadow',
    'spacing_density',
    'color_scheme',
    'css_variables',
    'detection',
    'notes',
    'manual_overrides'
  ]);
  return Object.fromEntries(Object.entries(existing).filter(([key]) => !known.has(key)));
}

function normalizeManualOverrides(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function applyManualOverrides(theme) {
  const overrides = theme.manual_overrides || {};
  const editableFields = [
    'primary',
    'secondary',
    'background',
    'surface',
    'text',
    'muted',
    'border',
    'error',
    'success',
    'font_family',
    'font_size_base',
    'line_height',
    'radius',
    'button_radius',
    'card_radius',
    'shadow',
    'spacing_density',
    'color_scheme'
  ];
  for (const field of editableFields) {
    if (typeof overrides[field] === 'string' && sanitizeCssValue(overrides[field])) {
      theme[field] = sanitizeCssValue(overrides[field]);
    }
  }
}

function buildTheme({ variables, selectors, html, detectedFrom, targetRoot, htmlEntry, outputRelative }) {
  const resolved = Object.fromEntries(Object.entries(variables).map(([key, value]) => [key, resolveCssValue(value, variables)]));
  const host = {
    primary: firstCssValue(resolved, ['primary', 'color-primary', 'brand', 'accent', 'link-color'], selectors, ['.button-primary', '.nav-links a:hover', 'a'], ['color', 'background-color', 'background']),
    secondary: firstCssValue(resolved, ['secondary', 'color-secondary', 'accent-2', 'highlight'], selectors, ['.eyebrow', '.card-label', '.button-primary'], ['color', 'background-color', 'background']),
    background: firstCssValue(resolved, ['background', 'bg', 'color-background', 'body-bg'], selectors, ['body'], ['background-color', 'background']),
    surface: firstCssValue(resolved, ['surface', 'card', 'panel', 'color-surface'], selectors, ['.hero-content', '.info-card', '.card', '.navbar'], ['background-color', 'background']),
    text: firstCssValue(resolved, ['text', 'color-text', 'foreground', 'body-color'], selectors, ['body'], ['color']),
    muted: firstCssValue(resolved, ['muted', 'color-muted', 'text-muted', 'secondary-text'], selectors, ['.hero-text', '.nav-links a'], ['color']),
    border: firstCssValue(resolved, ['border', 'color-border', 'border-color'], selectors, ['.navbar', '.info-card'], ['border-color', 'border']),
    radius: firstCssValue(resolved, ['radius', 'border-radius'], selectors, ['.card', '.info-card', '.hero-content'], ['border-radius']),
    button_radius: firstCssValue(resolved, ['button-radius', 'radius-button'], selectors, ['.button', '.nav-links a'], ['border-radius']),
    shadow: firstCssValue(resolved, ['shadow', 'card-shadow', 'shadow-card'], selectors, ['.card', '.info-card', '.hero-content', '.navbar'], ['box-shadow']),
    font_family: firstCssValue(resolved, ['font-main', 'font-family', 'font-sans', 'body-font'], selectors, ['body'], ['font-family']),
    line_height: firstCssValue(resolved, ['line-height', 'line-height-base'], selectors, ['body'], ['line-height'])
  };

  const colors = {
    primary: normalizeColor(host.primary) || fallbackTheme.primary,
    secondary: normalizeColor(host.secondary) || normalizeColor(host.primary) || fallbackTheme.secondary,
    background: normalizeColor(host.background) || fallbackTheme.background,
    surface: normalizeColor(host.surface) || fallbackTheme.surface,
    text: normalizeColor(host.text) || fallbackTheme.text,
    muted: normalizeColor(host.muted) || fallbackTheme.muted,
    border: normalizeColor(host.border) || fallbackTheme.border
  };
  const detectedCount = Object.values(host).filter(Boolean).length;
  const status = detectedCount >= 4 && detectedFrom.length > 1 ? 'detected' : 'fallback';
  const confidence = detectedCount >= 8 ? 'high' : detectedCount >= 5 ? 'medium' : status === 'detected' ? 'low' : 'unknown';
  const colorScheme = inferColorScheme(colors.background, colors.text);
  const now = new Date().toISOString();
  const sourceProject = path.basename(targetRoot);

  const theme = {
    metadata: {
      generated_by: 'RefSciLink Theme Detector',
      module_version: '0.4.0-dev',
      schema_version: '1.0.0',
      generated_at: now,
      updated_at: now,
      language: detectHtmlLanguage(html),
      source_project: sourceProject,
      source_entrypoint: htmlEntry
    },
    theme_mode: 'auto_override',
    detected_from: detectedFrom,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    muted: colors.muted,
    border: colors.border,
    error: fallbackTheme.error,
    success: fallbackTheme.success,
    font_family: sanitizeCssValue(host.font_family) || fallbackTheme.font_family,
    font_size_base: fallbackTheme.font_size_base,
    line_height: sanitizeCssValue(host.line_height) || fallbackTheme.line_height,
    radius: sanitizeCssValue(host.radius) || fallbackTheme.radius,
    button_radius: sanitizeCssValue(host.button_radius) || sanitizeCssValue(host.radius) || fallbackTheme.button_radius,
    card_radius: sanitizeCssValue(host.radius) || fallbackTheme.card_radius,
    shadow: sanitizeCssValue(host.shadow) || fallbackTheme.shadow,
    spacing_density: 'normal',
    color_scheme: colorScheme,
    css_variables: {},
    detection: {
      status,
      confidence,
      strategy: 'css_variables_and_host_selectors',
      host_style_summary: status === 'detected'
        ? `Detected host theme from ${detectedFrom.join(', ')}.`
        : 'Fallback scientific turquoise visual identity.',
      warnings: status === 'detected' ? [] : ['Theme detection did not find enough host style signals.']
    },
    notes: status === 'detected'
      ? `Generated from ${path.relative(targetRoot, path.join(targetRoot, outputRelative)) || outputRelative}. Edit manually to override.`
      : 'Fallback values. Edit manually or regenerate during installation.'
  };

  theme.css_variables = buildCssVariables(theme);

  return theme;
}

function buildCssVariables(theme) {
  return {
    '--refscilink-color-primary': theme.primary,
    '--refscilink-color-secondary': theme.secondary,
    '--refscilink-color-background': theme.background,
    '--refscilink-color-surface': theme.surface,
    '--refscilink-color-text': theme.text,
    '--refscilink-color-muted': theme.muted,
    '--refscilink-color-border': theme.border,
    '--refscilink-color-error': theme.error,
    '--refscilink-color-success': theme.success,
    '--refscilink-font-family': theme.font_family,
    '--refscilink-radius': theme.radius,
    '--refscilink-radius-button': theme.button_radius,
    '--refscilink-radius-card': theme.card_radius,
    '--refscilink-shadow-card': theme.shadow
  };
}

function extractStylesheetHrefs(html, htmlEntry) {
  const hrefs = [];
  const htmlDir = normalizeRelativePath(path.dirname(htmlEntry));
  const pattern = /<link\b[^>]*rel=["'][^"']*stylesheet[^"']*["'][^>]*>/gi;
  const hrefPattern = /\bhref=["']([^"']+)["']/i;
  for (const match of html.matchAll(pattern)) {
    const href = match[0].match(hrefPattern)?.[1];
    if (!href) continue;
    const cleanHref = stripUrlQuery(href);
    hrefs.push(htmlDir && htmlDir !== '.' ? normalizeRelativePath(path.posix.join(htmlDir, cleanHref)) : normalizeRelativePath(cleanHref));
  }
  return hrefs;
}

function extractCssVariables(css) {
  const variables = {};
  const rootBlocks = css.match(/:root\s*\{[^}]*\}/gi) || [];
  for (const block of rootBlocks) {
    for (const match of block.matchAll(/(--[a-z0-9_-]+)\s*:\s*([^;{}]+);/gi)) {
      variables[match[1].slice(2)] = match[2].trim();
    }
  }
  return variables;
}

function extractSelectorDeclarations(css) {
  const selectors = new Map();
  for (const match of css.matchAll(/([^{}]+)\{([^{}]+)\}/g)) {
    const selectorList = match[1].split(',').map(item => item.trim());
    const declarations = {};
    for (const declaration of match[2].split(';')) {
      const [property, ...valueParts] = declaration.split(':');
      if (!property || !valueParts.length) continue;
      declarations[property.trim()] = valueParts.join(':').trim();
    }
    for (const selector of selectorList) {
      selectors.set(selector, { ...(selectors.get(selector) || {}), ...declarations });
    }
  }
  return selectors;
}

function firstCssValue(variables, variableNames, selectors, selectorNames, properties) {
  for (const name of variableNames) {
    if (variables[name]) return variables[name];
  }
  for (const selector of selectorNames) {
    const declarations = selectors.get(selector);
    if (!declarations) continue;
    for (const property of properties) {
      if (declarations[property]) return resolveCssValue(declarations[property], variables);
    }
  }
  return '';
}

function resolveCssValue(value, variables, seen = new Set()) {
  return String(value || '').replace(/var\(\s*--([a-z0-9_-]+)\s*(?:,\s*([^)]+))?\)/gi, (_, name, fallback) => {
    if (seen.has(name)) return fallback || '';
    seen.add(name);
    return resolveCssValue(variables[name] || fallback || '', variables, seen);
  }).trim();
}

function normalizeColor(value) {
  const clean = sanitizeCssValue(value);
  if (!clean) return '';
  const hex = clean.match(/#[0-9a-f]{3,8}\b/i)?.[0];
  if (hex) return expandHexColor(hex);
  const rgb = clean.match(/rgba?\(\s*([^)]+)\)/i)?.[1];
  if (rgb) {
    const parts = rgb.split(',').slice(0, 3).map(part => Number.parseFloat(part.trim()));
    if (parts.every(part => Number.isFinite(part))) return rgbToHex(parts);
  }
  return '';
}

function expandHexColor(value) {
  if (value.length === 4) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toUpperCase();
  }
  return value.slice(0, 7).toUpperCase();
}

function rgbToHex(parts) {
  return `#${parts.map(part => Math.max(0, Math.min(255, Math.round(part))).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

function inferColorScheme(background, text) {
  const bg = colorLuminance(background);
  const fg = colorLuminance(text);
  return Number.isFinite(bg) && Number.isFinite(fg) && bg < fg ? 'dark' : 'light';
}

function colorLuminance(color) {
  const hex = normalizeColor(color);
  if (!hex) return Number.NaN;
  const values = [1, 3, 5].map(index => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
  const [r, g, b] = values.map(value => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function sanitizeCssValue(value) {
  const clean = String(value || '').trim();
  if (!clean || /[{}<>]/.test(clean)) return '';
  return clean.replace(/\s+/g, ' ');
}

function detectHtmlLanguage(html) {
  return html.match(/<html\b[^>]*\blang=["']?([^"'\s>]+)/i)?.[1]?.toLowerCase() || 'en';
}

function stripUrlQuery(value) {
  return String(value).split('#')[0].split('?')[0];
}

function normalizeRelativePath(value) {
  return String(value || '').replaceAll('\\', '/').replace(/^\/+/, '').replace(/\/+$/, '');
}

function isSafeRelativePath(value) {
  return value && !/^[a-z]+:/i.test(value) && !value.startsWith('//') && !value.split('/').includes('..');
}

async function backupFile(targetRoot, targetRelative) {
  const source = path.join(targetRoot, targetRelative);
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '_');
  const backupRelative = `${defaultBackupDir}/theme_${stamp}/${targetRelative}`;
  const backup = path.join(targetRoot, backupRelative);
  await fs.mkdir(path.dirname(backup), { recursive: true });
  await fs.copyFile(source, backup);
  return backupRelative;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function diagnostic(severity, code, message, details = {}) {
  return { severity, code, message, details };
}

function parseArgs(args) {
  const options = {
    targetRoot: repoRoot,
    htmlEntry: 'index.html',
    outputRelative: defaultOutput,
    cssFiles: [],
    dryRun: false,
    check: false
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--target') options.targetRoot = path.resolve(args[++index] || '.');
    else if (arg === '--html') options.htmlEntry = args[++index] || 'index.html';
    else if (arg === '--output') options.outputRelative = args[++index] || defaultOutput;
    else if (arg === '--css') options.cssFiles.push(args[++index] || '');
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--check') options.check = true;
    else if (!arg.startsWith('-')) options.targetRoot = path.resolve(arg);
    else throw new Error(`Unknown option: ${arg}`);
  }
  return options;
}

async function runCli() {
  const options = parseArgs(process.argv.slice(2));
  const { theme, diagnostics } = await detectTheme(options);
  const writeResult = options.check ? { diagnostics: [] } : await writeThemeFile({
    targetRoot: options.targetRoot,
    outputRelative: options.outputRelative,
    theme,
    dryRun: options.dryRun
  });
  const allDiagnostics = [...diagnostics, ...writeResult.diagnostics];
  const status = allDiagnostics.some(item => item.severity === 'error') ? 'fail' : 'pass';
  console.log(JSON.stringify({ status, theme, diagnostics: allDiagnostics }, null, 2));
  if (status === 'fail') process.exit(1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCli().catch(error => {
    console.error(`[error] REFSCILINK_THEME_FAILED: ${error.message}`);
    process.exit(1);
  });
}
