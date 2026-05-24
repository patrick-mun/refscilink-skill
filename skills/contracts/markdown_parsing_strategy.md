# Markdown parsing strategy

## Purpose

This strategy defines how `/create_module_ref` extracts bibliographic reference blocks from a selected Markdown file.

The goal is to make extraction deterministic across AI coding assistants while preserving scientific reliability: the parser extracts source text and traceability data, but it does not invent bibliographic metadata.

This strategy implements SH-011.

---

## Core principles

- Parse the selected Markdown file line by line.
- Preserve source line numbers for every extracted reference.
- Extract reference blocks first; metadata normalization happens later.
- Do not invent missing titles, authors, journals, years or identifiers.
- Keep references in Markdown appearance order.
- Preserve raw source text in `raw_reference`.
- Stop capture at the correct Markdown boundary.
- Mark ambiguous or incomplete references for manual review instead of silently discarding them.
- Produce output compatible with `skills/contracts/references_json_contract.md`.

---

## Inputs

The parser uses:

| Input | Source |
|---|---|
| Markdown file path | user answer or `refscilink.config.json` `source.markdown_file` |
| File encoding | UTF-8 |
| Detected host language | language detection or config |
| Bibliography heading candidates | this strategy and future SH-013 boundary rules |

If no Markdown file is selected, run install-only mode and report that extraction was skipped.

---

## Line model

The parser must convert the Markdown file to a stable line model:

```json
{
  "line_number": 1,
  "raw": "1. Doe J. Example article. Journal. 2024.",
  "trimmed": "1. Doe J. Example article. Journal. 2024."
}
```

Rules:

- line numbers are 1-based;
- preserve the original raw line for source tracking;
- use normalized trimmed text only for detection;
- do not alter punctuation inside `raw_reference` except when removing list markers;
- handle LF and CRLF line endings.

---

## Bibliography section detection

Start capturing after a Markdown heading that clearly indicates a bibliography section.

Initial accepted headings:

```text
References
Bibliography
Sources
Bibliographic references
Literature cited
Références
Références bibliographiques
Bibliographie
Sources
```

Heading syntax:

```text
## Références bibliographiques
### References
```

Rules:

- accept heading levels 1 to 6;
- compare headings case-insensitively;
- trim punctuation such as trailing `:` when matching;
- store `section_title` without leading `#`;
- store `section_level` as the heading level.

If no bibliography heading is found, the parser may use DOI/PMID/URL fallback extraction and must report that no bibliography section was detected.

---

## Section stop rules

Once a bibliography heading is found, capture until:

- another Markdown heading at the same or higher level is reached;
- end of file is reached.

Example:

```md
## Références
1. Doe J. Example. 2024.

## Annexes
This line must not be captured.
```

If a lower-level heading appears inside the bibliography section, keep capturing unless future SH-013 boundary rules define a stricter stop condition.

---

## Reference start patterns

A new reference block starts when a captured line matches one of these patterns:

```text
- Reference text
* Reference text
+ Reference text
1. Reference text
1) Reference text
[1] Reference text
[12] Reference text
```

The parser must remove only the marker from `raw_reference`, not meaningful bibliographic punctuation.

Accepted marker regex baseline:

```text
^\s*(?:[-*+]\s+|\d+[.)]\s+|\[[0-9]+\]\s*)
```

---

## Multi-line continuation rules

Lines following a reference start belong to the same reference when:

- they are non-empty;
- they do not start a new reference;
- they occur before the section stop boundary.

Continuation lines should be joined with a single space in `raw_reference`.

Example:

```md
1. Doe J. Long article title.
   Journal Name. 2024.
   doi:10.0000/example.
```

Extracted `raw_reference`:

```text
Doe J. Long article title. Journal Name. 2024. doi:10.0000/example.
```

`source_location.line_start` must be the first line of the reference block and `line_end` the last continuation line.

---

## Blank line rules

Blank lines inside a bibliography section:

- may separate references;
- should not be included in `raw_reference`;
- should not end capture by themselves.

If free-form paragraph references are used without list markers, a blank line may separate reference blocks.

---

## Free-form reference fallback

If a bibliography section contains no list or numbered markers, the parser may split references by blank-line-separated paragraphs.

Use this fallback only when:

- the bibliography section exists;
- no marker-based references were found;
- paragraphs contain bibliographic signals such as DOI, PMID, PMCID, URL, year, journal-like punctuation or author-like names.

If confidence is low, extract the paragraph but set:

```json
"extraction_status": "manual_review_required"
```

---

## DOI/PMID/URL fallback outside sections

If no bibliography section is detected, the parser may scan the entire Markdown file for lines containing:

- DOI;
- PMID;
- PMCID;
- URL.

Rules:

- use each matching line as a candidate reference block;
- preserve line numbers;
- set `section_title` to an empty string;
- set `section_level` to `0`;
- set `extraction_status` to `manual_review_required` unless the line is clearly bibliographic.

This fallback must not capture unrelated TODO lines unless they contain a strong bibliographic identifier.

---

## Extraction output

Each extracted block must provide enough information to build a `references.json` item:

```json
{
  "raw_reference": "",
  "line_start": 0,
  "line_end": 0,
  "section_title": "",
  "section_level": 0,
  "extraction_status": "extracted"
}
```

When normalized into `references.json`, this maps to:

```json
"source_location": {
  "line_start": 42,
  "line_end": 44,
  "section_title": "Références",
  "section_level": 2
}
```

---

## Extraction status rules

Use controlled values from `references_json_contract.md`:

```text
extracted
partially_extracted
incomplete
duplicate_suspected
manual_review_required
```

Recommended use:

| Status | When to use |
|---|---|
| `extracted` | Reference block is structurally clear. |
| `partially_extracted` | Block is clear but metadata signals are weak. |
| `incomplete` | Block appears intentionally incomplete. |
| `duplicate_suspected` | Block appears to duplicate another extracted reference. |
| `manual_review_required` | Parser confidence is low or fallback extraction was used. |

---

## Stable ordering and IDs

The parser must keep extracted blocks in Markdown appearance order.

The normalizer must generate IDs from that order:

```text
ref001
ref002
ref003
```

Rules:

- do not sort alphabetically;
- do not group by DOI or theme during parsing;
- do not remove suspected duplicates automatically;
- suspected duplicates remain separate entries with duplicate metadata fields.

---

## Non-invention rules

The parser must not invent:

- title;
- authors;
- journal;
- year;
- DOI;
- PMID;
- PMCID;
- access status;
- summary fields.

The parser may detect literal identifiers that are present in the text, but scientific metadata enrichment belongs to later steps.

---

## Examples

### Numbered references

Input:

```md
## References

1. Doe J. Example article. Journal. 2024. doi:10.0000/example.
2. Smith A. Another article. 2023.
```

Expected blocks:

```text
Doe J. Example article. Journal. 2024. doi:10.0000/example.
Smith A. Another article. 2023.
```

### Bracketed references

Input:

```md
## Bibliographie

[1] Dupont A. Article exemple. Revue. 2020.
[2] Martin B. Autre référence. 2021.
```

Expected blocks:

```text
Dupont A. Article exemple. Revue. 2020.
Martin B. Autre référence. 2021.
```

### Section boundary

Input:

```md
## Références

- Doe J. Example. 2024.

## Notes

- This note must not be captured.
```

Expected result:

```text
Only one reference is extracted.
```

---

## Minimal success criteria

Markdown parsing is acceptable only if:

- line numbers are preserved;
- bibliography heading detection is case-insensitive;
- capture stops at a same-or-higher-level heading;
- numbered, bullet and bracketed references are supported;
- multi-line references are joined correctly;
- unrelated sections after the bibliography are not captured;
- fallback DOI/PMID/URL extraction is reported as fallback;
- output preserves Markdown appearance order;
- `raw_reference` contains source text without list markers;
- `source_location` can be populated for every extracted reference;
- ambiguous or incomplete references are marked for review instead of being silently dropped;
- no bibliographic metadata is invented by the parser.
