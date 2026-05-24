# Reference numbering strategy

## Purpose

This strategy defines deterministic reference ordering, human-facing numbering and stable reference IDs for `/create_module_ref`.

The goal is to keep reference links, validation state and future enrichment data stable across reruns while preserving the visible order of references from the source Markdown.

This strategy implements SH-014.

---

## Core principles

- Keep references in source Markdown appearance order.
- Use stable machine IDs for links and stored validation state.
- Use human-facing numbers for display order.
- Do not arbitrarily renumber recognized existing references on rerun.
- Preserve human validation and enrichment data when a reference is recognized again.
- Assign new IDs only to genuinely new references.
- Do not silently discard previously validated references without backup or report.

---

## Field roles

### `id`

`id` is the stable machine identifier.

Rules:

- format must be `refNNN`, where `NNN` is a zero-padded integer;
- examples: `ref001`, `ref002`, `ref010`;
- IDs must be unique inside `references.json`;
- detail page URLs must use this ID, for example `reference.html?id=ref001`;
- an existing recognized reference must keep its previous `id` on rerun.

### `number`

`number` is the human-facing display order.

Rules:

- `number` is a positive integer;
- `number` follows current Markdown appearance order;
- `number` may change on rerun if the user reorders references in Markdown;
- `number` must be unique inside active `references`;
- `number` must not be used as a persistent URL identifier.

### Legacy `numero`

`numero` is a legacy French key and must not be generated in new `references.json` files.

Migration rule:

- if an older file contains `numero`, map it to `number` during migration;
- do not preserve `numero` in newly generated output;
- report the migration if an installation report is produced.

---

## Initial generation

On first generation, assign IDs and numbers in Markdown appearance order:

```text
1st extracted reference -> id ref001, number 1
2nd extracted reference -> id ref002, number 2
3rd extracted reference -> id ref003, number 3
```

The `references` array order must match the source Markdown order.

---

## Rerun matching keys

On rerun, the tool must try to recognize existing references before assigning new IDs.

Use matching keys in this priority order:

1. normalized DOI;
2. normalized PMID;
3. normalized PMCID;
4. normalized primary URL;
5. normalized `raw_reference` fingerprint.

Rules:

- use each previous reference at most once;
- prefer identifier matches over raw-text matches;
- compare DOI, PMID and PMCID case-insensitively after normalization;
- compare URLs after trimming trailing punctuation;
- compare raw text after lowercasing, whitespace normalization and list-marker removal;
- when several previous references match the same key, keep the first unused previous reference and mark uncertainty in `review_notes`.

---

## ID reuse

When a new extracted reference matches an existing reference:

- reuse the existing `id`;
- set `number` to the current Markdown order;
- update `raw_reference` and `source_location` from the current Markdown;
- preserve human validation fields;
- preserve enrichment fields unless the new extraction provides a stronger source value;
- preserve summaries and thematic classification unless explicitly regenerated.

Human validation fields to preserve:

```json
{
  "validated": true,
  "validation_status": "validated",
  "validated_by": "human",
  "validation_date": "ISO-8601 timestamp"
}
```

Summary and classification fields to preserve when non-empty:

```text
theme
keywords
short_summary
detailed_summary
key_points
project_relevance
limitations
```

Bibliographic enrichment fields to preserve when the new extraction leaves them empty:

```text
title
authors
year
journal
publisher
volume
issue
pages
access_type
metadata_status
review_notes
```

---

## New references

When no existing reference matches:

- assign the next unused ID after the highest existing `refNNN`;
- if no previous IDs exist, start at `ref001`;
- set `number` to the current Markdown order.

Example:

```text
Previous IDs: ref001, ref002, ref004
New reference ID: ref005
```

Do not reuse gaps automatically. A gap may represent a removed or archived reference.

---

## Removed references

If a previous reference is not found in the current Markdown:

- do not include it in the active `references` array unless a future archive mode explicitly requires it;
- create a backup before overwriting the previous `references.json`;
- report removed IDs in generation metadata or installation output;
- preserve the previous JSON file in the backup so human validation data is recoverable.

Suggested metadata:

```json
{
  "numbering_strategy": "stable_ids_source_order_numbers",
  "previous_reference_count": 12,
  "reused_reference_ids": ["ref001", "ref004"],
  "new_reference_ids": ["ref013"],
  "removed_reference_ids": ["ref002"]
}
```

---

## Duplicate handling

If two active extracted references match the same DOI, PMID, PMCID, URL or raw fingerprint:

- keep both references in source order;
- assign separate IDs unless a previous exact ID match exists for both;
- set the later reference `extraction_status` to `duplicate_suspected`;
- set `duplicate_of` to the first active matching ID;
- set `duplicate_confidence` to `high` for DOI/PMID/PMCID matches and `medium` for raw-text matches;
- do not automatically merge or delete duplicates.

---

## Sorting rules

The default output order is always active source Markdown order.

Do not sort references alphabetically, by year, by DOI, by theme or by validation status during generation.

UI code may offer client-side sorting later, but generated JSON must preserve source order.

---

## Success criteria

An implementation satisfies SH-014 when:

- first generation creates sequential `refNNN` IDs and numeric `number` values;
- IDs are unique;
- numbers are unique;
- output order follows Markdown appearance order;
- rerun keeps IDs for recognized references;
- rerun updates `number` according to current Markdown order;
- new references receive IDs above the highest previous ID;
- removed previous references are reported and recoverable from backup;
- human validation and summaries are preserved for recognized references;
- legacy `numero` is not generated in new output.
