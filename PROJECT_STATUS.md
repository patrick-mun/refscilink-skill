# RefSciLink Skill — Project Status

## Purpose

This document records the current state of the RefSciLink Skill project so that a new development session or a new AI coding assistant can resume work without losing context.

Repository:

```text
patrick-mun/refscilink-skill
```

Current focus:

```text
Hardening the `/create_module_ref` skill before full integration into Codex, Claude Code or another AI coding assistant.
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

Next recommended hardening task:

```text
SH-013 — Bibliography section boundary rules
```

---

## Remaining hardening tasks

The next Phase 1 critical items are:

| ID | Topic | Status |
|---|---|---|
| SH-013 | Bibliography section boundary rules | Pending |
| SH-019 | Machine-verifiable success criteria | Pending |

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

- `examples/basic-site/` has been created.
- The global README includes an official example and validation procedure.
- The skill context files for AI assistants exist or have been planned/created.
- Some roadmap items may need their `Validé` column updated after formal verification.

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
SH-013 — Bibliography section boundary rules
```

Expected focus:

- precise bibliography section start rules;
- precise bibliography section stop rules;
- nested heading behaviour;
- avoiding over-capture of notes, annexes and TODOs;
- fallback behaviour when no bibliography heading exists;
- interaction with Markdown parsing strategy.
