# RefSciLink Contract — Module Versioning Strategy

## Scope

This contract defines version metadata rules for generated RefSciLink modules.

It implements SH-029 and applies to:

- `refscilink.config.json`;
- `data/reference_bibliographique/json/references.json`;
- `data/reference_bibliographique/json/theme_refscilink.json`;
- generated reports and diagnostics;
- future migration or upgrade tooling.

---

## Core principle

Version metadata must make generated modules maintainable without making older valid projects unusable.

RefSciLink must distinguish:

- the RefSciLink module version;
- the schema version for each generated JSON file;
- the contract version used by the skill documentation;
- the timestamp of initial generation and last update when applicable.

Do not use one ambiguous `version` field to represent every type of version in future generated files.

---

## Mandatory reading rule

Before generating, updating, validating or migrating version metadata, an assistant must read:

```text
skills/contracts/module_versioning_strategy.md
skills/contracts/generated_files_contract.md
skills/contracts/refscilink_config_contract.md
skills/contracts/references_json_contract.md
skills/contracts/theme_refscilink_json_contract.md
skills/contracts/logging_diagnostics_strategy.md
skills/contracts/success_criteria_strategy.md
skills/contracts/user_file_protection_strategy.md
```

---

## Version field taxonomy

Use these meanings consistently:

| Field | Meaning | Example |
|---|---|---|
| `module_version` | Version of the generated RefSciLink module behaviour and file set. | `0.2.0-dev` |
| `schema_version` | Version of the JSON structure for the current file. | `1.0.0` |
| `contract_version` | Version of the normative contract used when a report or validation file is generated. | `1.0.0` |
| `generated_by` | Tool or skill identity that generated the file. | `RefSciLink Skill` |
| `generated_at` | ISO-8601 timestamp for file generation. | `2026-05-25T12:00:00+04:00` |
| `created_at` | ISO-8601 timestamp for first config creation. | `2026-05-25T12:00:00+04:00` |
| `updated_at` | ISO-8601 timestamp for last config or generated file update. | `2026-05-25T12:30:00+04:00` |

Existing contracts may still mention `version` for backward compatibility. New generation should prefer `module_version` and may include `version` as a legacy alias only when required by an existing consumer.

---

## Required generated metadata

### `refscilink.config.json`

Generated config metadata must include:

```json
{
  "generated_by": "RefSciLink Skill",
  "module_version": "0.2.0-dev",
  "schema_version": "1.0.0",
  "created_at": "ISO-8601 timestamp",
  "updated_at": "ISO-8601 timestamp"
}
```

Rules:

- `created_at` must remain stable after the first config creation.
- `updated_at` must change when the config is intentionally updated.
- `module_version` must describe the generated RefSciLink module version, not the host project version.
- `schema_version` must describe the `refscilink.config.json` schema only.
- If a legacy `version` field exists, keep it unless the user approves cleanup.

### `references.json`

Generated bibliography data metadata must include:

```json
{
  "generated_by": "RefSciLink Skill",
  "module_version": "0.2.0-dev",
  "schema_version": "1.0.0",
  "generated_at": "ISO-8601 timestamp",
  "updated_at": "ISO-8601 timestamp"
}
```

Rules:

- `generated_at` records first generation of the file.
- `updated_at` records the latest intentional rewrite or merge.
- `schema_version` describes the reference JSON structure only.
- Updating metadata must never erase human validation, summaries, themes or manual review fields.

### `theme_refscilink.json`

Generated theme metadata must include:

```json
{
  "generated_by": "RefSciLink Skill",
  "module_version": "0.2.0-dev",
  "schema_version": "1.0.0",
  "generated_at": "ISO-8601 timestamp",
  "updated_at": "ISO-8601 timestamp"
}
```

Rules:

- `generated_at` records first theme file generation.
- `updated_at` records the latest automatic or approved manual-compatible update.
- Updating metadata must never overwrite user theme overrides without backup and explicit reporting.

---

## Backward compatibility

Older generated files may contain:

```json
{
  "version": "0.2.0-dev"
}
```

When reading older files:

- treat `version` as `module_version` if `module_version` is missing;
- do not fail solely because `module_version` is absent;
- report a migration recommendation instead of silently rewriting;
- preserve legacy metadata unless an approved update is already writing the file;
- never change user-edited JSON only to rename version fields.

When writing new files:

- include `module_version`;
- include `schema_version`;
- include timestamps appropriate for the file type;
- optionally include `version` as a compatibility alias only if required by existing generated code.

---

## Migration rules

Version migration must be safe and explicit.

Before migrating metadata:

1. Detect whether the target file is generated, user-edited or unknown.
2. Apply the user file protection strategy.
3. Create a backup before rewriting JSON.
4. Preserve all scientific and validation fields.
5. Report which metadata fields were added or kept.

Migration must not:

- regenerate references unnecessarily;
- renumber references;
- change access status;
- mark summaries as validated;
- alter theme overrides;
- rewrite host project files only to update RefSciLink metadata.

---

## Diagnostics

Versioning diagnostics must use stable codes:

| Code | Severity | Meaning |
|---|---|---|
| `REFSCILINK_VERSION_METADATA_OK` | `success` | Required version metadata is present. |
| `REFSCILINK_MODULE_VERSION_SET` | `success` | `module_version` is present and non-empty. |
| `REFSCILINK_SCHEMA_VERSION_SET` | `success` | `schema_version` is present and non-empty. |
| `REFSCILINK_LEGACY_VERSION_FIELD_DETECTED` | `info` | Legacy `version` field was detected and tolerated. |
| `REFSCILINK_VERSION_MIGRATION_RECOMMENDED` | `review_required` | Metadata can be migrated safely with user approval. |
| `REFSCILINK_VERSION_METADATA_MISSING` | `warning` | Required version metadata is missing. |

Diagnostics must not include private filesystem paths or full reference payloads.

---

## Validation checklist

A generated module satisfies SH-029 when:

- `refscilink.config.json` metadata distinguishes `module_version` and `schema_version`;
- `references.json` metadata distinguishes `module_version` and `schema_version`;
- `theme_refscilink.json` metadata distinguishes `module_version` and `schema_version`;
- timestamps are ISO-8601 strings;
- legacy `version` values are tolerated without breaking old modules;
- metadata migration never erases scientific validation data;
- diagnostics use the codes defined in this contract.

---

## Final report requirements

When installing, updating or validating a module, the assistant should report:

- the detected or written `module_version`;
- each generated JSON `schema_version`;
- whether legacy `version` aliases were found;
- whether migration was applied, skipped or recommended;
- any versioning diagnostics requiring human review.
