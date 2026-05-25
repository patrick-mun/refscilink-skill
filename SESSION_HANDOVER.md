# Session Handover

Repository:

```text
refscilink-skill
```

## Current objective

Continue testing and stabilizing the real RefSciLink module after completing `/create_module_ref` skill hardening.

---

## Current status

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
Continue examples/basic-site testing
Visual/browser review still needed
```

Last completed test sequence:

```text
- npm run test:basic-site passed with 31 checks.
- Temporary static-site HTTP checks passed for main pages, CSS, JS and JSON.
- Fresh-install simulation extracted 10 references from examples/basic-site/bibliographie.md.
- Fresh generated references.json includes module_version 0.2.0-dev and schema_version 1.0.0.
- Browser visual inspection was not completed because the Browser tool was unavailable.
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
Continue examples/basic-site visual/browser testing
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
First examples/basic-site test passed:
- npm run test:basic-site => pass, 31 checks.
- Static HTTP checks => all tested pages/assets/JSON returned 200.
- Fresh install simulation => 10 references extracted.

Current task:
Continue examples/basic-site visual/browser testing.

Do not modify completed SH items without justification.
Keep technical specifications in English.
Generated UI must follow the host language.
Host visual identity has priority.
Do not update ROADMAP_UPGRADES.md statuses unless the corresponding module feature is fully validated against its roadmap criterion.
```

Recent deep-analysis corrections:

```text
- module_version metadata aligned in generated JSON and extraction output;
- external links are filtered to safe http/https URLs before rendering;
- create_module_ref contract table includes all SH-001 to SH-030 contracts;
- official tests include versioning and external-link safety checks.
```
