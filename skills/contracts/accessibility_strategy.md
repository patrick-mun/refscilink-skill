# RefSciLink Contract — Accessibility Strategy

## Scope

This contract defines minimum accessibility requirements for generated RefSciLink pages and browser behaviour.

It implements SH-026 and applies to:

- `index_ref.html`;
- `reference.html`;
- `assets/css/reference.css`;
- `assets/js/reference.js`;
- host navigation integration;
- future generated UI elements.

---

## Core principle

RefSciLink must be usable with keyboard navigation, screen readers and readable visual states.

Generated UI must prefer semantic HTML over ARIA-heavy custom widgets.

Accessibility requirements are not optional styling polish; they are part of the generated module contract.

---

## Mandatory reading rule

Before generating or modifying accessible UI behaviour, an assistant must read:

```text
skills/contracts/accessibility_strategy.md
skills/contracts/index_ref_html_contract.md
skills/contracts/reference_html_contract.md
skills/contracts/reference_js_contract.md
skills/contracts/reference_css_contract.md
skills/contracts/navigation_integration_contract.md
```

---

## Semantic HTML rules

Generated pages must:

- use `<main>` for primary page content;
- use `<header>` for page introduction when present;
- use `<section>` with headings for logical content blocks;
- use `<nav>` or `role="navigation"` only for navigation areas;
- keep heading hierarchy coherent;
- use real `<button type="button">` elements for actions;
- use real `<a href="...">` elements for navigation and external links;
- avoid clickable `<div>`, `<span>` or non-interactive elements.

Do not add ARIA roles that duplicate native semantics without a clear reason.

---

## Labels and names

All interactive controls must have an accessible name.

Rules:

- filters must have visible `<label>` elements or equivalent accessible labels;
- search inputs must expose a localized label;
- validation filters must expose their purpose;
- copy, source and validate actions must have localized text or `aria-label`;
- icon-only buttons are forbidden unless they include an accessible label;
- generated navigation links must use meaningful visible text.

---

## Dynamic state rules

Generated pages must expose dynamic states accessibly:

- loading, empty and non-critical count updates use `aria-live="polite"`;
- blocking errors use `role="alert"`;
- status changes after validation should update visible text;
- status badges must include text, not color alone;
- metadata review warnings must remain visible and textual;
- error messages must be localized where possible and understandable without developer tools.

---

## Keyboard rules

The generated UI must:

- keep all controls reachable by keyboard;
- preserve a logical tab order;
- avoid positive `tabindex` values;
- not trap focus;
- not require mouse hover to reveal essential controls;
- support activation through native button/link behaviour;
- keep copy and validate actions keyboard-accessible.

If future modal or drawer UI is added, it must define focus management before implementation.

---

## Focus visibility

Focus indicators must remain visible.

Rules:

- do not remove outlines without an equally visible replacement;
- use `:focus-visible` where practical;
- focus style must be scoped to `.refscilink-page` or namespaced controls;
- focus contrast must be visible against module backgrounds;
- host focus styles may be reused when they remain visible.

---

## Readability and visual accessibility

Generated UI must:

- preserve readable font sizes;
- avoid text-only-in-color status communication;
- provide visible differences for success, warning, error and review-required states;
- support high-contrast host styles when possible;
- avoid low-contrast placeholder-only labels;
- keep line length and spacing readable for summaries;
- respect `prefers-reduced-motion`.

Animations must be optional, subtle and non-essential.

---

## Page-specific requirements

### `index_ref.html`

The bibliography index page must provide:

- semantic page structure;
- labeled search and filter controls;
- live result count or summary area;
- accessible loading, empty and error states;
- reference cards with readable titles and textual status badges;
- real buttons or links for read, copy, source and validation actions.

### `reference.html`

The detail page must provide:

- semantic detail content;
- accessible metadata list structure;
- readable summary sections;
- accessible copy and validation controls;
- `role="alert"` for blocking errors;
- a keyboard-accessible back link.

### `reference.js`

The JavaScript must:

- create real buttons and links;
- preserve labels defined by the HTML contract;
- update live regions when state changes;
- avoid non-semantic click targets;
- preserve focus behaviour when practical;
- gracefully report missing DOM targets or failed JSON loading.

### `reference.css`

The CSS must:

- keep visible focus states;
- include reduced-motion handling when motion is used;
- scope accessibility styling to RefSciLink selectors;
- avoid global resets that damage host accessibility;
- keep status colors paired with text labels.

---

## Diagnostics

Accessibility checks and reports must use stable diagnostics compatible with `logging_diagnostics_strategy.md`.

Recommended diagnostic codes:

| Code | Severity | Meaning |
|---|---|---|
| `REFSCILINK_ACCESSIBILITY_SEMANTIC_HTML_OK` | `success` | Required semantic HTML structure is present. |
| `REFSCILINK_ACCESSIBILITY_LABELS_OK` | `success` | Interactive controls have accessible labels. |
| `REFSCILINK_ACCESSIBILITY_KEYBOARD_OK` | `success` | Controls are keyboard-accessible. |
| `REFSCILINK_ACCESSIBILITY_FOCUS_VISIBLE` | `success` | Visible focus states are defined. |
| `REFSCILINK_ACCESSIBILITY_WARNING` | `warning` | An accessibility concern requires review. |
| `REFSCILINK_ACCESSIBILITY_REVIEW_REQUIRED` | `review_required` | Accessibility cannot be verified automatically and needs human review. |

---

## Validation expectations

An accessible RefSciLink installation should verify:

- generated pages contain a `<main>` region;
- controls are native buttons, links, inputs or selects;
- filters have labels;
- dynamic states include live regions or alerts;
- focus-visible styles exist;
- status badges contain text labels;
- no generated action depends only on mouse interaction.

Automated checks are helpful but do not replace human accessibility review.

---

## Final report requirements

The final report should state:

- whether accessibility requirements were followed;
- any skipped or uncertain accessibility checks;
- whether keyboard navigation and focus visibility are expected to work;
- any manual review recommendations.

---

## Success criteria

SH-026 is complete when:

- this contract is indexed in `skills/contracts/README.md`;
- `skills/create_module_ref.md` requires reading this contract before accessible UI behaviour changes;
- diagnostic codes are added to `logging_diagnostics_strategy.md`;
- accessibility requirements are centralized here;
- tracking files mark SH-026 as validated and point to SH-027 as the next task.
