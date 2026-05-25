# RefSciLink Contract — Post-Install Validation Checklist

## Scope

This contract defines the machine-readable post-install validation checklist for RefSciLink.

It implements SH-030 and applies after:

- a fresh `/create_module_ref` installation;
- a rerun that updates generated files;
- a bibliography extraction;
- a dry-run validation;
- a pre-release or pre-test repository review.

---

## Core principle

Post-install validation must be explicit, repeatable and honest about uncertainty.

The checklist must not hide scientific uncertainty, accessibility limits, responsive review needs or metadata gaps just to produce a clean pass.

---

## Mandatory reading rule

Before declaring a RefSciLink installation, extraction or generated module update complete, an assistant must read:

```text
skills/contracts/post_install_validation_checklist.md
skills/contracts/success_criteria_strategy.md
skills/contracts/official_tests_strategy.md
skills/contracts/logging_diagnostics_strategy.md
skills/contracts/generated_files_contract.md
skills/contracts/references_json_contract.md
skills/contracts/theme_refscilink_json_contract.md
skills/contracts/refscilink_config_contract.md
skills/contracts/user_file_protection_strategy.md
skills/contracts/github_pages_compatibility_strategy.md
skills/contracts/accessibility_strategy.md
skills/contracts/responsive_design_strategy.md
skills/contracts/external_links_security_strategy.md
skills/contracts/module_versioning_strategy.md
```

---

## Checklist report shape

A post-install validation report must be machine-readable JSON when produced by a tool.

Recommended shape:

```json
{
  "status": "manual_review_required",
  "checklist_version": "1.0.0",
  "module_version": "0.2.0-dev",
  "generated_at": "ISO-8601 timestamp",
  "checks": [
    {
      "id": "files.required",
      "category": "files",
      "status": "pass",
      "message": "All mandatory generated files exist.",
      "required": true
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

Allowed root and check statuses:

```text
pass
fail
warning
manual_review_required
```

Top-level status rules:

- `fail` if any required check fails;
- `manual_review_required` if no required check fails but any check requires human review;
- `warning` if no failure or manual review exists but warnings are present;
- `pass` only when all checks pass without warnings or manual-review items.

---

## Required checklist categories

The checklist must include these categories.

| Category | Required | Purpose |
|---|---:|---|
| `files` | yes | Mandatory generated files exist. |
| `json` | yes | JSON files parse and use official root shapes. |
| `metadata` | yes | Required metadata and version fields are present. |
| `references` | yes | Bibliographic records satisfy structural rules. |
| `statuses` | yes | Validation, extraction, metadata and access status enums are valid. |
| `safety` | yes | User files, backups and overwrite rules are respected. |
| `static_hosting` | yes | Relative paths and GitHub Pages constraints are respected. |
| `ui` | yes | Generated UI has required hooks and controls. |
| `accessibility` | yes | Semantic HTML, labels, keyboard and focus expectations are checked or flagged. |
| `responsive` | yes | Mobile and narrow viewport expectations are checked or flagged. |
| `external_links` | yes | External links use safe schemes and new-tab attributes. |
| `diagnostics` | yes | Diagnostics use stable codes and severities. |
| `official_tests` | yes | Official fixture validation has been run or explicitly skipped. |
| `manual_review` | yes | Scientific and visual items requiring human judgment are listed. |

---

## Mandatory check IDs

Use stable check IDs so future tools and CI can compare results.

### Files

```text
files.required
files.no_unapproved_overwrite
files.backup_created_when_needed
```

### JSON

```text
json.parse.references
json.parse.theme
json.parse.schema
json.parse.config
json.root.references
json.root.theme
json.root.config
```

### Metadata and versioning

```text
metadata.references.required
metadata.theme.required
metadata.config.required
metadata.module_version
metadata.schema_version
metadata.timestamps
metadata.legacy_version_compatibility
```

### References

```text
references.count_matches_metadata
references.ids_unique
references.numbers_unique
references.required_fields
references.source_traceability
references.no_auto_validation
```

### Statuses and scientific review

```text
statuses.validation_enum
statuses.extraction_enum
statuses.metadata_enum
statuses.access_type_enum
statuses.validated_consistency
manual_review.scientific_uncertainty
manual_review.ai_summaries
```

### Static UI

```text
ui.index_hooks
ui.detail_hooks
ui.css_linked
ui.js_linked
ui.reference_json_load
ui.controls_present
```

### Safety, hosting and links

```text
safety.user_files_protected
safety.no_absolute_paths
static_hosting.relative_paths
static_hosting.github_pages_safe
external_links.safe_protocols
external_links.noopener_noreferrer
external_links.no_innerhtml_url_injection
```

### Accessibility and responsive

```text
accessibility.semantic_html
accessibility.labels
accessibility.keyboard
accessibility.focus_visible
responsive.viewport_meta
responsive.mobile_breakpoint
responsive.no_horizontal_scroll
responsive.touch_targets
```

### Diagnostics and official tests

```text
diagnostics.codes_known
diagnostics.severity_valid
official_tests.basic_site
official_tests.dry_run
official_tests.repository_unchanged
```

---

## Status mapping

Use these default mappings:

| Situation | Status |
|---|---|
| Required file missing | `fail` |
| JSON parse error | `fail` |
| Required metadata missing | `fail` |
| Unknown controlled enum value | `fail` |
| `validated: true` without human validation status | `fail` |
| Generated output uses unsafe URL scheme | `fail` |
| Overwrite happened without backup | `fail` |
| Legacy `version` exists but `module_version` is missing | `warning` or `manual_review_required` depending on migration risk |
| Reference metadata cannot be verified | `manual_review_required` |
| AI-generated summary is present but not human validated | `manual_review_required` |
| Accessibility cannot be fully verified automatically | `manual_review_required` |
| Responsive layout needs visual browser review | `manual_review_required` |
| Optional theme value uses fallback | `warning` |
| Official tests were not run | `manual_review_required` |

---

## Manual review requirements

The checklist must always surface human-review items separately from technical failures.

Manual review is required when:

- scientific metadata was inferred but not verified;
- summaries were generated by AI;
- access type is `unknown`, `abstract_only`, `preprint` or `accepted_author_version`;
- a reference has `metadata_status: metadata_to_verify`;
- duplicate references are suspected;
- accessibility or responsive checks need browser or assistive-technology review;
- legacy metadata migration is recommended but not approved.

Manual review must not block static UI generation, but it must block final scientific approval.

---

## Diagnostics

Post-install checklist diagnostics must use stable codes:

| Code | Severity | Meaning |
|---|---|---|
| `REFSCILINK_VALIDATION_CHECKLIST_STARTED` | `info` | Post-install validation checklist started. |
| `REFSCILINK_VALIDATION_CHECKLIST_PASS` | `success` | Checklist completed without failures, warnings or manual-review items. |
| `REFSCILINK_VALIDATION_CHECKLIST_WARNING` | `warning` | Checklist completed with warnings. |
| `REFSCILINK_VALIDATION_CHECKLIST_FAILED` | `error` | Checklist found at least one failure. |
| `REFSCILINK_VALIDATION_CHECKLIST_REVIEW_REQUIRED` | `review_required` | Checklist found at least one human-review item. |
| `REFSCILINK_VALIDATION_CHECKLIST_OFFICIAL_TESTS_MISSING` | `review_required` | Official tests were not run or not reported. |

Diagnostics must not include private filesystem paths or complete reference payloads.

---

## Required final report

After completing installation or update work, an assistant must report:

- top-level checklist status;
- whether official tests were run;
- number of pass, fail, warning and manual-review checks;
- files created, updated, preserved or skipped;
- scientific manual-review requirements;
- whether generated module files are ready for deeper construction analysis.

If the checklist is not executable yet, the assistant must still report the checklist categories manually and explain which items require future tooling.

---

## Success criteria

SH-030 is complete when:

- this contract is indexed in `skills/contracts/README.md`;
- `skills/create_module_ref.md` requires reading this contract before declaring installation success;
- diagnostic codes are added to `logging_diagnostics_strategy.md`;
- checklist categories and stable check IDs are documented;
- tracking files mark SH-030 as validated;
- project status points to deep construction analysis before full module testing.
