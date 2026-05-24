# Metadata identifier extraction strategy

## Purpose

This strategy defines how `/create_module_ref` detects and normalizes DOI, PMID, PMCID and URL values from extracted Markdown reference blocks.

The goal is to make identifier extraction deterministic without performing scientific metadata enrichment or inventing missing identifiers.

This strategy implements SH-012.

---

## Core principles

- Extract only identifiers literally present in the reference text.
- Do not query external APIs in this step.
- Do not infer missing DOI, PMID, PMCID or URLs from titles or metadata.
- Normalize identifiers into stable JSON string fields.
- Preserve the original reference text in `raw_reference`.
- Prefer explicit identifiers over generic URLs.
- Record uncertainty in `metadata_status` and `review_notes`.
- Keep output compatible with `skills/contracts/references_json_contract.md`.

---

## Target JSON fields

Identifier extraction maps to these reference fields:

```json
{
  "doi": "",
  "pmid": "",
  "pmcid": "",
  "url": "",
  "pdf_url": "",
  "source_url": "",
  "metadata_status": "not_enriched",
  "review_notes": ""
}
```

Unknown values must be empty strings, not `null`.

---

## DOI detection

Recognize DOI values in these forms:

```text
doi:10.1038/nature15393
doi: 10.1038/nature15393
DOI 10.1038/nature15393
https://doi.org/10.1038/nature15393
http://dx.doi.org/10.1038/nature15393
10.1038/nature15393
```

Baseline DOI pattern:

```text
10\.\d{4,9}/[-._;()/:A-Z0-9]+
```

Rules:

- matching is case-insensitive;
- store DOI without `https://doi.org/` or `http://dx.doi.org/`;
- store DOI without leading `doi:` or `DOI`;
- trim trailing punctuation such as `.`, `,`, `;`, `)`, `]`;
- preserve meaningful DOI punctuation inside the identifier;
- store as a string.

Example:

```text
https://doi.org/10.1016/j.ajhg.2017.03.004.
```

becomes:

```json
"doi": "10.1016/j.ajhg.2017.03.004"
```

---

## PMID detection

Recognize PMID values in these forms:

```text
PMID: 26432245
PMID 26432245
PubMed PMID: 26432245
pubmed:26432245
```

Rules:

- matching is case-insensitive;
- store only digits;
- store as a string, not a number;
- trim punctuation around the value;
- avoid treating years, page numbers or volumes as PMID unless an explicit PMID label is present.

Example:

```text
Nature. 2015. PMID: 26432245.
```

becomes:

```json
"pmid": "26432245"
```

---

## PMCID detection

Recognize PMCID values in these forms:

```text
PMCID: PMC1234567
PMC1234567
PMC 1234567
PubMed Central PMCID: PMC1234567
```

Rules:

- matching is case-insensitive;
- preserve or add the `PMC` prefix;
- store as a string;
- trim punctuation around the value;
- avoid matching unrelated words beginning with `pmc`.

Example:

```text
PMCID: 1234567.
```

becomes:

```json
"pmcid": "PMC1234567"
```

---

## URL detection

Recognize HTTP and HTTPS URLs:

```text
https://example.org/article
http://example.org/resource
```

Rules:

- store URLs as strings;
- trim trailing punctuation such as `.`, `,`, `;`, `)`, `]`;
- preserve query strings and fragments;
- do not store malformed URLs;
- do not invent protocol prefixes.

If a URL is a DOI URL, extract the DOI and do not store the DOI URL as the primary `url` unless no other source URL is present.

---

## PDF URL detection

A URL should be stored in `pdf_url` when:

- the path ends with `.pdf`;
- the URL contains a clear PDF download pattern;
- the reference explicitly labels it as PDF.

Examples:

```text
https://example.org/article.pdf
PDF: https://example.org/download/123
```

If a reference contains both a landing page and a PDF URL:

- store the landing page in `url`;
- store the direct PDF in `pdf_url`.

---

## URL field precedence

Use this precedence:

1. DOI extracted from DOI URL goes to `doi`;
2. direct PDF URL goes to `pdf_url`;
3. non-PDF primary article or publisher URL goes to `url`;
4. additional metadata or database URL goes to `source_url`;
5. if only DOI exists and no URL exists, `url` may be `https://doi.org/{doi}` for clickable display.

Do not duplicate the same URL in `url`, `pdf_url` and `source_url`.

---

## Multiple identifiers

If multiple identifiers of the same type are present:

- keep the first clear primary value;
- preserve additional values in `review_notes`;
- set `metadata_status` to `metadata_to_verify`.

Example `review_notes`:

```text
Multiple DOI values detected: 10.0000/a; 10.0000/b.
```

Do not delete or merge references automatically based only on repeated identifiers.

---

## Metadata status rules

Identifier extraction is not enrichment. Default remains:

```json
"metadata_status": "not_enriched"
```

Use:

```json
"metadata_status": "metadata_to_verify"
```

when:

- multiple conflicting identifiers are detected;
- an identifier appears malformed after normalization;
- only weak fallback extraction produced the reference.

Use:

```json
"metadata_status": "metadata_partial"
```

when at least one identifier is found but the reference is otherwise incomplete.

---

## Review notes

Use `review_notes` for extraction uncertainty, not for invented metadata.

Examples:

```text
Multiple URLs detected; primary URL selected automatically.
PMCID normalized from numeric value.
DOI candidate was ignored because it was malformed.
```

Leave `review_notes` empty when extraction is straightforward.

---

## Non-invention rules

This step must not:

- search CrossRef, PubMed, Europe PMC or publisher websites;
- infer DOI from title;
- infer PMID from article title;
- infer PMCID from PMID;
- classify open-access status from a URL alone unless a later access-classification step is explicitly running;
- generate summaries.

---

## Examples

### DOI label

Input:

```text
Doe J. Example article. Journal. 2024. doi:10.0000/example.
```

Output:

```json
{
  "doi": "10.0000/example",
  "url": "https://doi.org/10.0000/example"
}
```

### DOI URL and PDF URL

Input:

```text
Doe J. Example. https://doi.org/10.0000/example PDF: https://example.org/article.pdf
```

Output:

```json
{
  "doi": "10.0000/example",
  "url": "https://doi.org/10.0000/example",
  "pdf_url": "https://example.org/article.pdf"
}
```

### PMID and PMCID

Input:

```text
Smith A. Example. PMID: 12345678. PMCID: PMC9876543.
```

Output:

```json
{
  "pmid": "12345678",
  "pmcid": "PMC9876543"
}
```

---

## Minimal success criteria

Identifier extraction is acceptable only if:

- DOI is normalized without URL prefix;
- DOI URLs are recognized;
- trailing punctuation is removed from DOI, PMID, PMCID and URLs;
- PMID is extracted only from explicit PMID labels;
- PMCID preserves or adds the `PMC` prefix;
- URL fields are strings and never `null`;
- PDF URLs are separated into `pdf_url` when clear;
- multiple conflicting identifiers are reported in `review_notes`;
- no external lookup is performed;
- no missing identifier is invented;
- output remains compatible with `references_json_contract.md`.
