#!/usr/bin/env node
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const buildTool = path.join(repoRoot, 'data/reference_bibliographique/tools/build_references.mjs');
const installTool = path.join(repoRoot, 'tools/install_refscilink.mjs');
const serveTool = path.join(repoRoot, 'tools/serve_static.mjs');
const themeTool = path.join(repoRoot, 'tools/theme_detector.mjs');
const exampleMarkdown = path.join(repoRoot, 'examples/basic-site/bibliographie.md');
const exampleIndex = path.join(repoRoot, 'examples/basic-site/index.html');
const exampleStyle = path.join(repoRoot, 'examples/basic-site/style.css');
const expectedReferenceCount = 10;

const validationStatuses = new Set(['pending_validation', 'validated', 'rejected', 'needs_revision']);
const extractionStatuses = new Set(['extracted', 'partially_extracted', 'incomplete', 'duplicate_suspected', 'manual_review_required']);
const metadataStatuses = new Set(['not_enriched', 'metadata_found', 'metadata_partial', 'metadata_not_found', 'metadata_to_verify', 'enrichment_failed']);
const accessTypes = new Set(['open_access', 'abstract_only', 'accepted_author_version', 'preprint', 'paywalled', 'unknown']);

const checks = [];

async function main() {
  await checkRequiredFiles();
  await checkJsonFiles();
  await checkConfigContract();
  await checkBasicSiteNavigation();
  await checkGeneratedHtmlLanguage();
  await checkGeneratedJsLocalization();
  await checkGeneratedJsDetailLinks();
  await checkGeneratedJsThemeRuntime();
  await checkReadmeQuickStart();
  await checkPackageScripts();
  await checkNpmScriptExecution();
  await checkBuildToolSyntax();
  await checkInstallToolSyntax();
  await checkServeToolSyntax();
  await checkThemeToolSyntax();
  await checkRootReferencesStructure();
  await checkThemeDetection();
  await checkThemeManualOverrides();
  await checkGeneratedMetadata();
  await checkExternalLinkSafety();
  await checkOfficialExtraction();
  await checkLocalInstaller();
  await checkStaticServer();
  await checkDryRunNoMutation();
  printReport();
}

async function checkBasicSiteNavigation() {
  const html = await fs.readFile(path.join(repoRoot, 'examples/basic-site/index.html'), 'utf8');
  const hasRefSciLinkNavigation = html.includes('data-refscilink-nav-link')
    && html.includes('data/reference_bibliographique/index_ref.html')
    && html.includes('Références');
  record('ui.basic_site.navigation_link', hasRefSciLinkNavigation ? 'pass' : 'fail', hasRefSciLinkNavigation ? 'Basic site includes a localized RefSciLink navigation link.' : 'Basic site is missing the localized RefSciLink navigation link.');
}

async function checkGeneratedHtmlLanguage() {
  const indexHtml = await fs.readFile(path.join(repoRoot, 'data/reference_bibliographique/index_ref.html'), 'utf8');
  const detailHtml = await fs.readFile(path.join(repoRoot, 'data/reference_bibliographique/reference.html'), 'utf8');
  record('ui.index.language.fr', indexHtml.includes('<html lang="fr">') && indexHtml.includes('Références bibliographiques') ? 'pass' : 'fail', 'index_ref.html uses French defaults for the official French example.');
  record('ui.detail.language.fr', detailHtml.includes('<html lang="fr">') && detailHtml.includes('Retour aux références') ? 'pass' : 'fail', 'reference.html uses French defaults for the official French example.');
}

async function checkGeneratedJsLocalization() {
  const script = await fs.readFile(path.join(repoRoot, 'data/reference_bibliographique/assets/js/reference.js'), 'utf8');
  const localizesMetadata = script.includes('fieldNumber: "Numéro"')
    && script.includes('fieldAccess: "Accès"')
    && script.includes('translateBadgeValue("validation", getValidationStatus(reference))');
  record('ui.detail.metadata_i18n', localizesMetadata ? 'pass' : 'fail', localizesMetadata ? 'Detail metadata labels and status values are localized.' : 'Detail metadata labels or status values are not localized.');
}

async function checkGeneratedJsDetailLinks() {
  const script = await fs.readFile(path.join(repoRoot, 'data/reference_bibliographique/assets/js/reference.js'), 'utf8');
  const usesStableIds = script.includes('reference.html?id=${encodeURIComponent(reference.id)}');
  const doesNotUseDisplayNumber = !script.includes('reference.html?id=${encodeURIComponent(reference.number)}');
  record('ui.index.detail_links_use_ids', usesStableIds && doesNotUseDisplayNumber ? 'pass' : 'fail', usesStableIds && doesNotUseDisplayNumber ? 'Detail links use stable reference IDs, not display numbers.' : 'Detail links must use stable reference IDs.');
}

async function checkGeneratedJsThemeRuntime() {
  const script = await fs.readFile(path.join(repoRoot, 'data/reference_bibliographique/assets/js/reference.js'), 'utf8');
  const loadsTheme = script.includes('REFSCILINK_THEME_PATH = "./json/theme_refscilink.json"')
    && script.includes('async function loadTheme()')
    && script.includes('applyTheme(await loadTheme())');
  record('theme.runtime.loads_json', loadsTheme ? 'pass' : 'fail', loadsTheme ? 'reference.js loads theme_refscilink.json before rendering.' : 'reference.js must load theme_refscilink.json at runtime.');

  const appliesVariables = script.includes('page.style.setProperty(name, value)')
    && script.includes('theme.manual_overrides?.css_variables')
    && script.includes('isSafeRefSciLinkCssVariable');
  record('theme.runtime.applies_css_variables', appliesVariables ? 'pass' : 'fail', appliesVariables ? 'reference.js applies safe RefSciLink CSS variables from editable JSON.' : 'reference.js must apply safe CSS variables from theme_refscilink.json.');
}

async function checkReadmeQuickStart() {
  const readme = await fs.readFile(path.join(repoRoot, 'README.md'), 'utf8');
  const requiredText = [
    'Quick Start in Under 5 Minutes',
    'Node.js 18 or newer',
    'npm run demo',
    'http://127.0.0.1:8000/index.html',
    'npm run test:basic-site',
    'npm run test:theme',
    'npm run install:module',
    'npm run build:refs',
    'npm run theme:detect',
    'npm run serve'
  ];
  const missing = requiredText.filter(text => !readme.includes(text));
  record('docs.readme.quick_start', missing.length ? 'fail' : 'pass', missing.length ? `README quick start is missing: ${missing.join(', ')}` : 'README includes a five-minute developer quick start with install, demo and test commands.');
}

async function checkPackageScripts() {
  const pkg = JSON.parse(await fs.readFile(path.join(repoRoot, 'package.json'), 'utf8'));
  const scripts = pkg.scripts || {};
  const required = ['build:refs', 'install:module', 'theme:detect', 'test:theme', 'serve', 'demo'];
  record('npm.scripts.required', required.every(name => typeof scripts[name] === 'string' && scripts[name].length > 0) ? 'pass' : 'fail', 'package.json exposes build:refs, install:module, theme:detect, test:theme, serve and demo scripts.');
  record('npm.scripts.local_only', !Object.values(scripts).some(script => script.includes('npx serve')) ? 'pass' : 'fail', 'npm serve/demo scripts use local Node tooling instead of npx serve.');
  record('npm.scripts.install_module', scripts['install:module']?.includes('tools/install_refscilink.mjs') ? 'pass' : 'fail', 'install:module calls the local installer.');
  record('npm.scripts.theme_detect', scripts['theme:detect']?.includes('tools/theme_detector.mjs') ? 'pass' : 'fail', 'theme:detect calls the local theme detector.');
}

async function checkNpmScriptExecution() {
  const buildResult = await run('npm', ['run', 'build:refs', '--', '--dry-run'], repoRoot);
  record('npm.script.build_refs', buildResult.code === 0 && buildResult.stdout.includes('REFSCILINK_DRY_RUN_NO_WRITE') ? 'pass' : 'fail', buildResult.code === 0 ? 'npm run build:refs supports safe dry-run execution.' : buildResult.stderr || buildResult.stdout);

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'refscilink-npm-install-'));
  const indexHtml = (await fs.readFile(exampleIndex, 'utf8'))
    .replace(/\n\s*<a href="data\/reference_bibliographique\/index_ref\.html" data-refscilink-nav-link>Références<\/a>/, '');
  await fs.writeFile(path.join(tempDir, 'index.html'), indexHtml, 'utf8');
  await fs.copyFile(exampleStyle, path.join(tempDir, 'style.css'));
  await fs.copyFile(exampleMarkdown, path.join(tempDir, 'bibliographie.md'));
  const installResult = await run('npm', ['run', 'install:module', '--', '--target', tempDir, '--markdown', 'bibliographie.md', '--html', 'index.html'], repoRoot);
  record('npm.script.install_module', installResult.code === 0 && existsSync(path.join(tempDir, 'data/reference_bibliographique/index_ref.html')) ? 'pass' : 'fail', installResult.code === 0 ? 'npm run install:module installs into a temporary site.' : installResult.stderr || installResult.stdout);

  const themeResult = await run('npm', ['run', 'theme:detect', '--', '--check'], repoRoot);
  record('npm.script.theme_detect', themeResult.code === 0 && themeResult.stdout.includes('REFSCILINK_THEME_DETECTED') ? 'pass' : 'fail', themeResult.code === 0 ? 'npm run theme:detect detects the official example theme in check mode.' : themeResult.stderr || themeResult.stdout);

  const themeTestResult = await run('npm', ['run', 'test:theme'], repoRoot);
  record('npm.script.test_theme', themeTestResult.code === 0 && themeTestResult.stdout.includes('"pass": 16') ? 'pass' : 'fail', themeTestResult.code === 0 ? 'npm run test:theme passes dedicated theme detection tests.' : themeTestResult.stderr || themeTestResult.stdout);

  const serveResult = await run('npm', ['run', 'serve', '--', '--check'], repoRoot);
  record('npm.script.serve', serveResult.code === 0 ? 'pass' : 'fail', serveResult.code === 0 ? 'npm run serve passes static server check mode.' : serveResult.stderr || serveResult.stdout);

  const demoResult = await run('npm', ['run', 'demo', '--', '--check'], repoRoot);
  record('npm.script.demo', demoResult.code === 0 ? 'pass' : 'fail', demoResult.code === 0 ? 'npm run demo prepares the assembled basic-site demo in check mode.' : demoResult.stderr || demoResult.stdout);
}

async function checkRequiredFiles() {
  const requiredFiles = [
    'data/reference_bibliographique/index_ref.html',
    'data/reference_bibliographique/reference.html',
    'data/reference_bibliographique/assets/css/reference.css',
    'data/reference_bibliographique/assets/js/reference.js',
    'data/reference_bibliographique/json/references.json',
    'data/reference_bibliographique/json/theme_refscilink.json',
    'data/reference_bibliographique/tools/build_references.mjs',
    'data/reference_bibliographique/tools/prompt_recherche_ia.md',
    'data/reference_bibliographique/tools/schema_references.json',
    'refscilink.config.json',
    'tools/install_refscilink.mjs',
    'tools/theme_detector.mjs'
  ];
  const missing = requiredFiles.filter(file => !existsSync(path.join(repoRoot, file)));
  record('files.required', missing.length ? 'fail' : 'pass', missing.length ? `Missing files: ${missing.join(', ')}` : 'All mandatory files exist.');
}

async function checkJsonFiles() {
  const jsonFiles = [
    'data/reference_bibliographique/json/references.json',
    'data/reference_bibliographique/json/theme_refscilink.json',
    'data/reference_bibliographique/tools/schema_references.json',
    'refscilink.config.json'
  ];
  for (const file of jsonFiles) {
    try {
      JSON.parse(await fs.readFile(path.join(repoRoot, file), 'utf8'));
      record(`json.parse.${file}`, 'pass', `${file} parses as JSON.`);
    } catch (error) {
      record(`json.parse.${file}`, 'fail', `${file} is invalid JSON: ${error.message}`);
    }
  }
}

async function checkConfigContract() {
  const config = JSON.parse(await fs.readFile(path.join(repoRoot, 'refscilink.config.json'), 'utf8'));
  const requiredRoots = ['metadata', 'source', 'output', 'display', 'theme', 'language', 'enrichment', 'safety', 'runtime'];
  record('config.root.required_sections', requiredRoots.every(key => config[key] && typeof config[key] === 'object') ? 'pass' : 'fail', 'refscilink.config.json includes all required root sections.');

  const hasSource = config.source?.markdown_file === 'examples/basic-site/bibliographie.md'
    && Array.isArray(config.source?.markdown_candidates)
    && config.source.markdown_candidates.includes('examples/basic-site/bibliographie.md')
    && config.source?.html_entrypoint === 'examples/basic-site/index.html'
    && Array.isArray(config.source?.html_entrypoint_candidates)
    && config.source.html_entrypoint_candidates.includes('examples/basic-site/index.html');
  record('config.source.official_example', hasSource ? 'pass' : 'fail', 'Config records the official Markdown source and HTML entry point.');

  const outputPaths = [
    ['module_dir', 'data/reference_bibliographique'],
    ['index_file', 'data/reference_bibliographique/index_ref.html'],
    ['detail_file', 'data/reference_bibliographique/reference.html'],
    ['references_json', 'data/reference_bibliographique/json/references.json'],
    ['theme_json', 'data/reference_bibliographique/json/theme_refscilink.json']
  ];
  const hasOutput = outputPaths.every(([key, value]) => config.output?.[key] === value);
  record('config.output.paths', hasOutput ? 'pass' : 'fail', 'Config records the generated module output paths.');

  const hasDisplay = ['page', 'panel', 'both', 'none'].includes(config.display?.mode)
    && ['auto', 'navbar', 'floating_button', 'manual', 'skip'].includes(config.display?.navigation_integration)
    && config.display?.navigation_target === 'data/reference_bibliographique/index_ref.html';
  record('config.display.mode_navigation', hasDisplay ? 'pass' : 'fail', 'Config records display mode and navigation integration settings.');

  const hasThemeAndLanguage = config.theme?.mode === 'auto_override'
    && config.theme?.config_file === 'data/reference_bibliographique/json/theme_refscilink.json'
    && config.theme?.preserve_host_identity === true
    && config.language?.mode === 'auto'
    && config.language?.detected === 'fr'
    && config.language?.generated_ui === 'fr';
  record('config.theme_language', hasThemeAndLanguage ? 'pass' : 'fail', 'Config records theme mode and generated UI language.');
}

async function checkBuildToolSyntax() {
  const result = await run('node', ['--check', buildTool], repoRoot);
  record('tool.syntax.build_references', result.code === 0 ? 'pass' : 'fail', result.code === 0 ? 'build_references.mjs syntax is valid.' : result.stderr || result.stdout);
}

async function checkInstallToolSyntax() {
  const result = await run('node', ['--check', installTool], repoRoot);
  record('tool.syntax.install_refscilink', result.code === 0 ? 'pass' : 'fail', result.code === 0 ? 'install_refscilink.mjs syntax is valid.' : result.stderr || result.stdout);
}

async function checkServeToolSyntax() {
  const result = await run('node', ['--check', serveTool], repoRoot);
  record('tool.syntax.serve_static', result.code === 0 ? 'pass' : 'fail', result.code === 0 ? 'serve_static.mjs syntax is valid.' : result.stderr || result.stdout);
}

async function checkThemeToolSyntax() {
  const result = await run('node', ['--check', themeTool], repoRoot);
  record('tool.syntax.theme_detector', result.code === 0 ? 'pass' : 'fail', result.code === 0 ? 'theme_detector.mjs syntax is valid.' : result.stderr || result.stdout);
}

async function checkRootReferencesStructure() {
  const payload = JSON.parse(await fs.readFile(path.join(repoRoot, 'data/reference_bibliographique/json/references.json'), 'utf8'));
  validateReferencesPayload(payload, 'json.references.root');
}

async function checkThemeDetection() {
  const theme = JSON.parse(await fs.readFile(path.join(repoRoot, 'data/reference_bibliographique/json/theme_refscilink.json'), 'utf8'));
  const detected = theme.detection?.status === 'detected'
    && theme.detection?.confidence === 'high'
    && theme.detected_from?.includes('examples/basic-site/style.css');
  record('theme.detect.official_example', detected ? 'pass' : 'fail', detected ? 'Official theme JSON is generated from the basic-site CSS with high confidence.' : 'Official theme JSON must be detected from examples/basic-site/style.css.');

  const expectedValues = theme.primary === '#007B83'
    && theme.secondary === '#00A6B2'
    && theme.radius === '18px'
    && theme.button_radius === '999px'
    && theme.shadow === '0 16px 40px rgba(0, 65, 70, 0.12)';
  record('theme.detect.values', expectedValues ? 'pass' : 'fail', 'Detected theme captures colors, radius, button radius and shadow from the host site.');

  const result = await run('node', [themeTool, '--target', '.', '--html', 'examples/basic-site/index.html', '--output', 'data/reference_bibliographique/json/theme_refscilink.json', '--check'], repoRoot);
  record('theme.detect.check_mode', result.code === 0 && result.stdout.includes('REFSCILINK_THEME_DETECTED') ? 'pass' : 'fail', result.code === 0 ? 'Theme detector check mode detects host styles without writing.' : result.stderr || result.stdout);
}

async function checkThemeManualOverrides() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'refscilink-theme-override-'));
  await fs.copyFile(exampleIndex, path.join(tempDir, 'index.html'));
  await fs.copyFile(exampleStyle, path.join(tempDir, 'style.css'));
  const themeDir = path.join(tempDir, 'data/reference_bibliographique/json');
  await fs.mkdir(themeDir, { recursive: true });
  const existingTheme = {
    metadata: {
      generated_by: 'RefSciLink Theme Detector',
      module_version: '0.2.0-dev',
      schema_version: '1.0.0',
      generated_at: '2026-05-24T12:00:00.000Z',
      updated_at: '2026-05-24T12:00:00.000Z'
    },
    manual_overrides: {
      primary: '#123456',
      radius: '6px',
      css_variables: {
        '--refscilink-color-primary': '#123456'
      }
    },
    maintainer_note: 'preserve me'
  };
  await fs.writeFile(path.join(themeDir, 'theme_refscilink.json'), `${JSON.stringify(existingTheme, null, 2)}\n`, 'utf8');
  const result = await run('node', [themeTool, '--target', tempDir, '--html', 'index.html', '--output', 'data/reference_bibliographique/json/theme_refscilink.json'], repoRoot);
  record('theme.override.command', result.code === 0 ? 'pass' : 'fail', result.code === 0 ? 'Theme detector rewrites a theme file with backup support.' : result.stderr || result.stdout);
  if (result.code !== 0) return;

  const theme = JSON.parse(await fs.readFile(path.join(themeDir, 'theme_refscilink.json'), 'utf8'));
  record('theme.override.manual_values', theme.primary === '#123456' && theme.radius === '6px' && theme.css_variables?.['--refscilink-color-primary'] === '#123456' ? 'pass' : 'fail', 'Manual overrides preserve editable theme values during regeneration.');
  record('theme.override.unknown_keys', theme.maintainer_note === 'preserve me' ? 'pass' : 'fail', 'Unknown theme keys are preserved during regeneration.');
}

async function checkGeneratedMetadata() {
  const metadataFiles = [
    ['data/reference_bibliographique/json/references.json', 'generated_at'],
    ['data/reference_bibliographique/json/theme_refscilink.json', 'generated_at'],
    ['refscilink.config.json', 'created_at']
  ];
  for (const [file, creationTimestamp] of metadataFiles) {
    const payload = JSON.parse(await fs.readFile(path.join(repoRoot, file), 'utf8'));
    const metadata = payload.metadata || {};
    const hasModuleVersion = typeof metadata.module_version === 'string' && metadata.module_version.length > 0;
    const hasSchemaVersion = typeof metadata.schema_version === 'string' && metadata.schema_version.length > 0;
    const hasCreationTimestamp = typeof metadata[creationTimestamp] === 'string' && metadata[creationTimestamp].length > 0;
    const hasUpdatedAt = file.endsWith('references.json') || file.endsWith('theme_refscilink.json')
      ? typeof metadata.updated_at === 'string' && metadata.updated_at.length > 0
      : typeof metadata.updated_at === 'string' && metadata.updated_at.length > 0;
    record(`metadata.versioning.${file}`, hasModuleVersion && hasSchemaVersion && hasCreationTimestamp && hasUpdatedAt ? 'pass' : 'fail', `${file} includes module_version, schema_version and timestamps.`);
  }
}

async function checkExternalLinkSafety() {
  const script = await fs.readFile(path.join(repoRoot, 'data/reference_bibliographique/assets/js/reference.js'), 'utf8');
  record('external_links.allowed_protocols', script.includes('REFSCILINK_ALLOWED_EXTERNAL_PROTOCOLS') && script.includes('"http:"') && script.includes('"https:"') ? 'pass' : 'fail', 'reference.js defines allowed external URL protocols.');
  record('external_links.url_parser', script.includes('new URL(') && script.includes('getSafeExternalHref') ? 'pass' : 'fail', 'reference.js validates external hrefs before rendering.');
  record('external_links.noopener_noreferrer', script.includes('target = "_blank"') && script.includes('rel = "noopener noreferrer"') ? 'pass' : 'fail', 'External new-tab links include noopener noreferrer.');
}

async function checkOfficialExtraction() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'refscilink-basic-site-'));
  await fs.copyFile(exampleMarkdown, path.join(tempDir, 'bibliographie.md'));
  const result = await run('node', [buildTool, 'bibliographie.md'], tempDir);
  record('example.extract.command', result.code === 0 ? 'pass' : 'fail', result.code === 0 ? 'Official extraction command succeeded.' : result.stderr || result.stdout);
  if (result.code !== 0) return;

  const outputPath = path.join(tempDir, 'data/reference_bibliographique/json/references.json');
  const payload = JSON.parse(await fs.readFile(outputPath, 'utf8'));
  validateReferencesPayload(payload, 'example.extract.references');
  record('example.extract.count', payload.references.length === expectedReferenceCount ? 'pass' : 'fail', `Expected ${expectedReferenceCount} references, got ${payload.references.length}.`);
  record('example.extract.first_id', payload.references[0]?.id === 'ref001' && payload.references[0]?.number === 1 ? 'pass' : 'fail', 'Fresh extraction starts with id ref001 and number 1.');
  record('example.extract.last_id', payload.references.at(-1)?.id === 'ref010' && payload.references.at(-1)?.number === expectedReferenceCount ? 'pass' : 'fail', 'Fresh extraction ends with id ref010 and number 10.');
  record('example.extract.sequential_ids', hasSequentialReferenceIds(payload.references) ? 'pass' : 'fail', 'Fresh extraction creates sequential ref001..ref010 IDs.');
  record('example.extract.diagnostics', hasDiagnostic(payload, 'REFSCILINK_EXTRACT_OK') ? 'pass' : 'fail', 'Extraction diagnostics include REFSCILINK_EXTRACT_OK.');
}

async function checkDryRunNoMutation() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'refscilink-basic-site-dry-'));
  await fs.copyFile(exampleMarkdown, path.join(tempDir, 'bibliographie.md'));
  const result = await run('node', [buildTool, '--dry-run', 'bibliographie.md'], tempDir);
  record('example.dry_run.command', result.code === 0 ? 'pass' : 'fail', result.code === 0 ? 'Dry-run command succeeded.' : result.stderr || result.stdout);
  record('example.dry_run.no_references_json', !existsSync(path.join(tempDir, 'data/reference_bibliographique/json/references.json')) ? 'pass' : 'fail', 'Dry-run must not write references.json.');
  record('example.dry_run.no_backup', !existsSync(path.join(tempDir, 'backup')) ? 'pass' : 'fail', 'Dry-run must not create backup files.');
  for (const code of ['REFSCILINK_DRY_RUN_ENABLED', 'REFSCILINK_DRY_RUN_WOULD_WRITE_JSON', 'REFSCILINK_DRY_RUN_NO_WRITE']) {
    record(`example.dry_run.diagnostic.${code}`, result.stdout.includes(code) ? 'pass' : 'fail', `Dry-run console output includes ${code}.`);
  }
}

async function checkLocalInstaller() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'refscilink-basic-site-install-'));
  const indexHtml = (await fs.readFile(exampleIndex, 'utf8'))
    .replace(/\n\s*<a href="data\/reference_bibliographique\/index_ref\.html" data-refscilink-nav-link>Références<\/a>/, '');
  await fs.writeFile(path.join(tempDir, 'index.html'), indexHtml, 'utf8');
  await fs.copyFile(exampleStyle, path.join(tempDir, 'style.css'));
  await fs.copyFile(exampleMarkdown, path.join(tempDir, 'bibliographie.md'));

  const result = await run('node', [installTool, '--target', tempDir, '--markdown', 'bibliographie.md', '--html', 'index.html'], repoRoot);
  record('installer.command', result.code === 0 ? 'pass' : 'fail', result.code === 0 ? 'Local installer command succeeded.' : result.stderr || result.stdout);
  if (result.code !== 0) return;

  const installedFiles = [
    'data/reference_bibliographique/index_ref.html',
    'data/reference_bibliographique/reference.html',
    'data/reference_bibliographique/assets/css/reference.css',
    'data/reference_bibliographique/assets/js/reference.js',
    'data/reference_bibliographique/tools/build_references.mjs',
    'refscilink.config.json'
  ];
  const missing = installedFiles.filter(file => !existsSync(path.join(tempDir, file)));
  record('installer.files.created', missing.length ? 'fail' : 'pass', missing.length ? `Installer missing files: ${missing.join(', ')}` : 'Installer created mandatory module files.');

  const installedIndex = await fs.readFile(path.join(tempDir, 'index.html'), 'utf8');
  const linkCount = (installedIndex.match(/data-refscilink-nav-link/g) || []).length;
  record('installer.navigation.added_once', linkCount === 1 && installedIndex.includes('Références') && installedIndex.includes('data/reference_bibliographique/index_ref.html') ? 'pass' : 'fail', 'Installer adds one localized References navigation link.');
  record('installer.index.backup_created', existsSync(path.join(tempDir, 'backup/refscilink')) ? 'pass' : 'fail', 'Installer creates a backup before modifying index.html.');

  const installedConfig = JSON.parse(await fs.readFile(path.join(tempDir, 'refscilink.config.json'), 'utf8'));
  const configOk = installedConfig.source?.markdown_file === 'bibliographie.md'
    && installedConfig.source?.html_entrypoint === 'index.html'
    && installedConfig.output?.module_dir === 'data/reference_bibliographique'
    && installedConfig.display?.navigation_target === 'data/reference_bibliographique/index_ref.html'
    && installedConfig.language?.generated_ui === 'fr';
  record('installer.config.created', configOk ? 'pass' : 'fail', 'Installer writes reusable project-relative config.');

  const installedTheme = JSON.parse(await fs.readFile(path.join(tempDir, 'data/reference_bibliographique/json/theme_refscilink.json'), 'utf8'));
  const installedThemeDetected = installedTheme.detection?.status === 'detected'
    && installedTheme.detection?.confidence === 'high'
    && installedTheme.detected_from?.includes('style.css');
  record('installer.theme.detected', installedThemeDetected ? 'pass' : 'fail', 'Installer regenerates theme_refscilink.json from the host stylesheet.');

  const secondRun = await run('node', [installTool, '--target', tempDir, '--markdown', 'bibliographie.md', '--html', 'index.html'], repoRoot);
  const rerunIndex = await fs.readFile(path.join(tempDir, 'index.html'), 'utf8');
  const rerunLinkCount = (rerunIndex.match(/data-refscilink-nav-link/g) || []).length;
  record('installer.idempotent.navigation', secondRun.code === 0 && rerunLinkCount === 1 ? 'pass' : 'fail', 'Installer rerun does not duplicate the References link.');
}

async function checkStaticServer() {
  const serveCheck = await run('node', [serveTool, '.', '--check'], repoRoot);
  record('serve.check.root', serveCheck.code === 0 ? 'pass' : 'fail', serveCheck.code === 0 ? 'Static server check succeeds for repository root.' : serveCheck.stderr || serveCheck.stdout);

  const demoCheck = await run('node', [serveTool, '--demo-basic-site', '--check'], repoRoot);
  record('serve.check.demo', demoCheck.code === 0 ? 'pass' : 'fail', demoCheck.code === 0 ? 'Static server check prepares the basic-site demo.' : demoCheck.stderr || demoCheck.stdout);
}

function validateReferencesPayload(payload, prefix) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    record(prefix, 'fail', 'references.json root must be an object.');
    return;
  }
  record(`${prefix}.root`, payload.metadata && Array.isArray(payload.references) ? 'pass' : 'fail', 'references.json has metadata and references array.');
  if (!payload.metadata || !Array.isArray(payload.references)) return;
  record(`${prefix}.reference_count`, payload.metadata.reference_count === payload.references.length ? 'pass' : 'fail', 'metadata.reference_count matches references length.');
  record(`${prefix}.metadata.module_version`, typeof payload.metadata.module_version === 'string' && payload.metadata.module_version.length > 0 ? 'pass' : 'fail', 'metadata.module_version is present.');
  record(`${prefix}.metadata.schema_version`, typeof payload.metadata.schema_version === 'string' && payload.metadata.schema_version.length > 0 ? 'pass' : 'fail', 'metadata.schema_version is present.');

  const ids = new Set();
  const numbers = new Set();
  let validReferences = true;
  for (const reference of payload.references) {
    validReferences = validateReference(reference, ids, numbers) && validReferences;
  }
  record(`${prefix}.items`, validReferences ? 'pass' : 'fail', validReferences ? 'All reference items satisfy structural checks.' : 'One or more references failed structural checks.');
}

function validateReference(reference, ids, numbers) {
  let valid = true;
  valid = typeof reference.raw_reference === 'string' && reference.raw_reference.length > 0 && valid;
  valid = /^ref\d{3,}$/.test(reference.id) && !ids.has(reference.id) && valid;
  ids.add(reference.id);
  valid = Number.isInteger(reference.number) && reference.number > 0 && !numbers.has(reference.number) && valid;
  numbers.add(reference.number);
  valid = Array.isArray(reference.authors) && valid;
  valid = validationStatuses.has(reference.validation_status) && valid;
  valid = extractionStatuses.has(reference.extraction_status) && valid;
  valid = metadataStatuses.has(reference.metadata_status) && valid;
  valid = accessTypes.has(reference.access_type) && valid;
  valid = reference.validated === (reference.validation_status === 'validated') && valid;
  valid = reference.source_location && Number.isInteger(reference.source_location.line_start) && valid;
  return valid;
}

function hasSequentialReferenceIds(references) {
  return references.every((reference, index) => {
    const number = index + 1;
    return reference.id === `ref${String(number).padStart(3, '0')}` && reference.number === number;
  });
}

function hasDiagnostic(payload, code) {
  return Array.isArray(payload.metadata?.diagnostics) && payload.metadata.diagnostics.some(diagnostic => diagnostic.code === code);
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
  const report = { status, checks, summary };
  console.log(JSON.stringify(report, null, 2));
  if (status === 'fail') process.exit(1);
}

function run(command, args, cwd) {
  return new Promise(resolve => {
    const child = spawn(command, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => {
      stdout += chunk;
    });
    child.stderr.on('data', chunk => {
      stderr += chunk;
    });
    child.on('close', code => {
      resolve({ code, stdout, stderr });
    });
  });
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
