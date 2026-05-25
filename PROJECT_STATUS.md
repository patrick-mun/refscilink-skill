# RefSciLink Skill — Project Status

## Purpose

This document records the current state of the RefSciLink Skill project so that a new development session or a new AI coding assistant can resume work without losing context.

Repository:

```text
patrick-mun/refscilink-skill
```

Current focus:

```text
Testing and stabilizing the real RefSciLink module after completing `/create_module_ref` skill hardening.
```

---

## Project vision

RefSciLink is a reusable Vanilla HTML/CSS/JS bibliography module for scientific websites, web presentations and static tools.

The goal is to allow an AI coding assistant to install a bibliography browser inside an existing web project. The module should:

- detect bibliographic references in Markdown files;
- create bibliography pages;
- generate structured JSON data;
- optionally enrich references with scientific metadata;
- provide summary and validation interfaces;
- adapt visually to the host website;
- support static hosting such as GitHub Pages.

---

## Key repository files

```text
README.md
ROADMAP_UPGRADES.md
SKILL_HARDENING_CHECKLIST.md
PROJECT_STATUS.md
SESSION_HANDOVER.md
skills/create_module_ref.md
CLAUDE.md
AGENTS.md
.codex/context.md
examples/basic-site/
```

---

## Main skill

Current skill file:

```text
skills/create_module_ref.md
```

Commands:

```text
/create_module_ref
/creat_modul_ref
```

The legacy misspelled command is still accepted for compatibility.

---

## Important design decisions

### Language policy

- Technical skill specifications must be written in English.
- Internal JSON keys must remain English and stable.
- Generated user-facing content must follow the detected language of the host website.
- Language detection priority:
  1. `<html lang="...">`
  2. language metadata
  3. visible content analysis
  4. `refscilink.config.json`
  5. fallback `en`

### Visual identity policy

The host website visual identity always has priority.

Visual priority order:

1. Host website visual identity.
2. `theme_refscilink.json` overrides.
3. Automatic theme detection.
4. RefSciLink fallback theme.

### CSS policy

- No unjustified inline CSS.
- Styling must live in `assets/css/reference.css`.
- CSS must be namespaced with `refscilink-` or equivalent safe prefixes.
- Generated styles must not overwrite global host classes such as `.btn`, `.card`, `.container`, `.nav`.

### JavaScript policy

- No inline JavaScript.
- JavaScript must live in `assets/js/reference.js`.
- Events must be attached through `addEventListener()`.
- HTML must expose stable `data-refscilink-*` hooks.
- JavaScript must be structured and meaningfully commented.

### Code documentation policy

Generated code must contain useful comments explaining:

- major sections;
- extension points;
- JavaScript hooks;
- state management;
- accessibility behaviour;
- fallback behaviour.

Avoid meaningless comments that only repeat the tag or variable name.

---

## Current hardening status

Hardening tasks are tracked in:

```text
SKILL_HARDENING_CHECKLIST.md
```

Completed and validated:

| ID | Status | Summary |
|---|---|---|
| SH-000 | Done | Technical skill specification normalized to English while preserving language-aware generation. |
| SH-001 | Done | Generated files contract defined. |
| SH-002 | Done | `index_ref.html` HTML contract defined. |
| SH-003 | Done | `reference.html` HTML contract defined. |
| SH-004 | Done | `assets/js/reference.js` JavaScript contract defined. |
| SH-005 | Done | `assets/css/reference.css` CSS contract defined. |
| SH-006 | Done | `references.json` JSON contract defined. |
| SH-007 | Done | `theme_refscilink.json` JSON contract defined. |
| SH-008 | Done | `refscilink.config.json` configuration contract defined. |
| SH-009 | Done | Navigation integration contract defined. |
| SH-010 | Done | Multi-page website behaviour contract defined. |
| SH-011 | Done | Markdown parsing strategy defined. |
| SH-012 | Done | DOI / PMID / PMCID / URL extraction strategy defined. |
| SH-013 | Done | Bibliography section boundary strategy defined. |
| SH-014 | Done | Reference numbering and stable ID strategy defined. |
| SH-015 | Done | Reference status lifecycle strategy defined. |
| SH-016 | Done | Logging and diagnostics strategy defined. |
| SH-017 | Done | Dry-run mode strategy defined. |
| SH-018 | Done | Rollback mode strategy defined. |
| SH-019 | Done | Machine-verifiable success criteria strategy defined. |
| SH-020 | Done | Official reproducible tests using `examples/basic-site` implemented. |
| SH-021 | Done | Offline mode strategy defined for local-only execution. |
| SH-022 | Done | No external API mode strategy defined for local-only enrichment-safe execution. |
| SH-023 | Done | Deferred enrichment strategy defined for non-blocking metadata lookup. |
| SH-024 | Done | User file protection strategy defined as global non-destruction layer. |
| SH-025 | Done | GitHub Pages compatibility strategy defined for static subpath deployments. |
| SH-026 | Done | Accessibility strategy defined for semantic, keyboard-friendly generated UI. |
| SH-027 | Done | Responsive design strategy defined for mobile and tablet usability. |
| SH-028 | Done | External links security strategy defined for safe scientific source navigation. |
| SH-029 | Done | Module versioning strategy defined for generated module and schema metadata. |
| SH-030 | Done | Post-install validation checklist defined for machine-readable final review. |

Next recommended phase:

```text
Continue module testing after first `examples/basic-site` validation
```

---

## Remaining hardening tasks

All SH-001 to SH-030 hardening items are complete.

| ID | Topic | Status |
|---|---|---|
| SH-001..SH-030 | Skill hardening checklist | Complete |

Do not modify completed SH items unless a bug or inconsistency is discovered.

---

## Functional roadmap status

Functional upgrades are tracked separately in:

```text
ROADMAP_UPGRADES.md
```

This file tracks project-level improvements such as:

- example sites;
- config file support;
- local installer;
- npm scripts;
- theme detection tools;
- parser tests;
- JSON schema validation;
- PubMed / Europe PMC enrichment;
- Open Access classification;
- BibTeX / RIS / CSL-JSON exports;
- GitHub templates;
- CLI and npm publication;
- GitHub Actions.

Important distinction:

| Document | Role |
|---|---|
| `SKILL_HARDENING_CHECKLIST.md` | Specifies and hardens the AI skill behaviour. |
| `ROADMAP_UPGRADES.md` | Tracks functional and developer-experience upgrades. |
| `PROJECT_STATUS.md` | Summarizes the current global project state. |
| `SESSION_HANDOVER.md` | Provides a short restart prompt for a new session. |

Current known functional state:

- The repository and generated module metadata are aligned on `0.4.0-dev`.
- JSON schema metadata remains `schema_version: 1.0.0`.
- `examples/basic-site/` has been created.
- The global README includes a five-minute developer quick start, the official example and the validation procedure.
- The skill context files for AI assistants exist or have been planned/created.
- The latest `examples/basic-site` module test passed with 84 automated checks.
- The dedicated theme detection suite passed with 16 automated checks.
- The dedicated Markdown extraction suite passed with 19 automated checks.
- The dedicated persistent validation suite passed with 14 automated checks.
- A temporary static-site copy served all main pages, assets and JSON files with HTTP 200.
- A fresh-install simulation extracted 10 references from `examples/basic-site/bibliographie.md`.
- Browser visual inspection has been completed in Codex for the official example flow: home page navigation, bibliography list, `ref001` detail page and French labels.
- Roadmap items 1 (`examples/basic-site/`), 2 (`refscilink.config.json`), 3 (`tools/install_refscilink.mjs`), 4 (`package.json` npm scripts), 5 (`README.md` quick start), 6 (`tools/theme_detector.mjs`), 7 (`theme_refscilink.json` editable overrides), 8 (`tests/theme_detection.test.mjs`), 9 (mixed-format Markdown extraction), 10 (`tests/extract_references.test.mjs`) and 11 (`tools/validate_reference.mjs`) are validated.

Before changing roadmap statuses, inspect the actual repository state and update `ROADMAP_UPGRADES.md` deliberately.

---

## Official example site

Example location:

```text
examples/basic-site/
```

Purpose:

- provide a realistic host website;
- test bibliography extraction;
- test visual theme detection;
- test `/create_module_ref` installation;
- validate expected output.

Relevant files:

```text
examples/basic-site/index.html
examples/basic-site/style.css
examples/basic-site/bibliographie.md
examples/basic-site/README.md
examples/basic-site/expected_output/expected_tree.md
examples/basic-site/expected_output/expected_result.md
```

---

## Required reading order for a new session

A new AI session should read these files in order:

```text
README.md
PROJECT_STATUS.md
SESSION_HANDOVER.md
SKILL_HARDENING_CHECKLIST.md
ROADMAP_UPGRADES.md
skills/create_module_ref.md
```

---

## Working method

For each new correction:

1. Read the current GitHub file before editing.
2. Explain the target SH item or roadmap item.
3. Propose a correction plan.
4. Wait for user validation.
5. Apply the correction to GitHub.
6. Update `SKILL_HARDENING_CHECKLIST.md` or `ROADMAP_UPGRADES.md` when relevant.
7. Report the commit SHA.

---

## Next task

Recommended next task:

```text
Continue roadmap-driven module improvements after validating `examples/basic-site`
```

Latest completed checks:

- `npm run test:basic-site` passed with 84 checks.
- `npm run test:extract` passed with 19 checks.
- `npm run test:theme` passed with 16 checks.
- `npm run test:validate` passed with 14 checks.
- Temporary static-site HTTP checks returned 200 for `/`, `index.html`, `index_ref.html`, `reference.html`, CSS, JS, `references.json` and `theme_refscilink.json`.
- Fresh-install simulation in `/tmp/refscilink-basic-site-fresh` extracted 10 references.
- Fresh install produced `module_version: 0.4.0-dev`, `schema_version: 1.0.0`, `ref001` through `ref010` and `REFSCILINK_EXTRACT_OK`.
- Static checks confirmed `refscilink.config.json` source/output/display/theme/language settings, README quick-start coverage, automatic theme detection, dedicated theme detection fixtures, dedicated Markdown extraction fixtures, dedicated persistent validation fixtures, editable theme runtime overrides, mixed-format Markdown extraction, local installer syntax, local static server syntax, npm script execution, navigation integration, French generated pages, localized detail metadata, stable detail links and external-link safety guards.
- Local installer checks confirmed module file creation, `index.html` backup, one localized `Références` link, reusable config creation and idempotent rerun behaviour.
- Browser review confirmed the flow `index.html` -> `Références` -> bibliography list -> `reference.html?id=ref001`.

Expected next focus:

- continue the module roadmap in `ROADMAP_UPGRADES.md`;
- next likely target is JSON schema validation.

Latest deep-analysis correction sequence:

- generated metadata now uses `module_version` with `schema_version` and timestamps;
- generated external links are filtered through safe `http:` and `https:` URL checks;
- `/create_module_ref` lists all SH-001 to SH-030 normative contracts in its contract table;
- official tests now catch navigation integration, French generated UI, stable fresh-install IDs, detail-link ID usage, versioning and external-link safety regressions.
