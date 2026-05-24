# Machine-verifiable success criteria strategy

## Purpose

This strategy defines the machine-verifiable criteria for considering a RefSciLink installation, extraction or generated module update successful.

The goal is to convert the normative contracts into a repeatable pass/fail validation process that can be run by AI agents, local tools and future CI checks.

This strategy implements SH-019.

---

## Core principles

- Success criteria must be observable from files, JSON data, diagnostics or command results.
- Validation must separate `pass`, `fail`, `warning` and `manual_review_required`.
- A command that exits successfully may still produce warnings or manual-review items.
- Scientific uncertainty must never be hidden to make validation pass.
- Dry-run validation must prove no files were modified.
- Validation reports must be concise and machine-checkable.

---

## Result statuses

Allowed validation result statuses:

```text
pass
fail
warning
manual_review_required
```

| Status | Meaning |
|---|---|
| `pass` | Requirement is satisfied. |
| `fail` | Requirement is not satisfied and must be fixed. |
| `warning` | Requirement is usable but degraded or incomplete. |
| `manual_review_required` | Human judgment is required before final approval. |

---

## Required file checks

A complete generated module must include:

```text
data/reference_bibliographique/index_ref.html
data/reference_bibliographique/reference.html
data/reference_bibliographique/assets/css/reference.css
data/reference_bibliographique/assets/js/reference.js
data/reference_bibliographique/json/references.json
data/reference_bibliographique/json/theme_refscilink.json
data/reference_bibliographique/tools/build_references.mjs
data/reference_bibliographique/tools/prompt_recherche_ia.md
data/reference_bibliographique/tools/schema_references.json
refscilink.config.json
```

Validation:

- missing mandatory generated files are `fail`;
- skipped files are allowed only if the installation report explains why;
- manual edits must not be overwritten without backup.

---

## JSON validity checks

Required JSON parse checks:

```text
data/reference_bibliographique/json/references.json
data/reference_bibliographique/json/theme_refscilink.json
data/reference_bibliographique/tools/schema_references.json
refscilink.config.json
```

Validation:

- invalid JSON is `fail`;
- root arrays for new `references.json` are `fail`;
- missing required metadata is `fail`;
- unknown optional values should be empty strings, arrays or objects according to their contracts.

---

## `references.json` structural checks

`references.json` must satisfy:

- root object contains `metadata` and `references`;
- `references` is an array;
- `metadata.reference_count` equals `references.length`;
- every reference has a unique `id`;
- every reference has a unique `number`;
- `id` values follow `refNNN`;
- `number` values are positive integers;
- every reference includes `raw_reference`, `title`, `authors`, `access_type`, `validation_status`, `extraction_status`, `metadata_status`, `source_markdown` and `source_location`;
- `validated` is consistent with `validation_status`;
- controlled status fields use only documented enum values;
- diagnostics, when present, use SH-016 diagnostic structure.

Any failure above is `fail`.

References with `pending_validation`, `manual_review_required`, `metadata_to_verify`, `duplicate_suspected`, `needs_revision` or `rejected` are `manual_review_required`, not schema failures.

---

## Static page checks

Generated static pages must be internally coherent:

- `index_ref.html` links to `assets/css/reference.css`;
- `index_ref.html` loads `assets/js/reference.js`;
- `reference.html` links to `assets/css/reference.css`;
- `reference.html` loads `assets/js/reference.js`;
- `reference.js` fetches or references `json/references.json`;
- links are relative and GitHub Pages compatible;
- generated pages include stable `data-refscilink-*` hooks required by the contracts.

Missing links or broken relative paths are `fail`.

---

## Local tool checks

The local extraction helper must pass:

```bash
node --check data/reference_bibliographique/tools/build_references.mjs
```

Validation:

- syntax failure is `fail`;
- unsupported Node.js version should be `warning` or `fail` depending on whether the tool can run.

---

## Extraction test checks

Use the official example source:

```text
examples/basic-site/bibliographie.md
```

Minimum extraction test:

```bash
mkdir -p /tmp/refscilink-validation
cp examples/basic-site/bibliographie.md /tmp/refscilink-validation/bibliographie.md
cd /tmp/refscilink-validation
node /absolute/path/to/data/reference_bibliographique/tools/build_references.mjs bibliographie.md
```

Expected result:

- `data/reference_bibliographique/json/references.json` is created;
- output JSON parses successfully;
- `references.length` is greater than `0`;
- `metadata.reference_count` equals `references.length`;
- generated diagnostics include `REFSCILINK_EXTRACT_OK`;
- every reference has an ID and source location.

For the bundled `examples/basic-site`, the expected current extraction count is:

```text
10 references
```

If the official example changes intentionally, update this expected count in the same commit.

---

## Dry-run checks

Dry-run validation must prove no mutation:

```bash
mkdir -p /tmp/refscilink-dry-run
cp examples/basic-site/bibliographie.md /tmp/refscilink-dry-run/bibliographie.md
cd /tmp/refscilink-dry-run
node /absolute/path/to/data/reference_bibliographique/tools/build_references.mjs --dry-run bibliographie.md
```

Expected result:

- no `data/reference_bibliographique/json/references.json` is created;
- no `backup/` directory is created;
- console output includes `REFSCILINK_DRY_RUN_ENABLED`;
- console output includes `REFSCILINK_DRY_RUN_WOULD_WRITE_JSON`;
- console output includes `REFSCILINK_DRY_RUN_NO_WRITE`.

Any dry-run mutation is `fail`.

---

## Backup and overwrite checks

When an existing protected file is overwritten in normal mode:

- a backup must be created first;
- diagnostics must include `REFSCILINK_BACKUP_CREATED`;
- backup path must be project-relative in diagnostics when possible.

If overwrite occurs without backup, validation result is `fail`.

If backup cannot be created, the write must not proceed.

---

## Standard validation report

A validation report should use this shape:

```json
{
  "status": "pass",
  "checks": [
    {
      "id": "json.references.structure",
      "status": "pass",
      "message": "references.json root structure is valid."
    }
  ],
  "summary": {
    "pass": 0,
    "fail": 0,
    "warning": 0,
    "manual_review_required": 0
  }
}
```

Rules:

- top-level `status` is `fail` if any check fails;
- top-level `status` is `manual_review_required` if no check fails but at least one check requires manual review;
- top-level `status` is `warning` if no check fails or requires manual review but warnings exist;
- otherwise top-level `status` is `pass`.

---

## Minimal command bundle

At minimum, run:

```bash
node --check data/reference_bibliographique/tools/build_references.mjs
node -e "JSON.parse(require('fs').readFileSync('data/reference_bibliographique/json/references.json','utf8')); JSON.parse(require('fs').readFileSync('data/reference_bibliographique/json/theme_refscilink.json','utf8')); JSON.parse(require('fs').readFileSync('data/reference_bibliographique/tools/schema_references.json','utf8')); JSON.parse(require('fs').readFileSync('refscilink.config.json','utf8')); console.log('JSON OK')"
```

Then run the extraction and dry-run checks against `examples/basic-site/bibliographie.md`.

---

## Success criteria

An implementation satisfies SH-019 when:

- all mandatory validation categories are documented;
- pass/fail/warning/manual-review semantics are defined;
- exact local commands are documented;
- official example extraction has a known expected count;
- dry-run no-mutation validation is defined;
- diagnostics are part of validation;
- the process is precise enough for future CI or local validation tooling.
