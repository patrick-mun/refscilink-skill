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

---

## Execution modes

The assistant must separate the workflow into three levels.

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

Scientific enrichment must not block the installation.

If web access or API access is unavailable, generate the module and mark references as requiring enrichment.

---

## First mandatory questions

Ask:

```text
Quel fichier Markdown dois-je analyser pour extraire les références bibliographiques ?
```

If several Markdown files are present, list likely candidates.

Then ask:

```text
Souhaites-tu afficher les références dans une page dédiée, dans un panneau latéral, ou les deux ?
```

Recommended default:

```text
Page dédiée + bouton Références dans index.html
```

Then ask:

```text
Souhaites-tu que RefSciLink s'adapte automatiquement à la charte graphique du site ?
```

Recommended default:

```text
Oui — Theme Mode = Auto + Override
```

Then ask or infer:

```text
Langue de l'interface : fr ou en ?
```

Default:

```text
fr
```

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

## Source strategy

When installing files, use this priority order:

1. If RefSciLink source/template files are present in the current repository, copy or adapt them.
2. If source/template files are not available, generate a minimal functional module from this skill specification.
3. If a file already exists in the target project, do not overwrite it without backup.

Minimal functional module means:

- `index_ref.html` can load `references.json`;
- `reference.css` contains namespaced `refscilink-` styles;
- `reference.js` can render references, filters and buttons;
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

If the `Références` button already exists, do not duplicate it.

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
  "language": "fr",
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

If several `index.html` files are found, ask which one should receive the `Références` button.

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

### 4. Add a References button

Default label:

```text
Références
```

Default link:

```html
<a href="data/reference_bibliographique/index_ref.html" class="refscilink-button">Références</a>
```

Rules:

- prefer existing navigation style;
- preserve navigation order;
- do not duplicate the button;
- if no navigation is found, add a safe floating button;
- do not force a new visual style on the main site.

---

### 5. Extract references from Markdown

Search for sections titled like:

- `Références`
- `Références bibliographiques`
- `Bibliographie`
- `Sources`
- `References`
- `Bibliographic references`
- `Literature cited`

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

Each reference supports:

```json
{
  "resume_court": "",
  "resume_detaille": "",
  "points_cles": [],
  "interet_pour_le_projet": "",
  "limites": ""
}
```

Default validation:

```json
{
  "validated": false,
  "validation_status": "a_valider",
  "validated_by": "",
  "validation_date": ""
}
```

---

## Required reference JSON schema

Each reference in `references.json` must follow this structure:

```json
{
  "id": "ref001",
  "numero": 1,
  "titre": "",
  "auteurs": [],
  "annee": "",
  "journal": "",
  "doi": "",
  "pmid": "",
  "pmcid": "",
  "url": "",
  "pdf_url": "",
  "access_type": "unknown",
  "theme": "non_classe",
  "raw_reference": "",
  "resume_court": "",
  "resume_detaille": "",
  "points_cles": [],
  "interet_pour_le_projet": "",
  "limites": "",
  "validated": false,
  "validation_status": "a_valider",
  "validated_by": "",
  "validation_date": "",
  "source_markdown": ""
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
Aucun fichier Markdown détecté. Installation effectuée sans extraction.
```

### No references found

Create `references.json` with an empty array and report:

```text
Aucune référence détectée. Vérifier le titre de la section bibliographique.
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
"validation_status": "metadata_a_verifier"
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
- the `Références` button was added or a clear reason is reported;
- no duplicate `Références` button was created;
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
Module RefSciLink installé.

Mode d'exécution : Install only / Install + Extract / Install + Extract + Enrichment
Fichiers créés/modifiés :
- ...

Fichier Markdown analysé : ...
Nombre de références détectées : ...
Nombre de références complètes : ...
Nombre de références à vérifier : ...

Mode d'affichage : page dédiée / panneau latéral / les deux
Bouton Références : ajouté / déjà présent / non ajouté

Theme mode : Auto + Override / Manual / Fallback
Theme file : data/reference_bibliographique/json/theme_refscilink.json
Couleur principale détectée : ...
Police détectée : ...
Rayon de bordure détecté : ...

Backups créés : oui / non
Config : refscilink.config.json

Tests post-installation : réussis / partiels / échec
Prochaine étape recommandée : ouvrir data/reference_bibliographique/index_ref.html
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
