# Dry-run mode strategy

## Purpose

This strategy defines RefSciLink dry-run behaviour for `/create_module_ref` and local tools.

The goal is to simulate installation, extraction and update decisions without modifying the target project, while still producing useful diagnostics and machine-checkable planned actions.

This strategy implements SH-017.

---

## Core principles

- Dry-run must never write, overwrite, delete, move or create project files.
- Dry-run must never create backups; it must report backups that would be created.
- Dry-run must execute the same read-only analysis and decision logic as normal mode.
- Dry-run output must be clear enough for humans and structured enough for future tests.
- Dry-run diagnostics must reuse SH-016 logging conventions.
- Dry-run must not hide errors that would block a real run.

---

## Activation

Dry-run may be activated by any of these triggers:

```text
--dry-run
refscilink.config.json safety.dry_run: true
explicit user request
```

For local tools, `--dry-run` must be supported when practical.

If several triggers conflict, the explicit runtime option wins:

```text
--dry-run > --no-dry-run > config safety.dry_run
```

---

## Forbidden mutations

When dry-run is active, the assistant or tool must not:

- create `data/reference_bibliographique/`;
- write `references.json`;
- write `theme_refscilink.json`;
- update `refscilink.config.json`;
- modify host HTML, CSS or JavaScript;
- create backup directories or backup files;
- install dependencies;
- run formatters that modify files;
- remove or rename files.

Read operations are allowed.

---

## Planned action model

Dry-run diagnostics may include planned actions in `details.action`.

Allowed planned actions:

```text
would_create
would_update
would_skip
would_backup
would_extract
would_write_json
would_modify_navigation
would_preserve
```

Example:

```json
{
  "severity": "info",
  "code": "REFSCILINK_DRY_RUN_WOULD_WRITE_JSON",
  "message": "Dry-run: references.json would be written.",
  "details": {
    "action": "would_write_json",
    "path": "data/reference_bibliographique/json/references.json",
    "reference_count": 10
  }
}
```

---

## Diagnostic codes

Dry-run diagnostics must use stable `REFSCILINK_DRY_RUN_*` codes.

Baseline codes:

| Code | Severity | Meaning |
|---|---|---|
| `REFSCILINK_DRY_RUN_ENABLED` | `info` | Dry-run mode is active. |
| `REFSCILINK_DRY_RUN_WOULD_CREATE_DIR` | `info` | A directory would be created. |
| `REFSCILINK_DRY_RUN_WOULD_WRITE_JSON` | `info` | A JSON file would be written. |
| `REFSCILINK_DRY_RUN_WOULD_BACKUP` | `info` | A backup would be created. |
| `REFSCILINK_DRY_RUN_NO_WRITE` | `success` | Dry-run completed without writing files. |

Dry-run may also emit normal diagnostics such as `REFSCILINK_EXTRACT_OK` because the analysis phase is real.

---

## Local extraction tool requirements

For `data/reference_bibliographique/tools/build_references.mjs`, dry-run must:

- accept `--dry-run`;
- read the selected Markdown file;
- read existing `references.json` if present;
- extract references;
- compute stable IDs, status normalization and diagnostics;
- print the same diagnostic console format as normal mode;
- include planned write/backup diagnostics;
- not create `data/reference_bibliographique/json`;
- not write `references.json`;
- not create backup files.

The tool may print a generated JSON preview only if explicitly requested by a separate future option. Default dry-run should remain concise.

---

## Report requirements

A dry-run report must state:

- dry-run is active;
- what input was read;
- what output would be written;
- whether an existing file would be backed up;
- reference count and status review summary;
- whether any blocking errors were detected;
- that no files were modified.

---

## Interaction with rollback

Dry-run does not need rollback because it does not mutate files.

If a tool reports a rollback plan during dry-run, it must label it as simulated only.

Rollback planning must follow:

```text
skills/contracts/rollback_mode_strategy.md
```

---

## Success criteria

An implementation satisfies SH-017 when:

- `--dry-run` is accepted by local extraction tooling;
- no output file is created or modified in dry-run;
- no backup is created in dry-run;
- extraction and numbering decisions still run;
- console output includes `REFSCILINK_DRY_RUN_ENABLED`;
- console output includes `REFSCILINK_DRY_RUN_NO_WRITE`;
- planned write and backup actions are reported as `would_*`;
- normal execution remains unchanged when dry-run is not active.
