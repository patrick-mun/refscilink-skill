# JSON contract — `json/references.json`

## Purpose

This contract defines the exact structure of the generated RefSciLink bibliography data file:

```text
data/reference_bibliographique/json/references.json
```

The goal is to make every AI coding assistant generate the same stable JSON format so that `reference.js`, local Node.js tools, future validators, exports and human validation workflows can rely on predictable data.

This contract implements SH-006.

---

## Core principles

- Internal JSON keys must remain English and stable across all languages.
- User-facing text values, such as summaries, may follow the detected host website language.
- AI-generated summaries must never be marked as validated by default.
- The generated file must be valid UTF-8 JSON.
- The file must use two-space indentation.
- JSON comments and trailing commas are forbidden.
- Unknown string values must be represented as empty strings, not `null`.
- Unknown arrays must be represented as empty arrays.
- Unknown objects must be represented as empty objects only when the object is optional.
- PMID and PMCID must be strings, not numbers.
- DOI must be normalized as a DOI string when possible, without `https://doi.org/`.

---

## Root structure

The official generated root structure is mandatory:

```json
{
  "metadata": {},
  "references": []
}
```

The legacy root-array structure is not allowed for new generation:

```json
[
  { "id": "ref001" }
]
```

`reference.js` may tolerate a legacy root array for backward compatibility, but the skill must always generate the official object root with `metadata` and `references`.

---

## Mandatory `metadata` object

The `metadata` object must be present and must contain at least these keys:

```json
{
  "generated_by": "RefSciLink Skill",
  "version": "0.2.0-dev",
  "schema_version": "1.0.0",
  "generated_at": "ISO-8601 timestamp",
  "language": "fr",
  "source_markdown": "bibliographie.md",
  "source_markdown_sha256": "",
  "enrichment_mode": "extract_only",
  "reference_count": 0
}
```

### Metadata field rules

| Key | Type | Rule |
|---|---:|---|
| `generated_by` | string | Must identify RefSciLink as the generator. |
| `version` | string | RefSciLink module or skill version. |
| `schema_version` | string | Contract version for `references.json`. |
| `generated_at` | string | ISO-8601 timestamp. |
| `language` | string | Detected host website language or configured language. |
| `source_markdown` | string | Markdown file analysed for references. |
| `source_markdown_sha256` | string | Optional hash of source Markdown content. Use empty string if unavailable. |
| `enrichment_mode` | string | Installation/enrichment mode used. |
| `reference_count` | number | Number of entries in `references`. |

---

## Mandatory reference object

Each item in `references` must follow this stable structure:

```json
{
  "id": "ref001",
  "number": 1,
  "raw_reference": "",
  "title": "",
  "authors": [],
  "year": "",
  "journal": "",
  "publisher": "",
  "volume": "",
  "issue": "",
  "pages": "",
  "doi": "",
  "pmid": "",
  "pmcid": "",
  "url": "",
  "pdf_url": "",
  "source_url": "",
  "access_type": "unknown",
  "theme": "unclassified",
  "keywords": [],
  "short_summary": "",
  "detailed_summary": "",
  "key_points": [],
  "project_relevance": "",
  "limitations": "",
  "validated": false,
  "validation_status": "pending_validation",
  "validated_by": "",
  "validation_date": "",
  "extraction_status": "extracted",
  "metadata_status": "not_enriched",
  "review_notes": "",
  "source_markdown": "",
  "source_location": {
    "line_start": 0,
    "line_end": 0,
    "section_title": "",
    "section_level": 0
  },
  "duplicate_of": "",
  "duplicate_confidence": ""
}
```

---

## Reference field rules

| Key | Type | Rule |
|---|---:|---|
| `id` | string | Stable unique ID such as `ref001`. |
| `number` | number | Human-facing order number. |
| `raw_reference` | string | Original extracted reference string. |
| `title` | string | Article, book, chapter or source title. |
| `authors` | array of strings | Authors as display strings. No complex author objects in this contract version. |
| `year` | string | Year as string to preserve uncertain values. |
| `journal` | string | Journal, book series or source container. |
| `publisher` | string | Publisher when available. |
| `volume` | string | Volume when available. |
| `issue` | string | Issue when available. |
| `pages` | string | Page range or article number. |
| `doi` | string | DOI normalized without URL prefix when possible. |
| `pmid` | string | PubMed ID as string. |
| `pmcid` | string | PubMed Central ID as string, including `PMC` prefix when present. |
| `url` | string | Main source URL. |
| `pdf_url` | string | Direct PDF URL when available. |
| `source_url` | string | Metadata or publisher source URL when different from `url`. |
| `access_type` | string | Must use one of the allowed controlled values. |
| `theme` | string | Thematic group or `unclassified`. |
| `keywords` | array of strings | Optional keywords. |
| `short_summary` | string | Short summary in detected host language when generated. |
| `detailed_summary` | string | Detailed summary in detected host language when generated. |
| `key_points` | array of strings | Main points. |
| `project_relevance` | string | Why the reference matters for the host project. |
| `limitations` | string | Limits, caveats or uncertainty. |
| `validated` | boolean | Must be `false` by default. |
| `validation_status` | string | Must use one of the allowed controlled values. |
| `validated_by` | string | Empty until human validation. |
| `validation_date` | string | Empty until human validation. |
| `extraction_status` | string | Must use one of the allowed controlled values. |
| `metadata_status` | string | Must use one of the allowed controlled values. |
| `review_notes` | string | Notes for manual review. |
| `source_markdown` | string | Source Markdown path for this reference. |
| `source_location` | object | Location of the reference in the Markdown source. |
| `duplicate_of` | string | ID of suspected canonical duplicate, or empty string. |
| `duplicate_confidence` | string | Optional confidence label or score string. |

---

## Author representation

`authors` must be an array of strings:

```json
"authors": [
  "Dupont A.",
  "Martin B."
]
```

Do not generate complex author objects in this contract version.

Forbidden for this contract version:

```json
"authors": [
  {
    "family": "Dupont",
    "given": "Alice"
  }
]
```

Complex author objects may be introduced later in a new schema version if required.

---

## Stable IDs and ordering

The detailed normative strategy is externalized in:

```text
skills/contracts/reference_numbering_strategy.md
```

IDs and numbers must be generated in Markdown appearance order:

```text
ref001, ref002, ref003...
1, 2, 3...
```

Rules:

- `id` must be unique inside the file.
- `number` must be unique inside the file.
- `references` array order must follow appearance order in the source Markdown.
- On rerun, do not renumber existing recognized references arbitrarily.
- If a reference is removed from the Markdown, do not silently delete human validation data without backup.

---

## Controlled values

The detailed lifecycle strategy for `validation_status`, `extraction_status`, `metadata_status` and `access_type` is externalized in:

```text
skills/contracts/reference_status_lifecycle_strategy.md
```

### `access_type`

Allowed values:

```text
open_access
abstract_only
accepted_author_version
preprint
paywalled
unknown
```

Meaning:

| Value | Meaning |
|---|---|
| `open_access` | Full article is openly accessible. |
| `abstract_only` | Only abstract or metadata is accessible. |
| `accepted_author_version` | Accepted author manuscript is accessible. |
| `preprint` | Preprint is accessible. |
| `paywalled` | Full article appears paywalled. |
| `unknown` | Access status not verified. |

### `validation_status`

Allowed values:

```text
pending_validation
validated
rejected
needs_revision
```

Default:

```json
{
  "validated": false,
  "validation_status": "pending_validation"
}
```

### `extraction_status`

Allowed values:

```text
extracted
partially_extracted
incomplete
duplicate_suspected
manual_review_required
```

### `metadata_status`

Allowed values:

```text
not_enriched
metadata_found
metadata_partial
metadata_not_found
metadata_to_verify
enrichment_failed
```

---

## Source location object

`source_location` must use this structure:

```json
"source_location": {
  "line_start": 0,
  "line_end": 0,
  "section_title": "",
  "section_level": 0
}
```

Rules:

- `line_start` and `line_end` are 1-based when known.
- Use `0` when line numbers are unavailable.
- `section_title` stores the detected bibliography section title when known.
- `section_level` stores the Markdown heading level when known.

---

## Duplicate handling

Do not automatically delete suspected duplicates.

If a duplicate is suspected:

```json
{
  "extraction_status": "duplicate_suspected",
  "duplicate_of": "ref001",
  "duplicate_confidence": "high"
}
```

Human review must decide whether the duplicate should be merged, removed or preserved.

---

## Human validation rules

For allowed validation transitions and UI expectations, apply:

```text
skills/contracts/reference_status_lifecycle_strategy.md
```

AI-generated summaries must never be considered human-validated.

Default generated state:

```json
{
  "validated": false,
  "validation_status": "pending_validation",
  "validated_by": "",
  "validation_date": ""
}
```

After explicit human validation:

```json
{
  "validated": true,
  "validation_status": "validated",
  "validated_by": "human",
  "validation_date": "ISO-8601 timestamp"
}
```

If the summary is rejected or requires correction, use:

```json
{
  "validated": false,
  "validation_status": "needs_revision"
}
```

or:

```json
{
  "validated": false,
  "validation_status": "rejected"
}
```

---

## Compatibility with `reference.js`

`reference.js` must read the official structure:

```json
{
  "metadata": {},
  "references": []
}
```

It may tolerate the legacy root-array format only as a backward-compatible input format.

The skill must not generate legacy root arrays.

---

## Normalization rules

- DOI should be stored as `10.xxxx/yyyy`, not as `https://doi.org/10.xxxx/yyyy`, when possible.
- PMID must be stored as a string.
- PMCID must be stored as a string and should preserve the `PMC` prefix when known.
- URLs must be strings.
- Empty unknown URL fields must use `""`.
- `authors`, `keywords` and `key_points` must always be arrays.
- Do not localize internal keys.
- Do not use French keys such as `titre`, `auteurs`, `resume`, `validation_humaine`.

---

## Minimal generated example

```json
{
  "metadata": {
    "generated_by": "RefSciLink Skill",
    "version": "0.2.0-dev",
    "schema_version": "1.0.0",
    "generated_at": "2026-05-24T12:00:00+04:00",
    "language": "fr",
    "source_markdown": "bibliographie.md",
    "source_markdown_sha256": "",
    "enrichment_mode": "extract_only",
    "reference_count": 1
  },
  "references": [
    {
      "id": "ref001",
      "number": 1,
      "raw_reference": "Doe J. Example article. Journal. 2024. doi:10.0000/example.",
      "title": "Example article",
      "authors": ["Doe J."],
      "year": "2024",
      "journal": "Journal",
      "publisher": "",
      "volume": "",
      "issue": "",
      "pages": "",
      "doi": "10.0000/example",
      "pmid": "",
      "pmcid": "",
      "url": "",
      "pdf_url": "",
      "source_url": "",
      "access_type": "unknown",
      "theme": "unclassified",
      "keywords": [],
      "short_summary": "",
      "detailed_summary": "",
      "key_points": [],
      "project_relevance": "",
      "limitations": "",
      "validated": false,
      "validation_status": "pending_validation",
      "validated_by": "",
      "validation_date": "",
      "extraction_status": "extracted",
      "metadata_status": "not_enriched",
      "review_notes": "",
      "source_markdown": "bibliographie.md",
      "source_location": {
        "line_start": 42,
        "line_end": 42,
        "section_title": "Références",
        "section_level": 2
      },
      "duplicate_of": "",
      "duplicate_confidence": ""
    }
  ]
}
```

---

## Minimal success criteria

A generated `references.json` is acceptable only if:

- the root is an object with `metadata` and `references`;
- `references` is an array;
- every reference has a unique `id`;
- every reference has a unique `number`;
- every reference includes `raw_reference`, `title`, `authors`, `access_type`, `validation_status`, `extraction_status` and `metadata_status`;
- controlled values match the allowed lists;
- `validated` is `false` by default;
- no internal key is localized;
- the file is valid JSON with two-space indentation;
- the file can be loaded by `reference.js`;
- the file can later be validated by `tools/schema_references.json`.
