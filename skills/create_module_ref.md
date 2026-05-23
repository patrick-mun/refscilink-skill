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
- Comment generated code meaningfully so that developers can maintain it.

---

## Execution modes

The assistant must separate the workflow into three levels.

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

Scientific enrichment must not block the installation.

If web access or API access is unavailable, generate the module and mark references as requiring enrichment.

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

### Language behaviour examples

If the host page contains:

```html
<html lang="fr">
```

then generated labels may include:

```text
Références
Lire le résumé
Voir la source
Copier la référence
Valider le résumé
```

If the host page contains:

```html
<html lang="en">
```

then generated labels may include:

```text
References
Read summary
View source
Copy reference
Validate summary
```

### Important rule

The internal JSON keys must remain English and stable, regardless of the generated interface language.

Only field values and visible UI text may be localized.

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

## Generated files contract

The following files are mandatory unless the installation mode explicitly reports why a file could not be created.

| File | Type | Required role |
|---|---|---|
| `index_ref.html` | HTML | Bibliography list page |
| `reference.html` | HTML | Detailed reference page |
| `assets/css/reference.css` | CSS | Namespaced RefSciLink styles |
| `assets/js/reference.js` | JavaScript | Reference loading, rendering, filtering and validation UI |
| `json/references.json` | JSON | Structured bibliography data |
| `json/theme_refscilink.json` | JSON | Detected and editable visual theme |
| `tools/build_references.mjs` | Node.js ES Module | Local bibliography extraction helper |
| `tools/prompt_recherche_ia.md` | Markdown | AI enrichment prompt |
| `tools/schema_references.json` | JSON Schema | Reference data schema |
| `refscilink.config.json` | JSON | Persistent project-level configuration |

### Creation and update rules

- Create missing files.
- Update existing generated files only after backup.
- Never delete user files automatically.
- Never overwrite `references.json`, `theme_refscilink.json`, `index.html`, `reference.css` or `reference.js` without backup.
- Use relative paths compatible with static hosting and GitHub Pages.

### Minimal metadata

Generated JSON files should include metadata when possible:

```json
{
  "generated_by": "RefSciLink Skill",
  "version": "0.2.0-dev",
  "generated_at": "ISO-8601 timestamp"
}
```

### Visual adaptation priority

The generated file contract must never prevent adaptation to the user's visual identity.

Visual priority order:

1. Host website visual identity.
2. `theme_refscilink.json` overrides.
3. Automatic theme detection.
4. RefSciLink fallback theme.

---

## HTML contract — `index_ref.html`

`index_ref.html` is the bibliography index page. It must provide a stable, accessible and JavaScript-addressable structure for listing references, filtering them and opening summaries.

This contract defines the required structure of the generated HTML file. Visual styling belongs in `assets/css/reference.css`, and dynamic behaviour belongs in `assets/js/reference.js`.

### File-level requirements

`index_ref.html` must:

- use `<!DOCTYPE html>`;
- set `<html lang="{{detected_language}}">`;
- include UTF-8 charset;
- include a responsive viewport meta tag;
- link CSS using a relative path: `./assets/css/reference.css`;
- load JavaScript using a relative path: `./assets/js/reference.js`;
- avoid external framework dependencies;
- remain compatible with static hosting and GitHub Pages;
- include meaningful comments explaining each major section.

### No inline styling policy

Inline CSS is prohibited unless technically required and explicitly justified in a code comment.

Allowed only when unavoidable:

- runtime values computed by JavaScript;
- accessibility fallbacks;
- temporary state attributes required by the browser.

Not allowed inline:

- colors;
- typography;
- spacing;
- borders;
- shadows;
- layout rules;
- visual component styles.

All visual design must be implemented in:

```text
assets/css/reference.css
```

### Code documentation policy

Generated HTML must be commented in a useful and maintainable way.

Comments should explain:

- page sections;
- extension points;
- JavaScript hooks;
- accessibility states;
- fallback areas.

Avoid meaningless comments that simply repeat tag names.

### Minimal HTML skeleton

The generated page must follow this skeleton or an equivalent semantic structure:

```html
<!DOCTYPE html>
<html lang="{{detected_language}}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{localized_references_title}}</title>
  <link rel="stylesheet" href="./assets/css/reference.css" />
</head>
<body>
  <!-- RefSciLink bibliography page. -->
  <main class="refscilink-page" data-refscilink-page="index">
    <!-- Page header and navigation back to the host website. -->
    <header class="refscilink-header">
      <a class="refscilink-back-link" href="../../index.html" data-refscilink-back-link>{{localized_back_label}}</a>
      <h1 class="refscilink-title" data-refscilink-title>{{localized_references_title}}</h1>
      <p class="refscilink-subtitle" data-refscilink-subtitle>{{localized_references_subtitle}}</p>
    </header>

    <!-- Search and filters. -->
    <section class="refscilink-controls" aria-label="{{localized_filter_area_label}}"></section>

    <!-- Dynamic summary counters. -->
    <section class="refscilink-summary" aria-live="polite">
      <p class="refscilink-count" data-refscilink-count></p>
    </section>

    <!-- Loading, empty and error states. -->
    <section class="refscilink-state-area" aria-live="polite">
      <p class="refscilink-loading" data-refscilink-loading>{{localized_loading_label}}</p>
      <p class="refscilink-empty" data-refscilink-empty hidden>{{localized_empty_label}}</p>
      <p class="refscilink-error" data-refscilink-error role="alert" hidden></p>
    </section>

    <!-- Reference list container populated by JavaScript. -->
    <section class="refscilink-list" id="refscilink-reference-list" data-refscilink-list></section>

    <!-- Template used by JavaScript to render each reference card. -->
    <template id="refscilink-reference-template">
      <article class="refscilink-reference-card" data-refscilink-reference-card>
        <!-- Card content is populated by reference.js. -->
      </article>
    </template>
  </main>

  <script src="./assets/js/reference.js"></script>
</body>
</html>
```

### Mandatory semantic sections

The page must include these semantic areas:

- `header.refscilink-header` for the localized title and back navigation;
- `section.refscilink-controls` for search and filters;
- `section.refscilink-summary` for counters and live status;
- `section.refscilink-state-area` for loading, empty and error states;
- `section.refscilink-list` with `id="refscilink-reference-list"` for rendered references;
- `template#refscilink-reference-template` for reference cards.

### Mandatory JavaScript hooks

The following data attributes must be present when relevant:

```text
data-refscilink-page
data-refscilink-search
data-refscilink-theme-filter
data-refscilink-validation-filter
data-refscilink-access-filter
data-refscilink-list
data-refscilink-count
data-refscilink-loading
data-refscilink-empty
data-refscilink-error
data-refscilink-reference-card
```

Data attributes are stable JavaScript hooks. CSS classes may evolve for design reasons, but these hooks should remain stable.

### Mandatory controls

`index_ref.html` must include or provide containers for:

- a search input;
- a theme filter;
- a validation-status filter;
- an access-type filter;
- a reference counter;
- a back link to the host site;
- a source link when available.

Each form control must have a real `<label>` or an accessible label.

### Reference card content

Each rendered reference card must support displaying:

- reference number;
- title;
- authors;
- year;
- journal;
- theme;
- access type;
- validation status;
- DOI, PMID and PMCID when available;
- `Read summary` / localized equivalent;
- `View source` / localized equivalent;
- `Copy reference` / localized equivalent;
- `Validate summary` / localized equivalent.

### Accessibility requirements

The page must:

- use semantic HTML whenever possible;
- use real `<button>` elements for actions;
- use `<a>` elements for navigation and external links;
- provide labels for all filters;
- use `aria-live="polite"` for dynamic counters and non-critical states;
- use `role="alert"` for errors;
- avoid clickable non-semantic `<div>` or `<span>` elements;
- remain keyboard navigable.

### Localization requirements

Visible text must follow the detected host language.

Examples for French:

```text
Références
Rechercher une référence
Lire le résumé
Aucune référence trouvée
```

Examples for English:

```text
References
Search references
Read summary
No references found
```

Internal JSON keys and JavaScript hook names remain English.

### Page states

The HTML must support these states:

- `loading`;
- `ready`;
- `empty`;
- `error`.

State visibility may be controlled by `reference.js` using `hidden`, ARIA attributes or CSS classes.

### External link security

External links generated inside the reference list must use:

```html
target="_blank" rel="noopener noreferrer"
```

### Visual integration rule

The HTML must not impose a fixed artistic style.

It must provide structure and hooks only. The visual identity must come from:

1. the host website visual identity;
2. `theme_refscilink.json`;
3. automatic theme detection;
4. fallback RefSciLink CSS variables.

---

## HTML contract — `reference.html`

`reference.html` is the detailed reference page. It must display one selected bibliographic reference and its summary, metadata, access status and validation controls.

This page is opened from `index_ref.html` and should use a query parameter to identify the selected reference.

Standard URL format:

```text
reference.html?id=ref001
```

The alias `reference.html?ref=ref001` may be accepted by JavaScript for backward compatibility, but `id` is the canonical query parameter.

Visual styling belongs in `assets/css/reference.css`, and dynamic behaviour belongs in `assets/js/reference.js`.

### File-level requirements

`reference.html` must:

- use `<!DOCTYPE html>`;
- set `<html lang="{{detected_language}}">`;
- include UTF-8 charset;
- include a responsive viewport meta tag;
- link CSS using a relative path: `./assets/css/reference.css`;
- load JavaScript using a relative path: `./assets/js/reference.js`;
- avoid external framework dependencies;
- remain compatible with static hosting and GitHub Pages;
- include meaningful comments explaining each major section.

### No inline styling policy

Inline CSS is prohibited unless technically required and explicitly justified in a code comment.

Not allowed inline:

- colors;
- typography;
- spacing;
- borders;
- shadows;
- layout rules;
- visual component styles.

All visual design must be implemented in:

```text
assets/css/reference.css
```

### Code documentation policy

Generated HTML must be commented in a useful and maintainable way.

Comments should explain:

- reference detail sections;
- metadata zones;
- JavaScript hooks;
- summary sections;
- validation controls;
- loading, not-found and error fallbacks.

Required examples:

```html
<!-- Reference metadata section populated by reference.js. -->
```

```html
<!-- Validation controls for human review of AI-generated summaries. -->
```

### Minimal HTML skeleton

The generated page must follow this skeleton or an equivalent semantic structure:

```html
<!DOCTYPE html>
<html lang="{{detected_language}}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{reference_title}} — {{localized_references_title}}</title>
  <link rel="stylesheet" href="./assets/css/reference.css" />
</head>
<body>
  <!-- RefSciLink reference detail page. -->
  <main class="refscilink-page" data-refscilink-page="detail">
    <!-- Page header and navigation back to the bibliography list. -->
    <header class="refscilink-header">
      <a class="refscilink-back-link" href="./index_ref.html" data-refscilink-back-to-list>{{localized_back_to_references_label}}</a>
      <h1 class="refscilink-title" data-refscilink-detail-title>{{localized_loading_reference_label}}</h1>
    </header>

    <!-- Loading, not-found and error states. -->
    <section class="refscilink-state-area" aria-live="polite">
      <p class="refscilink-loading" data-refscilink-loading>{{localized_loading_label}}</p>
      <p class="refscilink-not-found" data-refscilink-not-found hidden>{{localized_reference_not_found_label}}</p>
      <p class="refscilink-error" data-refscilink-error role="alert" hidden></p>
    </section>

    <!-- Detailed reference content populated by JavaScript. -->
    <article class="refscilink-detail" data-refscilink-detail hidden>
      <!-- Metadata section populated by reference.js. -->
      <section class="refscilink-metadata" aria-labelledby="refscilink-metadata-title">
        <h2 id="refscilink-metadata-title">{{localized_metadata_title}}</h2>
        <dl class="refscilink-metadata-list" data-refscilink-metadata></dl>
      </section>

      <!-- Summary sections generated from references.json. -->
      <section class="refscilink-summary-section" aria-labelledby="refscilink-summary-title">
        <h2 id="refscilink-summary-title">{{localized_summary_title}}</h2>
        <section data-refscilink-short-summary></section>
        <section data-refscilink-detailed-summary></section>
        <section data-refscilink-key-points></section>
        <section data-refscilink-project-relevance></section>
        <section data-refscilink-limitations></section>
      </section>

      <!-- Action links and validation controls. -->
      <section class="refscilink-actions" aria-label="{{localized_actions_label}}">
        <a class="refscilink-source-link" href="#" data-refscilink-source-link target="_blank" rel="noopener noreferrer">{{localized_view_source_label}}</a>
        <button type="button" class="refscilink-copy-button" data-refscilink-copy-reference>{{localized_copy_reference_label}}</button>
        <button type="button" class="refscilink-validate-button" data-refscilink-validate>{{localized_validate_summary_label}}</button>
      </section>
    </article>
  </main>

  <script src="./assets/js/reference.js"></script>
</body>
</html>
```

### Mandatory semantic sections

The page must include these semantic areas:

- `header.refscilink-header` for back navigation and the reference title;
- `section.refscilink-state-area` for loading, not-found and error states;
- `article.refscilink-detail` for the detailed reference content;
- `section.refscilink-metadata` for DOI, PMID, PMCID, journal, year, authors and access status;
- `section.refscilink-summary-section` for summaries and interpretation fields;
- `section.refscilink-actions` for source, copy and validation controls.

### Mandatory JavaScript hooks

The following data attributes must be present when relevant:

```text
data-refscilink-page="detail"
data-refscilink-back-to-list
data-refscilink-detail
data-refscilink-detail-title
data-refscilink-metadata
data-refscilink-short-summary
data-refscilink-detailed-summary
data-refscilink-key-points
data-refscilink-project-relevance
data-refscilink-limitations
data-refscilink-source-link
data-refscilink-copy-reference
data-refscilink-validate
data-refscilink-loading
data-refscilink-not-found
data-refscilink-error
```

Data attributes are stable JavaScript hooks. CSS classes may evolve for design reasons, but these hooks should remain stable.

### Required displayed content

`reference.html` must support displaying:

- reference ID;
- reference number;
- title;
- authors;
- year;
- journal;
- DOI;
- PMID;
- PMCID;
- URL;
- PDF URL;
- access type;
- theme;
- validation status;
- short summary;
- detailed summary;
- key points;
- project relevance;
- limitations;
- raw reference when useful.

### Required actions

The page must support:

- back to bibliography list;
- view source;
- copy reference;
- validate summary.

Action controls must be real `<button>` or `<a>` elements.

### Accessibility requirements

The page must:

- use `<article>` for the reference content;
- use `<section>` elements with headings for logical groups;
- use real `<button>` elements for actions;
- use `<a>` elements for navigation and external links;
- use `aria-live="polite"` for loading and non-critical states;
- use `role="alert"` for errors;
- avoid clickable non-semantic `<div>` or `<span>` elements;
- remain keyboard navigable;
- maintain a coherent heading hierarchy.

### Localization requirements

Visible text must follow the detected host language.

Examples for French:

```text
Retour aux références
Résumé court
Résumé détaillé
Points clés
Intérêt pour le projet
Limites
Valider le résumé
Référence introuvable
```

Examples for English:

```text
Back to references
Short summary
Detailed summary
Key points
Project relevance
Limitations
Validate summary
Reference not found
```

Internal JSON keys and JavaScript hook names remain English.

### Page states

The HTML must support these states:

- `loading`;
- `ready`;
- `not_found`;
- `error`.

If `reference.html?id=...` does not match any reference in `references.json`, the page must show the localized not-found state instead of failing silently.

### External link security

External links generated or displayed on the detail page must use:

```html
target="_blank" rel="noopener noreferrer"
```

### Visual integration rule

The HTML must not impose a fixed artistic style.

It must provide structure and hooks only. The visual identity must come from:

1. the host website visual identity;
2. `theme_refscilink.json`;
3. automatic theme detection;
4. fallback RefSciLink CSS variables.

---

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

Recommended structure:

```json
{
  "source_markdown": "bibliographie.md",
  "output_dir": "data/reference_bibliographique",
  "display_mode": "page",
  "theme_mode": "auto_override",
  "language": "auto",
  "detected_language": "fr",
  "enrichment_mode": "extract_only",
  "created_by": "RefSciLink Skill",
  "version": "0.2.0-dev"
}
```

Use the config file on future executions instead of asking again, unless the user explicitly wants to change settings.

---

## Installation tasks

### 1. Inspect project structure

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

Default French label:

```text
Références
```

Default English label:

```text
References
```

Default link:

```html
<a href="data/reference_bibliographique/index_ref.html" class="refscilink-button">References</a>
```

Rules:

- use the detected host language for the visible label;
- prefer existing navigation style;
- preserve navigation order;
- do not duplicate the button;
- if no navigation is found, add a safe floating button;
- do not force a new visual style on the main site.

---

### 5. Extract references from Markdown

Search for sections titled like:

- `References`
- `Bibliography`
- `Sources`
- `Bibliographic references`
- `Literature cited`
- `Références`
- `Références bibliographiques`
- `Bibliographie`
- `Sources`

The Markdown file may contain unrelated content.

Extract when possible:

- title;
- authors;
- year;
- journal or publisher;
- DOI;
- PMID;
- PMCID;
- URL;
- raw reference string.

If a reference is incomplete, attempt correction first. If correction fails, mark it as requiring manual review.

---

### 6. Scientific lookup and access classification

Only perform this step in Mode 3 or when explicitly requested.

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

Internal JSON keys must be English and stable across languages.

Each reference in `references.json` must follow this structure:

```json
{
  "id": "ref001",
  "number": 1,
  "title": "",
  "authors": [],
  "year": "",
  "journal": "",
  "doi": "",
  "pmid": "",
  "pmcid": "",
  "url": "",
  "pdf_url": "",
  "access_type": "unknown",
  "theme": "unclassified",
  "raw_reference": "",
  "short_summary": "",
  "detailed_summary": "",
  "key_points": [],
  "project_relevance": "",
  "limitations": "",
  "validated": false,
  "validation_status": "pending_validation",
  "validated_by": "",
  "validation_date": "",
  "source_markdown": ""
}
```

Recommended root structure:

```json
{
  "metadata": {
    "generated_by": "RefSciLink Skill",
    "version": "0.2.0-dev",
    "generated_at": "ISO-8601 timestamp",
    "language": "fr",
    "source_markdown": "bibliographie.md"
  },
  "references": []
}
```

---

## Theme adaptation — mandatory visual integration

Use:

```text
Theme Mode = Auto + Override
```

Generate:

```text
data/reference_bibliographique/json/theme_refscilink.json
```

Required structure:

```json
{
  "metadata": {
    "generated_by": "RefSciLink Skill",
    "version": "0.2.0-dev",
    "generated_at": "ISO-8601 timestamp"
  },
  "theme_mode": "auto_override",
  "detected_from": [],
  "primary": "#007B83",
  "secondary": "#00A6B2",
  "background": "#f7fafb",
  "surface": "#ffffff",
  "text": "#102027",
  "muted": "#607d8b",
  "border": "#d8e3e7",
  "font_family": "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  "radius": "12px",
  "button_radius": "999px",
  "card_radius": "18px",
  "shadow": "0 12px 30px rgba(0,0,0,0.08)",
  "spacing_density": "normal",
  "notes": "Auto-detected values. Edit manually if needed."
}
```

Visual safety rules:

- prefix module classes with `refscilink-` or `ref-`;
- do not overwrite global `.button`, `.btn`, `.card`, `.container`, `.nav`;
- avoid global selectors except minimal `:root` variables;
- do not reset `body`, `html`, `*`, `a`, `button` globally;
- do not import external fonts without approval;
- do not add CSS frameworks.

---

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
