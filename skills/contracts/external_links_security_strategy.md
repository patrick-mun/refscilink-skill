# RefSciLink Contract — External Links Security Strategy

## Scope

This contract defines security rules for external links generated or rendered by RefSciLink.

It implements SH-028 and applies to:

- links rendered in `index_ref.html`;
- links rendered in `reference.html`;
- links created by `assets/js/reference.js`;
- `url`, `source_url`, `pdf_url` and DOI-derived links;
- future source, PDF, PubMed, PMCID, publisher and scientific metadata links.

---

## Core principle

External links must be safe by default.

RefSciLink must prevent unsafe opener access, avoid dangerous URL schemes and never inject untrusted URLs through HTML strings.

---

## Mandatory reading rule

Before generating or modifying external link behaviour, an assistant must read:

```text
skills/contracts/external_links_security_strategy.md
skills/contracts/reference_js_contract.md
skills/contracts/index_ref_html_contract.md
skills/contracts/reference_html_contract.md
skills/contracts/metadata_identifier_extraction_strategy.md
skills/contracts/accessibility_strategy.md
```

---

## Link categories

### Internal RefSciLink links

Internal RefSciLink links include:

- `index_ref.html`;
- `reference.html?id=...`;
- back-to-list links;
- back-to-site links;
- host navigation links to the bibliography module.

Internal links should not use `target="_blank"` by default.

### External scientific links

External scientific links include:

- `url`;
- `source_url`;
- DOI links generated as `https://doi.org/{doi}`;
- PubMed, PMCID, publisher or repository links;
- future metadata-source links.

External scientific links may open in a new tab only with safe `rel` attributes.

### External PDF links

External PDF links from `pdf_url` follow the same security rules as external scientific links.

---

## `target` and `rel` rules

Any external link that uses:

```html
target="_blank"
```

must also use:

```html
rel="noopener noreferrer"
```

Rules:

- `noopener` is required to prevent unsafe `window.opener` access;
- `noreferrer` is required by default for safer outbound navigation;
- internal links should not use `target="_blank"` unless explicitly justified;
- PDF links must use the same external link protection;
- generated HTML and JavaScript-created links must follow the same rule.

---

## URL safety rules

External URLs must be validated before use.

Allowed external protocols:

```text
http:
https:
```

Forbidden or unsafe protocols include:

```text
javascript:
data:
file:
vbscript:
blob:
```

Rules:

- empty strings are not valid external URLs;
- invalid URLs must not be assigned to `href`;
- DOI-derived URLs must be generated as `https://doi.org/{normalized_doi}`;
- if a DOI cannot produce a safe URL, display the DOI as text only;
- never inject untrusted URLs via `innerHTML`;
- use DOM APIs such as `document.createElement("a")`, `textContent` and property assignment.

---

## JavaScript rules

`reference.js` must:

- create links with `document.createElement("a")`;
- set `href` only after URL safety checks;
- set `target="_blank"` and `rel="noopener noreferrer"` for external links;
- hide or disable source links when no safe URL exists;
- avoid `window.open()` by default;
- if a future justified `window.open()` is added, it must use equivalent opener protection.

Generated JavaScript must not concatenate untrusted URLs into HTML strings.

---

## UI behaviour

When a reference has a safe external source:

- show a localized “View source” / equivalent link;
- use safe target and rel attributes;
- keep the label meaningful for assistive technology.

When no safe external source exists:

- hide the link or show a localized unavailable-source message;
- keep DOI, PMID or PMCID as text where useful;
- do not create a broken or unsafe link.

Source, PDF and DOI links must remain visually understandable as external navigation.

---

## Diagnostics

External link security checks and reports must use stable diagnostics compatible with `logging_diagnostics_strategy.md`.

Recommended diagnostic codes:

| Code | Severity | Meaning |
|---|---|---|
| `REFSCILINK_EXTERNAL_LINK_SAFE` | `success` | External links use allowed protocols and safe attributes. |
| `REFSCILINK_EXTERNAL_LINK_REL_OK` | `success` | `target="_blank"` links include `rel="noopener noreferrer"`. |
| `REFSCILINK_EXTERNAL_LINK_BLOCKED_UNSAFE_URL` | `warning` | An unsafe or invalid external URL was blocked. |
| `REFSCILINK_EXTERNAL_LINK_REVIEW_REQUIRED` | `review_required` | External link safety requires manual review. |
| `REFSCILINK_EXTERNAL_LINK_INTERNAL_TARGET_SKIPPED` | `info` | Internal link was kept in the same tab. |

---

## Validation expectations

An external-link-safe RefSciLink installation should verify:

- all external links with `target="_blank"` have `rel="noopener noreferrer"`;
- internal links do not unnecessarily open new tabs;
- JavaScript-created external links apply the same attributes;
- unsafe URL schemes are blocked or ignored;
- DOI-derived links use `https://doi.org/`;
- source links are hidden or marked unavailable when no safe URL exists.

---

## Final report requirements

The final report should state:

- whether external link security rules were followed;
- whether any unsafe links were blocked or skipped;
- whether any external link requires manual review.

---

## Success criteria

SH-028 is complete when:

- this contract is indexed in `skills/contracts/README.md`;
- `skills/create_module_ref.md` requires reading this contract before external link behaviour changes;
- diagnostic codes are added to `logging_diagnostics_strategy.md`;
- external link target, rel and URL-scheme rules are centralized here;
- tracking files mark SH-028 as validated and point to the next pending hardening task.
