# RefSciLink Skill

> 🚀 RefSciLink can be installed automatically using the AI skill:
>
> ```text
> /create_module_ref
> ```
>
> Compatible with Codex, Claude Code and AI-assisted development workflows.

**RefSciLink Skill** is a reusable Vanilla HTML/CSS/JS module for scientific websites, web presentations and static tools. It extracts bibliographic references from Markdown documents, enriches them with web metadata, stores them in JSON, and displays a clean reference interface with detailed summaries and validation status.

## Goal

The module helps readers, reviewers and scientific collaborators verify the literature behind a web presentation. Each reference can expose:

- title, authors, journal, year, DOI, PMID and URL;
- open-access status: open access, abstract only, accepted author manuscript, preprint, paywalled or unknown;
- short summary, detailed summary, key points, limitations and relevance for the project;
- validation status with a user action button.

## Quick Start in Under 5 Minutes

Requirements:

- Node.js 18 or newer;
- no external service, API key or framework required for the local demo.

From the repository root:

```bash
npm run demo
```

Open:

```txt
http://127.0.0.1:8000/index.html
```

The demo command assembles a temporary copy of `examples/basic-site/` with the RefSciLink module already available. Use the `Références` navigation link to open:

```txt
http://127.0.0.1:8000/data/reference_bibliographique/index_ref.html
```

Run the official local validation:

```bash
npm run test:basic-site
```

Run the dedicated theme-detection validation:

```bash
npm run test:theme
```

To install RefSciLink into another local static site:

```bash
npm run install:module -- --target /path/to/site --markdown bibliographie.md --html index.html
```

The installer copies `data/reference_bibliographique/`, creates `refscilink.config.json`, backs up the selected HTML entry point, and adds one localized `Références` navigation link when needed.

To rebuild the official example references from Markdown:

```bash
npm run build:refs
```

To regenerate the official example theme from the host HTML/CSS:

```bash
npm run theme:detect
```

To fine-tune the rendered theme without editing CSS, update:

```txt
data/reference_bibliographique/json/theme_refscilink.json
```

Durable manual overrides should go under:

```json
{
  "manual_overrides": {
    "primary": "#123456",
    "radius": "6px",
    "css_variables": {
      "--refscilink-color-primary": "#123456"
    }
  }
}
```

`reference.js` applies safe `--refscilink-*` variables from this JSON at runtime. `theme_detector.mjs` preserves `manual_overrides` and unknown maintainer keys when the theme is regenerated.

For a root-level static preview instead of the assembled demo:

```bash
npm run serve
```

## AI-Assisted Installation

RefSciLink can be installed automatically by an AI coding assistant such as:

- Codex
- Claude Code
- GitHub Copilot Agent
- OpenHands
- other compatible coding assistants

The repository provides a dedicated skill:

```text
/creat_modul_ref
```

Recommended alias:

```text
/create_module_ref
```

### What the skill does

When invoked, the assistant:

1. Analyses the current web project structure.
2. Searches Markdown files for bibliographic references.
3. Asks which Markdown file should be analysed.
4. Creates the RefSciLink module automatically.
5. Adds a "Références" button to the website.
6. Generates the required HTML/CSS/JS/JSON files.
7. Extracts references.
8. Attempts to repair incomplete references.
9. Searches scientific metadata.
10. Prepares structured summaries and JSON records.
11. Analyses the site's visual identity.
12. Adapts the bibliography module to the host design.

### Automatic theme adaptation

Visual integration is a core feature of RefSciLink.

The goal is that the generated bibliography module looks like a natural part of the host website instead of an unrelated external page.

The installation skill uses:

```text
Theme Mode = Auto + Override
```

During installation, the AI analyses:

- HTML structure;
- CSS files;
- CSS variables (`:root`);
- buttons;
- navigation bar;
- typography;
- spacing;
- border radius;
- shadows;
- dominant colors;
- dark/light mode tendencies.

RefSciLink then generates a dedicated theme configuration file:

```text
data/reference_bibliographique/json/theme_refscilink.json
```

Developers can edit this file manually after installation to fine-tune the visual integration.

### Visual safety rules

RefSciLink is designed not to break the existing website.

The generated module:

- uses dedicated `refscilink-` CSS classes;
- avoids modifying global styles;
- does not overwrite `.btn`, `.card`, `.container`, `.nav`, etc.;
- does not inject CSS frameworks;
- preserves responsiveness;
- keeps the host website as the visual reference.

### Skill definition

The installation behaviour is defined in:

```text
skills/create_module_ref.md
```

Detailed generated-file contracts and extraction strategies are indexed in:

```text
skills/contracts/README.md
```

This file can be adapted, versioned and extended according to project needs.

## Official Example and Validation Procedure

RefSciLink provides an official host website used to validate installations and future upgrades.

Location:

```txt
examples/basic-site/
```

The example intentionally includes:

- a navigation bar;
- a hero section;
- cards and buttons;
- a dedicated visual identity;
- a Markdown bibliography file;
- validation checklists.

### Run the example locally

```bash
npm run demo
```

Open:

```txt
http://127.0.0.1:8000/index.html
```

### Test the installation skill

Invoke:

```text
/create_module_ref
```

When prompted, select:

```text
bibliographie.md
```

Recommended choices:

```text
Display mode: Page dédiée + bouton Références
Theme mode: Auto + Override
```

### Local installer

For local static sites, the repository also provides a Node.js installer:

```bash
node tools/install_refscilink.mjs --target examples/basic-site --markdown bibliographie.md --html index.html
```

The installer copies the RefSciLink module, writes `refscilink.config.json`, backs up the selected HTML entry point, and adds one localized `Références` navigation link when it is not already present. It is idempotent: rerunning it must not duplicate the navigation link.

### NPM scripts

Common local commands are:

```bash
npm run build:refs
npm run install:module -- --target examples/basic-site --markdown bibliographie.md --html index.html
npm run theme:detect
npm run test:theme
npm run serve
npm run demo
```

`npm run theme:detect` reads the host HTML/CSS and regenerates `data/reference_bibliographique/json/theme_refscilink.json` with detected colors, typography, radius, shadows and button shape. `npm run serve` starts a local static server for the repository root. `npm run demo` assembles a temporary `examples/basic-site` copy with the RefSciLink module and serves that complete demo without external dependencies.

### Expected generated structure

The skill should create:

```txt
data/reference_bibliographique/
```

including:

```txt
index_ref.html
reference.html
references.json
theme_refscilink.json
```

### Validation references

Use the following documents:

```txt
examples/basic-site/expected_output/expected_tree.md
examples/basic-site/expected_output/expected_result.md
```

These files define:

- expected file structure;
- bibliography extraction checks;
- theme detection checks;
- visual integration checks;
- success criteria.

### Automated official test

From the repository root, run:

```bash
npm run test:basic-site
```

This validates the canonical `examples/basic-site/bibliographie.md` fixture, checks required JSON files, verifies `refscilink.config.json` source/output/display/theme/language settings, verifies `build_references.mjs`, `install_refscilink.mjs`, `theme_detector.mjs` and `serve_static.mjs` syntax, tests the local installer and npm scripts on temporary sites, confirms generated version metadata, checks automatic theme detection from the host CSS, checks runtime application and preservation of editable theme overrides, runs the dedicated theme detection suite, checks the localized navigation entry and French generated pages, verifies stable `ref001` to `ref010` fresh-install IDs and detail links, checks external-link safety guards, confirms the expected 10 extracted references, and ensures dry-run mode does not write generated files.

The dedicated theme suite runs:

```bash
npm run test:theme
```

It verifies CSS variable extraction, selector-only extraction, nested stylesheet paths, fallback behaviour, ignored external stylesheet URLs, dark/light inference and preservation of manual overrides.

### Validation goal

An installation is considered successful when:

- references are detected correctly;
- metadata extraction works;
- theme detection works;
- a bibliography interface is generated;
- navigation integration works;
- the original website design remains intact.

## Offline Mode

RefSciLink must remain usable without internet access.

When offline mode is active:

- Markdown extraction still runs locally;
- DOI, PMID, PMCID and URLs found in source text are preserved;
- scientific metadata lookup is skipped;
- unverified metadata remains marked for review;
- the generated static bibliography UI must still work.

The normative offline behaviour is defined in:

```text
skills/contracts/offline_mode_strategy.md
```

## No External API Mode

RefSciLink can run when external scientific enrichment APIs are disabled, unavailable or intentionally forbidden.

In this mode:

- local Markdown extraction still runs;
- local DOI, PMID, PMCID and URL detection still runs;
- scientific lookup through PubMed, Crossref, Europe PMC, DOI.org, Semantic Scholar, Unpaywall or publisher APIs is skipped;
- metadata remains unverified unless it comes from local source text or a later approved enrichment workflow;
- deferred enrichment can be recommended without blocking installation.

The normative behaviour is defined in:

```text
skills/contracts/no_external_api_mode_strategy.md
```

## Deferred Enrichment

RefSciLink may install and extract references before scientific metadata enrichment is available.

Deferred enrichment means:

- extraction and static UI generation are completed first;
- metadata lookup can run later;
- stable IDs and source traceability are preserved;
- human validation fields are never overwritten silently;
- AI-generated summaries remain unvalidated until a human validates them.

The normative workflow is defined in:

```text
skills/contracts/deferred_enrichment_strategy.md
```

## User File Protection

RefSciLink must protect host project files and manually edited generated files.

Before overwriting, restoring or removing files, RefSciLink must:

- classify whether the file is a host user file, generated file, editable JSON file, backup or temporary file;
- create and verify a backup before modifying protected existing files;
- preserve manual edits, unknown JSON keys, validation fields, summaries and review notes;
- skip or request manual review instead of overwriting conflicts silently;
- never delete user files automatically.

The normative safety contract is defined in:

```text
skills/contracts/user_file_protection_strategy.md
```

## GitHub Pages Compatibility

RefSciLink must work as static HTML/CSS/JS/JSON, including GitHub Pages project sites served under a subpath.

Compatibility rules:

- use relative browser paths by default;
- avoid filesystem absolute paths and `file://` URLs;
- avoid root-relative `/data/...` unless explicitly configured;
- load JSON through static relative URLs;
- do not require a backend, dynamic route, bundler or `localhost` in production.

The normative strategy is defined in:

```text
skills/contracts/github_pages_compatibility_strategy.md
```

## Accessibility

RefSciLink generated pages must remain accessible and keyboard-friendly.

Minimum expectations:

- semantic HTML structure;
- labeled filters and controls;
- real buttons for actions and real links for navigation;
- visible focus states;
- live regions for loading/count updates;
- `role="alert"` for blocking errors;
- textual status indicators, not color-only signals.

The normative accessibility strategy is defined in:

```text
skills/contracts/accessibility_strategy.md
```

## Responsive Design

RefSciLink generated pages must remain readable and usable on desktop, tablet and mobile screens.

Minimum expectations:

- responsive behaviour down to approximately `320px`;
- no horizontal scrolling for normal mobile widths;
- filters and actions that wrap or stack;
- cards and detail sections that remain readable;
- long DOI, URL, title and author text that wraps safely;
- responsive CSS scoped to RefSciLink selectors.

The normative responsive strategy is defined in:

```text
skills/contracts/responsive_design_strategy.md
```

## External Links Security

RefSciLink must render external scientific links safely.

Security rules:

- external links opened in a new tab use `target="_blank"` with `rel="noopener noreferrer"`;
- internal RefSciLink navigation stays in the same tab by default;
- unsafe URL schemes such as `javascript:`, `data:`, `file:` and `vbscript:` are not used;
- source and PDF links are hidden or skipped when no safe URL is available;
- untrusted URLs are never injected through `innerHTML`.

The normative external-link strategy is defined in:

```text
skills/contracts/external_links_security_strategy.md
```

## Module Versioning

RefSciLink generated JSON must distinguish module version from schema version.

Minimum expectations:

- new generated metadata uses `module_version` for RefSciLink module behaviour;
- each generated JSON file keeps its own `schema_version`;
- `generated_at`, `created_at` and `updated_at` timestamps are ISO-8601 strings;
- older `version` fields are tolerated as legacy aliases;
- metadata migration must never erase scientific validation data, summaries or theme overrides.

The normative module versioning strategy is defined in:

```text
skills/contracts/module_versioning_strategy.md
```

## Post-Install Validation Checklist

RefSciLink completion reports must separate technical success from scientific and visual review.

Minimum expectations:

- validation reports use `pass`, `fail`, `warning` and `manual_review_required`;
- required files, JSON structure, metadata, statuses, static UI, accessibility, responsive behaviour and external links are checked;
- official tests are reported explicitly;
- AI summaries, uncertain metadata and visual/accessibility limits remain visible as manual-review items.

The normative post-install checklist is defined in:

```text
skills/contracts/post_install_validation_checklist.md
```

The official example must be used whenever a major change is made to:

- bibliography extraction;
- theme detection;
- installation workflow;
- JSON schema;
- user interface.

## Structure

```txt
data/
└── reference_bibliographique/
    ├── index_ref.html
    ├── reference.html
    ├── assets/
    │   ├── css/reference.css
    │   └── js/reference.js
    ├── json/
    │   ├── references.json
    │   └── theme_refscilink.json
    └── tools/
        ├── build_references.mjs
        ├── prompt_recherche_ia.md
        └── schema_references.json
```

## Current automation level

The current version includes:

- automatic Markdown section detection;
- explicit bibliography section boundary rules to avoid capturing notes, annexes or TODO content;
- reference extraction;
- stable reference IDs across reruns when references are recognized;
- explicit reference lifecycle states for validation, extraction, metadata and access review;
- machine-readable diagnostics in generated metadata for extraction and review events;
- dry-run extraction mode for simulating JSON generation without writing files;
- rollback recovery contract for safe restore planning after failed operations;
- machine-verifiable success criteria for validating generated modules;
- explicit module and schema version metadata for generated JSON;
- post-install validation checklist for final review;
- DOI detection;
- metadata lookup through Crossref when a DOI is present;
- JSON schema for AI-enriched summaries;
- static interface with filters, copy button, source link and validation button;
- AI installation workflow through `/create_module_ref`;
- automatic host-theme detection;
- theme override configuration file generation;
- visual integration safeguards;
- official validation example site.

## Validation rule

```json
"validated": false,
"validation_status": "pending_validation"
```

AI-generated summaries are never validated automatically.

## Roadmap

See:

```txt
ROADMAP_UPGRADES.md
```

for the complete upgrade plan and validation tracking.

## License

MIT License.
