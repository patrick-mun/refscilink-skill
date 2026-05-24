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
