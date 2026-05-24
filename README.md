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
cd examples/basic-site
python3 -m http.server 8000
```

Open:

```txt
http://localhost:8000
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

### Validation goal

An installation is considered successful when:

- references are detected correctly;
- metadata extraction works;
- theme detection works;
- a bibliography interface is generated;
- navigation integration works;
- the original website design remains intact.

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
