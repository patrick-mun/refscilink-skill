# RefSciLink Contract — No External API Mode Strategy

## Scope

This contract defines RefSciLink behaviour when network access may exist but external scientific enrichment APIs must not be used.

It implements SH-022 and applies to:

- `/create_module_ref` installation decisions;
- local extraction and generated JSON;
- scientific enrichment gating;
- diagnostics and final reports;
- preparation for future deferred enrichment.

This mode is distinct from offline mode. Offline mode means no network access at all. No-external-API mode means the project may still have network access, but RefSciLink must not call scientific metadata APIs or external enrichment services.

---

## Core principle

No-external-API mode is a stable local operation mode.

RefSciLink must keep local installation, extraction, JSON generation and static UI generation working while deliberately skipping external scientific lookup.

Skipped enrichment must be explicit, traceable and resumable later.

---

## Mandatory reading rule

Before running, implementing or modifying no-external-API behaviour, an assistant must read:

```text
skills/contracts/no_external_api_mode_strategy.md
skills/contracts/refscilink_config_contract.md
skills/contracts/references_json_contract.md
skills/contracts/metadata_identifier_extraction_strategy.md
skills/contracts/reference_status_lifecycle_strategy.md
skills/contracts/logging_diagnostics_strategy.md
skills/contracts/offline_mode_strategy.md
```

If deferred enrichment is requested, use this contract until SH-023 defines the full deferred enrichment workflow.

---

## Activation rules

No-external-API mode is active when one of these conditions is true:

1. the user explicitly requests no external API calls;
2. `refscilink.config.json` contains `"enrichment.mode": "no_external_api"`;
3. scientific API keys are missing and the user does not approve unauthenticated lookup;
4. scientific APIs are unavailable, rate-limited or blocked, but general network access still exists;
5. privacy, reproducibility or static-hosting constraints forbid external enrichment calls.

If all network access is unavailable or forbidden, use offline mode instead.

---

## Configuration rules

In no-external-API mode, generated or updated config must use:

```json
"enrichment": {
  "mode": "no_external_api",
  "allow_network": true,
  "allow_ai_summaries": false,
  "require_human_validation": true
}
```

Rules:

- `allow_network` may be `true` because non-enrichment network access can still exist;
- external scientific metadata APIs must not be called;
- `allow_ai_summaries` must remain `false` unless the user explicitly requests local-only summary drafting;
- `require_human_validation` must remain `true`;
- existing user-approved enrichment configuration must not be overwritten silently.

---

## Forbidden external enrichment services

No-external-API mode must not call:

- PubMed;
- Crossref;
- Europe PMC;
- DOI.org metadata APIs;
- Semantic Scholar;
- Unpaywall;
- HAL;
- bioRxiv or medRxiv APIs;
- publisher metadata APIs;
- remote PDF availability checks;
- any third-party bibliographic lookup service.

The assistant must not infer missing metadata from search results.

---

## Allowed actions

No-external-API mode may perform:

- local project analysis;
- Markdown reference extraction;
- DOI, PMID, PMCID and URL detection from the source text;
- local parsing of visible bibliographic fields;
- stable ID assignment and rerun matching;
- local JSON generation;
- local theme detection from host files;
- static HTML/CSS/JS generation;
- local validation tests;
- links to already present source URLs.

If the user explicitly approves network navigation for the host project itself, that must still not become scientific metadata enrichment.

---

## Reference JSON rules

In no-external-API mode, `references.json` metadata should use:

```json
"enrichment_mode": "no_external_api"
```

For each reference:

- identifiers present in source text may be extracted and stored;
- missing identifiers must remain empty;
- local raw-reference parsing may populate fields only when the source text supports them;
- `metadata_status` should remain `not_enriched` when no enrichment lookup has been performed;
- `metadata_status` should be `metadata_to_verify` when local parsing is uncertain or conflicting;
- `access_type` should remain `unknown` unless access is explicit in source text or local files;
- `validation_status` must remain `pending_validation` unless a human validates the record;
- existing validated data, summaries and enrichment fields must be preserved according to the reference numbering strategy.

No-external-API mode must never mark metadata as `metadata_found` solely because an identifier was locally detected.

---

## Diagnostics

No-external-API mode must use stable diagnostics compatible with `logging_diagnostics_strategy.md`.

Recommended diagnostic codes:

| Code | Severity | Meaning |
|---|---|---|
| `REFSCILINK_NO_EXTERNAL_API_MODE_ENABLED` | `info` | No-external-API mode is active. |
| `REFSCILINK_EXTERNAL_API_SKIPPED` | `warning` | External scientific API lookup was skipped. |
| `REFSCILINK_METADATA_LOOKUP_DEFERRED` | `info` | Metadata lookup can be resumed later. |
| `REFSCILINK_LOCAL_METADATA_ONLY` | `info` | Metadata came only from local source text. |
| `REFSCILINK_API_KEY_MISSING` | `warning` | A scientific API key was unavailable or not configured. |

Diagnostics may appear in:

- console output;
- `metadata.diagnostics` in `references.json`;
- final assistant reports.

Diagnostics must not include API keys, tokens, full abstracts, complete reference text or sensitive local paths.

---

## Final report requirements

When no-external-API mode is active, the final report must explicitly state:

- no-external-API mode was used;
- external scientific metadata lookup was skipped;
- whether general network access was available or irrelevant;
- how many references were extracted locally;
- how many identifiers were detected locally;
- how many references require metadata review;
- whether deferred enrichment is recommended.

The report must not describe metadata as verified if it was not checked through an approved enrichment workflow.

---

## Interaction with SH-021 and SH-023

Use `offline` when no network access is available or permitted.

Use `no_external_api` when network access may exist but scientific enrichment APIs must not be called.

SH-023 will define the full deferred enrichment workflow. Until then, no-external-API mode must preserve enough source text, identifiers, diagnostics and review status for later enrichment.

---

## Success criteria

SH-022 is complete when:

- this contract is indexed in `skills/contracts/README.md`;
- `skills/create_module_ref.md` requires reading this contract before no-external-API behaviour changes;
- external scientific API calls are explicitly forbidden in this mode;
- local extraction and generated UI remain supported;
- no-external-API diagnostics are defined;
- tracking files mark SH-022 as validated and point to SH-023 as the next task.
