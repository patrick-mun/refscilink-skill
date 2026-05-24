# GitHub Copilot Instructions — RefSciLink Skill

## Project identity

This repository contains **RefSciLink Skill**, a reusable Vanilla HTML/CSS/JS module for scientific bibliography management in static websites, web presentations and scientific tools.

The module must remain lightweight, framework-free and easy to integrate into existing projects.

## Main objective

When assisting in this repository, prioritise the development and maintenance of the RefSciLink bibliography module.

The module must:

- extract bibliographic references from Markdown files;
- normalise reference metadata when possible;
- detect DOI, PMID, PMCID and URLs;
- classify access status;
- generate or prepare structured JSON records;
- display references through a clean HTML/CSS/JS interface;
- keep AI-generated summaries unvalidated by default;
- support human validation of summaries.

## Preferred command workflow

The project exposes an AI-assisted installation skill:

```text
/create_module_ref
```

Legacy spelling also accepted:

```text
/creat_modul_ref
```

The skill is documented in:

```text
skills/create_module_ref.md
```

When the user invokes this command in another web project, the assistant should install the module under:

```text
data/reference_bibliographique/
```

## Required module structure

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

## Coding rules

Use Vanilla HTML, CSS and JavaScript by default.

Do not introduce React, Vue, Angular, Next.js, Django, Flask or another framework unless the target project already clearly uses it and the user explicitly wants integration with it.

Keep code readable, portable and compatible with static hosting such as GitHub Pages.

Prefer progressive enhancement: the module should still display references from JSON even if advanced AI enrichment is not available.

## Scientific reliability rules

Never mark an AI-generated summary as validated automatically.

Default validation state:

```json
{
  "validated": false,
  "validation_status": "pending_validation"
}
```

Do not invent bibliographic metadata.

If metadata cannot be verified, mark it as requiring review.

If only an abstract is available, clearly state that the full article is not open access.

## Access classification

Use one of the following values:

```json
"open_access"
"abstract_only"
"accepted_author_version"
"preprint"
"paywalled"
"unknown"
```

## UI requirements

The bibliography page should include:

- list of references;
- theme filter;
- validation filter;
- access-status indicator;
- button to read the summary;
- button to open the source;
- button to copy the reference;
- button to validate the summary.

Validation can use browser localStorage in static mode.

## Style rules

The module should adapt to the host website style when installed in another project.

If no theme is detected, use the sober scientific default:

```css
--ref-primary: #007B83;
--ref-bg: #f7fafb;
--ref-card: #ffffff;
--ref-text: #102027;
--ref-muted: #607d8b;
```

## Documentation rule

When adding features, update:

- `README.md`;
- `skills/create_module_ref.md` when the AI-assisted installation workflow changes;
- `data/reference_bibliographique/tools/schema_references.json` when JSON fields change.

Markdown bibliography extraction boundaries are defined in:

```text
skills/contracts/bibliography_boundary_strategy.md
```

Reference numbering and stable IDs are defined in:

```text
skills/contracts/reference_numbering_strategy.md
```

Reference lifecycle states are defined in:

```text
skills/contracts/reference_status_lifecycle_strategy.md
```

Logging and diagnostics are defined in:

```text
skills/contracts/logging_diagnostics_strategy.md
```

Dry-run simulation is defined in:

```text
skills/contracts/dry_run_mode_strategy.md
```

Rollback planning is defined in:

```text
skills/contracts/rollback_mode_strategy.md
```

Success validation is defined in:

```text
skills/contracts/success_criteria_strategy.md
```
