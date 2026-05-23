# RefSciLink Skill

**RefSciLink Skill** is a reusable Vanilla HTML/CSS/JS module for scientific websites, web presentations and static tools. It extracts bibliographic references from Markdown documents, enriches them with web metadata, stores them in JSON, and displays a clean reference interface with detailed summaries and validation status.

## Goal

The module helps readers, reviewers and scientific collaborators verify the literature behind a web presentation. Each reference can expose:

- title, authors, journal, year, DOI, PMID and URL;
- open-access status: open access, abstract only, accepted author manuscript, preprint, paywalled or unknown;
- short summary, detailed summary, key points, limitations and relevance for the project;
- validation status with a user action button.

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

## Installation

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

- `Références bibliographiques`
- `Bibliographie`
- `References`
- `Sources`
- `Literature cited`

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

In your main `index.html`, add either a page link:

```html
<a class="refscilink-button" href="data/reference_bibliographique/index_ref.html">Références</a>
```

or a side-panel button:

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
- a JSON schema for AI-enriched summaries;
- a static interface with filters, copy button, source link and validation button.

The module is designed so Codex, Claude Code or another local AI assistant can use `prompt_recherche_ia.md` to enrich each reference with detailed summaries and access-status verification.

## Validation rule

No AI-generated summary is considered validated by default.

```json
"validated": false,
"validation_status": "a_valider"
```

The browser can store temporary validation in `localStorage`. For durable validation in the JSON file, run the builder again or edit the JSON in VS Code.

## Roadmap

- PubMed / Europe PMC enrichment.
- Unpaywall integration for open-access classification.
- HAL and preprint detection.
- GitHub Actions workflow for automatic JSON generation.
- Export to BibTeX, RIS and CSL-JSON.
- Optional local validation server for writing validation status back to JSON.

## License

MIT License.
