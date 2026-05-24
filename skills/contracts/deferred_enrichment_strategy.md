# RefSciLink Contract — Deferred Enrichment Strategy

## Scope

This contract defines how RefSciLink prepares and executes delayed scientific metadata enrichment after local installation or extraction.

It implements SH-023 and applies to:

- `/create_module_ref` execution modes;
- generated `refscilink.config.json`;
- generated or updated `references.json`;
- future enrichment-only tools;
- diagnostics and final reports.

This contract defines the workflow and safety rules. It does not implement a live scientific enrichment client.

---

## Core principle

Deferred enrichment must never block installation.

RefSciLink may install and extract references first, then enrich metadata later when network access, APIs, credentials or human approval are available.

Deferred enrichment must preserve stable IDs, human validation data, source traceability and previously reviewed content.

---

## Mandatory reading rule

Before running, implementing or modifying deferred enrichment behaviour, an assistant must read:

```text
skills/contracts/deferred_enrichment_strategy.md
skills/contracts/refscilink_config_contract.md
skills/contracts/references_json_contract.md
skills/contracts/reference_numbering_strategy.md
skills/contracts/reference_status_lifecycle_strategy.md
skills/contracts/metadata_identifier_extraction_strategy.md
skills/contracts/logging_diagnostics_strategy.md
```

If APIs are unavailable or forbidden, also read:

```text
skills/contracts/offline_mode_strategy.md
skills/contracts/no_external_api_mode_strategy.md
```

---

## Activation rules

Deferred enrichment is active when one of these conditions is true:

1. the user chooses “extract now, enrich later”;
2. `refscilink.config.json` contains `"enrichment.mode": "deferred_enrichment"`;
3. extraction succeeds but APIs, credentials or network access are unavailable at installation time;
4. a later enrichment-only pass is requested for an existing `references.json`;
5. no-external-API or offline mode records metadata lookup as deferred for future execution.

Deferred enrichment must be explicit in diagnostics or final reports.

---

## Configuration rules

When deferred enrichment is selected, generated or updated config should use:

```json
"enrichment": {
  "mode": "deferred_enrichment",
  "allow_network": true,
  "allow_ai_summaries": false,
  "require_human_validation": true
}
```

Rules:

- `allow_network` may be `true` for a future enrichment pass;
- `allow_network` may remain `false` when enrichment is only planned, not executed;
- `allow_ai_summaries` must remain `false` unless the user explicitly approves summary drafting;
- `require_human_validation` must always remain `true`;
- existing user-approved configuration must not be overwritten silently.

---

## Preconditions for enrichment-only runs

Before performing a deferred enrichment pass, the assistant or tool must verify:

- `references.json` exists and parses as JSON;
- root object contains `metadata` and `references`;
- each target reference has a stable `id`;
- each target reference preserves `raw_reference`;
- source traceability exists through `source_markdown` and `source_location` when available;
- existing human validation fields are readable;
- existing summaries, review notes and enrichment fields are readable;
- identifiers detected locally are preserved.

If these checks fail, the enrichment pass must stop or mark affected references as requiring manual review.

---

## Enrichment update rules

Deferred enrichment may update:

- missing or empty bibliographic fields;
- `metadata_status`;
- `access_type`;
- `source_url`;
- `pdf_url`;
- `review_notes`;
- diagnostics;
- summary fields only when summary generation is explicitly requested.

Deferred enrichment must not:

- change existing `id` values;
- renumber references;
- delete `raw_reference`;
- delete `source_location`;
- overwrite human-validated fields without explicit approval;
- erase existing `validated_by` or `validation_date`;
- set `validated` to `true`;
- set `validation_status` to `validated`;
- mark AI-generated summaries as human validated;
- remove review notes without preserving their meaning.

When a conflict exists between existing validated data and newly fetched metadata, preserve the validated data and set `metadata_status` to `metadata_to_verify`.

---

## Reference JSON rules

During deferred enrichment, `references.json` metadata should use:

```json
"enrichment_mode": "deferred_enrichment"
```

Reference status transitions:

| Outcome | `metadata_status` |
|---|---|
| Metadata found and consistent | `metadata_found` |
| Metadata partially found | `metadata_partial` |
| Lookup found no metadata | `metadata_not_found` |
| Lookup failed technically | `enrichment_failed` |
| Conflicting or uncertain metadata | `metadata_to_verify` |

Validation rules:

- `validation_status` remains unchanged unless a human explicitly changes it;
- `validated` remains consistent with `validation_status`;
- references with new summaries must remain `pending_validation` unless manually validated;
- access classification remains informational and does not validate summaries.

---

## Rerun safety

Deferred enrichment reruns must be idempotent and conservative.

Rules:

- match records by existing `id`, not by current list order;
- preserve manually validated records;
- only fill empty fields or update fields with stronger verified metadata;
- preserve non-empty summaries unless explicitly regenerated;
- preserve `theme`, `keywords`, `review_notes` and project relevance unless explicitly updated;
- report every changed reference ID;
- report every skipped reference ID and reason.

An enrichment-only run must not behave like a fresh Markdown extraction unless the user explicitly requests extraction again.

---

## Diagnostics

Deferred enrichment must use stable diagnostics compatible with `logging_diagnostics_strategy.md`.

Recommended diagnostic codes:

| Code | Severity | Meaning |
|---|---|---|
| `REFSCILINK_DEFERRED_ENRICHMENT_PENDING` | `info` | Enrichment is planned for later. |
| `REFSCILINK_DEFERRED_ENRICHMENT_STARTED` | `info` | Deferred enrichment pass started. |
| `REFSCILINK_DEFERRED_ENRICHMENT_COMPLETED` | `success` | Deferred enrichment completed. |
| `REFSCILINK_DEFERRED_ENRICHMENT_PARTIAL` | `warning` | Deferred enrichment completed with partial metadata. |
| `REFSCILINK_DEFERRED_ENRICHMENT_FAILED` | `error` | Deferred enrichment failed. |
| `REFSCILINK_ENRICHMENT_REFERENCE_UPDATED` | `info` | A reference was updated during enrichment. |
| `REFSCILINK_ENRICHMENT_REFERENCE_SKIPPED` | `warning` | A reference was skipped during enrichment. |
| `REFSCILINK_ENRICHMENT_REVIEW_REQUIRED` | `review_required` | Enriched metadata requires human review. |

Diagnostics may appear in:

- console output;
- `metadata.diagnostics` in `references.json`;
- final assistant reports.

Diagnostics must not include API keys, tokens, full abstracts, complete reference text or sensitive local paths.

---

## Final report requirements

Deferred enrichment reports must state:

- whether enrichment is pending, started, completed, partial or failed;
- reference counts targeted, updated, skipped and requiring review;
- changed reference IDs;
- skipped reference IDs and reasons;
- metadata sources used when enrichment actually runs;
- whether summaries were generated;
- that AI-generated summaries still require human validation.

When enrichment is only planned, the report must clearly say no external metadata lookup has been performed yet.

---

## Success criteria

SH-023 is complete when:

- this contract is indexed in `skills/contracts/README.md`;
- `skills/create_module_ref.md` requires reading this contract before deferred enrichment behaviour changes;
- deferred enrichment is defined as non-blocking;
- enrichment-only rerun safety is defined;
- human validation and AI-summary safeguards are explicit;
- deferred enrichment diagnostics are defined;
- tracking files mark SH-023 as validated and point to SH-024 as the next task.
