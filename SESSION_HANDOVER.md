# Session Handover

Repository:

```text
refscilink-skill
```

## Current objective

Continue testing and stabilizing the real RefSciLink module after completing `/create_module_ref` skill hardening.

---

## Current status

Branch and remote:

```text
main is aligned with origin/main.
Latest pushed commit: b3742a5 Align module version to 0.4.0-dev
Working tree was clean after the last push.
```

Completed hardening items:

```text
SH-000
SH-001
SH-002
SH-003
SH-004
SH-005
SH-006
SH-007
SH-008
SH-009
SH-010
SH-011
SH-012
SH-013
SH-014
SH-015
SH-016
SH-017
SH-018
SH-019
SH-020
SH-021
SH-022
SH-023
SH-024
SH-025
SH-026
SH-027
SH-028
SH-029
SH-030
```

Current task:

```text
Continue roadmap-driven module improvements after examples/basic-site validation.
Next likely roadmap item: 12, JSON schema validation.
```

Last completed test sequence:

```text
- npm run test:basic-site passed with 84 checks.
- npm run test:extract passed with 19 checks.
- npm run test:theme passed with 16 checks.
- npm run test:validate passed with 14 checks.
- Temporary static-site HTTP checks passed for main pages, CSS, JS and JSON.
- Fresh-install simulation extracted 10 references from examples/basic-site/bibliographie.md.
- Current development version is 0.4.0-dev, with generated JSON schema_version 1.0.0.
- Fresh generated references.json includes module_version 0.4.0-dev, schema_version 1.0.0 and sequential ref001..ref010 IDs.
- Browser visual inspection was completed: home navigation contains Références, the list page renders 10 French references, card #1 links to reference.html?id=ref001, and the ref001 detail page renders French metadata/actions.
- Roadmap items 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 and 11 are validated.
```

Recent pushed commits:

```text
b3742a5 Align module version to 0.4.0-dev
68c45e7 Document local validation maintenance points
28c853d Add local persistent reference validation
11e1918 Add dedicated Markdown extraction tests
2965ca2 Improve mixed Markdown reference extraction
1e0ae14 Add dedicated theme detection tests
```

---

## Required reading order

Read these files before making modifications:

```text
README.md
PROJECT_STATUS.md
SESSION_HANDOVER.md
SKILL_HARDENING_CHECKLIST.md
ROADMAP_UPGRADES.md
skills/create_module_ref.md
skills/contracts/README.md
```

For generated-file behaviour, read the relevant contract in:

```text
skills/contracts/
```

---

## Mandatory project rules

### Language

```text
Technical specifications: English
Generated UI: Host website language
JSON keys: English
```

### Generated data

```text
references.json uses metadata + references root object
Reference fields use English keys such as number, title, authors, short_summary
Default validation_status is pending_validation
AI-generated summaries are never validated automatically
```

### CSS

```text
No unjustified inline CSS
Styling inside assets/css/reference.css
Host visual identity has priority
Namespaced selectors only
```

### JavaScript

```text
No inline JavaScript
JavaScript inside assets/js/reference.js
Use addEventListener()
Use data-refscilink-* hooks
```

### Documentation

```text
Generated code must be meaningfully commented
Prefer maintainer-friendly comments for open-source contributors
Comment intent, invariants, safety rules and non-obvious decisions
Avoid comments that merely restate obvious code
Contracts in skills/contracts/ are normative when present
```

### Host website protection

```text
Do not overwrite user files without backup
Do not pollute global CSS
Do not impose a fixed RefSciLink design
```

---

## Hardening tracking

Specification hardening:

```text
SKILL_HARDENING_CHECKLIST.md
```

Functional upgrades:

```text
ROADMAP_UPGRADES.md
```

Do not confuse roadmap upgrades with hardening tasks.

---

## Recommended next action

Next action:

```text
Continue roadmap-driven module improvements with item 12: JSON schema validation.
```

Then continue with:

```text
Roadmap-driven module improvements in ROADMAP_UPGRADES.md
```

---

## Standard restart prompt

Use this prompt in a new AI session:

```text
Read:
1. README.md
2. PROJECT_STATUS.md
3. SESSION_HANDOVER.md
4. SKILL_HARDENING_CHECKLIST.md
5. ROADMAP_UPGRADES.md
6. skills/create_module_ref.md
7. skills/contracts/README.md

Repository:
refscilink-skill

Current state:
SH-000 to SH-030 completed and validated.
Generated-file contracts are externalized in skills/contracts/.
Current development version: 0.4.0-dev.
Generated JSON schema_version remains 1.0.0.
Latest pushed commit: b3742a5 Align module version to 0.4.0-dev.
Branch main was clean and aligned with origin/main after the last push.
First examples/basic-site test passed:
- npm run test:basic-site => pass, 84 checks.
- npm run test:extract => pass, 19 checks.
- npm run test:theme => pass, 16 checks.
- npm run test:validate => pass, 14 checks.
- Static HTTP checks => all tested pages/assets/JSON returned 200.
- Fresh install simulation => 10 references extracted with ref001..ref010.
- Browser review => home Références link, list page and ref001 detail page validated.
- refscilink.config.json => official source Markdown, HTML entry point, output paths, display, theme and language validated.
- tools/install_refscilink.mjs => module creation, backup, navigation insertion, config writing and idempotent rerun validated on a temporary site.
- package.json npm scripts => build:refs, install:module, serve and demo validated with local-only tooling.
- README quick start => less-than-five-minute demo, validation, install, rebuild and serve path documented and covered by the official test.
- tools/theme_detector.mjs => host CSS colors, typography, radius, button shape and shadows detected locally; installer regenerates theme_refscilink.json during install.
- theme_refscilink.json editable overrides => reference.js applies safe --refscilink-* variables at runtime; manual_overrides and unknown maintainer keys are preserved during theme regeneration.
- tests/theme_detection.test.mjs => dedicated fixtures cover CSS variables, selector extraction, nested stylesheet paths, fallback, ignored external stylesheets, dark inference and manual override preservation.
- Markdown extraction now handles mixed numbered, bracketed, bullet and free-form bibliography entries in the same section, preserves subsection metadata and stops at explicit non-bibliographic headings.
- tests/extract_references.test.mjs => dedicated fixtures cover DOI, PMID, PMCID, URL/PDF URL extraction, stable rerun IDs, source-order numbering, no-heading fallback and dry-run safety.
- tools/validate_reference.mjs => local persistent validation writes human validation fields back to references.json with backup, note appending, JSON preservation and dry-run safety.
- recent commits => b3742a5 version alignment, 68c45e7 maintenance comments, 28c853d persistent validation.

Current task:
Continue roadmap-driven module improvements.
Next likely roadmap item: item 12, JSON schema validation with tools/validate_schema.mjs and tests/schema_validation.test.mjs.

Do not modify completed SH items without justification.
Keep technical specifications in English.
Generated UI must follow the host language.
Host visual identity has priority.
Generated code should include maintainer-friendly comments for open-source contributors.
Do not update ROADMAP_UPGRADES.md statuses unless the corresponding module feature is fully validated against its roadmap criterion.
```

Recent deep-analysis corrections:

```text
- module_version metadata aligned in generated JSON and extraction output;
- external links are filtered to safe http/https URLs before rendering;
- create_module_ref contract table includes all SH-001 to SH-030 contracts;
- official tests include config completeness, local installer behaviour, npm script execution, local static server checks, navigation integration, French UI, stable fresh-install IDs, detail-link ID usage, versioning and external-link safety checks.
```
