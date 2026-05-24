# RefSciLink — Codex Project Context

## Mission

RefSciLink is a reusable scientific bibliography module designed for static web projects.

Primary technologies:

- HTML
- CSS
- JavaScript
- JSON
- Markdown
- Node.js utilities

Default implementation philosophy:

- framework independent;
- lightweight;
- reusable;
- scientific transparency;
- AI-assisted workflow;
- mandatory human validation.

## Core capability

RefSciLink transforms bibliographic references found inside Markdown files into a structured scientific bibliography website.

Workflow:

1. Detect references in Markdown.
2. Normalize bibliographic metadata.
3. Search scientific databases.
4. Classify article availability.
5. Generate structured summaries.
6. Store records in JSON.
7. Display references in a web interface.
8. Allow user validation.

## Installation skill

The canonical installation command is:

```text
/create_module_ref
```

Legacy alias:

```text
/creat_modul_ref
```

Skill specification:

```text
skills/create_module_ref.md
```

Always consult the skill specification when implementing installation logic.

## Installation destination

When installing into another project, generate:

```text
data/reference_bibliographique/
```

containing:

```text
index_ref.html
reference.html
assets/
json/
tools/
```

## Markdown extraction rules

Search for headings similar to:

- Références
- Références bibliographiques
- Bibliographie
- Sources
- References
- Bibliographic references

The source file may contain unrelated content.

References may be incomplete.

Attempt correction before flagging for review.

## Scientific sources

When enrichment is available, prioritise:

- PubMed
- CrossRef
- Europe PMC
- DOI.org
- Semantic Scholar
- HAL
- bioRxiv
- medRxiv
- publisher metadata

## Access classification

Use:

```json
open_access
abstract_only
accepted_author_version
preprint
paywalled
unknown
```

## Summary fields

Each reference should support:

```json
{
  "short_summary": "",
  "detailed_summary": "",
  "key_points": [],
  "project_relevance": "",
  "limitations": ""
}
```

## Validation policy

Never automatically validate AI-generated summaries.

Default:

```json
{
  "validated": false,
  "validation_status": "pending_validation"
}
```

## Interface expectations

Bibliography pages should support:

- reference list;
- theme filtering;
- validation filtering;
- source access indicators;
- summary view;
- copy reference action;
- source link;
- validation button.

## Design expectations

Integrate visually with the host project.

Fallback palette:

```css
--ref-primary: #007B83;
--ref-bg: #f7fafb;
--ref-card: #ffffff;
--ref-text: #102027;
--ref-muted: #607d8b;
```

## Contribution checklist

Before finalising modifications:

- keep compatibility with static hosting;
- preserve JSON schema consistency;
- update README when behaviour changes;
- update the installation skill if workflow changes;
- avoid introducing unnecessary dependencies.
