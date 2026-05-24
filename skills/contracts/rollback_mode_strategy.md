# Rollback mode strategy

## Purpose

This strategy defines RefSciLink rollback behaviour for `/create_module_ref` and future local recovery tools.

The goal is to restore a project safely after a failed or unwanted RefSciLink installation/update, using known backups and explicit diagnostics without destroying user work.

This strategy implements SH-018.

---

## Core principles

- Rollback must be conservative and traceable.
- Rollback must restore only from known RefSciLink backups or explicitly selected files.
- Rollback must never delete user files blindly.
- Rollback must detect conflicts before overwriting current files.
- Rollback must preserve files modified after backup unless the user explicitly confirms overwrite.
- Rollback must produce human-readable and machine-readable diagnostics.
- Rollback dry-run must produce a simulated restore plan without mutating files.

---

## Activation

Rollback may be triggered by:

```text
explicit user request
future --rollback command
failed installation after partial writes
blocking diagnostic after file mutation
```

Rollback must not run automatically after every warning. It is appropriate only when:

- a write failed after one or more files were already changed;
- the user asks to restore a previous state;
- diagnostics identify an installation as unsafe or incomplete.

---

## Backup selection

Backup selection priority:

1. explicit backup path provided by the user;
2. backup path recorded in diagnostics or installation report;
3. most recent unambiguous backup under `backup/refscilink/`;
4. stop and ask for user confirmation if several plausible backups exist.

Rules:

- never guess between multiple equally plausible backups;
- reject backup paths outside the project unless the user explicitly confirms a local-only recovery;
- verify that selected backup files exist before planning restore actions;
- report missing or incomplete backups as `manual_review_required`.

---

## Rollback action model

Allowed rollback actions:

```text
restore_file
remove_created_file
remove_empty_created_dir
skip_conflict
manual_review_required
```

Action meanings:

| Action | Meaning |
|---|---|
| `restore_file` | Copy a backed-up file back to its original path. |
| `remove_created_file` | Remove a file created by RefSciLink when it did not exist before. |
| `remove_empty_created_dir` | Remove an empty directory created by RefSciLink. |
| `skip_conflict` | Skip a restore because the current file changed after backup. |
| `manual_review_required` | Human decision required before continuing. |

Rollback plans should be represented in diagnostics or future reports as:

```json
{
  "action": "restore_file",
  "source": "backup/refscilink/reference_bibliographique_20260524_120000/json/references.json",
  "target": "data/reference_bibliographique/json/references.json",
  "status": "planned"
}
```

---

## Safety checks

Before restoring a file, rollback must verify:

- backup file exists;
- target path is inside the project root;
- target path belongs to RefSciLink output or was explicitly backed up by RefSciLink;
- target file has not been modified after the backup unless overwrite is explicitly confirmed;
- parent directory exists or can be safely recreated;
- dry-run is not active.

If any check fails, the action must become `skip_conflict` or `manual_review_required`.

---

## File removal rules

Rollback may remove created files only when all conditions are true:

- the file was created by RefSciLink during the failed operation;
- the file did not exist before the operation;
- the file has not been modified by a user since creation;
- the action was listed in the rollback plan.

Rollback must not remove:

- source Markdown files;
- host project files not created by RefSciLink;
- manually edited generated files;
- non-empty directories;
- backup directories.

---

## Dry-run interaction

Rollback dry-run means:

- compute the rollback plan;
- emit diagnostics;
- do not restore files;
- do not remove files;
- do not create directories;
- label every action as simulated.

Rollback dry-run must reuse SH-017 conventions and planned-action language.

---

## Diagnostics

Rollback diagnostics must use stable `REFSCILINK_ROLLBACK_*` codes.

Baseline codes:

| Code | Severity | Meaning |
|---|---|---|
| `REFSCILINK_ROLLBACK_STARTED` | `info` | Rollback planning or execution started. |
| `REFSCILINK_ROLLBACK_BACKUP_SELECTED` | `info` | A backup was selected. |
| `REFSCILINK_ROLLBACK_PLAN_CREATED` | `info` | A rollback plan was created. |
| `REFSCILINK_ROLLBACK_RESTORE_PLANNED` | `info` | A file restore was planned. |
| `REFSCILINK_ROLLBACK_RESTORED` | `success` | A file was restored. |
| `REFSCILINK_ROLLBACK_REMOVAL_PLANNED` | `info` | A created file or empty directory removal was planned. |
| `REFSCILINK_ROLLBACK_REMOVED` | `success` | A created file or empty directory was removed. |
| `REFSCILINK_ROLLBACK_CONFLICT` | `review_required` | Rollback conflict requires human review. |
| `REFSCILINK_ROLLBACK_SKIPPED` | `warning` | Rollback action was skipped. |
| `REFSCILINK_ROLLBACK_DRY_RUN` | `info` | Rollback is simulated only. |
| `REFSCILINK_ROLLBACK_COMPLETE` | `success` | Rollback completed. |
| `REFSCILINK_ROLLBACK_FAILED` | `error` | Rollback failed. |

Diagnostics must not include long file contents.

---

## Report requirements

A rollback report must include:

- selected backup path;
- list of planned actions;
- list of executed actions;
- skipped actions and reasons;
- conflicts requiring manual review;
- confirmation whether dry-run was active;
- final status.

---

## Scope for current implementation

SH-018 defines the normative rollback contract.

It does not require `build_references.mjs` to implement full rollback execution yet. A future local installer or rollback tool may implement this strategy after the safety rules are locked.

Current tools may document and emit rollback diagnostic codes, but they must not perform destructive restore/remove actions unless explicitly designed and tested for rollback.

---

## Success criteria

An implementation satisfies SH-018 when:

- rollback has a documented backup selection strategy;
- rollback actions are limited to the allowed action model;
- dry-run rollback is explicitly non-mutating;
- conflicts stop automatic restoration;
- user-created or recently modified files are protected;
- diagnostics use stable `REFSCILINK_ROLLBACK_*` codes;
- contracts clearly state that full automatic rollback must not run without explicit user intent.
