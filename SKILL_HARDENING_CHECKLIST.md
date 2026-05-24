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
| SH-005 | CSS contract | Define mandatory classes and namespaces in `reference.css` | Consistent styling and isolation | Critical | Oui |
| SH-006 | JSON contract | Define exact root structure of `references.json` | Identical JSON format across agents | Critical | Oui |
| SH-007 | JSON contract | Define exact root structure of `theme_refscilink.json` | Identical theme format across agents | Critical | Oui |
| SH-008 | Configuration contract | Define complete schema of `refscilink.config.json` | Persistent configuration behaviour | High | Oui |
| SH-009 | Navigation integration | Define exact insertion strategy for the `Références` button | Predictable HTML modification | Critical | Oui |
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

### SH-005 — reference.css CSS Contract

Implemented in `skills/create_module_ref.md`.

The skill now defines the mandatory contract for the generated CSS integration layer.

Implemented:

- strict `refscilink-` namespacing and selector isolation;
- prohibition of global host-class overrides such as `.btn`, `.card`, `.container`, `.nav`, `.navbar` and similar common names;
- no global reset of `body`, `html`, `*`, `a` or `button` unless narrowly scoped and explicitly justified;
- mandatory `reference.css` file header and maintainable section organization;
- scoped RefSciLink CSS custom properties on `.refscilink-page`;
- host design adaptation rules for typography, colors, surfaces, borders, radii, shadows, spacing density and dark/light mode tendency;
- fallback scientific visual style when no host identity is detectable;
- mandatory class coverage for pages, headers, controls, reference cards, detail pages, metadata, buttons, badges and states;
- responsive layout requirements including mobile support down to approximately 320px;
- visible focus states and reduced-motion support;
- loading, empty, not-found, error, validation and metadata-review state styling;
- side-panel compatibility classes when the selected display mode includes a panel;
- dark-mode and high-contrast compatibility scoped to the module;
- explicit separation between CSS styling, HTML structure and JavaScript behaviour;
- minimal machine-reviewable CSS success criteria.

The CSS contract must make RefSciLink feel like an extension of the host website. It must adapt to the user's visual identity and artistic charter rather than imposing a fixed RefSciLink aesthetic.

---

### SH-006 — references.json JSON Contract

Implemented in `skills/contracts/references_json_contract.md` and used as the normative contract for generated `data/reference_bibliographique/json/references.json` files.

The skill now defines the mandatory JSON data structure for bibliographic references.

Implemented:

- mandatory root object with `metadata` and `references`;
- prohibition of generating legacy root arrays, while allowing `reference.js` to tolerate them for backward compatibility;
- mandatory metadata fields including `generated_by`, `version`, `schema_version`, `generated_at`, `language`, `source_markdown`, `source_markdown_sha256`, `enrichment_mode` and `reference_count`;
- stable reference object with bibliographic fields, identifiers, URLs, access status, summaries, validation fields, extraction status, metadata status, review notes, source location and duplicate tracking;
- string-array representation for `authors`;
- stable `ref001`, `ref002`, `ref003` ID strategy and appearance-order numbering;
- controlled values for `access_type`, `validation_status`, `extraction_status` and `metadata_status`;
- explicit no-`null` policy for unknown strings and arrays;
- source Markdown location tracking with line numbers and section metadata;
- duplicate handling without automatic deletion;
- strict human-validation rules preventing AI summaries from being validated by default;
- DOI, PMID, PMCID and URL normalization rules;
- minimal valid JSON example;
- machine-reviewable success criteria for future `schema_references.json` validation.

Generated user-facing summary values may follow the detected host language, but all JSON keys must remain English and stable.

---

### SH-007 — theme_refscilink.json JSON Contract

Implemented in `skills/contracts/theme_refscilink_json_contract.md` and used as the normative contract for generated `data/reference_bibliographique/json/theme_refscilink.json` files.

The skill now defines the mandatory JSON structure for editable visual theme configuration.

Implemented:

- mandatory root object with stable theme fields;
- mandatory metadata fields including `generated_by`, `version`, `schema_version`, `generated_at`, `language`, `source_project` and `source_entrypoint`;
- controlled values for `theme_mode`, `spacing_density`, `color_scheme`, detection `status` and detection `confidence`;
- required color, typography, radius, shadow, spacing and color-scheme fields;
- `detected_from` rules for listing inspected host files;
- `css_variables` mapping to namespaced `--refscilink-*` CSS custom properties;
- `detection` object for status, confidence, strategy, warnings and host visual summary;
- host visual identity priority rules;
- human editability and backup expectations;
- minimal valid JSON example;
- machine-reviewable success criteria for future theme validation tools.

The theme contract must preserve the host website visual identity before applying RefSciLink fallback values.

---

### SH-008 — refscilink.config.json Configuration Contract

Implemented in `skills/contracts/refscilink_config_contract.md` and used as the normative contract for generated project-level `refscilink.config.json` files.

The skill now defines the persistent configuration structure used to make `/create_module_ref` safely rerunnable.

Implemented:

- mandatory root object with `metadata`, `source`, `output`, `display`, `theme`, `language`, `enrichment`, `safety` and `runtime`;
- mandatory metadata fields including `generated_by`, `version`, `schema_version`, `created_at` and `updated_at`;
- project-relative source and output path rules;
- controlled values for display mode, navigation integration, theme mode and enrichment mode;
- language configuration rules preserving English internal keys and host-language UI generation;
- enrichment flags for network use, AI summaries and mandatory human validation;
- safety rules for backups, dry-run mode, manual edit preservation and non-overwrite defaults;
- static-hosting and GitHub Pages runtime compatibility fields;
- idempotence and rerun behaviour using existing config values before asking the user again;
- legacy flat-key compatibility and migration expectations;
- minimal valid JSON example;
- machine-reviewable success criteria for future config validation tools.

The configuration contract must preserve user choices and host-project constraints while keeping RefSciLink static-hosting compatible.

---

### SH-009 — Navigation Integration Contract

Implemented in `skills/contracts/navigation_integration_contract.md` and used as the normative contract for adding a localized RefSciLink navigation entry to the selected host HTML entry point.

The skill now defines the exact insertion strategy for the `Références` / `References` navigation entry.

Implemented:

- controlled integration modes: `auto`, `navbar`, `floating_button`, `manual` and `skip`;
- alignment with `refscilink.config.json` display and navigation settings;
- HTML entry point selection priority and ambiguity handling;
- navigation container detection strategy for semantic `<nav>`, `role="navigation"`, navbar/menu classes and header link groups;
- duplicate detection rules for existing RefSciLink links;
- navbar insertion rules preserving order, classes, accessibility and formatting;
- safe floating-button fallback without inline CSS or JavaScript;
- manual and skip mode behaviours;
- host file backup and minimal-change requirements before modifying `index.html` or another entry point;
- style rules that reuse host navigation classes when safe and otherwise use namespaced RefSciLink classes;
- accessibility, mobile-menu, multi-page and generated-navigation constraints;
- before/after HTML examples;
- final report fields and machine-reviewable success criteria.

The navigation integration contract must add predictable access to the bibliography module without breaking or redesigning the host website navigation.

---

## Contract externalization note

The normative contracts for completed hardening items SH-001 to SH-009 are now externalized in:

```text
skills/contracts/
```

Contract index:

```text
skills/contracts/README.md
```

The main skill file `skills/create_module_ref.md` remains the workflow entry point, but dedicated contract files are authoritative for generated file structures and behaviours.

Current externalized contracts:

| ID | Contract |
|---|---|
| SH-001 | `skills/contracts/generated_files_contract.md` |
| SH-002 | `skills/contracts/index_ref_html_contract.md` |
| SH-003 | `skills/contracts/reference_html_contract.md` |
| SH-004 | `skills/contracts/reference_js_contract.md` |
| SH-005 | `skills/contracts/reference_css_contract.md` |
| SH-006 | `skills/contracts/references_json_contract.md` |
| SH-007 | `skills/contracts/theme_refscilink_json_contract.md` |
| SH-008 | `skills/contracts/refscilink_config_contract.md` |
| SH-009 | `skills/contracts/navigation_integration_contract.md` |

---

## Recommended implementation order

### Phase 1 — Critical specification lock

- SH-011
- SH-012
- SH-013
- SH-019

Goal:

Remove all major implementation ambiguities.
