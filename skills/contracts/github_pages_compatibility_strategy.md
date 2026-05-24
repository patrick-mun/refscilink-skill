# RefSciLink Contract — GitHub Pages Compatibility Strategy

## Scope

This contract defines static-hosting and GitHub Pages compatibility rules for RefSciLink.

It implements SH-025 and applies to:

- generated HTML pages;
- generated CSS and JavaScript links;
- browser-side JSON loading;
- host navigation integration;
- generated `refscilink.config.json`;
- future validators and local tools that check deployability.

---

## Core principle

RefSciLink must work as plain static files.

Generated browser output must not require a backend, server-side route, build step, bundler, local Node.js runtime or `localhost` in production.

For GitHub Pages project sites, RefSciLink must be safe under a subpath such as:

```text
https://user.github.io/project-name/
```

This makes relative paths the default.

---

## Mandatory reading rule

Before generating or modifying static-hosting paths, an assistant must read:

```text
skills/contracts/github_pages_compatibility_strategy.md
skills/contracts/refscilink_config_contract.md
skills/contracts/reference_js_contract.md
skills/contracts/navigation_integration_contract.md
skills/contracts/multi_page_websites_contract.md
skills/contracts/user_file_protection_strategy.md
```

---

## Path rules

Generated browser files must use relative paths by default.

Rules:

- do not write filesystem absolute paths into generated HTML, CSS, JS or committed JSON;
- do not use `file://` URLs;
- do not use root-relative `/data/...` links unless the user explicitly configures a root deployment;
- prefer `data/reference_bibliographique/index_ref.html` from root pages;
- compute navigation links relative to each modified HTML page;
- use forward slashes in generated paths;
- preserve custom relative output directories from config.

Examples:

| From page | Link to bibliography index |
|---|---|
| `index.html` | `data/reference_bibliographique/index_ref.html` |
| `pages/about.html` | `../data/reference_bibliographique/index_ref.html` |
| `docs/index.html` | `../data/reference_bibliographique/index_ref.html` |
| `docs/guides/page.html` | `../../data/reference_bibliographique/index_ref.html` |

---

## Generated page asset rules

Inside `data/reference_bibliographique/index_ref.html` and `data/reference_bibliographique/reference.html`, asset links must be relative to the page location:

```text
assets/css/reference.css
assets/js/reference.js
json/references.json
json/theme_refscilink.json
```

The pages must not require:

- dynamic route handling;
- server-side templating;
- backend endpoints;
- Node.js in the browser runtime;
- framework-specific loaders;
- CDN dependencies for core functionality.

External fonts or optional assets may be used only when the host project already uses them or the user explicitly approves them.

---

## JSON loading rules

Browser-side JSON loading must work on static hosting.

Rules:

- `reference.js` should fetch `json/references.json` and `json/theme_refscilink.json` using relative URLs;
- failed JSON fetches must produce a clear visible error state;
- invalid JSON must be handled without breaking the page shell;
- the module must not rely on local filesystem reads in the browser;
- persistent browser validation may use `localStorage`, while persistent JSON writes require a separate local tool or backend.

GitHub Pages serves JSON as static files, so the generated JSON must be committed or deployed with the generated pages.

---

## Runtime constraints

Production browser output must be:

- framework-free by default;
- static-hosting compatible;
- usable without install-time dependencies;
- usable without `npm install`;
- usable without local extraction tools after JSON has been generated;
- deployable as committed HTML/CSS/JS/JSON files.

Node.js may be required only for local tools such as `build_references.mjs`, not for viewing deployed pages.

---

## Site-root detection

When the host project uses `docs/`, `public/`, `static/`, `dist/` or `build/`, the assistant must:

1. identify the likely static site root;
2. report the assumption;
3. avoid moving the RefSciLink module without confirmation;
4. compute links relative to the selected integration page;
5. preserve user file protection rules.

If the site root is ambiguous, ask for confirmation or install without modifying navigation.

---

## Configuration rules

Generated `refscilink.config.json` runtime settings should include:

```json
"runtime": {
  "static_hosting": true,
  "github_pages_compatible": true,
  "node_required_for_tools": true,
  "minimum_node_version": "18"
}
```

Path fields must remain project-relative by default.

Do not store machine-specific absolute paths in committed config files.

---

## Diagnostics

GitHub Pages compatibility must use stable diagnostics compatible with `logging_diagnostics_strategy.md`.

Recommended diagnostic codes:

| Code | Severity | Meaning |
|---|---|---|
| `REFSCILINK_STATIC_HOSTING_COMPATIBLE` | `success` | Generated browser output is static-hosting compatible. |
| `REFSCILINK_GITHUB_PAGES_SUBPATH_SAFE` | `success` | Paths are safe for GitHub Pages project subpaths. |
| `REFSCILINK_RELATIVE_PATH_REQUIRED` | `warning` | A relative path is required for static hosting compatibility. |
| `REFSCILINK_STATIC_JSON_LOAD_CONFIGURED` | `success` | Static JSON loading is configured with relative paths. |
| `REFSCILINK_STATIC_HOSTING_WARNING` | `warning` | A static hosting compatibility concern was detected. |
| `REFSCILINK_SITE_ROOT_ASSUMED` | `info` | A likely static site root was assumed. |

Diagnostics must use project-relative paths when safe.

---

## Validation expectations

A GitHub Pages compatible installation must verify:

- generated HTML links CSS and JS through relative paths;
- generated JavaScript loads JSON through relative paths;
- host navigation links are relative from the modified page;
- no generated browser file contains machine-specific absolute paths;
- no production browser page depends on `localhost`;
- no backend route is required to display references from committed JSON.

---

## Final report requirements

The final report must state:

- whether static-hosting compatibility is satisfied;
- whether GitHub Pages project-subpath compatibility is satisfied;
- which site root was assumed, if any;
- which relative navigation href was added or skipped;
- any static-hosting warnings or manual review items.

---

## Success criteria

SH-025 is complete when:

- this contract is indexed in `skills/contracts/README.md`;
- `skills/create_module_ref.md` requires reading this contract before static path or GitHub Pages behaviour changes;
- diagnostic codes are added to `logging_diagnostics_strategy.md`;
- relative-first path rules are centralized here;
- tracking files mark SH-025 as validated and point to SH-026 as the next task.
