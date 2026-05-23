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

Then ask:

```text
Souhaites-tu que RefSciLink s'adapte automatiquement à la charte graphique du site ?
```

Recommended default:

```text
Oui — mode Auto + fichier de personnalisation modifiable.
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
- Markdown files containing references;
- existing design system, if any.

Do not overwrite existing files without checking whether the module already exists.

If the module already exists, propose an update mode instead of recreating everything.

---

### 2. Analyse host visual identity

Before generating CSS, analyse the host site's visual identity.

Inspect:

- `index.html`;
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

The goal is to make the bibliography module feel native to the existing site.

---

### 3. Create module files

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
- `theme_refscilink.json` for visual overrides;
- a Node.js tool for extracting and preparing references;
- a JSON schema documenting the expected data structure;
- an AI prompt used to enrich references.

---

### 4. Add a References button

Add a visible navigation button to the main page.

Default label:

```text
Références
```

Default link:

```html
<a href="data/reference_bibliographique/index_ref.html" class="refscilink-button">Références</a>
```

If the site already has a navigation bar, integrate the button inside the existing navigation and reuse existing button/link classes when safe.

If no navigation exists, add a simple floating button without breaking the layout.

Do not force a new visual style on the main site.

---

### 5. Extract references from Markdown

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

### 6. Scientific lookup and access classification

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

### 7. Summary generation

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

### 8. Required reference JSON schema

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

### 9. Web interface requirements

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

### 10. Theme adaptation — mandatory visual integration

The module must adapt to the artistic and visual identity of the host site.

This is a core feature, not optional decoration.

Use a **Theme Mode = Auto + Override** approach.

#### 10.1 Auto theme detection

The assistant must inspect the existing site and infer:

- primary color;
- secondary/accent color;
- background color;
- card/background surface color;
- text color;
- muted text color;
- border color;
- font family;
- button style;
- navigation style;
- border radius;
- card radius;
- button radius;
- box-shadow style;
- spacing density;
- dark/light mode tendency.

Detection priority:

1. CSS variables in `:root`.
2. Existing design-system variables.
3. Navbar and button classes.
4. Repeated colors in CSS files.
5. Body and section styles.
6. Fallback scientific theme.

#### 10.2 Theme override file

Generate this file:

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

The user must be able to manually edit this file after installation.

#### 10.3 CSS variable bridge

In `reference.css`, define RefSciLink variables from the theme values.

Use namespaced variables only:

```css
:root {
  --ref-primary: #007B83;
  --ref-secondary: #00A6B2;
  --ref-bg: #f7fafb;
  --ref-card: #ffffff;
  --ref-text: #102027;
  --ref-muted: #607d8b;
  --ref-border: #d8e3e7;
  --ref-radius: 12px;
  --ref-button-radius: 999px;
  --ref-card-radius: 18px;
  --ref-shadow: 0 12px 30px rgba(0,0,0,0.08);
}
```

Do not modify the host site's global CSS variables unless explicitly requested.

#### 10.4 Visual safety rules

The module must not break or dominate the existing site.

Rules:

- Do not overwrite existing global classes like `.button`, `.btn`, `.card`, `.container`, `.nav`.
- Prefix module classes with `refscilink-` or `ref-`.
- Avoid global selectors except minimal `:root` variable declarations.
- Do not reset `body`, `html`, `*`, `a`, `button` globally.
- Do not import external fonts without user approval.
- Do not add CSS frameworks.
- Keep the reference page coherent with the site but visually secondary.

#### 10.5 Button integration

When adding the `Références` button:

- prefer reusing the existing navigation/link style;
- if a primary button class exists, reuse it only if it will not affect layout;
- otherwise create `.refscilink-button`;
- preserve mobile responsiveness;
- do not remove or reorder existing navigation items unless necessary.

#### 10.6 Manual mode

If the user rejects automatic adaptation, create a clear manual file:

```text
data/reference_bibliographique/json/theme_refscilink.json
```

and set:

```json
{
  "theme_mode": "manual"
}
```

The CSS must still use the values defined in that file or the generated CSS variables.

#### 10.7 Final theme report

At the end of installation, report:

```text
Theme mode: Auto + Override
Theme file: data/reference_bibliographique/json/theme_refscilink.json
Detected primary color: ...
Detected font: ...
Detected radius: ...
Manual override possible: yes
```

---

### 11. Safety and scientific reliability rules

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

Theme mode : Auto + Override / Manual / Fallback
Theme file : data/reference_bibliographique/json/theme_refscilink.json
Couleur principale détectée : ...
Police détectée : ...
Rayon de bordure détecté : ...

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
