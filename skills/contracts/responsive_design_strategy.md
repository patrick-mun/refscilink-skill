# RefSciLink Contract — Responsive Design Strategy

## Scope

This contract defines minimum responsive behaviour for generated RefSciLink pages and styles.

It implements SH-027 and applies to:

- `index_ref.html`;
- `reference.html`;
- `assets/css/reference.css`;
- generated reference cards;
- filters and action controls;
- future RefSciLink UI components.

---

## Core principle

RefSciLink must remain readable and usable from desktop down to narrow mobile screens without taking control of the host site's global responsive design.

Responsive rules must be scoped to RefSciLink selectors and must not modify host layout primitives.

---

## Mandatory reading rule

Before generating or modifying responsive layout, an assistant must read:

```text
skills/contracts/responsive_design_strategy.md
skills/contracts/reference_css_contract.md
skills/contracts/index_ref_html_contract.md
skills/contracts/reference_html_contract.md
skills/contracts/accessibility_strategy.md
skills/contracts/github_pages_compatibility_strategy.md
```

---

## Target viewport ranges

RefSciLink must remain usable on:

| Range | Expected behaviour |
|---|---|
| Desktop | Comfortable readable layout, optional multi-column areas only when useful. |
| Tablet | Controls and cards may wrap; no clipped actions. |
| Mobile | Single-column reading flow down to approximately `320px`. |

The exact breakpoints may adapt to the host design, but generated CSS must include at least one mobile breakpoint.

Recommended baseline:

```css
@media (max-width: 640px) {
  /* RefSciLink-scoped responsive rules. */
}
```

---

## Global responsive rules

Generated responsive CSS must:

- remain scoped under `.refscilink-*` or `.refscilink-page`;
- avoid global resets or host layout overrides;
- avoid fixed widths that can overflow mobile screens;
- use `max-width`, `minmax(0, 1fr)`, `flex-wrap` or single-column grids where appropriate;
- avoid horizontal scrolling on standard mobile widths;
- preserve readable spacing without wasting narrow screens;
- handle long titles, DOI strings, URLs and author lists without layout breakage.

Root-relative or deployment path concerns are handled by `github_pages_compatibility_strategy.md`; responsive rules must not introduce deployment-specific assumptions.

---

## `index_ref.html` layout expectations

The bibliography index page must support:

- filters that stack or wrap on narrow screens;
- search input that remains full-width or comfortably readable on mobile;
- reference cards readable in a single column;
- badges that wrap without overlapping text;
- card actions that wrap or stack without clipping;
- loading, empty and error states that remain visible on mobile.

The index page must not require horizontal scrolling to access filters, cards or actions.

---

## `reference.html` layout expectations

The detail page must support:

- readable metadata sections on mobile;
- metadata labels and values stacking when needed;
- summaries without overflowing the viewport;
- copy and validation actions that wrap or stack;
- long DOI, PMID, PMCID, URL and source links that wrap safely;
- a back link that remains visible and keyboard-accessible.

---

## Control and touch rules

Interactive controls must:

- keep sufficient padding for touch use;
- avoid cramped inline-only layouts on mobile;
- preserve visible focus states;
- keep labels close to their controls;
- avoid relying on hover-only interactions;
- keep copy, source and validation actions discoverable.

Touch target sizing should follow common accessibility expectations where practical, without forcing a fixed design that conflicts with the host site.

---

## Text overflow rules

Generated CSS must protect against overflow for:

- long article titles;
- long author lists;
- DOI strings;
- URLs;
- journal names;
- review notes;
- summaries and key points.

Use properties such as:

```css
overflow-wrap: anywhere;
word-break: normal;
min-width: 0;
```

Use aggressive breaking only inside RefSciLink scopes and only for content likely to overflow.

---

## Motion and viewport rules

Responsive design must remain compatible with accessibility:

- respect `prefers-reduced-motion`;
- avoid layout animations that are required for comprehension;
- avoid scroll locking unless explicitly justified;
- do not hide essential content behind hover-only or pointer-only behaviours.

Generated pages must include a responsive viewport meta tag through their HTML contracts.

---

## Diagnostics

Responsive checks and reports must use stable diagnostics compatible with `logging_diagnostics_strategy.md`.

Recommended diagnostic codes:

| Code | Severity | Meaning |
|---|---|---|
| `REFSCILINK_RESPONSIVE_LAYOUT_OK` | `success` | Responsive layout requirements are satisfied. |
| `REFSCILINK_RESPONSIVE_MOBILE_BREAKPOINT_OK` | `success` | A RefSciLink-scoped mobile breakpoint is defined. |
| `REFSCILINK_RESPONSIVE_NO_HORIZONTAL_SCROLL` | `success` | Layout is designed to avoid horizontal scrolling. |
| `REFSCILINK_RESPONSIVE_TOUCH_TARGETS_OK` | `success` | Controls have mobile-friendly spacing. |
| `REFSCILINK_RESPONSIVE_WARNING` | `warning` | A responsive layout concern requires review. |
| `REFSCILINK_RESPONSIVE_REVIEW_REQUIRED` | `review_required` | Responsive behaviour needs manual viewport review. |

---

## Validation expectations

A responsive RefSciLink installation should verify:

- generated pages include the viewport meta tag;
- CSS includes at least one scoped mobile breakpoint;
- filters and actions can become one column;
- reference cards do not use dangerous fixed widths;
- long text can wrap;
- focus styles and labels remain usable on mobile;
- no host global responsive selectors are overwritten.

Automated checks do not replace manual viewport review on representative mobile and tablet widths.

---

## Final report requirements

The final report should state:

- whether responsive requirements were followed;
- which breakpoint strategy was used;
- whether horizontal scrolling is expected to be avoided;
- whether mobile manual review is recommended.

---

## Success criteria

SH-027 is complete when:

- this contract is indexed in `skills/contracts/README.md`;
- `skills/create_module_ref.md` requires reading this contract before responsive layout changes;
- diagnostic codes are added to `logging_diagnostics_strategy.md`;
- responsive requirements are centralized here;
- tracking files mark SH-027 as validated and point to SH-028 as the next task.
