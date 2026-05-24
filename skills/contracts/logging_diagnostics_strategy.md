# Logging and diagnostics strategy

## Purpose

This strategy defines RefSciLink logging, diagnostics and reporting conventions for `/create_module_ref` and local tools.

The goal is to make installation, extraction and validation outcomes understandable for humans while also exposing stable machine-readable diagnostics for future tests, dry-run mode and rollback mode.

This strategy implements SH-016.

---

## Core principles

- Report every important action without flooding the user.
- Keep diagnostic codes stable across agents and versions.
- Separate human-readable console output from machine-readable JSON diagnostics.
- Do not log long bibliographic content or unnecessary sensitive data.
- Always report warnings and review-required states explicitly.
- Prefer concise counts, file paths and stable IDs over raw content.
- Diagnostics must help future dry-run and rollback workflows.

---

## Severity levels

Allowed diagnostic severities:

```text
info
success
warning
error
review_required
```

| Severity | Meaning |
|---|---|
| `info` | Neutral progress or context message. |
| `success` | Completed operation. |
| `warning` | Non-blocking issue or degraded behaviour. |
| `error` | Blocking failure. |
| `review_required` | Human review is required before considering output final. |

---

## Machine-readable diagnostic object

Diagnostics stored in JSON metadata must use this structure:

```json
{
  "severity": "success",
  "code": "REFSCILINK_EXTRACT_OK",
  "message": "Extracted 10 references from Markdown.",
  "details": {
    "reference_count": 10
  }
}
```

Rules:

- `severity` must use one of the allowed severity values.
- `code` must be a stable uppercase identifier prefixed with `REFSCILINK_`.
- `message` must be concise and human-readable English.
- `details` must be an object.
- Do not include complete reference text, full article abstracts or AI-generated summaries in diagnostics.
- Use counts, IDs and project-relative paths where possible.

---

## Metadata location

Generated `references.json` files may include diagnostics under:

```json
{
  "metadata": {
    "diagnostics": []
  }
}
```

`metadata.diagnostics` is optional but recommended for generated or regenerated files.

---

## Console output format

Local tools should emit short console messages:

```text
[success] REFSCILINK_EXTRACT_OK: Extracted 10 references from Markdown.
[review_required] REFSCILINK_REFERENCES_REMOVED: 1 previous reference ID was not found in the current Markdown.
```

Rules:

- Console output must be readable without parsing JSON.
- Use the same diagnostic codes as `metadata.diagnostics`.
- Avoid stack traces unless the command fails unexpectedly.

---

## Stable diagnostic codes

Recommended baseline codes:

| Code | Severity | Meaning |
|---|---|---|
| `REFSCILINK_RUN_STARTED` | `info` | Local tool or installation started. |
| `REFSCILINK_MARKDOWN_READ` | `success` | Markdown source was read. |
| `REFSCILINK_EXISTING_JSON_READ` | `info` | Existing `references.json` was read for rerun preservation. |
| `REFSCILINK_EXISTING_JSON_INVALID` | `warning` | Existing `references.json` could not be parsed or reused. |
| `REFSCILINK_LEGACY_JSON_READ` | `warning` | Legacy root-array JSON was read for compatibility. |
| `REFSCILINK_BACKUP_CREATED` | `success` | Backup was created before overwriting existing data. |
| `REFSCILINK_EXTRACT_OK` | `success` | References were extracted. |
| `REFSCILINK_NO_REFERENCES_FOUND` | `review_required` | No references were extracted. |
| `REFSCILINK_IDS_REUSED` | `info` | Existing reference IDs were reused. |
| `REFSCILINK_IDS_CREATED` | `info` | New reference IDs were assigned. |
| `REFSCILINK_REFERENCES_REMOVED` | `review_required` | Previous reference IDs were not found in current Markdown. |
| `REFSCILINK_STATUS_REVIEW_REQUIRED` | `review_required` | Generated references include states requiring human review. |
| `REFSCILINK_JSON_WRITTEN` | `success` | `references.json` was written. |
| `REFSCILINK_RUN_FAILED` | `error` | Tool or installation failed. |

Additional codes may be added if they remain stable and documented.

---

## Events to report

The assistant or local tool must report:

- installation or extraction start;
- selected Markdown file;
- generated files created, updated, skipped or preserved;
- backups created;
- number of references extracted;
- reused, new and removed reference IDs;
- status families requiring review;
- JSON parse failures;
- missing input files;
- permission or write failures;
- navigation integration skipped or requiring manual review.

---

## Privacy and content minimization

Diagnostics must not include:

- full bibliographic reference text;
- article abstracts;
- AI-generated summaries;
- private notes from Markdown sections;
- access tokens or API keys;
- absolute paths unless the workflow is explicitly local-only and no project-relative path is available.

Allowed diagnostic details:

- counts;
- stable reference IDs;
- project-relative paths;
- status enum values;
- short error messages.

---

## Success criteria

An implementation satisfies SH-016 when:

- generated diagnostics use documented severity values;
- diagnostic codes are stable and prefixed with `REFSCILINK_`;
- `references.json` metadata can include `diagnostics`;
- local tools emit matching human-readable console messages;
- removed references and review-required states are explicitly reported;
- backups are reported when created;
- diagnostics avoid long source content and sensitive values;
- future dry-run and rollback features can reuse the same diagnostic vocabulary.
