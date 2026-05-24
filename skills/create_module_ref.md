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

Visual styling belongs in `assets/css/reference.css`, and dynamic behaviour belongs in `assets/js/reference.js`.

### File-level requirements

`index_ref.html` must:

- use `<!DOCTYPE html>`;
- set `<html lang="{{detected_language}}">`;
- include UTF-8 charset;
- include a responsive viewport meta tag;
- link CSS using `./assets/css/reference.css`;
- load JavaScript using `./assets/js/reference.js`;
- avoid external framework dependencies;
- remain compatible with static hosting and GitHub Pages;
- include meaningful comments explaining each major section.

### No inline styling policy

Inline CSS is prohibited unless technically required and explicitly justified in a code comment.

All visual design must be implemented in:

```text
assets/css/reference.css
```

### Code documentation policy

Generated HTML must be commented in a useful and maintainable way. Comments should explain page sections, extension points, JavaScript hooks, accessibility states and fallback areas.

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

The page must include:

- `header.refscilink-header`;
- `section.refscilink-controls`;
- `section.refscilink-summary`;
- `section.refscilink-state-area`;
- `section.refscilink-list` with `id="refscilink-reference-list"`;
- `template#refscilink-reference-template`.

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

### External link security

External links generated inside the reference list must use:

```html
target="_blank" rel="noopener noreferrer"
```

### Visual integration rule

The HTML must not impose a fixed artistic style. It must provide structure and hooks only.

---

## HTML contract — `reference.html`

`reference.html` is the detailed reference page. It must display one selected bibliographic reference and its summary, metadata, access status and validation controls.

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
- link CSS using `./assets/css/reference.css`;
- load JavaScript using `./assets/js/reference.js`;
- avoid external framework dependencies;
- remain compatible with static hosting and GitHub Pages;
- include meaningful comments explaining each major section.

### No inline styling policy

Inline CSS is prohibited unless technically required and explicitly justified in a code comment.

All visual design must be implemented in:

```text
assets/css/reference.css
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

The page must use semantic HTML, preserve keyboard navigation, use `aria-live="polite"` for loading and non-critical states, and use `role="alert"` for errors.

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

The HTML must not impose a fixed artistic style. It must provide structure and hooks only.

---

## JavaScript contract — `assets/js/reference.js`

`reference.js` is the functional engine of the RefSciLink browser module. It must power both `index_ref.html` and `reference.html` without inline JavaScript.

The script must load data, detect the current page, render references, apply filters, render detail pages, manage validation state, handle localization and report errors safely.

### No inline JavaScript policy

Inline JavaScript is prohibited.

Forbidden patterns:

```html
<button onclick="validateReference()">...</button>
<script>
  // Inline module logic is not allowed.
</script>
```

Required pattern:

```html
<script src="./assets/js/reference.js"></script>
```

HTML must expose stable `data-refscilink-*` hooks, and `reference.js` must attach behaviour using `addEventListener()`.

### File header requirement

`reference.js` must start with a meaningful header comment:

```js
/**
 * RefSciLink
 * File: reference.js
 * Purpose:
 * Load references, render bibliography lists, render detail pages,
 * manage filters, localization and validation state.
 *
 * Generated by RefSciLink Skill.
 */
```

### Required file organization

The file must be structured into documented sections:

```js
// ==========================================================
// Constants and configuration
// ==========================================================

// ==========================================================
// State management
// ==========================================================

// ==========================================================
// Data loading
// ==========================================================

// ==========================================================
// Localization
// ==========================================================

// ==========================================================
// Rendering: index page
// ==========================================================

// ==========================================================
// Rendering: detail page
// ==========================================================

// ==========================================================
// Filters and search
// ==========================================================

// ==========================================================
// Validation state
// ==========================================================

// ==========================================================
// Utilities
// ==========================================================

// ==========================================================
// Bootstrapping
// ==========================================================
```

### Required functions

`reference.js` must implement or clearly provide equivalent functions:

```js
initRefSciLink()
loadReferences()
loadTheme()
detectCurrentPage()
detectLanguage()
getLocalizedLabels()
renderIndexPage()
renderDetailPage()
renderReferenceCard()
applyFilters()
bindIndexEvents()
bindDetailEvents()
getReferenceIdFromUrl()
findReferenceById()
copyReferenceToClipboard()
validateReference()
loadValidationState()
saveValidationState()
setPageState()
showError()
sanitizeText()
createExternalLink()
```

Equivalent names are allowed only if the final code remains clear, documented and functionally complete.

### Data loading requirements

The script must load JSON using relative paths compatible with static hosting:

```text
./json/references.json
./json/theme_refscilink.json
```

It must support the recommended `references.json` root structure:

```json
{
  "metadata": {},
  "references": []
}
```

It may support legacy arrays for backward compatibility, but the metadata object + `references` array is the preferred format.

### Rendering rules

The script must:

- use `data-refscilink-*` hooks to find DOM targets;
- not depend on CSS classes for core logic;
- prefer `textContent` for user-controlled or bibliographic content;
- avoid `innerHTML` unless the content is fully controlled, sanitized and justified in a comment;
- create real `<button>` elements for actions;
- create real `<a>` elements for navigation and external links;
- set external links with `target="_blank"` and `rel="noopener noreferrer"`;
- avoid injecting visual style rules.

### `innerHTML` policy

`innerHTML` is prohibited by default.

Allowed only when:

- rendering a fully controlled internal template;
- content is explicitly sanitized;
- a code comment explains why `textContent` is insufficient.

Default rule:

```js
element.textContent = value;
```

### Localization requirements

The script must include a minimal localization dictionary or load equivalent labels from configuration.

Minimum built-in dictionary:

```js
const REFSCILINK_I18N = {
  fr: {
    references: "Références",
    searchPlaceholder: "Rechercher une référence",
    readSummary: "Lire le résumé",
    viewSource: "Voir la source",
    copyReference: "Copier la référence",
    validateSummary: "Valider le résumé",
    noReferences: "Aucune référence trouvée",
    referenceNotFound: "Référence introuvable"
  },
  en: {
    references: "References",
    searchPlaceholder: "Search references",
    readSummary: "Read summary",
    viewSource: "View source",
    copyReference: "Copy reference",
    validateSummary: "Validate summary",
    noReferences: "No references found",
    referenceNotFound: "Reference not found"
  }
};
```

Visible UI text must use the detected host language. Internal JSON keys remain English.

### Page state management

For `index_ref.html`, the script must support:

- `loading`;
- `ready`;
- `empty`;
- `error`.

For `reference.html`, the script must support:

- `loading`;
- `ready`;
- `not_found`;
- `error`.

`setPageState()` or an equivalent function must control `hidden`, ARIA attributes or namespaced state classes.

### Filtering and search requirements

On `index_ref.html`, the script must support:

- text search across title, authors, journal, year and raw reference;
- theme filtering;
- validation-status filtering;
- access-type filtering;
- result count updates;
- empty state when filters return no result.

### Detail page requirements

On `reference.html`, the script must:

- read the canonical `id` query parameter;
- optionally accept `ref` as a backward-compatible alias;
- find the matching reference in `references.json`;
- render metadata, summaries, key points, project relevance and limitations;
- show a localized not-found state if the reference does not exist;
- update the document title when the reference is found.

### Validation state requirements

In static mode, validation may be stored in `localStorage`.

Recommended localStorage key:

```js
const REFSCILINK_VALIDATION_STORAGE_KEY = "refscilink.validation.v1";
```

Recommended stored structure:

```json
{
  "ref001": {
    "validated": true,
    "validation_status": "validated",
    "validated_at": "ISO-8601 timestamp"
  }
}
```

The script must gracefully handle unavailable or blocked `localStorage`.

Persistent JSON validation is not required in the browser-only module and should be handled later by a Node.js or backend tool.

### Error handling requirements

The script must handle:

- missing `references.json`;
- invalid JSON;
- empty references;
- missing `theme_refscilink.json`;
- missing DOM targets;
- unknown page type;
- missing reference ID;
- reference ID not found;
- unavailable Clipboard API;
- unavailable or blocked `localStorage`.

Errors must be reported through user-facing localized error states and developer-friendly `console.warn()` / `console.error()` messages.

### Accessibility requirements

The script must:

- update `aria-live` regions for count, loading, empty and error states;
- preserve keyboard navigation;
- attach events to real buttons and links;
- avoid creating clickable non-semantic elements;
- preserve focus behaviour where possible;
- not remove labels required by the HTML contract.

### Separation of responsibilities

`reference.js` must not:

- define inline styles;
- inject `<style>` blocks;
- modify global host CSS;
- import or depend on Bootstrap, Tailwind, React, Vue or Angular;
- modify the host website `index.html` after installation;
- override global browser objects;
- execute scientific enrichment calls unless explicitly configured.

`reference.js` may:

- add or remove `hidden`;
- add or remove namespaced `refscilink-*` state classes;
- populate text and attributes;
- create semantic DOM nodes inside RefSciLink containers;
- read local JSON files;
- store temporary validation in localStorage.

### Bootstrapping requirement

The script must initialize after DOM readiness:

```js
document.addEventListener("DOMContentLoaded", initRefSciLink);
```

It must not assume that DOM nodes exist before the document is ready.

---

## CSS contract — `assets/css/reference.css`

`reference.css` is the visual integration layer of the RefSciLink module. It must style the bibliography index page, the reference detail page and any optional RefSciLink navigation button without polluting or replacing the host website design system.

The CSS contract has two simultaneous goals:

1. guarantee a consistent and usable RefSciLink interface across AI coding assistants;
2. preserve and adapt to the host website visual identity, artistic direction and design constraints.

The host website visual identity always has priority over RefSciLink fallback styling.

### File-level requirements

`reference.css` must:

- be located at `data/reference_bibliographique/assets/css/reference.css`;
- contain only CSS, without embedded JavaScript or external framework imports;
- start with a meaningful header comment explaining the file purpose, generated origin and customization points;
- use readable section comments for maintainability;
- use only namespaced RefSciLink selectors for module styling;
- avoid changing the host website outside RefSciLink containers;
- remain compatible with static hosting and GitHub Pages.

Required header example:

```css
/**
 * RefSciLink
 * File: reference.css
 * Purpose:
 * Style the bibliography module while preserving the host website design system.
 *
 * Generated by RefSciLink Skill.
 * Customize theme values through CSS variables or theme_refscilink.json-derived values.
 */
```

### Namespacing and isolation rules

All module selectors must be scoped to `refscilink-` classes or to attributes inside a RefSciLink root container.

Allowed selector patterns:

```css
.refscilink-page { }
.refscilink-header { }
.refscilink-reference-card { }
.refscilink-page [data-refscilink-search] { }
.refscilink-actions .refscilink-validate-button { }
```

Forbidden selector patterns unless explicitly justified in a comment:

```css
body { }
html { }
* { }
a { }
button { }
.card { }
.btn { }
.container { }
.nav { }
```

The CSS must not redefine global host classes such as `.btn`, `.button`, `.card`, `.container`, `.row`, `.nav`, `.navbar`, `.header`, `.footer`, `.content` or similar common names.

If a global-looking selector is unavoidable, it must be narrowly scoped under `.refscilink-page` or another RefSciLink root class.

### Theme adaptation variables

`reference.css` must define a small set of RefSciLink CSS custom properties on `.refscilink-page`, not globally on `:root` by default.

These variables should be populated from host design detection and/or `theme_refscilink.json` when the module is generated.

Minimum variable set:

```css
.refscilink-page {
  --refscilink-color-primary: #007B83;
  --refscilink-color-secondary: #00A6B2;
  --refscilink-color-background: #f7fafb;
  --refscilink-color-surface: #ffffff;
  --refscilink-color-text: #102027;
  --refscilink-color-muted: #607d8b;
  --refscilink-color-border: #d8e3e7;
  --refscilink-color-error: #b00020;
  --refscilink-color-success: #176b3a;
  --refscilink-font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --refscilink-radius: 12px;
  --refscilink-radius-card: 18px;
  --refscilink-radius-button: 999px;
  --refscilink-shadow-card: 0 12px 30px rgba(0, 0, 0, 0.08);
  --refscilink-spacing-xs: 0.35rem;
  --refscilink-spacing-sm: 0.65rem;
  --refscilink-spacing-md: 1rem;
  --refscilink-spacing-lg: 1.5rem;
  --refscilink-spacing-xl: 2.25rem;
}
```

If the host site already defines relevant CSS variables, the generated CSS may map RefSciLink variables to them:

```css
.refscilink-page {
  --refscilink-color-primary: var(--primary-color, #007B83);
  --refscilink-font-family: var(--font-body, system-ui, sans-serif);
}
```

Do not define RefSciLink variables globally in `:root` unless the user explicitly requests project-wide variables or the generated comment explains why the host architecture requires it.

### Required file organization

The CSS file must be organized into documented sections or equivalent readable blocks:

```css
/* ==========================================================
   RefSciLink theme variables
   ========================================================== */

/* ==========================================================
   Base module layout
   ========================================================== */

/* ==========================================================
   Header and navigation
   ========================================================== */

/* ==========================================================
   Search and filter controls
   ========================================================== */

/* ==========================================================
   Reference cards
   ========================================================== */

/* ==========================================================
   Detail page
   ========================================================== */

/* ==========================================================
   Badges, statuses and metadata
   ========================================================== */

/* ==========================================================
   Buttons and links
   ========================================================== */

/* ==========================================================
   Loading, empty, not-found and error states
   ========================================================== */

/* ==========================================================
   Accessibility and focus states
   ========================================================== */

/* ==========================================================
   Responsive layout
   ========================================================== */
```

### Mandatory class coverage

`reference.css` must provide styling for, at minimum, the following classes when they are generated:

```text
.refscilink-page
.refscilink-header
.refscilink-title
.refscilink-subtitle
.refscilink-back-link
.refscilink-controls
.refscilink-control-group
.refscilink-label
.refscilink-input
.refscilink-select
.refscilink-summary
.refscilink-count
.refscilink-state-area
.refscilink-loading
.refscilink-empty
.refscilink-not-found
.refscilink-error
.refscilink-list
.refscilink-reference-card
.refscilink-reference-title
.refscilink-reference-meta
.refscilink-reference-actions
.refscilink-detail
.refscilink-metadata
.refscilink-metadata-list
.refscilink-summary-section
.refscilink-actions
.refscilink-button
.refscilink-source-link
.refscilink-copy-button
.refscilink-validate-button
.refscilink-badge
.refscilink-badge-access
.refscilink-badge-validation
.refscilink-badge-theme
```

Equivalent class names are allowed only if they remain namespaced and are documented in the generated HTML and JavaScript.

### Host design adaptation rules

When generating `reference.css`, the assistant must inspect the host website and adapt these visual properties when possible:

- font family;
- base font size and line height;
- primary and secondary colors;
- background and surface colors;
- text and muted text colors;
- border colors;
- button shape and radius;
- card radius;
- shadow style;
- spacing density;
- navigation button style;
- dark or light mode tendency.

The generated CSS should feel like an extension of the host website. It must not impose a fixed RefSciLink aesthetic if the host site has a clear artistic direction.

If the host has a minimal, editorial, institutional, playful, dark, high-contrast, scientific, medical, educational or portfolio style, RefSciLink must adapt the density, radius, color balance and typography accordingly.

### Fallback visual style

If no host visual identity can be detected, use a restrained scientific fallback style:

- readable sans-serif system font;
- neutral background;
- white or near-white cards;
- one primary accent color;
- visible borders;
- moderate border radius;
- subtle shadows;
- comfortable spacing;
- no decorative overload.

The fallback style must remain easy to override through CSS variables.

### Layout requirements

The CSS must support:

- a centered readable page layout;
- a responsive filter area;
- reference cards displayed in a readable single-column layout by default;
- optional grid layout only when the host design and content density justify it;
- detail page sections with clear hierarchy;
- long titles, long author lists and long URLs without overflow;
- mobile screens down to approximately 320px width.

The module must avoid horizontal scrolling on standard mobile widths.

### Control styling requirements

Search inputs and filters must:

- use visible labels or remain compatible with accessible labels from HTML;
- have sufficient padding for touch interaction;
- show visible focus states;
- inherit or adapt typography from the host design;
- avoid browser-inconsistent extremely small controls.

Buttons and links must:

- preserve semantic difference between navigation links and actions;
- show hover and focus states;
- use host-like radius and color when detected;
- not rely only on color to indicate state;
- remain legible on both light and dark surfaces.

### Badge and status requirements

Badges for access type, validation status and theme must:

- use `.refscilink-badge` plus a modifier or specific class;
- remain readable at small sizes;
- avoid color-only meaning when possible;
- support at least these semantic groups:
  - access type;
  - validation status;
  - theme or category.

Recommended status classes:

```text
.refscilink-status-validated
.refscilink-status-pending-validation
.refscilink-status-metadata-to-verify
.refscilink-access-open-access
.refscilink-access-abstract-only
.refscilink-access-accepted-author-version
.refscilink-access-preprint
.refscilink-access-paywalled
.refscilink-access-unknown
```

### State styling requirements

The CSS must provide clear styles for:

- loading state;
- empty state;
- not-found state;
- error state;
- validated state;
- pending validation state;
- metadata-to-verify state.

State classes must be namespaced, for example:

```text
.refscilink-is-loading
.refscilink-is-ready
.refscilink-is-empty
.refscilink-has-error
.refscilink-is-not-found
```

The JavaScript may toggle these classes, but CSS must not depend on global state classes outside the RefSciLink module.

### Accessibility requirements

The CSS must:

- provide visible `:focus-visible` styles for links, buttons, inputs and selects inside the module;
- preserve browser focus outlines unless replacing them with an equally visible alternative;
- maintain sufficient color contrast for text, buttons, badges and states;
- not hide focusable elements with `display: none` unless the HTML `hidden` attribute or JavaScript state explicitly requires it;
- avoid motion-heavy transitions by default;
- respect reduced-motion preferences.

Required reduced-motion rule:

```css
@media (prefers-reduced-motion: reduce) {
  .refscilink-page *,
  .refscilink-page *::before,
  .refscilink-page *::after {
    scroll-behavior: auto;
    transition-duration: 0.01ms;
    animation-duration: 0.01ms;
    animation-iteration-count: 1;
  }
}
```

### Responsive requirements

The CSS must include at least one mobile breakpoint. Recommended baseline:

```css
@media (max-width: 640px) {
  .refscilink-page {
    padding: var(--refscilink-spacing-md);
  }

  .refscilink-controls,
  .refscilink-reference-actions,
  .refscilink-actions {
    display: grid;
    grid-template-columns: 1fr;
  }
}
```

Responsive rules must remain scoped to RefSciLink classes.

### Side-panel compatibility

If the selected display mode includes a side panel, the CSS must also define a namespaced side-panel layer, for example:

```text
.refscilink-panel
.refscilink-panel-overlay
.refscilink-panel-content
.refscilink-panel-close
.refscilink-panel-is-open
```

The side panel must:

- not block the host site permanently;
- provide a visible close button;
- remain keyboard accessible;
- avoid global scroll locking unless explicitly justified;
- use namespaced classes for open and closed states.

### Dark mode and high-contrast compatibility

If the host site appears to use dark mode, generated variables must adapt instead of forcing a light theme.

If no host dark mode is detected, the CSS may include an optional scoped dark-mode block only if it does not override the host site globally.

Allowed:

```css
.refscilink-page.refscilink-theme-dark { }
```

Avoid global dark-mode overrides such as:

```css
@media (prefers-color-scheme: dark) {
  body { }
}
```

unless scoped to `.refscilink-page`.

### Comments and maintainability

Generated CSS comments must explain:

- theme variable purpose;
- which values were adapted from the host site;
- which values are fallback defaults;
- how developers can override visual identity safely;
- how state classes relate to JavaScript behaviour.

Avoid meaningless comments that simply repeat selector names.

### CSS must not perform JavaScript responsibilities

`reference.css` must not:

- hide or show references based on filtering logic;
- encode search behaviour;
- rely on unchecked global DOM structure;
- import scripts or external frameworks;
- use CSS hacks that prevent JavaScript state management.

CSS may style classes and attributes produced by JavaScript, but filtering, validation and detail rendering remain JavaScript responsibilities.

### Minimal CSS success criteria

A generated `reference.css` is acceptable only if:

- all selectors are namespaced or safely scoped;
- no global host classes are overwritten;
- the bibliography index is readable on desktop and mobile;
- the detail page is readable on desktop and mobile;
- focus states are visible;
- action buttons and links are visually identifiable;
- loading, empty, error and not-found states are styled;
- badges for access, validation and theme are styled;
- long bibliographic content does not break the layout;
- host visual identity is adapted when detectable;
- fallback variables exist when detection fails.

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
