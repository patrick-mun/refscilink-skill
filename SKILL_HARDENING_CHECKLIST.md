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
| SH-001 | Generated files contract | Define exact internal format of every generated file | No ambiguity about generated content | Critical | Oui |
| SH-002 | HTML contract | Define mandatory structure of `index_ref.html` | All agents generate equivalent bibliography index pages | Critical | Non |
| SH-003 | HTML contract | Define mandatory structure of `reference.html` | All agents generate equivalent detail pages | Critical | Non |
| SH-004 | JavaScript contract | Define mandatory functions of `reference.js` | Consistent behaviour across installations | Critical | Non |
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

## Recommended implementation order

### Phase 1 — Critical specification lock

- SH-002
- SH-003
- SH-004
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
