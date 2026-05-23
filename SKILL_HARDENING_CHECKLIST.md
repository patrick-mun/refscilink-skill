# RefSciLink Skill — Skill Hardening Checklist

## Purpose

This document tracks all remaining improvements required before considering the RefSciLink installation skill fully specified and ready for integration into AI coding assistants.

The objective is to eliminate ambiguity so that different AI agents (Codex, Claude Code, Copilot Agent, OpenHands, etc.) produce equivalent installations.

---

## Validation status legend

| Value | Meaning |
|---|---|
| Non | Not started |
| En cours | Partially specified or partially implemented |
| Oui | Fully specified, reviewed and validated |

---

## Skill hardening tasks

| ID | Category | Required improvement | Expected result | Priority | Validé |
|---|---|---|---|---|---|
| SH-000 | Skill normalization | Normalize technical skill specification to English while keeping generated content language-aware | Consistent behaviour across AI coding assistants | Critical | Oui |
| SH-001 | Generated files contract | Define exact internal format of every generated file | No ambiguity about generated content | Critical | Oui |
| SH-002 | HTML contract | Define mandatory structure of `index_ref.html` | All agents generate equivalent bibliography index pages | Critical | Oui |
| SH-003 | HTML contract | Define mandatory structure of `reference.html` | All agents generate equivalent detail pages | Critical | Oui |
| SH-004 | JavaScript contract | Define mandatory functions of `reference.js` | Consistent behaviour across installations | Critical | Oui |
| SH-005 | CSS contract | Define mandatory classes and namespaces in `reference.css` | Consistent styling and isolation | Critical | Non |
| SH-006 | JSON contract | Define exact root structure of `references.json` | Identical JSON format across agents | Critical | Non |
| SH-007 | JSON contract | Define exact root structure of `theme_refscilink.json` | Identical theme format across agents | Critical | Non |
| SH-008 | Configuration contract | Define complete schema of `refscilink.config.json` | Persistent configuration behaviour | High | Non |
| SH-009 | Navigation integration | Define exact insertion strategy for the `Références` button | Predictable HTML modification | Critical | Non |
| SH-010 | Multi-page websites | Define behaviour when several HTML entry points exist | Consistent integration decisions | Medium | Non |
| SH-011 | Markdown parsing | Define line-by-line parsing strategy | Stable extraction behaviour | Critical | Non |
| SH-012 | Metadata extraction | Define DOI / PMID / PMCID / URL detection rules | Consistent metadata extraction | Critical | Non |
| SH-013 | Markdown boundaries | Define bibliography section start/stop rules | Avoid over-capturing unrelated content | Critical | Non |
| SH-014 | Reference numbering | Define numbering and ordering strategy | Stable reference identifiers | Medium | Non |
| SH-015 | Reference status system | Define all reference validation and error states | Consistent lifecycle management | High | Non |
| SH-016 | Logging | Define installation logs and diagnostics | Easier debugging | Medium | Non |
| SH-017 | Dry-run mode | Define simulation mode without file modification | Safe testing workflow | High | Non |
| SH-018 | Rollback mode | Define restoration strategy after failed installation | Safe recovery mechanism | High | Non |
| SH-019 | Success criteria | Define machine-verifiable installation success criteria | Reliable validation process | Critical | Non |
| SH-020 | Official tests | Define mandatory test cases using `examples/basic-site` | Reproducible validation workflow | Critical | Non |
| SH-021 | Offline mode | Define behaviour without internet access | Predictable offline execution | High | Non |
| SH-022 | No external API mode | Define behaviour without enrichment APIs | Stable local operation | High | Non |
| SH-023 | Deferred enrichment | Define delayed enrichment workflow | Non-blocking installation | Medium | Non |
| SH-024 | User file protection | Define strict non-destruction rules | No accidental data loss | Critical | Non |
| SH-025 | GitHub Pages compatibility | Define static hosting constraints | GitHub Pages support guaranteed | High | Non |
| SH-026 | Accessibility | Define minimum accessibility requirements | Accessible generated interface | Medium | Non |
| SH-027 | Responsive design | Define minimum responsive behaviour | Mobile compatibility guaranteed | Medium | Non |
| SH-028 | External links security | Define `noopener`, `noreferrer`, target rules | Safer external navigation | Medium | Non |
| SH-029 | Module versioning | Define generated module version metadata | Easier maintenance and upgrades | Medium | Non |
| SH-030 | Validation checklist | Define machine-readable post-install checklist | Automated verification possible | High | Non |

---

## Completed items

### SH-000 — Technical Specification Normalization

Implemented in `skills/create_module_ref.md`.

The skill has been normalized as an English technical specification while preserving language-aware generation.

Implemented:

- English technical instructions;
- English workflow descriptions;
- English installation reports;
- English error messages;
- `Language Detection` section;
- host-language driven content generation;
- English internal JSON schema keys.

Preserved:

- multilingual bibliography detection keywords;
- automatic language adaptation;
- host visual identity adaptation;
- GitHub Pages compatibility.

Generated user-facing content must follow the detected host website language, while internal schema keys and technical instructions remain English.

---

### SH-001 — Generated Files Contract

Implemented in `skills/create_module_ref.md`.

The skill now defines:

- mandatory generated files;
- file type expectations;
- creation/update rules;
- backup behaviour;
- metadata requirements;
- GitHub Pages compatible relative paths;
- adaptation hierarchy preserving the user's visual identity.

Theme priority order:

1. Host website visual identity.
2. `theme_refscilink.json`.
3. Automatic theme detection.
4. RefSciLink fallback theme.

The generated file contract must never prevent adaptation to the user's design system.

---

### SH-002 — index_ref.html HTML Contract

Implemented in `skills/create_module_ref.md`.

The skill now defines the mandatory contract for the generated bibliography index page.

Implemented:

- minimal semantic HTML skeleton;
- mandatory `index_ref.html` page sections;
- stable JavaScript data hooks;
- required search and filter controls;
- reference card content requirements;
- loading, ready, empty and error states;
- accessibility requirements;
- localization requirements;
- external link security rules;
- GitHub Pages compatible relative paths;
- no inline styling policy;
- mandatory meaningful code comments;
- strict separation of HTML structure, CSS styling and JavaScript behaviour;
- preservation of host visual identity.

The HTML contract must provide structure and extension points only. Visual styling must remain in `assets/css/reference.css` unless a rare technical exception is explicitly justified in a comment.

---

### SH-003 — reference.html HTML Contract

Implemented in `skills/create_module_ref.md`.

The skill now defines the mandatory contract for the generated reference detail page.

Implemented:

- canonical detail URL format: `reference.html?id=ref001`;
- optional backward-compatible `ref` query parameter support;
- minimal semantic HTML skeleton;
- mandatory `reference.html` page sections;
- stable JavaScript data hooks for detail rendering;
- metadata display requirements;
- summary display requirements;
- key points, project relevance and limitations sections;
- human validation controls;
- source, copy and validation actions;
- loading, ready, not-found and error states;
- accessibility requirements;
- localization requirements;
- external link security rules;
- GitHub Pages compatible relative paths;
- no inline styling policy;
- mandatory meaningful code comments;
- strict separation of HTML structure, CSS styling and JavaScript behaviour;
- preservation of host visual identity.

The detail page must display one selected reference from `references.json` and must show a localized not-found state when the requested reference ID does not exist.

---

### SH-004 — reference.js JavaScript Contract

Implemented in `skills/create_module_ref.md`.

The skill now defines the mandatory contract for the generated JavaScript engine.

Implemented:

- strict no inline JavaScript policy;
- mandatory use of `assets/js/reference.js`;
- meaningful file header comment;
- documented internal file organization;
- required functional areas and functions;
- JSON loading via GitHub Pages compatible relative paths;
- support for `metadata` + `references` JSON root structure;
- stable `data-refscilink-*` hook usage;
- safe rendering rules using `textContent` by default;
- restricted and justified `innerHTML` policy;
- localization dictionary requirements;
- index page rendering requirements;
- detail page rendering requirements;
- search and filter requirements;
- localStorage validation state requirements;
- error handling requirements;
- accessibility requirements;
- bootstrapping via `DOMContentLoaded`;
- strict separation of JavaScript behaviour from HTML structure and CSS styling.

The JavaScript contract must keep behaviour in `assets/js/reference.js`, avoid inline event handlers, preserve the host design system and avoid framework dependencies.

---

## Recommended implementation order

### Phase 1 — Critical specification lock

- SH-005
- SH-006
- SH-007
- SH-009
- SH-011
- SH-012
- SH-013
- SH-019

Goal:

Remove all major implementation ambiguities.
