# Reference status lifecycle strategy

## Purpose

This strategy defines the lifecycle of RefSciLink reference states across extraction, metadata enrichment, access classification, human validation and UI display.

The goal is to prevent ambiguous states and make every agent generate, filter and display references consistently without hiding scientific uncertainty.

This strategy implements SH-015.

---

## Core principles

- State fields must remain independent but compatible.
- AI-generated summaries must never be automatically marked as human validated.
- Scientific uncertainty must remain visible until a human resolves it.
- Duplicate suspicion must not automatically delete, merge or reject a reference.
- Access classification is informational and must not imply summary validation.
- Browser-only validation may be temporary in `localStorage`; persistent validation requires a local tool or backend.
- UI must expose blocking review states clearly.

---

## Status field families

RefSciLink uses four controlled status families:

| Field | Purpose |
|---|---|
| `validation_status` | Human review state for summaries and reference interpretation. |
| `extraction_status` | Reliability of the extracted reference block. |
| `metadata_status` | Reliability of normalized bibliographic metadata and identifiers. |
| `access_type` | Scientific access classification for the source. |

The boolean field `validated` mirrors whether `validation_status` is `validated`.

Rules:

- `validated: true` is allowed only when `validation_status` is `validated`.
- `validated: false` is required for all other `validation_status` values.
- `validated_by` and `validation_date` must be empty unless a human validation occurred.

---

## `validation_status`

Allowed values:

```text
pending_validation
validated
needs_revision
rejected
```

| Value | Meaning | Trigger | Expected action | UI severity |
|---|---|---|---|---|
| `pending_validation` | Reference exists but has not been human reviewed. | Default generation or AI summary creation. | Human reads metadata and summaries. | Warning / review needed. |
| `validated` | Human explicitly approved the reference interpretation and summaries. | Validation button, local tool or backend action. | Keep displayed as trusted by reviewer. | Success. |
| `needs_revision` | Human found an issue requiring correction. | Human review rejects current summary or metadata but keeps the reference. | Correct metadata, summary or classification, then revalidate. | Blocking warning. |
| `rejected` | Human decided this reference should not be used in the bibliography. | Human rejection action. | Keep traceable, hide by default only if UI offers such filter. | Blocking/error. |

Default generated validation state:

```json
{
  "validated": false,
  "validation_status": "pending_validation",
  "validated_by": "",
  "validation_date": ""
}
```

---

## Validation transitions

Allowed transitions:

```text
pending_validation -> validated
pending_validation -> needs_revision
pending_validation -> rejected
needs_revision -> validated
needs_revision -> rejected
rejected -> pending_validation
validated -> needs_revision
validated -> rejected
```

Rules:

- `validated -> needs_revision` is allowed when source data changes or a reviewer finds a later issue.
- `rejected -> pending_validation` is allowed when the reference is restored for review.
- Any transition to `validated` must set `validated: true`, `validated_by` and `validation_date`.
- Any transition away from `validated` must set `validated: false`.
- Agents must not perform a transition to `validated` unless the user explicitly validates.

---

## `extraction_status`

Allowed values:

```text
extracted
partially_extracted
incomplete
duplicate_suspected
manual_review_required
```

| Value | Meaning | Trigger | Expected action | UI severity |
|---|---|---|---|---|
| `extracted` | Reference block was extracted with adequate confidence. | Marker-based or clear section extraction. | Normal review. | Neutral. |
| `partially_extracted` | Reference appears usable but some block structure is uncertain. | Multi-line, ambiguous split or low-confidence parse. | Human checks source line. | Warning. |
| `incomplete` | Reference lacks enough bibliographic content. | Very short or missing key source text. | Complete from source or reject. | Blocking warning. |
| `duplicate_suspected` | Reference appears to duplicate another active reference. | Matching DOI, PMID, PMCID, URL or raw fingerprint. | Human decides merge, keep or reject. | Warning. |
| `manual_review_required` | Parser used fallback or uncertainty is high. | Identifier-only fallback or no clear bibliography section. | Human checks source before validation. | Blocking warning. |

Rules:

- `duplicate_suspected` must keep `duplicate_of` and `duplicate_confidence` when known.
- `manual_review_required`, `incomplete` and `partially_extracted` must prevent automatic validation.
- `extracted` does not imply metadata correctness or human validation.

---

## `metadata_status`

Allowed values:

```text
not_enriched
metadata_found
metadata_partial
metadata_not_found
metadata_to_verify
enrichment_failed
```

| Value | Meaning | Trigger | Expected action | UI severity |
|---|---|---|---|---|
| `not_enriched` | No enrichment lookup has been performed. | Local extract-only mode. | Optional enrichment or human review. | Neutral. |
| `metadata_found` | Metadata was found and appears consistent. | Successful metadata lookup. | Human validates final summary. | Neutral/success. |
| `metadata_partial` | Some metadata was found, but fields remain incomplete. | Partial lookup result. | Human checks missing fields. | Warning. |
| `metadata_not_found` | Lookup found no metadata. | DOI/PMID/source lookup with no result. | Human checks raw reference. | Warning. |
| `metadata_to_verify` | Metadata or identifiers contain conflicts or uncertainty. | Multiple identifiers, conflicting URLs or uncertain parse. | Human resolves conflict. | Blocking warning. |
| `enrichment_failed` | Lookup failed technically. | Network/API/parsing failure. | Retry later or continue manually. | Warning/error. |

Rules:

- `metadata_found` must not set `validated: true`.
- `metadata_to_verify` must remain visible until manually resolved.
- `enrichment_failed` must not erase extracted identifiers.

---

## `access_type`

Allowed values:

```text
open_access
abstract_only
accepted_author_version
preprint
paywalled
unknown
```

| Value | Meaning | UI severity |
|---|---|---|
| `open_access` | Full article appears openly accessible. | Success/neutral. |
| `abstract_only` | Only abstract or metadata is available. | Warning. |
| `accepted_author_version` | Accepted manuscript is available. | Neutral/info. |
| `preprint` | Preprint is available. | Info. |
| `paywalled` | Full article appears paywalled. | Warning. |
| `unknown` | Access status has not been verified. | Neutral/review. |

Rules:

- `access_type` must never imply that content has been scientifically validated.
- If only the abstract is available, use `abstract_only`.
- If access cannot be verified, use `unknown`.

---

## Blocking vs non-blocking review

Blocking for publication-ready status:

```text
validation_status: pending_validation
validation_status: needs_revision
validation_status: rejected
extraction_status: incomplete
extraction_status: manual_review_required
metadata_status: metadata_to_verify
```

Requires visible caution but may be published with clear labeling:

```text
extraction_status: partially_extracted
extraction_status: duplicate_suspected
metadata_status: metadata_partial
metadata_status: metadata_not_found
metadata_status: enrichment_failed
access_type: abstract_only
access_type: paywalled
```

Non-blocking informational states:

```text
extraction_status: extracted
metadata_status: not_enriched
metadata_status: metadata_found
access_type: open_access
access_type: accepted_author_version
access_type: preprint
access_type: unknown
```

---

## UI requirements

Generated UI must:

- display `validation_status` on cards and detail pages;
- display access classification on cards and detail pages;
- expose validation, access and theme filters on the index page;
- show extraction or metadata warnings when they require review;
- show duplicate suspicion with a link or label pointing to `duplicate_of` when available;
- never hide `needs_revision`, `rejected`, `manual_review_required` or `metadata_to_verify` by default;
- localize labels while preserving JSON enum values.

Suggested label mapping may be localized, but enum values must remain unchanged.

---

## Static validation storage

When validation is stored in browser `localStorage`, use the same field names as `references.json`:

```json
{
  "ref001": {
    "validated": true,
    "validation_status": "validated",
    "validated_by": "human",
    "validation_date": "ISO-8601 timestamp"
  }
}
```

Rules:

- localStorage state is a UI override, not persistent source-of-truth JSON;
- it must not invent metadata;
- it must be gracefully ignored if unavailable or malformed.

---

## Success criteria

An implementation satisfies SH-015 when:

- all status fields use only documented enum values;
- generated references default to `pending_validation`, `not_enriched` and `unknown` access when no stronger information exists;
- `validated` is consistent with `validation_status`;
- duplicate suspicion does not merge or delete references automatically;
- metadata uncertainty remains visible through `metadata_status` and `review_notes`;
- UI contracts require visible state labels and filters;
- localStorage validation uses `validation_date`, not a divergent field name;
- machine tests can verify enum membership and boolean/status consistency.
