# Contract — Multi-page websites

## Purpose

This contract defines how `/create_module_ref` behaves when the host project contains several HTML entry points or multiple website pages.

The goal is to make AI coding assistants choose, modify and report multi-page integration decisions consistently without accidentally editing the wrong page or breaking relative links.

This contract implements SH-010.

---

## Core principles

- Do not assume that every project has a single root `index.html`.
- Detect all plausible HTML entry points before modifying host navigation.
- Modify only the selected HTML entry point by default.
- Modify multiple pages only when the user explicitly requests it.
- Ask the user when several plausible entry points exist and no config resolves the ambiguity.
- Preserve user files through backups before modifying any host HTML page.
- Generate project-relative links that are correct from each modified page location.
- Do not modify generated build output when a source template is clearly present.
- Report selected, modified, skipped and ambiguous pages.

---

## Inputs

Multi-page handling must use these inputs when available:

| Input | Source |
|---|---|
| HTML entry point | user choice or `refscilink.config.json` `source.html_entrypoint` |
| HTML candidates | project inspection or `source.html_entrypoint_candidates` |
| Navigation integration mode | `display.navigation_integration` |
| Navigation target | `display.navigation_target` |
| Output module directory | `output.module_dir` |
| Explicit all-pages request | current user instruction |

If direct user instruction conflicts with config, the current user instruction takes priority.

---

## HTML page discovery

Discover candidate HTML pages using project-relative paths.

Include:

- root `index.html`;
- root HTML pages such as `about.html`, `contact.html`, `presentation.html`;
- `index.html` files in likely static subfolders;
- pages under common static-site source folders such as `docs/`, `public/`, `src/`, `site/`, `pages/` when they look source-controlled.

Ignore by default:

- RefSciLink generated pages under `data/reference_bibliographique/`;
- backup folders;
- dependency folders such as `node_modules/`;
- build artifacts such as `dist/`, `build/`, `.next/`, `.nuxt/`, `coverage/` unless the project clearly uses them as source;
- hidden folders such as `.git/`;
- HTML files inside package caches or vendor folders;
- generated documentation output when source templates are present.

If only generated output exists and no source page is identifiable, report this uncertainty before modifying.

---

## Entry point classification

Classify discovered HTML pages as:

| Class | Meaning |
|---|---|
| `primary_entrypoint` | Best candidate for initial navigation integration. |
| `secondary_page` | User-facing page that may later receive the RefSciLink link. |
| `template_source` | Source template or layout that controls multiple pages. |
| `generated_output` | Generated artifact that should not be edited by default. |
| `refscilink_generated` | RefSciLink module page; must not receive host navigation injection. |
| `ambiguous` | Plausible page requiring user choice. |

Primary entry point signals include:

- root `index.html`;
- `<html lang>` and complete document structure;
- navigation or header;
- links to project CSS;
- visible landing-page content;
- absence of build-output markers.

Generated output signals include:

- minified HTML;
- generator comments;
- hashed assets;
- location in `dist/`, `build/` or similar folders;
- source templates with matching content elsewhere.

---

## Entry point selection priority

Use this priority order:

1. explicit user-selected HTML file;
2. `refscilink.config.json` `source.html_entrypoint`;
3. single clear root `index.html`;
4. source template or layout controlling the site navigation;
5. most likely source-controlled landing page;
6. ask the user when multiple plausible candidates remain.

If no HTML entry point is found:

- create the RefSciLink module;
- skip navigation integration;
- report `HTML entry point: not found`.

If multiple entry points are found:

- do not guess when candidates have similar confidence;
- list likely candidates;
- ask which one should receive the navigation entry;
- store the selected path in `refscilink.config.json`.

---

## Modification scope

Default scope:

```text
single_entrypoint
```

Allowed modification scopes:

```text
single_entrypoint
selected_pages
all_user_facing_pages
template_only
none
```

Rules:

- `single_entrypoint`: modify only the selected HTML entry point.
- `selected_pages`: modify only pages explicitly selected by the user.
- `all_user_facing_pages`: modify all detected user-facing source pages only after explicit user confirmation.
- `template_only`: modify the shared source template/layout instead of individual generated pages.
- `none`: do not modify host HTML.

Never apply `all_user_facing_pages` silently.

---

## Navigation integration across pages

Navigation integration remains governed by:

```text
skills/contracts/navigation_integration_contract.md
```

For multi-page projects:

- apply the navigation contract independently to each modified page or selected template;
- avoid duplicate RefSciLink links on every page;
- preserve each page's existing navigation style;
- do not force a navigation link onto pages that have no navigation unless the selected mode allows a fallback;
- report pages where integration was skipped or requires manual review.

If a shared template controls navigation, prefer modifying the template once instead of editing generated pages.

---

## Relative link calculation

Navigation targets must be correct from the location of each modified page.

Default module index path from project root:

```text
data/reference_bibliographique/index_ref.html
```

Examples:

| Modified page | Correct href |
|---|---|
| `index.html` | `data/reference_bibliographique/index_ref.html` |
| `pages/about.html` | `../data/reference_bibliographique/index_ref.html` |
| `docs/index.html` | `../data/reference_bibliographique/index_ref.html` |
| `docs/guides/page.html` | `../../data/reference_bibliographique/index_ref.html` |

Rules:

- compute href relative to the modified HTML file directory;
- use forward slashes;
- avoid absolute filesystem paths;
- avoid root-relative `/data/...` paths unless the user or project config explicitly requires root-relative deployment;
- keep GitHub Pages project-site compatibility in mind.

---

## Config tracking

`refscilink.config.json` should track multi-page decisions when available.

Recommended additional fields under `source`:

```json
"source": {
  "html_entrypoint": "index.html",
  "html_entrypoint_candidates": [
    "index.html",
    "pages/about.html"
  ],
  "html_pages_selected": [
    "index.html"
  ],
  "html_pages_modified": [
    "index.html"
  ],
  "html_pages_skipped": []
}
```

Rules:

- preserve existing config fields;
- store project-relative paths;
- do not store absolute paths;
- update config only after backup;
- if config schema has not yet added these optional fields, preserve them as extra keys.

---

## Backup requirements

Before modifying any host HTML page:

1. create a backup according to the backup rules;
2. preserve original file path structure in the backup when multiple pages are modified;
3. report all backed-up files;
4. do not modify additional pages if backup creation fails.

When multiple pages are modified, backup all affected pages before applying changes.

---

## Ambiguity handling

Ask the user when:

- several root or top-level HTML pages could be the main entry point;
- several `index.html` files exist in plausible source folders;
- the project has both source templates and generated output;
- navigation is framework-generated and the source template is unclear;
- user request says "all pages" but the list of user-facing pages is uncertain.

Do not ask when:

- there is exactly one root `index.html`;
- config clearly identifies the entry point and the file exists;
- user explicitly selected a file.

---

## Special project layouts

### GitHub Pages

For project sites, prefer relative links over root-relative links so the module works under:

```text
https://username.github.io/repository-name/
```

### `docs/` site

If the site root appears to be `docs/`, generate or link relative to the selected site root only after reporting the assumption.

### `public/` or `static/`

If `public/` or `static/` is a deployment source, treat its HTML files as source only when the project convention indicates that they are edited directly.

### Build-output folders

Do not edit `dist/` or `build/` by default when a source page exists elsewhere.

---

## Minimal examples

### Single root entry point

```text
index.html
style.css
bibliographie.md
```

Decision:

```text
HTML entry point: index.html
Modification scope: single_entrypoint
```

### Multiple top-level pages

```text
index.html
about.html
methods.html
bibliographie.md
```

Default decision:

```text
HTML entry point: index.html
Modification scope: single_entrypoint
Other pages: skipped unless user requests selected_pages or all_user_facing_pages
```

### Nested page selected

```text
index.html
pages/about.html
data/reference_bibliographique/index_ref.html
```

If modifying `pages/about.html`, use:

```html
<a href="../data/reference_bibliographique/index_ref.html" data-refscilink-nav-link>References</a>
```

---

## Installation report fields

The final report must include:

```text
HTML entry point: index.html
HTML candidates: ...
Modification scope: single_entrypoint / selected_pages / all_user_facing_pages / template_only / none
Pages modified: ...
Pages skipped: ...
Navigation target per modified page: ...
Backups created: yes / no
Ambiguities: none / ...
```

---

## Minimal success criteria

Multi-page handling is acceptable only if:

- all plausible HTML entry points are detected or intentionally ignored with a reason;
- generated RefSciLink pages are not treated as host entry points;
- ambiguous entry points trigger a user question or clear report;
- only the selected entry point is modified by default;
- multiple pages are modified only after explicit user instruction;
- each modified page receives a correct relative href;
- every modified host HTML file is backed up before modification;
- navigation integration follows `navigation_integration_contract.md`;
- `refscilink.config.json` records the selected entry point when available;
- final report lists selected, modified and skipped pages.
