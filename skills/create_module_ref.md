# Skill: `/create_module_ref`

Legacy command accepted: `/creat_modul_ref`

## Purpose

Install the RefSciLink bibliography module into the current web project.

The skill is designed for Codex, Claude Code, GitHub Copilot Agent, OpenHands or another coding assistant working inside VS Code.

The default implementation is Vanilla HTML/CSS/JS.

---

## Core principles

- Work inside the currently opened project folder.
- Do not assume React, Vue, Angular, Django, Flask or Next.js unless clearly present.
- Prefer static-hosting compatibility.
- Preserve existing design and content.
- Never overwrite user data without backup.
- Never mark AI-generated summaries as validated by default.
- Prefer a functional minimal installation over an incomplete advanced one.
- Keep this technical specification in English.
- Generate user-facing content in the detected language of the host website.
- Keep visual design in CSS files under `assets/css/` unless a technical exception is explicitly justified.
- Keep JavaScript in `assets/js/reference.js`; inline JavaScript is prohibited.
- Comment generated code meaningfully so developers can maintain it.

---

## Execution modes

### Mode 1 — Install only

Creates the module structure, HTML/CSS/JS files, empty JSON files and button integration.

### Mode 2 — Install + Extract references

Mode 1 plus Markdown bibliography extraction and `references.json` generation.

### Mode 3 — Install + Extract + Scientific enrichment

Mode 2 plus scientific lookup, access classification and AI-generated summaries.

Recommended default for first tests:

```text
Mode 2 — Install + Extract references
```

Scientific enrichment must not block installation. If web access or API access is unavailable, generate the module and mark references as requiring enrichment.

---

## First mandatory questions

Ask:

```text
Which Markdown file should be analysed for bibliography extraction?
```

If several Markdown files are present, list likely candidates.

Then ask:

```text
Which display mode should be used: dedicated page, side panel, or both?
```

Recommended default:

```text
Dedicated page + References button in index.html
```

Then ask:

```text
Should RefSciLink automatically adapt to the host website visual identity?
```

Recommended default:

```text
Yes — Theme Mode = Auto + Override
```

Then ask or infer:

```text
Interface language: auto / fr / en / other
```

Recommended default:

```text
auto
```

---

## Language detection

The skill must detect the host website language and use it for generated user-facing content.

Generated content language affects:

- page titles;
- navigation labels;
- interface buttons;
- visible status labels;
- AI-generated summaries;
- user-facing error messages inside generated pages.

The technical specification, code comments and implementation instructions remain in English.

### Detection priority

1. `<html lang="...">` in the selected HTML entry point.
2. `<meta name="language" content="...">` or equivalent metadata.
3. Visible text analysis from navigation, headings and buttons.
4. `refscilink.config.json` if it already exists.
5. Fallback: `en`.

### Setting the language attribute on generated HTML files

When generating `index_ref.html` and `reference.html`, the skill must set the `lang` attribute to the detected language code:

```html
<html lang="{{detected_language}}">
```

Where `{{detected_language}}` is a valid BCP 47 language tag (e.g. `fr`, `en`, `de`, `es`).

If detection is inconclusive, use `en` as the international fallback:

```html
<html lang="en">
```

The `reference.js` module reads this attribute at runtime through `detectLanguage()` and applies the matching locale to all UI elements through `applyI18n()`. Static text in the HTML template must therefore be set to the detected language as the **default displayed value**, so the page is readable even before JavaScript executes.

### Runtime i18n mechanism

Generated HTML files use a two-layer localization approach:

- **Layer 1 — Static default text**: all translatable elements carry their text content in the detected language. This ensures a readable page without JavaScript.
- **Layer 2 — Runtime replacement**: all translatable elements carry a `data-refscilink-i18n="key"` attribute. The `applyI18n()` function in `reference.js` reads `<html lang>` at `DOMContentLoaded` and replaces text content using the matching locale from `REFSCILINK_I18N`.

This means the skill must:

1. Set `<html lang="{{detected_language}}">`.
2. Write the correct translated text as the static default in every translatable element.
3. Add `data-refscilink-i18n="key"` on every translatable element so `applyI18n()` can update it at runtime.

The full list of i18n keys and their per-locale values is defined in `REFSCILINK_I18N` inside `assets/js/reference.js`.

If the detected language has no matching locale in `REFSCILINK_I18N`, `reference.js` falls back to `en` automatically.

### Language behaviour examples

If the host page contains `<html lang="fr">`, generated labels may include:

```text
Références
Lire le résumé
Voir la source
Copier la référence
Valider le résumé
```

If the host page contains `<html lang="en">`, generated labels may include:

```text
References
Read summary
View source
Copy reference
Validate summary
```

Internal JSON keys must remain English and stable. Only field values and visible UI text may be localized.

---

## Required module location

Create the module under:

```text
data/reference_bibliographique/
```

Required structure:

```text
data/reference_bibliographique/
├── index_ref.html
├── reference.html
├── assets/
│   ├── css/
│   │   └── reference.css
│   └── js/
│       └── reference.js
├── json/
│   ├── references.json
│   └── theme_refscilink.json
└── tools/
    ├── build_references.mjs
    ├── prompt_recherche_ia.md
    └── schema_references.json
```

Also create or update at project root:

```text
refscilink.config.json
```

---

## Normative generated-file contracts

The detailed generated-file contracts are externalized in:

```text
skills/contracts/
```

Before generating, updating or validating any RefSciLink module file, the assistant must read and apply the relevant normative contract from that folder.

When a dedicated contract exists in `skills/contracts/`, it is the authoritative specification for that generated file and takes priority over summarized guidance in this main skill file.

Read the contract index first:

```text
skills/contracts/README.md
```

Current normative contracts:

| Generated file or concern | Normative contract |
|---|---|
| Generated file set, creation/update rules and metadata | `skills/contracts/generated_files_contract.md` |
| `index_ref.html` | `skills/contracts/index_ref_html_contract.md` |
| `reference.html` | `skills/contracts/reference_html_contract.md` |
| `assets/js/reference.js` | `skills/contracts/reference_js_contract.md` |
| `assets/css/reference.css` | `skills/contracts/reference_css_contract.md` |
| `json/references.json` | `skills/contracts/references_json_contract.md` |
| `json/theme_refscilink.json` | `skills/contracts/theme_refscilink_json_contract.md` |
| `refscilink.config.json` | `skills/contracts/refscilink_config_contract.md` |
| Host navigation entry / References button | `skills/contracts/navigation_integration_contract.md` |
| Multiple HTML entry points / multi-page websites | `skills/contracts/multi_page_websites_contract.md` |
| Markdown bibliography extraction | `skills/contracts/markdown_parsing_strategy.md` |
| Markdown bibliography section boundaries | `skills/contracts/bibliography_boundary_strategy.md` |
| DOI, PMID, PMCID and URL extraction | `skills/contracts/metadata_identifier_extraction_strategy.md` |
| Reference numbering, stable IDs and rerun matching | `skills/contracts/reference_numbering_strategy.md` |
| Reference status lifecycle, filters and validation states | `skills/contracts/reference_status_lifecycle_strategy.md` |
| Logging, diagnostics and report codes | `skills/contracts/logging_diagnostics_strategy.md` |
| Dry-run simulation without file writes | `skills/contracts/dry_run_mode_strategy.md` |
| Rollback planning and safe restore behaviour | `skills/contracts/rollback_mode_strategy.md` |
| Machine-verifiable validation and success criteria | `skills/contracts/success_criteria_strategy.md` |
| Official reproducible tests using `examples/basic-site` | `skills/contracts/official_tests_strategy.md` |
| Offline execution without internet access | `skills/contracts/offline_mode_strategy.md` |
| Network-available execution without scientific enrichment APIs | `skills/contracts/no_external_api_mode_strategy.md` |
| Deferred metadata enrichment after installation or extraction | `skills/contracts/deferred_enrichment_strategy.md` |
| User file protection, overwrite prevention and conflict handling | `skills/contracts/user_file_protection_strategy.md` |
| Static hosting and GitHub Pages compatibility | `skills/contracts/github_pages_compatibility_strategy.md` |
| Semantic HTML, ARIA, keyboard and focus accessibility | `skills/contracts/accessibility_strategy.md` |
| Mobile, tablet and narrow viewport responsive behaviour | `skills/contracts/responsive_design_strategy.md` |
| External links, safe URL schemes and `noopener noreferrer` rules | `skills/contracts/external_links_security_strategy.md` |
| Generated module version metadata, schema versions and migration compatibility | `skills/contracts/module_versioning_strategy.md` |
| Post-install validation checklist and final machine-readable review | `skills/contracts/post_install_validation_checklist.md` |

If a required contract file is missing, continue using the corresponding section in this main skill file and report that the dedicated contract has not yet been created.

## Source strategy

When installing files, use this priority order:

1. If RefSciLink source/template files are present in the current repository, copy or adapt them.
2. If source/template files are not available, generate a minimal functional module from this skill specification.
3. If a file already exists in the target project, do not overwrite it without backup.

Minimal functional module means:

- `index_ref.html` can load `references.json`;
- `reference.html` can load a selected reference by `id` query parameter;
- `reference.css` contains namespaced `refscilink-` styles;
- `reference.js` can render references, filters, detail pages and buttons;
- `references.json` exists and is valid JSON;
- `theme_refscilink.json` exists and is valid JSON.

---

## Idempotence and backup rules

The skill must be safely rerunnable.

User file protection rules are externalized in:

```text
skills/contracts/user_file_protection_strategy.md
```

The assistant must read that strategy before writing, overwriting, deleting, moving, renaming or restoring any file.

If `data/reference_bibliographique/` already exists:

1. Detect existing files.
2. Create a backup before modifying anything.
3. Preserve user-edited data.
4. Report what was kept, updated or skipped.

Backup path pattern:

```text
backup/refscilink/reference_bibliographique_YYYYMMDD_HHMMSS/
```

Never overwrite without backup:

- `references.json`
- `theme_refscilink.json`
- manually edited `reference.css`
- manually edited `reference.js`
- existing `index.html`

If the localized References button already exists, do not duplicate it.

---

## Configuration file

Create or update:

```text
refscilink.config.json
```

The normative contract for generated project-level configuration is externalized in:

```text
skills/contracts/refscilink_config_contract.md
```

The assistant must read that contract before generating, updating or validating `refscilink.config.json`.

Use the config file on future executions instead of asking again, unless the user explicitly wants to change settings.

---

## Installation tasks

### 1. Inspect project structure

Static hosting and GitHub Pages compatibility rules are externalized in:

```text
skills/contracts/github_pages_compatibility_strategy.md
```

The assistant must read that strategy before generating or modifying browser paths, JSON loading paths or GitHub Pages deployment assumptions.

Detect:

- main HTML entry point, usually `index.html`;
- multiple possible `index.html` files;
- existing CSS files;
- existing JavaScript files;
- existing navigation bar or menu;
- Markdown files containing references;
- existing design system;
- existing RefSciLink installation.

If no `index.html` is found, do not fail completely. Create the module and report that navigation integration could not be performed.

If several `index.html` files are found, ask which one should receive the localized References button.

For multi-page websites or multiple plausible HTML entry points, apply:

```text
skills/contracts/multi_page_websites_contract.md
```

---

### 2. Analyse host visual identity

Inspect:

- linked CSS files;
- inline `<style>` blocks;
- CSS custom properties in `:root`;
- button classes;
- navigation classes;
- card/container classes;
- body background;
- typography declarations;
- common border-radius values;
- common box-shadow values.

Detection priority:

1. CSS variables in `:root`.
2. Existing design-system variables.
3. Navbar and button classes.
4. Repeated colors in CSS files.
5. Body and section styles.
6. Fallback scientific theme.

---

### 3. Create module files

Accessibility rules are externalized in:

```text
skills/contracts/accessibility_strategy.md
```

The assistant must read that strategy before generating or modifying semantic HTML, ARIA attributes, keyboard behaviour, focus styles or accessible status messages.

Responsive design rules are externalized in:

```text
skills/contracts/responsive_design_strategy.md
```

The assistant must read that strategy before generating or modifying mobile, tablet or narrow-viewport layout behaviour.

External link security rules are externalized in:

```text
skills/contracts/external_links_security_strategy.md
```

The assistant must read that strategy before generating or modifying source, DOI, PDF, publisher or other external link behaviour.

Module versioning rules are externalized in:

```text
skills/contracts/module_versioning_strategy.md
```

The assistant must read that strategy before generating, updating, validating or migrating RefSciLink module and schema version metadata.

Create all required module files under:

```text
data/reference_bibliographique/
```

The module must include:

- bibliography index page;
- detailed reference page;
- CSS adapted to host style;
- JavaScript to load `references.json`;
- `references.json`;
- `theme_refscilink.json`;
- Node.js tool for extracting references;
- JSON schema;
- AI prompt for later enrichment.

---

### 4. Add a localized References button

The normative contract for host navigation integration is externalized in:

```text
skills/contracts/navigation_integration_contract.md
```

The assistant must read that contract before adding, updating, skipping or reporting the localized References navigation entry.

---

### 5. Extract references from Markdown

The normative Markdown parsing strategy is externalized in:

```text
skills/contracts/markdown_parsing_strategy.md
```

The assistant must read that strategy before extracting references from Markdown or modifying the local Markdown extraction tool.

Bibliography section boundary rules are externalized in:

```text
skills/contracts/bibliography_boundary_strategy.md
```

The assistant must read that strategy before deciding where Markdown bibliography extraction starts, stops or falls back to identifier-based extraction.

Identifier extraction rules for DOI, PMID, PMCID and URLs are externalized in:

```text
skills/contracts/metadata_identifier_extraction_strategy.md
```

The assistant must read that strategy before normalizing identifiers or modifying identifier extraction code.

Reference numbering, stable IDs and rerun matching rules are externalized in:

```text
skills/contracts/reference_numbering_strategy.md
```

The assistant must read that strategy before generating `id`, assigning `number`, preserving existing references or modifying rerun behaviour.

Reference status lifecycle rules are externalized in:

```text
skills/contracts/reference_status_lifecycle_strategy.md
```

The assistant must read that strategy before generating, filtering, displaying or transitioning `validation_status`, `extraction_status`, `metadata_status` or `access_type`.

Logging and diagnostics rules are externalized in:

```text
skills/contracts/logging_diagnostics_strategy.md
```

The assistant must read that strategy before reporting installation actions, emitting local-tool diagnostics or writing `metadata.diagnostics`.

Dry-run mode rules are externalized in:

```text
skills/contracts/dry_run_mode_strategy.md
```

The assistant must read that strategy before simulating installation, extraction, backups or file writes without mutating the project.

Rollback mode rules are externalized in:

```text
skills/contracts/rollback_mode_strategy.md
```

The assistant must read that strategy before planning or executing any recovery, restore or cleanup after a failed RefSciLink operation.

Machine-verifiable success criteria are externalized in:

```text
skills/contracts/success_criteria_strategy.md
```

The assistant must read that strategy before declaring an installation, extraction or generated module update successful.

Post-install validation checklist rules are externalized in:

```text
skills/contracts/post_install_validation_checklist.md
```

The assistant must read that checklist before declaring a RefSciLink installation, extraction or generated module update complete.

Offline mode rules are externalized in:

```text
skills/contracts/offline_mode_strategy.md
```

The assistant must read that strategy before running, implementing or modifying behaviour when no internet connection is available.

No-external-API mode rules are externalized in:

```text
skills/contracts/no_external_api_mode_strategy.md
```

The assistant must read that strategy before running, implementing or modifying behaviour where network access may exist but scientific enrichment APIs must not be used.

Deferred enrichment rules are externalized in:

```text
skills/contracts/deferred_enrichment_strategy.md
```

The assistant must read that strategy before planning, reporting or performing delayed metadata enrichment after installation or extraction.

---

### 6. Scientific lookup and access classification

Only perform this step in Mode 3 or when explicitly requested.

If offline mode is active, skip scientific lookup, keep local extraction working and report:

```text
Offline mode active. Scientific metadata enrichment skipped.
```

Offline execution must follow:

```text
skills/contracts/offline_mode_strategy.md
```

If no-external-API mode is active, skip external scientific API lookup, keep local extraction working and report:

```text
No-external-API mode active. External scientific metadata lookup skipped.
```

No-external-API execution must follow:

```text
skills/contracts/no_external_api_mode_strategy.md
```

If enrichment is deferred, complete local installation and extraction first, preserve stable IDs and report:

```text
Deferred enrichment planned. Local installation and extraction completed without blocking.
```

Deferred enrichment must follow:

```text
skills/contracts/deferred_enrichment_strategy.md
```

Search appropriate sources:

- PubMed;
- CrossRef;
- Europe PMC;
- DOI.org;
- Semantic Scholar;
- HAL;
- bioRxiv;
- medRxiv;
- publisher pages;
- Unpaywall or equivalent open-access metadata.

Allowed `access_type` values:

```json
"open_access"
"abstract_only"
"accepted_author_version"
"preprint"
"paywalled"
"unknown"
```

If only the abstract is accessible, explicitly state that the full article is not open access.

---

### 7. Summary generation

Only generate summaries in Mode 3 or when explicitly requested.

Summaries must be written in the detected host website language.

Each reference supports:

```json
{
  "short_summary": "",
  "detailed_summary": "",
  "key_points": [],
  "project_relevance": "",
  "limitations": ""
}
```

Default validation:

```json
{
  "validated": false,
  "validation_status": "pending_validation",
  "validated_by": "",
  "validation_date": ""
}
```

---

## Required reference JSON schema

The normative contract for generated `data/reference_bibliographique/json/references.json` files is externalized in:

```text
skills/contracts/references_json_contract.md
```

The assistant must read that contract before generating, updating or validating `references.json`.

## Theme adaptation — mandatory visual integration

Use:

```text
Theme Mode = Auto + Override
```

The normative contract for generated `data/reference_bibliographique/json/theme_refscilink.json` files is externalized in:

```text
skills/contracts/theme_refscilink_json_contract.md
```

The assistant must read that contract before generating, updating or validating `theme_refscilink.json`.

Visual safety and CSS integration rules are defined in:

```text
skills/contracts/reference_css_contract.md
```

## Error handling

### No Markdown file found

Create the module in install-only mode and report:

```text
No Markdown file detected. Installation completed without extraction.
```

### No references found

Create `references.json` with an empty `references` array and report:

```text
No references detected. Verify the bibliography section heading.
```

### No `index.html` found

Create the module but skip button integration.

### Several `index.html` files found

Ask which one should be modified.

### Theme detection failed

Use fallback theme and report:

```text
Theme mode: Fallback
```

### Scientific lookup unavailable

Do not fail installation. Mark references:

```json
"access_type": "unknown",
"validation_status": "metadata_to_verify"
```

---

## Post-installation checks

After installation, verify:

- `data/reference_bibliographique/index_ref.html` exists;
- `data/reference_bibliographique/reference.html` exists;
- `data/reference_bibliographique/assets/css/reference.css` exists;
- `data/reference_bibliographique/assets/js/reference.js` exists;
- `data/reference_bibliographique/json/references.json` is valid JSON;
- `data/reference_bibliographique/json/theme_refscilink.json` is valid JSON;
- `refscilink.config.json` exists;
- the localized References button was added or a clear reason is reported;
- no duplicate References button was created;
- no original user file was overwritten without backup.

If the current project is `examples/basic-site`, compare results with:

```text
examples/basic-site/expected_output/expected_tree.md
examples/basic-site/expected_output/expected_result.md
```

For repository-level validation of the official fixture, run:

```text
npm run test:basic-site
```

The official test strategy is externalized in:

```text
skills/contracts/official_tests_strategy.md
```

The assistant must read that contract before modifying the official test workflow or declaring fixture validation complete.

---

## Final report template

At the end, report:

```text
RefSciLink module installed.

Execution mode: Install only / Install + Extract / Install + Extract + Enrichment
Created/modified files:
- ...

Analysed Markdown file: ...
Detected references: ...
Complete references: ...
References requiring review: ...

Display mode: dedicated page / side panel / both
References button: added / already present / not added

Detected language: ...
Generated interface language: ...

Theme mode: Auto + Override / Manual / Fallback
Theme file: data/reference_bibliographique/json/theme_refscilink.json
Detected primary color: ...
Detected font: ...
Detected border radius: ...

Backups created: yes / no
Config: refscilink.config.json

Post-installation checks: passed / partial / failed
Recommended next step: open data/reference_bibliographique/index_ref.html
```

---

## Minimal command behavior

When the user types:

```text
/create_module_ref
```

or:

```text
/creat_modul_ref
```

execute this skill.

---

## Development note

This skill belongs to RefSciLink and should remain focused on the bibliography module until the module is tested and stabilized.
