# AGENTS.md — RefSciLink Skill

## Project mission

RefSciLink Skill is a reusable scientific bibliography module for static web projects, web presentations and scientific tools.

It must remain:

- lightweight;
- framework-free by default;
- reusable across projects;
- compatible with static hosting;
- transparent for scientific validation;
- usable by AI coding agents.

## Canonical AI command

The preferred AI-assisted installation command is:

```text
/create_module_ref
```

Legacy spelling accepted:

```text
/creat_modul_ref
```

The detailed skill specification is located at:

```text
skills/create_module_ref.md
```

Agents must consult this file before modifying the installation workflow.

## Core workflow

RefSciLink transforms references found in Markdown documents into a structured bibliography module.

Expected workflow:

1. Analyse the current web project.
2. Ask which Markdown file contains references.
3. Extract bibliographic references.
4. Normalise metadata when possible.
5. Detect DOI, PMID, PMCID and URLs.
6. Search scientific metadata when available.
7. Classify article access status.
8. Generate or prepare structured summaries.
9. Store records in JSON.
10. Display references through Vanilla HTML/CSS/JS.
11. Require human validation for every AI-generated summary.

Markdown extraction must respect the bibliography section boundary strategy in:

```text
skills/contracts/bibliography_boundary_strategy.md
```

Reference IDs and rerun numbering must respect:

```text
skills/contracts/reference_numbering_strategy.md
```

Reference lifecycle states must respect:

```text
skills/contracts/reference_status_lifecycle_strategy.md
```

Logging and diagnostics must respect:

```text
skills/contracts/logging_diagnostics_strategy.md
```

Dry-run simulation must respect:

```text
skills/contracts/dry_run_mode_strategy.md
```

Rollback planning must respect:

```text
skills/contracts/rollback_mode_strategy.md
```

Success validation must respect:

```text
skills/contracts/success_criteria_strategy.md
```

## Default module path

When installed in another project, create:

```text
data/reference_bibliographique/
```

with this structure:

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

## Technology rules

Use Vanilla HTML, CSS and JavaScript by default.

Do not introduce React, Vue, Angular, Next.js, Django, Flask or any other framework unless the host project already uses it and the user explicitly asks for that integration.

Prefer clear, maintainable code over complex abstractions.

Avoid unnecessary dependencies.

## Scientific reliability rules

Never invent bibliographic metadata.

Never mark AI-generated summaries as validated automatically.

Default validation state:

```json
{
  "validated": false,
  "validation_status": "pending_validation"
}
```

If metadata cannot be verified, mark the reference as requiring review.

If only the abstract is available, clearly indicate that the full article is not open access.

## Access classification

Use only these values:

```json
"open_access"
"abstract_only"
"accepted_author_version"
"preprint"
"paywalled"
"unknown"
```

## Required JSON fields

Each reference should support:

```json
{
  "id": "ref001",
  "number": 1,
  "title": "",
  "authors": [],
  "year": "",
  "journal": "",
  "publisher": "",
  "volume": "",
  "issue": "",
  "pages": "",
  "doi": "",
  "pmid": "",
  "pmcid": "",
  "url": "",
  "pdf_url": "",
  "source_url": "",
  "access_type": "unknown",
  "theme": "unclassified",
  "keywords": [],
  "raw_reference": "",
  "short_summary": "",
  "detailed_summary": "",
  "key_points": [],
  "project_relevance": "",
  "limitations": "",
  "validated": false,
  "validation_status": "pending_validation",
  "validated_by": "",
  "validation_date": "",
  "extraction_status": "extracted",
  "metadata_status": "not_enriched",
  "review_notes": "",
  "source_markdown": ""
}
```

## UI expectations

The bibliography interface must provide:

- reference list;
- theme filter;
- validation filter;
- access-status indicator;
- summary display;
- source link;
- copy reference button;
- validation button.

Static-mode validation may use localStorage.

Persistent validation should update JSON through a local tool or later backend integration.

## Style expectations

Integrate with the host site style.

Fallback CSS variables:

```css
--ref-primary: #007B83;
--ref-bg: #f7fafb;
--ref-card: #ffffff;
--ref-text: #102027;
--ref-muted: #607d8b;
```

## Documentation checklist

When behaviour changes, update:

- README.md;
- skills/create_module_ref.md;
- AGENTS.md;
- CLAUDE.md when Claude-specific instructions are affected;
- .github/copilot-instructions.md when Copilot behaviour is affected;
- .codex/context.md when Codex context is affected.

## Official validation tests

Before declaring the official example validated, read:

```text
skills/contracts/official_tests_strategy.md
```

Then run:

```text
npm run test:basic-site
```

The test must remain local-only, deterministic and safe for the repository fixture.

## Offline mode

Before running or modifying behaviour without internet access, read:

```text
skills/contracts/offline_mode_strategy.md
```

Offline mode must keep installation and Markdown extraction working locally, skip scientific metadata enrichment, preserve locally detected identifiers and mark unverified metadata for human review.

## No external API mode

Before running or modifying behaviour where network access may exist but scientific enrichment APIs are forbidden, read:

```text
skills/contracts/no_external_api_mode_strategy.md
```

No-external-API mode must keep local extraction working, skip external scientific metadata APIs, preserve locally detected identifiers and prepare references for later enrichment.

## Deferred enrichment

Before planning or modifying delayed metadata enrichment, read:

```text
skills/contracts/deferred_enrichment_strategy.md
```

Deferred enrichment must never block installation, must preserve stable IDs and human validation fields, and must never auto-validate AI-generated summaries.

## User file protection

Before writing, overwriting, deleting, moving, renaming or restoring files, read:

```text
skills/contracts/user_file_protection_strategy.md
```

Protect host user files and manually edited generated files. If backup creation fails or manual edits create a conflict, skip the write and report manual review instead of overwriting silently.
