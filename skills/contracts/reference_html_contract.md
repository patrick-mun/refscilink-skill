<!-- Normative RefSciLink contract. Implements SH-003. -->

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

The generated page must follow this skeleton or an equivalent semantic structure.

Replace `{{detected_language}}` with the detected BCP 47 language code (e.g. `fr`, `en`). Replace each `{{localized_*}}` placeholder with the matching translated string for the detected language. Keep every `data-refscilink-i18n` attribute as-is — it is read by `applyI18n()` at runtime.

```html
<!DOCTYPE html>
<html lang="{{detected_language}}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{localized_reference_label}} — {{localized_references_title}}</title>
  <link rel="stylesheet" href="./assets/css/reference.css" />
</head>
<body>
  <!-- RefSciLink reference detail page. One reference is selected through reference.html?id=ref001. -->
  <main class="refscilink-page" data-refscilink-page="detail">
    <!-- Page header and navigation back to the bibliography list. -->
    <header class="refscilink-header">
      <a class="refscilink-back-link" href="./index_ref.html"
         data-refscilink-back-to-list
         data-refscilink-i18n="backToList">{{localized_back_to_references_label}}</a>
      <h1 class="refscilink-title"
          data-refscilink-detail-title
          data-refscilink-i18n="loadingReference">{{localized_loading_reference_label}}</h1>
    </header>

    <!-- Loading, not-found and error states. -->
    <section class="refscilink-state-area" aria-live="polite">
      <p class="refscilink-loading" data-refscilink-loading
         data-refscilink-i18n="loadingShort">{{localized_loading_label}}</p>
      <p class="refscilink-not-found" data-refscilink-not-found
         data-refscilink-i18n="notFound" hidden>{{localized_reference_not_found_label}}</p>
      <p class="refscilink-error" data-refscilink-error role="alert" hidden></p>
    </section>

    <!-- Detailed reference content populated by JavaScript. -->
    <article class="refscilink-detail" data-refscilink-detail hidden>
      <!-- Metadata section populated by reference.js. -->
      <section class="refscilink-metadata" aria-labelledby="refscilink-metadata-title">
        <h2 id="refscilink-metadata-title"
            data-refscilink-i18n="sectionMetadata">{{localized_metadata_title}}</h2>
        <dl class="refscilink-metadata-list" data-refscilink-metadata></dl>
      </section>

      <!-- Summary sections generated from references.json. -->
      <section class="refscilink-summary-section" aria-labelledby="refscilink-summary-title">
        <h2 id="refscilink-summary-title"
            data-refscilink-i18n="sectionSummary">{{localized_summary_title}}</h2>
        <section data-refscilink-short-summary></section>
        <section data-refscilink-detailed-summary></section>
        <section data-refscilink-key-points></section>
        <section data-refscilink-project-relevance></section>
        <section data-refscilink-limitations></section>
      </section>

      <!-- Action links and validation controls. -->
      <section class="refscilink-actions"
               data-refscilink-i18n-aria="actionsLabel"
               aria-label="{{localized_actions_label}}">
        <a class="refscilink-source-link" href="#"
           data-refscilink-source-link
           data-refscilink-i18n="viewSource"
           target="_blank" rel="noopener noreferrer">{{localized_view_source_label}}</a>
        <button type="button" class="refscilink-copy-button"
                data-refscilink-copy-reference
                data-refscilink-i18n="copyReference">{{localized_copy_reference_label}}</button>
        <button type="button" class="refscilink-validate-button"
                data-refscilink-validate
                data-refscilink-i18n="validateSummary">{{localized_validate_summary_label}}</button>
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

### Runtime i18n attributes

Every element that carries visible translatable text must also carry a `data-refscilink-i18n` attribute whose value is the matching key from `REFSCILINK_I18N` in `reference.js`.

Required i18n attribute mapping for `reference.html`:

```text
back link              → data-refscilink-i18n="backToList"
h1 loading title       → data-refscilink-i18n="loadingReference"
loading state          → data-refscilink-i18n="loadingShort"
not found state        → data-refscilink-i18n="notFound"
metadata h2            → data-refscilink-i18n="sectionMetadata"
summary h2             → data-refscilink-i18n="sectionSummary"
view source link       → data-refscilink-i18n="viewSource"
copy reference button  → data-refscilink-i18n="copyReference"
validate button        → data-refscilink-i18n="validateSummary"
actions section        → data-refscilink-i18n-aria="actionsLabel"
```

Note: the `h1` element (`data-refscilink-detail-title`) will have its text replaced by `renderDetailPage()` with the actual reference title once the JSON is loaded. The `data-refscilink-i18n="loadingReference"` value serves as the visible text only during the loading phase.

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

Validation, extraction, metadata and access labels must follow the lifecycle defined in:

```text
skills/contracts/reference_status_lifecycle_strategy.md
```

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

Visible text must follow the detected host language using a two-layer approach:

1. **Static default text**: each translatable element contains the text in the detected language. The page is readable even without JavaScript.
2. **Runtime replacement**: `applyI18n()` in `reference.js` re-applies the correct locale at `DOMContentLoaded` based on `<html lang>`. If no locale matches, it falls back to `en`.

When generating the file, write the detected language text as the static default and add the matching `data-refscilink-i18n` attribute on every element.

Examples for French:

```text
Retour aux références
Chargement de la référence…
Chargement…
Référence introuvable.
Métadonnées
Résumé
Voir la source
Copier la référence
Valider le résumé
```

Examples for English:

```text
Back to references
Loading reference…
Loading…
Reference not found.
Metadata
Summary
View source
Copy reference
Validate summary
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
