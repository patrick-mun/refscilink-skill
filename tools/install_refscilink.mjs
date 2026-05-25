#!/usr/bin/env node
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectTheme, writeThemeFile } from './theme_detector.mjs';

const repoRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const moduleSourceDir = path.join(repoRoot, 'data/reference_bibliographique');
const defaultModuleDir = 'data/reference_bibliographique';
const defaultBackupDir = 'backup/refscilink';

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const targetRoot = path.resolve(options.target || process.cwd());
  const diagnostics = [
    diagnostic('info', 'REFSCILINK_RUN_STARTED', 'RefSciLink installation started.', {
      target: path.relative(process.cwd(), targetRoot) || '.'
    })
  ];

  if (options.dryRun) {
    diagnostics.push(diagnostic('info', 'REFSCILINK_DRY_RUN_ENABLED', 'Dry-run mode is active.'));
  }

  await assertDirectory(targetRoot);
  const htmlEntry = normalizeRelativePath(options.html || 'index.html');
  const markdownFile = normalizeRelativePath(options.markdown || findFirstExisting(targetRoot, ['bibliographie.md', 'bibliography.md', 'references.md', 'README.md']) || '');
  const language = options.language || await detectLanguage(path.join(targetRoot, htmlEntry));
  const label = options.label || (language.startsWith('fr') ? 'Références' : 'References');
  const moduleDir = normalizeRelativePath(options.moduleDir || defaultModuleDir);
  const navigationTarget = `${moduleDir}/index_ref.html`;

  await installModuleFiles({ targetRoot, moduleDir, dryRun: options.dryRun, diagnostics });
  await generateTheme({ targetRoot, htmlEntry, moduleDir, dryRun: options.dryRun, diagnostics });
  await writeConfig({ targetRoot, htmlEntry, markdownFile, moduleDir, language, navigationTarget, dryRun: options.dryRun, diagnostics });
  await integrateNavigation({ targetRoot, htmlEntry, navigationTarget, label, dryRun: options.dryRun, diagnostics });

  if (options.dryRun) {
    diagnostics.push(diagnostic('success', 'REFSCILINK_DRY_RUN_NO_WRITE', 'Dry-run completed without writing files.'));
  }

  emitDiagnostics(diagnostics);
  emitSummary(diagnostics);
}

function parseArgs(args) {
  const options = {
    target: '',
    markdown: '',
    html: '',
    moduleDir: '',
    language: '',
    label: '',
    dryRun: false
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--target') {
      options.target = args[++index] || '';
    } else if (arg === '--markdown') {
      options.markdown = args[++index] || '';
    } else if (arg === '--html') {
      options.html = args[++index] || '';
    } else if (arg === '--module-dir') {
      options.moduleDir = args[++index] || '';
    } else if (arg === '--language') {
      options.language = args[++index] || '';
    } else if (arg === '--label') {
      options.label = args[++index] || '';
    } else if (!arg.startsWith('-') && !options.target) {
      options.target = arg;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  return options;
}

async function assertDirectory(dir) {
  const stats = await fs.stat(dir);
  if (!stats.isDirectory()) throw new Error(`Target is not a directory: ${dir}`);
}

function normalizeRelativePath(value) {
  return String(value || '').replaceAll('\\', '/').replace(/^\/+/, '').replace(/\/+$/, '');
}

function findFirstExisting(root, candidates) {
  return candidates.find(candidate => existsSync(path.join(root, candidate))) || '';
}

async function detectLanguage(htmlPath) {
  try {
    const html = await fs.readFile(htmlPath, 'utf8');
    const match = html.match(/<html\b[^>]*\blang=["']?([^"'\s>]+)/i);
    return match?.[1]?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  } catch {
    return 'en';
  }
}

async function installModuleFiles({ targetRoot, moduleDir, dryRun, diagnostics }) {
  const files = await listFiles(moduleSourceDir);
  for (const source of files) {
    const relativeFromModule = normalizeRelativePath(path.relative(moduleSourceDir, source));
    const targetRelative = `${moduleDir}/${relativeFromModule}`;
    const target = path.join(targetRoot, targetRelative);
    if (dryRun) {
      diagnostics.push(diagnostic('info', existsSync(target) ? 'REFSCILINK_DRY_RUN_WOULD_BACKUP' : 'REFSCILINK_DRY_RUN_WOULD_CREATE_DIR', existsSync(target) ? 'Dry-run: generated file would be backed up before update.' : 'Dry-run: generated file would be created.', {
        action: existsSync(target) ? 'would_backup' : 'would_create',
        path: targetRelative
      }));
      continue;
    }
    if (existsSync(target)) {
      const backupPath = await backupFile(targetRoot, targetRelative);
      diagnostics.push(diagnostic('success', 'REFSCILINK_BACKUP_CREATED', 'Existing generated file was backed up before update.', {
        path: backupPath
      }));
    }
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(source, target);
    diagnostics.push(diagnostic('success', 'REFSCILINK_FILE_WRITTEN', 'Generated module file was written.', {
      path: targetRelative
    }));
  }
}

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

async function writeConfig({ targetRoot, htmlEntry, markdownFile, moduleDir, language, navigationTarget, dryRun, diagnostics }) {
  const targetRelative = 'refscilink.config.json';
  const target = path.join(targetRoot, targetRelative);
  const now = new Date().toISOString();
  const existing = await readJsonIfValid(target);
  const config = {
    ...(existing || {}),
    metadata: {
      ...(existing?.metadata || {}),
      generated_by: 'RefSciLink Skill',
      module_version: '0.4.0-dev',
      schema_version: '1.0.0',
      created_at: existing?.metadata?.created_at || now,
      updated_at: now
    },
    source: {
      ...(existing?.source || {}),
      markdown_file: markdownFile,
      markdown_candidates: markdownFile ? unique([...(existing?.source?.markdown_candidates || []), markdownFile]) : [],
      html_entrypoint: htmlEntry,
      html_entrypoint_candidates: unique([...(existing?.source?.html_entrypoint_candidates || []), htmlEntry])
    },
    output: {
      ...(existing?.output || {}),
      module_dir: moduleDir,
      index_file: `${moduleDir}/index_ref.html`,
      detail_file: `${moduleDir}/reference.html`,
      references_json: `${moduleDir}/json/references.json`,
      theme_json: `${moduleDir}/json/theme_refscilink.json`
    },
    display: {
      ...(existing?.display || {}),
      mode: existing?.display?.mode || 'page',
      navigation_label: existing?.display?.navigation_label || '',
      navigation_integration: existing?.display?.navigation_integration || 'auto',
      navigation_target: navigationTarget
    },
    theme: {
      ...(existing?.theme || {}),
      mode: existing?.theme?.mode || 'auto_override',
      config_file: `${moduleDir}/json/theme_refscilink.json`,
      preserve_host_identity: existing?.theme?.preserve_host_identity ?? true
    },
    language: {
      ...(existing?.language || {}),
      mode: existing?.language?.mode || 'auto',
      detected: language,
      generated_ui: language
    },
    enrichment: {
      ...(existing?.enrichment || {}),
      mode: existing?.enrichment?.mode || 'extract_only',
      allow_network: existing?.enrichment?.allow_network ?? false,
      allow_ai_summaries: existing?.enrichment?.allow_ai_summaries ?? false,
      require_human_validation: existing?.enrichment?.require_human_validation ?? true
    },
    safety: {
      ...(existing?.safety || {}),
      backup_before_overwrite: existing?.safety?.backup_before_overwrite ?? true,
      backup_dir: existing?.safety?.backup_dir || defaultBackupDir,
      overwrite_user_files: existing?.safety?.overwrite_user_files ?? false,
      preserve_manual_edits: existing?.safety?.preserve_manual_edits ?? true,
      dry_run: dryRun
    },
    runtime: {
      ...(existing?.runtime || {}),
      static_hosting: existing?.runtime?.static_hosting ?? true,
      github_pages_compatible: existing?.runtime?.github_pages_compatible ?? true,
      node_required_for_tools: existing?.runtime?.node_required_for_tools ?? true,
      minimum_node_version: existing?.runtime?.minimum_node_version || '18'
    }
  };

  if (dryRun) {
    diagnostics.push(diagnostic('info', existsSync(target) ? 'REFSCILINK_DRY_RUN_WOULD_BACKUP' : 'REFSCILINK_DRY_RUN_WOULD_WRITE_JSON', existsSync(target) ? 'Dry-run: config would be backed up before update.' : 'Dry-run: config would be written.', {
      action: existsSync(target) ? 'would_backup' : 'would_write_json',
      path: targetRelative
    }));
    return;
  }

  if (existsSync(target)) {
    const backupPath = await backupFile(targetRoot, targetRelative);
    diagnostics.push(diagnostic('success', 'REFSCILINK_BACKUP_CREATED', 'Existing config was backed up before update.', {
      path: backupPath
    }));
  }
  await fs.writeFile(target, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  diagnostics.push(diagnostic('success', 'REFSCILINK_CONFIG_WRITTEN', 'refscilink.config.json was written.', {
    path: targetRelative
  }));
}

async function generateTheme({ targetRoot, htmlEntry, moduleDir, dryRun, diagnostics }) {
  const outputRelative = `${moduleDir}/json/theme_refscilink.json`;
  const detection = await detectTheme({ targetRoot, htmlEntry, outputRelative });
  diagnostics.push(...detection.diagnostics);
  const writeResult = await writeThemeFile({ targetRoot, outputRelative, theme: detection.theme, dryRun });
  diagnostics.push(...writeResult.diagnostics);
}

async function readJsonIfValid(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return null;
  }
}

async function integrateNavigation({ targetRoot, htmlEntry, navigationTarget, label, dryRun, diagnostics }) {
  const htmlPath = path.join(targetRoot, htmlEntry);
  if (!existsSync(htmlPath)) {
    diagnostics.push(diagnostic('review_required', 'REFSCILINK_NAVIGATION_SKIPPED', 'HTML entry point was not found; navigation integration was skipped.', {
      path: htmlEntry
    }));
    return;
  }
  const html = await fs.readFile(htmlPath, 'utf8');
  if (hasExistingNavigationLink(html, navigationTarget)) {
    diagnostics.push(diagnostic('success', 'REFSCILINK_NAVIGATION_ALREADY_PRESENT', 'References navigation link is already present.', {
      path: htmlEntry
    }));
    return;
  }
  const updated = insertNavigationLink(html, navigationTarget, label);
  if (updated === html) {
    diagnostics.push(diagnostic('review_required', 'REFSCILINK_NAVIGATION_MANUAL_REQUIRED', 'Navigation container was not safe to patch automatically.', {
      path: htmlEntry,
      snippet: `<a href="${navigationTarget}" data-refscilink-nav-link>${label}</a>`
    }));
    return;
  }
  if (dryRun) {
    diagnostics.push(diagnostic('info', 'REFSCILINK_DRY_RUN_WOULD_BACKUP', 'Dry-run: HTML entry point would be backed up before navigation update.', {
      action: 'would_backup',
      path: htmlEntry
    }));
    diagnostics.push(diagnostic('info', 'REFSCILINK_DRY_RUN_WOULD_MODIFY_NAVIGATION', 'Dry-run: References navigation link would be added.', {
      action: 'would_modify_navigation',
      path: htmlEntry,
      navigation_target: navigationTarget
    }));
    return;
  }
  const backupPath = await backupFile(targetRoot, htmlEntry);
  diagnostics.push(diagnostic('success', 'REFSCILINK_BACKUP_CREATED', 'HTML entry point was backed up before navigation update.', {
    path: backupPath
  }));
  await fs.writeFile(htmlPath, updated, 'utf8');
  diagnostics.push(diagnostic('success', 'REFSCILINK_NAVIGATION_ADDED', 'References navigation link was added.', {
    path: htmlEntry,
    navigation_target: navigationTarget,
    navigation_label: label
  }));
}

function hasExistingNavigationLink(html, navigationTarget) {
  return html.includes('data-refscilink-nav-link')
    || html.includes(`href="${navigationTarget}"`)
    || html.includes(`href='${navigationTarget}'`);
}

function insertNavigationLink(html, navigationTarget, label) {
  const link = `<a href="${navigationTarget}" data-refscilink-nav-link>${label}</a>`;
  const navLinksPattern = /(\n[ \t]*)<\/div>(\s*<\/nav>)/i;
  if (/<div\b[^>]*class=["'][^"']*\bnav-links\b[^"']*["'][^>]*>/i.test(html) && navLinksPattern.test(html)) {
    return html.replace(navLinksPattern, `$1  ${link}$1</div>$2`);
  }
  const navPattern = /(\n[ \t]*)<\/nav>/i;
  if (/<nav\b/i.test(html) && navPattern.test(html)) {
    return html.replace(navPattern, `$1  ${link}$1</nav>`);
  }
  return html;
}

async function backupFile(targetRoot, targetRelative) {
  const source = path.join(targetRoot, targetRelative);
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '_');
  const backupRelative = `${defaultBackupDir}/install_${stamp}/${targetRelative}`;
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

function emitDiagnostics(diagnostics) {
  diagnostics.forEach(item => {
    const line = `[${item.severity}] ${item.code}: ${item.message}`;
    if (item.severity === 'error') console.error(line);
    else console.log(line);
  });
}

function emitSummary(diagnostics) {
  const summary = diagnostics.reduce((counts, item) => {
    counts[item.severity] = (counts[item.severity] || 0) + 1;
    return counts;
  }, {});
  console.log(JSON.stringify({ status: summary.error ? 'fail' : 'pass', summary, diagnostics }, null, 2));
}

main().catch(error => {
  console.error(`[error] REFSCILINK_RUN_FAILED: ${error.message}`);
  process.exit(1);
});
