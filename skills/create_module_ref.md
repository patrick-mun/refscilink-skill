# Skill: `/creat_modul_ref`

## Purpose

`/creat_modul_ref` installs the RefSciLink bibliography module into the current web project.

The skill is designed for use with Codex, Claude Code, or another coding assistant inside VS Code. It must install a reusable Vanilla HTML/CSS/JS bibliography module able to extract bibliographic references from Markdown files, prepare a structured JSON file, and expose the references through a web interface.

> Preferred normalized command name: `/create_module_ref`  
> Legacy command accepted: `/creat_modul_ref`

---

## Operating context

The assistant must work inside the currently opened project folder.

The project is expected to be a static web project or a web presentation using:

- HTML
- CSS
- JavaScript
- JSON
- Markdown

The assistant must not assume a framework such as React, Vue, Angular, Django, Flask, or Next.js unless it is clearly present in the project.

The default implementation must be Vanilla HTML/CSS/JS.

---

## First mandatory question

Before modifying files, ask the user:

```text
Quel fichier Markdown dois-je analyser pour extraire les références bibliographiques ?
```

If several Markdown files are present, list the likely candidates.

Then ask:

```text
Souhaites-tu afficher les références dans une page dédiée, dans un panneau latéral, ou les deux ?
```

Recommended default for first installation:

```text
Page dédiée + bouton Références dans index.html
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
│   └── references.json
└── tools/
    ├── build_references.mjs
    ├── prompt_recherche_ia.md
    └── schema_references.json
```

---

## Installation tasks

When the command `/creat_modul_ref` or `/create_module_ref` is invoked, perform the following steps.

### 1. Inspect project structure

Detect:

- main HTML entry point, usually `index.html`;
- existing CSS files;
- existing JavaScript files;
- visual style variables if present;
- existing navigation bar or menu;
- Markdown files containing references.

Do not overwrite existing files without checking whether the module already exists.

If the module already exists, propose an update mode instead of recreating everything.

---

### 2. Create module files

Create all required module files under:

```text
data/reference_bibliographique/
```

The module must include:

- a bibliography index page;
- a detailed reference page;
- CSS adapted to the host site style;
- JavaScript to load `references.json`;
- JSON data file;
- a Node.js tool for extracting and preparing references;
- a JSON schema documenting the expected data structure;
- an AI prompt used to enrich references.

---

### 3. Add a References button

Add a visible navigation button to the main page.

Default label:

```text
Références
```

Default link:

```html
<a href="data/reference_bibliographique/index_ref.html" class="refscilink-button">Références</a>
```

If the site already has a navigation bar, integrate the button inside the existing navigation.

If no navigation exists, add a simple floating button without breaking the layout.

---

### 4. Extract references from Markdown

The assistant must search the selected Markdown file for sections whose titles may include:

- `Références`
- `Références bibliographiques`
- `Bibliographie`
- `Sources`
- `References`
- `Bibliographic references`

The file may contain other text. The references may not be perfectly formatted.

The assistant must try to detect and normalize each reference.

For each reference, extract when possible:

- title;
- authors;
- year;
- journal or publisher;
- DOI;
- PMID;
- PMCID;
- URL;
- raw reference string.

If a reference is incomplete, attempt correction first. If correction fails, mark it as incomplete and requiring manual review.

---

### 5. Scientific lookup and access classification

For each reference, search appropriate bibliographic sources such as:

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

Classify access as one of:

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

### 6. Summary generation

For each reference, prepare these fields:

```json
{
  "resume_court": "",
  "resume_detaille": "",
  "points_cles": [],
  "interet_pour_le_projet": "",
  "limites": ""
}
```

No generated summary should be considered validated by default.

Default validation fields:

```json
{
  "validated": false,
  "validation_status": "a_valider",
  "validated_by": "",
  "validation_date": ""
}
```

---

### 7. Required JSON schema

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

### 8. Web interface requirements

The bibliography interface must display a simple list with:

- reference number;
- title;
- authors;
- year;
- journal;
- theme;
- access status;
- validation status.

Each item must include:

- `Lire le résumé` button;
- `Voir la source` button;
- `Copier la référence` button;
- `Valider le résumé` button.

Filtering must include at least:

- theme;
- validated / not validated.

For the first version, validation may be stored in browser `localStorage` if no local server is present.

If a Node.js local tool is available, optionally provide a script able to persist validation back into JSON.

---

### 9. Style adaptation

The module must adapt to the visual style of the host site.

Detect when possible:

- primary color;
- background color;
- text color;
- border radius;
- button style;
- navigation style.

If no style can be detected, use a sober scientific default:

```css
--ref-primary: #007B83;
--ref-bg: #f7fafb;
--ref-card: #ffffff;
--ref-text: #102027;
--ref-muted: #607d8b;
```

Do not make the module visually dominant over the host site.

---

### 10. Safety and scientific reliability rules

The assistant must never mark a generated summary as validated automatically.

The assistant must distinguish:

- metadata found from bibliographic databases;
- content inferred from title and abstract;
- content summarized from full text;
- content that requires manual review.

If the article is not open access and only the abstract is available, the summary must clearly say so.

Do not invent DOI, PMID, authors, or journal information.

If metadata cannot be verified, set:

```json
"validation_status": "metadata_a_verifier"
```

---

## Expected final report after installation

At the end of execution, report:

```text
Module RefSciLink installé.

Fichiers créés/modifiés :
- ...

Mode d’affichage : page dédiée / panneau latéral / les deux
Fichier Markdown analysé : ...
Nombre de références détectées : ...
Nombre de références complètes : ...
Nombre de références à vérifier : ...

Prochaine étape recommandée : ouvrir data/reference_bibliographique/index_ref.html
```

---

## Minimal command behavior

When the user types:

```text
/creat_modul_ref
```

or:

```text
/create_module_ref
```

The coding assistant must execute this skill.

---

## Development note

This skill belongs to the RefSciLink project and should remain independent from larger scientific module frameworks until the bibliography module has been tested and stabilized.
