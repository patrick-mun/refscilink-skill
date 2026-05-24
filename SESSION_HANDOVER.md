# Session Handover

Repository:

```text
refscilink-skill
```

## Current objective

Finish hardening the `/create_module_ref` skill before advanced feature development and implementation work.

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
```

Current task:

```text
SH-012
DOI / PMID / PMCID / URL extraction rules
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

Implement:

```text
SH-012 — DOI / PMID / PMCID / URL extraction rules
```

Then continue Phase 1:

```text
SH-013 — Bibliography section boundary rules
SH-019 — Machine-verifiable success criteria
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
SH-000 to SH-011 completed and validated.
Generated-file contracts are externalized in skills/contracts/.

Current task:
SH-012 DOI / PMID / PMCID / URL extraction rules.

Do not modify completed SH items without justification.
Keep technical specifications in English.
Generated UI must follow the host language.
Host visual identity has priority.
```
