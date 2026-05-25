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
| `REFSCILINK_DRY_RUN_ENABLED` | `info` | Dry-run mode is active. |
| `REFSCILINK_DRY_RUN_WOULD_CREATE_DIR` | `info` | A directory would be created. |
| `REFSCILINK_DRY_RUN_WOULD_WRITE_JSON` | `info` | A JSON file would be written. |
| `REFSCILINK_DRY_RUN_WOULD_BACKUP` | `info` | A backup would be created. |
| `REFSCILINK_DRY_RUN_NO_WRITE` | `success` | Dry-run completed without writing files. |
| `REFSCILINK_OFFLINE_MODE_ENABLED` | `info` | Offline mode is active. |
| `REFSCILINK_NETWORK_UNAVAILABLE` | `warning` | Network access is unavailable or disabled. |
| `REFSCILINK_ENRICHMENT_SKIPPED_OFFLINE` | `warning` | Scientific enrichment was skipped because offline mode is active. |
| `REFSCILINK_LOCAL_EXTRACTION_ONLY` | `info` | Local extraction continues without online lookup. |
| `REFSCILINK_METADATA_REVIEW_REQUIRED` | `review_required` | Metadata remains unverified and requires human review. |
| `REFSCILINK_NO_EXTERNAL_API_MODE_ENABLED` | `info` | No-external-API mode is active. |
| `REFSCILINK_EXTERNAL_API_SKIPPED` | `warning` | External scientific API lookup was skipped. |
| `REFSCILINK_METADATA_LOOKUP_DEFERRED` | `info` | Metadata lookup can be resumed later. |
| `REFSCILINK_LOCAL_METADATA_ONLY` | `info` | Metadata came only from local source text. |
| `REFSCILINK_API_KEY_MISSING` | `warning` | A scientific API key was unavailable or not configured. |
| `REFSCILINK_DEFERRED_ENRICHMENT_PENDING` | `info` | Enrichment is planned for later. |
| `REFSCILINK_DEFERRED_ENRICHMENT_STARTED` | `info` | Deferred enrichment pass started. |
| `REFSCILINK_DEFERRED_ENRICHMENT_COMPLETED` | `success` | Deferred enrichment completed. |
| `REFSCILINK_DEFERRED_ENRICHMENT_PARTIAL` | `warning` | Deferred enrichment completed with partial metadata. |
| `REFSCILINK_DEFERRED_ENRICHMENT_FAILED` | `error` | Deferred enrichment failed. |
| `REFSCILINK_ENRICHMENT_REFERENCE_UPDATED` | `info` | A reference was updated during enrichment. |
| `REFSCILINK_ENRICHMENT_REFERENCE_SKIPPED` | `warning` | A reference was skipped during enrichment. |
| `REFSCILINK_ENRICHMENT_REVIEW_REQUIRED` | `review_required` | Enriched metadata requires human review. |
| `REFSCILINK_USER_FILE_PROTECTED` | `info` | A user or manually edited file was preserved. |
| `REFSCILINK_BACKUP_REQUIRED` | `info` | A backup is required before writing. |
| `REFSCILINK_BACKUP_FAILED_WRITE_SKIPPED` | `error` | Backup failed, so the write was skipped. |
| `REFSCILINK_MANUAL_EDIT_DETECTED` | `review_required` | Manual or potentially manual edits were detected. |
| `REFSCILINK_WRITE_SKIPPED_CONFLICT` | `review_required` | Write was skipped because of a conflict. |
| `REFSCILINK_DELETE_BLOCKED_USER_FILE` | `error` | Deletion was blocked because the target may be a user file. |
| `REFSCILINK_RESTORE_SKIPPED_NEWER_TARGET` | `review_required` | Restore was skipped because the target changed after backup. |
| `REFSCILINK_STATIC_HOSTING_COMPATIBLE` | `success` | Generated browser output is static-hosting compatible. |
| `REFSCILINK_GITHUB_PAGES_SUBPATH_SAFE` | `success` | Paths are safe for GitHub Pages project subpaths. |
| `REFSCILINK_RELATIVE_PATH_REQUIRED` | `warning` | A relative path is required for static hosting compatibility. |
| `REFSCILINK_STATIC_JSON_LOAD_CONFIGURED` | `success` | Static JSON loading is configured with relative paths. |
| `REFSCILINK_STATIC_HOSTING_WARNING` | `warning` | A static hosting compatibility concern was detected. |
| `REFSCILINK_SITE_ROOT_ASSUMED` | `info` | A likely static site root was assumed. |
| `REFSCILINK_ACCESSIBILITY_SEMANTIC_HTML_OK` | `success` | Required semantic HTML structure is present. |
| `REFSCILINK_ACCESSIBILITY_LABELS_OK` | `success` | Interactive controls have accessible labels. |
| `REFSCILINK_ACCESSIBILITY_KEYBOARD_OK` | `success` | Controls are keyboard-accessible. |
| `REFSCILINK_ACCESSIBILITY_FOCUS_VISIBLE` | `success` | Visible focus states are defined. |
| `REFSCILINK_ACCESSIBILITY_WARNING` | `warning` | An accessibility concern requires review. |
| `REFSCILINK_ACCESSIBILITY_REVIEW_REQUIRED` | `review_required` | Accessibility cannot be verified automatically and needs human review. |
| `REFSCILINK_RESPONSIVE_LAYOUT_OK` | `success` | Responsive layout requirements are satisfied. |
| `REFSCILINK_RESPONSIVE_MOBILE_BREAKPOINT_OK` | `success` | A RefSciLink-scoped mobile breakpoint is defined. |
| `REFSCILINK_RESPONSIVE_NO_HORIZONTAL_SCROLL` | `success` | Layout is designed to avoid horizontal scrolling. |
| `REFSCILINK_RESPONSIVE_TOUCH_TARGETS_OK` | `success` | Controls have mobile-friendly spacing. |
| `REFSCILINK_RESPONSIVE_WARNING` | `warning` | A responsive layout concern requires review. |
| `REFSCILINK_RESPONSIVE_REVIEW_REQUIRED` | `review_required` | Responsive behaviour needs manual viewport review. |
| `REFSCILINK_EXTERNAL_LINK_SAFE` | `success` | External links use allowed protocols and safe attributes. |
| `REFSCILINK_EXTERNAL_LINK_REL_OK` | `success` | `target="_blank"` links include `rel="noopener noreferrer"`. |
| `REFSCILINK_EXTERNAL_LINK_BLOCKED_UNSAFE_URL` | `warning` | An unsafe or invalid external URL was blocked. |
| `REFSCILINK_EXTERNAL_LINK_REVIEW_REQUIRED` | `review_required` | External link safety requires manual review. |
| `REFSCILINK_EXTERNAL_LINK_INTERNAL_TARGET_SKIPPED` | `info` | Internal link was kept in the same tab. |
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

Additional codes may be added if they remain stable and documented.

Rollback diagnostics must follow:

```text
skills/contracts/rollback_mode_strategy.md
```

Validation success reporting must follow:

```text
skills/contracts/success_criteria_strategy.md
```

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
