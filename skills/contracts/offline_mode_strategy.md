# RefSciLink Contract — Offline Mode Strategy

## Scope

This contract defines RefSciLink behaviour when no internet connection is available.

It implements SH-021 and applies to:

- `/create_module_ref` installation decisions;
- local Markdown extraction;
- generated `refscilink.config.json`;
- generated `references.json`;
- diagnostics and final reports;
- future tests that simulate offline execution.

This contract does not fully define the separate no-external-API mode. That behaviour is reserved for SH-022.

---

## Core principle

Offline mode is not a failure.

RefSciLink must still install, extract references, generate local JSON and display the bibliography interface without network access.

Network-dependent scientific enrichment must be skipped safely and reported clearly.

---

## Mandatory reading rule

Before running, implementing or modifying offline behaviour, an assistant must read:

```text
skills/contracts/offline_mode_strategy.md
skills/contracts/refscilink_config_contract.md
skills/contracts/references_json_contract.md
skills/contracts/metadata_identifier_extraction_strategy.md
skills/contracts/reference_status_lifecycle_strategy.md
skills/contracts/logging_diagnostics_strategy.md
```

If dry-run mode is also active, read:

```text
skills/contracts/dry_run_mode_strategy.md
```

If rollback or recovery is needed, read:

```text
skills/contracts/rollback_mode_strategy.md
```

---

## Offline activation

Offline mode is active when one of these conditions is true:

1. the user explicitly requests offline execution;
2. `refscilink.config.json` contains `"enrichment.mode": "offline"`;
3. `refscilink.config.json` contains `"enrichment.allow_network": false` and no other online enrichment mode is explicitly approved;
4. the environment cannot reach required scientific metadata services and the assistant must continue locally.

The assistant must not silently retry many network calls. If connectivity is unavailable, switch to offline-safe behaviour and report the degraded mode.

---

## Configuration rules

In offline mode, generated or updated config must use:

```json
"enrichment": {
  "mode": "offline",
  "allow_network": false,
  "allow_ai_summaries": false,
  "require_human_validation": true
}
```

Rules:

- `allow_network` must be `false`;
- `allow_ai_summaries` must be `false` unless the user explicitly requests local-only summary drafting and the assistant can perform it without network access;
- `require_human_validation` must remain `true`;
- switching to offline mode must not erase existing user-approved configuration without backup or explicit confirmation.

---

## Allowed local actions

Offline mode may perform:

- project analysis using local files;
- Markdown bibliography boundary detection;
- line-by-line reference extraction;
- DOI, PMID, PMCID and URL detection from source text;
- stable ID assignment and rerun matching;
- local JSON generation;
- local theme detection from existing HTML/CSS;
- static HTML/CSS/JS generation;
- local validation tests;
- dry-run simulation;
- backup creation when writing files.

Offline mode must not perform:

- PubMed, Crossref, Europe PMC, DOI.org, Semantic Scholar, Unpaywall, HAL, bioRxiv or medRxiv requests;
- publisher page scraping;
- remote PDF checks;
- internet-based open-access classification;
- network-based AI summary generation;
- metadata inference from online search results.

---

## Reference JSON rules

In offline mode, `references.json` metadata should use:

```json
"enrichment_mode": "offline"
```

For each reference:

- identifiers present in the Markdown source may be extracted and stored;
- missing identifiers must remain empty;
- bibliographic fields may be parsed only from the raw reference text;
- unavailable online metadata must not be invented;
- `metadata_status` should remain `not_enriched` when no enrichment has been attempted;
- `metadata_status` should be `metadata_to_verify` when local parsing is ambiguous or conflicting;
- `access_type` should remain `unknown` unless the access status is explicitly present in the source text or local project files;
- `validation_status` must remain `pending_validation` unless a human has validated the record.

Existing human validation, summaries and enrichment data must be preserved according to the reference numbering strategy.

---

## Diagnostics

Offline mode must use stable diagnostics compatible with `logging_diagnostics_strategy.md`.

Recommended diagnostic codes:

| Code | Severity | Meaning |
|---|---|---|
| `REFSCILINK_OFFLINE_MODE_ENABLED` | `info` | Offline mode is active. |
| `REFSCILINK_NETWORK_UNAVAILABLE` | `warning` | Network access is unavailable or disabled. |
| `REFSCILINK_ENRICHMENT_SKIPPED_OFFLINE` | `warning` | Scientific enrichment was skipped because offline mode is active. |
| `REFSCILINK_LOCAL_EXTRACTION_ONLY` | `info` | Local extraction continues without online lookup. |
| `REFSCILINK_METADATA_REVIEW_REQUIRED` | `review_required` | Metadata remains unverified and requires human review. |

Diagnostics may appear in:

- console output;
- `metadata.diagnostics` in `references.json`;
- final assistant reports.

Diagnostics must not include API keys, full abstracts, complete reference text or sensitive local paths.

---

## Final report requirements

When offline mode is active, the final report must explicitly state:

- offline mode was used;
- online enrichment was skipped;
- how many references were extracted locally;
- how many references require metadata review;
- whether any identifiers were detected locally;
- which command or manual step can be used later for enrichment when network access is available.

The report must not describe metadata as verified if it was only locally parsed.

---

## Interaction with SH-022

Offline mode means no network access at all.

No-external-API mode means network access may exist, but external scientific APIs are disabled or unavailable.

Until SH-022 is specified, use this distinction:

- if all network access is unavailable or forbidden, use `offline`;
- if the website or local network is available but scientific APIs are disabled, defer to future `no_external_api` rules and fall back to safe local extraction.

---

## Success criteria

SH-021 is complete when:

- this contract is indexed in `skills/contracts/README.md`;
- `skills/create_module_ref.md` requires reading this contract before offline behaviour changes;
- offline mode preserves local installation and extraction;
- offline mode forbids network-dependent enrichment;
- offline diagnostics are defined;
- tracking files mark SH-021 as validated and point to SH-022 as the next task.
