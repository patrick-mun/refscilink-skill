# Session Handover

Repository:

```text
refscilink-skill
```

## Current objective

Finish hardening the `/create_module_ref` skill before advanced feature development and AI integration.

---

## Current status

Completed hardening items:

```text
SH-000
SH-001
SH-002
SH-003
SH-004
```

Current task:

```text
SH-005
CSS Contract
assets/css/reference.css
```

---

## Required reading order

Read these files before making modifications:

```text
README.md
PROJECT_STATUS.md
SKILL_HARDENING_CHECKLIST.md
ROADMAP_UPGRADES.md
skills/create_module_ref.md
```

---

## Mandatory project rules

### Language

```text
Technical specifications: English
Generated UI: Host website language
JSON keys: English
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
SH-005 — CSS Contract
```

Then:

```text
SH-006 — references.json Contract
SH-007 — theme_refscilink.json Contract
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

Repository:
refscilink-skill

Current state:
SH-000 to SH-004 completed and validated.

Current task:
SH-005 CSS Contract.

Do not modify completed SH items without justification.
Keep technical specifications in English.
Generated UI must follow the host language.
Host visual identity has priority.
```
