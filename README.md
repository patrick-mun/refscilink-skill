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

### Example workflow

```text
/create_module_ref
```

The assistant asks:

```text
Quel fichier Markdown dois-je analyser pour extraire les références bibliographiques ?
```

Example answer:

```text
sources/bibliographie.md
```

The module is then installed automatically.

### Skill definition

The installation behaviour is defined in:

```text
skills/create_module_ref.md
```

This file can be adapted, versioned and extended according to project needs.

### Design philosophy

RefSciLink prioritises:

- automation;
- reproducibility;
- scientific transparency;
- mandatory human validation.

No AI-generated summary is considered validated by default.

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
    │   └── references.json
    └── tools/
        ├── build_references.mjs
        ├── prompt_recherche_ia.md
        └── schema_references.json
```

## Manual Installation

```bash
git clone https://github.com/YOUR-USER/refscilink-skill.git
cd refscilink-skill
npm install
```

No external JavaScript framework is required. The browser interface is pure HTML, CSS and JavaScript.

## Usage in VS Code

Run the builder and provide the Markdown file containing the bibliography when requested:

```bash
npm run build:refs
```

The script asks:

```txt
Path to the Markdown file containing references:
```

It then searches for bibliographic sections such as:

- Références bibliographiques
- Bibliographie
- References
- Sources
- Literature cited

The generated JSON is written to:

```txt
data/reference_bibliographique/json/references.json
```

## Display the bibliography

Start a local server:

```bash
npm run serve
```

Open:

```txt
http://localhost:8000/data/reference_bibliographique/index_ref.html
```

## Add a references button to an existing site

```html
<a class="refscilink-button" href="data/reference_bibliographique/index_ref.html">Références</a>
```

or:

```html
<button class="refscilink-button" data-refscilink-panel>Références</button>
<script src="data/reference_bibliographique/assets/js/reference.js"></script>
```

## Current automation level

The first public version includes:

- automatic Markdown section detection;
- reference extraction;
- DOI detection;
- metadata lookup through Crossref when a DOI is present;
- JSON schema for AI-enriched summaries;
- static interface with filters, copy button, source link and validation button;
- AI installation workflow through `/create_module_ref`.

## Validation rule

```json
"validated": false,
"validation_status": "a_valider"
```

AI-generated summaries are never validated automatically.

The browser can store temporary validation in localStorage. For durable validation in JSON, rerun the builder or update the JSON file directly.

## Roadmap

- PubMed enrichment.
- Europe PMC enrichment.
- Unpaywall integration.
- HAL and preprint detection.
- Full article availability classification.
- GitHub Actions automation.
- BibTeX export.
- RIS export.
- CSL-JSON export.
- Theme inheritance from host websites.
- Interactive validation dashboard.

## License

MIT License.