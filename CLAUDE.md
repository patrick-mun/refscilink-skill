# CLAUDE.md — RefSciLink Skill

## Purpose

This document provides Claude Code specific guidance for working on RefSciLink Skill.

RefSciLink is a reusable scientific bibliography module intended for static websites and scientific web presentations.

## First reference documents

Before making significant modifications, read:

1. README.md
2. AGENTS.md
3. skills/create_module_ref.md
4. .codex/context.md
5. .github/copilot-instructions.md

## Preferred command

Primary command:

```text
/create_module_ref
```

Supported legacy alias:

```text
/creat_modul_ref
```

When invoked, follow the workflow defined in:

```text
skills/create_module_ref.md
```

## Installation behaviour

Always begin by asking:

```text
Quel fichier Markdown dois-je analyser pour extraire les références bibliographiques ?
```

Then ask:

```text
Souhaites-tu afficher les références dans une page dédiée, dans un panneau latéral, ou les deux ?
```

Recommended default:

```text
Page dédiée + bouton Références dans index.html
```

## Technical expectations

Default stack:

- HTML
- CSS
- JavaScript
- JSON
- Markdown
- Node.js utilities

Avoid introducing frameworks unless the host project already uses them.

## Scientific expectations

References may be incomplete.

Attempt correction before marking them for review.

When enrichment is available, prioritise:

- PubMed
- CrossRef
- Europe PMC
- DOI.org
- Semantic Scholar
- HAL
- bioRxiv
- medRxiv

## Access classification

Allowed values:

```json
open_access
abstract_only
accepted_author_version
preprint
paywalled
unknown
```

## Validation policy

No AI-generated summary may be validated automatically.

Use:

```json
{
  "validated": false,
  "validation_status": "pending_validation"
}
```

Human review remains mandatory.

## User interface expectations

Provide:

- reference list;
- filters;
- summary view;
- source access indicators;
- validation controls;
- copy-reference actions.

## Style guidance

Adapt to the host site's visual identity.

Fallback palette:

```css
--ref-primary: #007B83;
--ref-bg: #f7fafb;
--ref-card: #ffffff;
--ref-text: #102027;
--ref-muted: #607d8b;
```

## Contribution rule

Whenever functionality changes:

- update README.md;
- update skills/create_module_ref.md if installation behaviour changes;
- update AGENTS.md if project-wide behaviour changes;
- update CLAUDE.md when Claude-specific guidance changes.

Markdown bibliography extraction boundaries are specified in:

```text
skills/contracts/bibliography_boundary_strategy.md
```
