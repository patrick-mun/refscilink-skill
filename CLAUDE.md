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

Reference numbering and stable IDs are specified in:

```text
skills/contracts/reference_numbering_strategy.md
```

Reference lifecycle states are specified in:

```text
skills/contracts/reference_status_lifecycle_strategy.md
```

Logging and diagnostics are specified in:

```text
skills/contracts/logging_diagnostics_strategy.md
```

Dry-run simulation is specified in:

```text
skills/contracts/dry_run_mode_strategy.md
```

Rollback planning is specified in:

```text
skills/contracts/rollback_mode_strategy.md
```

Success validation is specified in:

```text
skills/contracts/success_criteria_strategy.md
```

Official fixture tests are specified in:

```text
skills/contracts/official_tests_strategy.md
```

Run the official local validation with:

```text
npm run test:basic-site
```

Offline behaviour is specified in:

```text
skills/contracts/offline_mode_strategy.md
```

Offline mode must continue local extraction and skip network-based enrichment.

No-external-API behaviour is specified in:

```text
skills/contracts/no_external_api_mode_strategy.md
```

No-external-API mode must skip scientific metadata APIs while preserving local extraction and future enrichment readiness.

Deferred enrichment is specified in:

```text
skills/contracts/deferred_enrichment_strategy.md
```

Deferred enrichment must preserve stable IDs and human validation data, and must never auto-validate AI-generated summaries.

User file protection is specified in:

```text
skills/contracts/user_file_protection_strategy.md
```

Never overwrite, delete, move, rename or restore protected files without following backup and conflict rules.

GitHub Pages compatibility is specified in:

```text
skills/contracts/github_pages_compatibility_strategy.md
```

Use relative browser paths and avoid backend-only assumptions for generated pages.

Accessibility is specified in:

```text
skills/contracts/accessibility_strategy.md
```

Generated UI must use semantic HTML, labeled controls, keyboard-accessible actions and visible focus states.

Responsive design is specified in:

```text
skills/contracts/responsive_design_strategy.md
```

Generated UI must remain readable on mobile and avoid horizontal scrolling without modifying host global responsive rules.

External links security is specified in:

```text
skills/contracts/external_links_security_strategy.md
```

External links must use safe URL schemes and `rel="noopener noreferrer"` when opened in a new tab.

Module versioning is specified in:

```text
skills/contracts/module_versioning_strategy.md
```

Generated JSON metadata must distinguish `module_version` from `schema_version`, tolerate legacy `version` fields and preserve validated scientific content during migration.
