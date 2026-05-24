# RefSciLink Contract — User File Protection Strategy

## Scope

This contract defines strict non-destruction rules for RefSciLink operations.

It implements SH-024 and applies to:

- `/create_module_ref` installation and updates;
- generated file updates;
- host navigation integration;
- Markdown extraction and JSON regeneration;
- rollback planning and execution;
- deferred enrichment;
- future local tools.

This contract is the global safety layer. Any contract that writes, restores, removes, enriches or updates files must comply with it.

---

## Core principle

User files are more important than completing automation.

RefSciLink must skip, ask for confirmation or require manual review rather than overwrite, delete, move or rename user work unsafely.

No operation may destroy user data silently.

---

## Mandatory reading rule

Before writing, overwriting, deleting, moving, renaming or restoring any file, an assistant must read:

```text
skills/contracts/user_file_protection_strategy.md
skills/contracts/generated_files_contract.md
skills/contracts/refscilink_config_contract.md
skills/contracts/logging_diagnostics_strategy.md
```

When relevant, also read:

```text
skills/contracts/navigation_integration_contract.md
skills/contracts/multi_page_websites_contract.md
skills/contracts/dry_run_mode_strategy.md
skills/contracts/rollback_mode_strategy.md
skills/contracts/deferred_enrichment_strategy.md
```

---

## File categories

### Host user files

Host user files include:

- existing `index.html` files;
- existing HTML pages;
- existing host CSS and JavaScript files;
- source Markdown files;
- project configuration files not created by RefSciLink;
- user assets, images, fonts and data files.

Host user files must never be overwritten, moved, deleted or reformatted broadly without backup and explicit intent.

### RefSciLink generated files

Generated files include:

- `data/reference_bibliographique/index_ref.html`;
- `data/reference_bibliographique/reference.html`;
- `data/reference_bibliographique/assets/css/reference.css`;
- `data/reference_bibliographique/assets/js/reference.js`;
- `data/reference_bibliographique/json/references.json`;
- `data/reference_bibliographique/json/theme_refscilink.json`;
- `data/reference_bibliographique/tools/*`;
- `refscilink.config.json` when created by RefSciLink.

Generated files may still contain manual edits and must be protected after creation.

### Editable JSON files

Editable JSON files include:

- `references.json`;
- `theme_refscilink.json`;
- `refscilink.config.json`;
- future user-facing RefSciLink JSON files.

Unknown keys, human validation fields, summaries, review notes and local configuration choices must be preserved when safely updating JSON.

### Backups and temporary files

Backups are safety artifacts and must not be deleted automatically.

Temporary files may be removed only when they are created by the current RefSciLink operation, are inside the project or OS temp scope selected for the operation, and are not user-authored files.

---

## Required backup rules

Before modifying an existing protected file, RefSciLink must:

1. identify the target file category;
2. create a project-relative backup unless the user explicitly selected a different safe backup path;
3. verify that the backup exists and is readable;
4. record the backup path in diagnostics or the final report;
5. skip the write if backup creation fails.

Default backup root:

```text
backup/refscilink/
```

Recommended operation backup pattern:

```text
backup/refscilink/reference_bibliographique_YYYYMMDD_HHMMSS/
```

If a backup cannot be created, the write must not proceed.

---

## Manual edit detection

RefSciLink must treat a file as manually edited or potentially manually edited when:

- the file existed before the current operation;
- the file has changed since the last known backup;
- generated marker metadata is missing or changed;
- JSON contains unknown keys;
- JSON contains human validation fields;
- JSON contains non-empty summaries, review notes, themes, keywords or project relevance;
- host HTML navigation differs from the expected generated insertion;
- timestamps indicate modification after a backup used for restore.

Manual edit detection does not need to prove a human made the edit. Uncertainty must favour preservation.

---

## Conflict behaviour

When a conflict is detected, RefSciLink must choose one of:

```text
skip
manual_review_required
ask_confirmation
```

It must not choose silent overwrite.

Conflict examples:

- target file changed after backup;
- two plausible backup sources exist;
- JSON has unknown user keys and update logic cannot preserve them safely;
- generated page has manual layout edits;
- source Markdown was modified while extraction is running;
- rollback would overwrite a newer file.

---

## Deletion and removal rules

RefSciLink must never delete user files automatically.

Removal is allowed only when all conditions are true:

1. the file or directory was created by RefSciLink in the current or explicitly selected operation;
2. it did not exist before that operation;
3. it has not been modified by a user since creation;
4. the removal is listed in a plan or report;
5. the user explicitly requested cleanup or rollback, or a tested rollback tool is executing an approved plan.

Directories may be removed only when empty and created by RefSciLink.

Backup directories must not be removed automatically.

---

## JSON preservation rules

When updating editable JSON files, RefSciLink must:

- parse the existing file before writing;
- preserve unknown root keys where possible;
- preserve human validation fields;
- preserve non-empty summaries unless explicitly regenerated;
- preserve `review_notes`;
- preserve `validated_by` and `validation_date`;
- preserve manually assigned themes and keywords unless explicitly changed;
- keep `validated` consistent with `validation_status`;
- write a backup before replacing the file.

If JSON cannot be parsed, create a backup and write a new file only after explicit user confirmation. Otherwise, skip and report `manual_review_required`.

---

## Rollback interaction

Rollback must follow this contract and `rollback_mode_strategy.md`.

Rollback must not restore over a file modified after the selected backup unless the user explicitly confirms.

Rollback must not remove files unless they are known RefSciLink-created files and satisfy the removal rules above.

If backup selection is ambiguous, rollback must stop and ask for confirmation.

---

## Diagnostics

User file protection must use stable diagnostics compatible with `logging_diagnostics_strategy.md`.

Recommended diagnostic codes:

| Code | Severity | Meaning |
|---|---|---|
| `REFSCILINK_USER_FILE_PROTECTED` | `info` | A user or manually edited file was preserved. |
| `REFSCILINK_BACKUP_REQUIRED` | `info` | A backup is required before writing. |
| `REFSCILINK_BACKUP_FAILED_WRITE_SKIPPED` | `error` | Backup failed, so the write was skipped. |
| `REFSCILINK_MANUAL_EDIT_DETECTED` | `review_required` | Manual or potentially manual edits were detected. |
| `REFSCILINK_WRITE_SKIPPED_CONFLICT` | `review_required` | Write was skipped because of a conflict. |
| `REFSCILINK_DELETE_BLOCKED_USER_FILE` | `error` | Deletion was blocked because the target may be a user file. |
| `REFSCILINK_RESTORE_SKIPPED_NEWER_TARGET` | `review_required` | Restore was skipped because the target changed after backup. |

Diagnostics must include project-relative paths when safe.

Diagnostics must not include full file contents, secrets, API keys or private user data.

---

## Final report requirements

When protected files are encountered, the final report must state:

- files created;
- files updated;
- files skipped;
- backups created;
- conflicts requiring manual review;
- protected files intentionally left unchanged;
- any rollback or cleanup actions planned or executed.

If no user files were overwritten, say so explicitly.

---

## Success criteria

SH-024 is complete when:

- this contract is indexed in `skills/contracts/README.md`;
- `skills/create_module_ref.md` requires reading this contract before writes or restore operations;
- diagnostic codes are added to `logging_diagnostics_strategy.md`;
- user-file overwrite, delete, restore and conflict rules are centralized here;
- tracking files mark SH-024 as validated and point to SH-025 as the next task.
