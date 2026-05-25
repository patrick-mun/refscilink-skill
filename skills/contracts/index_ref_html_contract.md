<!-- Normative RefSciLink contract. Implements SH-002. -->

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

The generated page must follow this skeleton or an equivalent semantic structure.

Replace `{{detected_language}}` with the detected BCP 47 language code (e.g. `fr`, `en`). Replace each `{{localized_*}}` placeholder with the matching translated string for the detected language. Keep every `data-refscilink-i18n` attribute as-is — it is read by `applyI18n()` at runtime.

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
      <a class="refscilink-back-link" href="../../index.html"
         data-refscilink-back-link
         data-refscilink-i18n="backToSite">{{localized_back_label}}</a>
      <h1 class="refscilink-title"
          data-refscilink-title
          data-refscilink-i18n="pageTitle">{{localized_references_title}}</h1>
      <p class="refscilink-subtitle" data-refscilink-subtitle></p>
    </header>

    <!-- Search and filters expose stable data hooks for the JavaScript engine. -->
    <section class="refscilink-controls"
             data-refscilink-i18n-aria="filtersLabel"
             aria-label="{{localized_filter_area_label}}">
      <div class="refscilink-control-group">
        <label class="refscilink-label" for="refscilink-search"
               data-refscilink-i18n="search">{{localized_search_label}}</label>
        <input class="refscilink-input" id="refscilink-search" type="search"
               placeholder="{{localized_search_placeholder}}"
               data-refscilink-search
               data-refscilink-i18n-placeholder="searchPlaceholder" />
      </div>
      <div class="refscilink-control-group">
        <label class="refscilink-label" for="refscilink-theme-filter"
               data-refscilink-i18n="filterTheme">{{localized_theme_label}}</label>
        <select class="refscilink-select" id="refscilink-theme-filter" data-refscilink-theme-filter>
          <option value="all" data-refscilink-i18n="allThemes">{{localized_all_themes}}</option>
        </select>
      </div>
      <div class="refscilink-control-group">
        <label class="refscilink-label" for="refscilink-validation-filter"
               data-refscilink-i18n="filterValidation">{{localized_validation_label}}</label>
        <select class="refscilink-select" id="refscilink-validation-filter" data-refscilink-validation-filter>
          <option value="all"               data-refscilink-i18n="allStatuses">{{localized_all_statuses}}</option>
          <option value="pending_validation" data-refscilink-i18n="statusPending">{{localized_status_pending}}</option>
          <option value="validated"          data-refscilink-i18n="statusValidated">{{localized_status_validated}}</option>
          <option value="needs_revision"     data-refscilink-i18n="statusRevision">{{localized_status_revision}}</option>
          <option value="rejected"           data-refscilink-i18n="statusRejected">{{localized_status_rejected}}</option>
        </select>
      </div>
      <div class="refscilink-control-group">
        <label class="refscilink-label" for="refscilink-access-filter"
               data-refscilink-i18n="filterAccess">{{localized_access_label}}</label>
        <select class="refscilink-select" id="refscilink-access-filter" data-refscilink-access-filter>
          <option value="all"                      data-refscilink-i18n="allAccess">{{localized_all_access}}</option>
          <option value="open_access"              data-refscilink-i18n="accessOpen">{{localized_access_open}}</option>
          <option value="abstract_only"            data-refscilink-i18n="accessAbstract">{{localized_access_abstract}}</option>
          <option value="accepted_author_version"  data-refscilink-i18n="accessAuthor">{{localized_access_author}}</option>
          <option value="preprint"                 data-refscilink-i18n="accessPreprint">{{localized_access_preprint}}</option>
          <option value="paywalled"                data-refscilink-i18n="accessPaywall">{{localized_access_paywall}}</option>
          <option value="unknown"                  data-refscilink-i18n="accessUnknown">{{localized_access_unknown}}</option>
        </select>
      </div>
    </section>

    <!-- Dynamic summary counters. -->
    <section class="refscilink-summary" aria-live="polite">
      <p class="refscilink-count" data-refscilink-count></p>
    </section>

    <!-- Loading, empty and error states. -->
    <section class="refscilink-state-area" aria-live="polite">
      <p class="refscilink-loading" data-refscilink-loading
         data-refscilink-i18n="loading">{{localized_loading_label}}</p>
      <p class="refscilink-empty" data-refscilink-empty
         data-refscilink-i18n="noReferences" hidden>{{localized_empty_label}}</p>
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
data-refscilink-back-link
data-refscilink-title
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

### Runtime i18n attributes

Every element that carries visible translatable text must also carry a `data-refscilink-i18n` attribute whose value is the matching key from `REFSCILINK_I18N` in `reference.js`.

The `applyI18n()` function reads `<html lang>` at `DOMContentLoaded`, selects the matching locale and updates the `textContent` of all `[data-refscilink-i18n]` elements.

For the search input placeholder, use `data-refscilink-i18n-placeholder` instead.

For `aria-label` attributes on sections, use `data-refscilink-i18n-aria`.

Required i18n attribute mapping for `index_ref.html`:

```text
back link              → data-refscilink-i18n="backToSite"
h1 title               → data-refscilink-i18n="pageTitle"
search label           → data-refscilink-i18n="search"
search placeholder     → data-refscilink-i18n-placeholder="searchPlaceholder"
theme label            → data-refscilink-i18n="filterTheme"
validation label       → data-refscilink-i18n="filterValidation"
access label           → data-refscilink-i18n="filterAccess"
all themes option      → data-refscilink-i18n="allThemes"
all statuses option    → data-refscilink-i18n="allStatuses"
pending option         → data-refscilink-i18n="statusPending"
validated option       → data-refscilink-i18n="statusValidated"
revision option        → data-refscilink-i18n="statusRevision"
rejected option        → data-refscilink-i18n="statusRejected"
all access option      → data-refscilink-i18n="allAccess"
open access option     → data-refscilink-i18n="accessOpen"
abstract only option   → data-refscilink-i18n="accessAbstract"
author version option  → data-refscilink-i18n="accessAuthor"
preprint option        → data-refscilink-i18n="accessPreprint"
paywalled option       → data-refscilink-i18n="accessPaywall"
unknown option         → data-refscilink-i18n="accessUnknown"
loading state          → data-refscilink-i18n="loading"
empty state            → data-refscilink-i18n="noReferences"
filters section        → data-refscilink-i18n-aria="filtersLabel"
```

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

Validation, extraction, metadata and access labels must follow the lifecycle defined in:

```text
skills/contracts/reference_status_lifecycle_strategy.md
```
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

Visible text must follow the detected host language using a two-layer approach:

1. **Static default text**: each translatable element contains the text in the detected language. The page is readable even without JavaScript.
2. **Runtime replacement**: `applyI18n()` in `reference.js` re-applies the correct locale at `DOMContentLoaded` based on `<html lang>`. If no locale matches, it falls back to `en`.

When generating the file, write the detected language text as the static default and add the matching `data-refscilink-i18n` attribute on every element.

Examples for French:

```text
Retour au site
Références bibliographiques
Rechercher
Thème / Validation / Accès
Tous les thèmes / Tous les statuts / Tous les accès
À valider / Validé / À réviser / Rejeté
Open access / Résumé seul / Version auteur / Préprint / Accès payant / Inconnu
Chargement des références…
Aucune référence trouvée.
```

Examples for English:

```text
Back to site
Bibliographic references
Search
Theme / Validation / Access
All themes / All statuses / All access
Pending validation / Validated / Needs revision / Rejected
Open access / Abstract only / Accepted author version / Preprint / Paywalled / Unknown
Loading references…
No references found.
```

Internal JSON keys and JavaScript hook names remain English at all times.

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
