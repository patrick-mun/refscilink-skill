# Contract — Navigation integration

## Purpose

This contract defines the exact strategy for adding a localized RefSciLink navigation entry to a host website during `/create_module_ref` installation.

The goal is to make every AI coding assistant modify host HTML predictably, safely and minimally while preserving the original website design and navigation behaviour.

This contract implements SH-009.

---

## Core principles

- Preserve the host website structure, content and visual identity.
- Modify the selected HTML entry point only after backup.
- Never duplicate an existing RefSciLink navigation entry.
- Prefer existing navigation patterns over imposing a RefSciLink-specific design.
- Use the detected host language for the visible label.
- Use project-relative static-hosting-compatible links.
- Do not add inline CSS or inline JavaScript.
- Do not introduce frameworks or dependencies.
- Keep modifications minimal and easy to review.
- Report clearly when navigation integration is skipped, partial or requires manual review.

---

## Inputs

Navigation integration must use these inputs when available:

| Input | Source |
|---|---|
| HTML entry point | `refscilink.config.json` `source.html_entrypoint`, user choice or project inspection |
| Display mode | `refscilink.config.json` `display.mode` or user choice |
| Integration mode | `refscilink.config.json` `display.navigation_integration` |
| Navigation target | `refscilink.config.json` `display.navigation_target` |
| Navigation label | `refscilink.config.json` `display.navigation_label` or detected language |
| Detected language | host HTML, metadata, visible text or config |
| Existing theme/style | host HTML and CSS inspection |

If config and direct user instruction conflict, the current user instruction takes priority.

---

## Controlled integration modes

Allowed `display.navigation_integration` values:

```text
auto
navbar
floating_button
manual
skip
```

Meaning:

| Value | Meaning |
|---|---|
| `auto` | Detect the best safe integration strategy. |
| `navbar` | Insert into an existing navigation container. |
| `floating_button` | Add a safe RefSciLink-scoped floating link when no navigation is usable. |
| `manual` | Do not modify host HTML; report the recommended snippet. |
| `skip` | Do not add navigation integration. |

Allowed `display.mode` values from `refscilink.config.json`:

```text
page
panel
both
none
```

If `display.mode` is `none`, navigation integration must be skipped unless the user explicitly requests a link.

---

## Default target and labels

Default target:

```text
data/reference_bibliographique/index_ref.html
```

Default labels:

| Language | Label |
|---|---|
| `fr` | `Références` |
| `en` | `References` |
| other or unknown | `References` |

If the host site uses a different language and the agent can infer a better localized label, it may use that label and report it.

---

## Entry point selection

Use this priority order:

1. explicit user-selected HTML file;
2. `refscilink.config.json` `source.html_entrypoint`;
3. single project-root `index.html`;
4. most likely site entry point discovered by inspection;
5. ask the user when multiple plausible entry points exist.

If no HTML entry point exists:

- create the RefSciLink module;
- skip navigation integration;
- report that no HTML entry point was found.

If several `index.html` files exist and no config or user selection resolves ambiguity, ask which file should be modified.

---

## Detection strategy for existing navigation

Inspect the selected HTML entry point for existing navigation targets in this order:

1. semantic `<nav>` elements;
2. elements with `role="navigation"`;
3. common navigation containers such as `.navbar`, `.nav`, `.nav-links`, `.menu`, `.site-nav`, `.header-nav`;
4. header link groups inside `<header>`;
5. visible lists of internal links;
6. hero or header action groups only if they function as primary navigation.

Prefer containers that already contain multiple `<a>` links.

Do not insert into:

- footer-only navigation unless it is the only navigation and the user agrees;
- breadcrumb trails;
- pagination controls;
- social link lists;
- external-link groups;
- generated RefSciLink pages;
- unrelated cards or content lists.

---

## Duplicate detection

Before adding anything, detect existing RefSciLink navigation entries.

Treat a link as existing if any of these are true:

- `href` points to `data/reference_bibliographique/index_ref.html`;
- `href` points to a normalized equivalent of the configured navigation target;
- element has `data-refscilink-nav-link`;
- element has class `refscilink-button` or `refscilink-nav-link`;
- visible text matches a localized references label and the href points to the RefSciLink module.

If an existing entry is found:

- do not add another entry;
- optionally update the href only if clearly stale and after backup;
- report `References button: already present`.

---

## Navbar insertion rules

When adding to an existing navigation container:

1. preserve existing indentation and formatting style when practical;
2. insert after the last primary navigation link by default;
3. preserve existing link order and do not reorder host links;
4. create a real `<a>` element;
5. use the configured or localized visible label;
6. use the configured project-relative href;
7. add `data-refscilink-nav-link`;
8. reuse host link classes only when the target container clearly applies them to equivalent links;
9. add a namespaced class such as `refscilink-nav-link` or `refscilink-button` only if useful and safe.

Recommended minimal link:

```html
<a href="data/reference_bibliographique/index_ref.html" data-refscilink-nav-link>References</a>
```

If host navigation links share a class:

```html
<a href="data/reference_bibliographique/index_ref.html" class="nav-link refscilink-nav-link" data-refscilink-nav-link>References</a>
```

Only reuse host classes already used by peer navigation links. Do not invent or overwrite global host classes.

---

## Floating button fallback

Use `floating_button` only when:

- no reliable navigation container exists;
- `display.navigation_integration` is `floating_button`;
- or `auto` mode cannot safely insert into existing navigation.

Floating fallback must:

- be a real `<a>` element;
- use a namespaced class;
- use the configured project-relative href;
- include `data-refscilink-nav-link`;
- avoid inline CSS;
- rely on `assets/css/reference.css` or a host-safe scoped style already covered by the CSS contract.

Recommended snippet:

```html
<a href="data/reference_bibliographique/index_ref.html" class="refscilink-button" data-refscilink-nav-link>References</a>
```

If the host page does not load `data/reference_bibliographique/assets/css/reference.css`, the floating button should still remain usable as a plain link. Do not inject inline CSS.

---

## Manual mode

In `manual` mode:

- do not modify host HTML;
- report the exact recommended snippet;
- include the selected target and localized label;
- explain where the user can place it.

Manual mode is appropriate when:

- navigation is generated by a framework or runtime script;
- the entry point is too ambiguous;
- the host navigation structure is non-standard and risky to edit;
- the user explicitly wants manual integration.

---

## Skip mode

In `skip` mode:

- do not modify host HTML;
- still generate the RefSciLink module if requested;
- report `References button: not added`;
- include the direct URL to the bibliography page.

---

## File protection and backup rules

Before modifying the selected HTML entry point:

1. create a backup according to the project backup rules;
2. preserve original file encoding when practical;
3. make the smallest possible change;
4. do not rewrite the entire document unnecessarily;
5. do not reformat unrelated HTML;
6. do not remove comments or attributes unrelated to RefSciLink;
7. do not modify unrelated CSS or JavaScript files unless explicitly required and backed up.

Never modify host `index.html` without backup.

---

## Style rules

Navigation integration must not add inline styles:

```html
<!-- Forbidden -->
<a style="..." href="data/reference_bibliographique/index_ref.html">References</a>
```

Use this priority order for visual integration:

1. existing host navigation classes used by peer links;
2. existing host button/link classes only when semantically appropriate;
3. RefSciLink namespaced classes such as `refscilink-nav-link` or `refscilink-button`;
4. plain accessible link when styling cannot be safely inferred.

Do not overwrite global classes such as `.btn`, `.button`, `.card`, `.container`, `.nav` or `.navbar`.

---

## Accessibility rules

The inserted entry must:

- be a real `<a>` element for navigation;
- have visible text;
- remain keyboard focusable;
- not rely only on iconography;
- not remove or break existing `aria-label`, `role`, `aria-expanded` or menu semantics;
- respect mobile navigation structure when detected.

If the site uses a mobile menu toggle, insert into the same link collection used by the menu rather than creating an unreachable desktop-only link.

---

## Multi-page and generated-navigation cases

If the site has multiple pages:

- modify only the selected HTML entry point unless the user explicitly asks for all pages;
- report that other pages were not modified;
- store the selected entry point in `refscilink.config.json`.

If navigation is generated by JavaScript, templates or a framework:

- do not patch generated runtime output blindly;
- identify the source template when possible;
- if the source template is unclear, use `manual` mode and report why.

---

## Minimal before/after examples

### Existing navbar

Before:

```html
<nav class="navbar" aria-label="Navigation principale">
  <a href="#home">Accueil</a>
  <a href="#methods">Méthodes</a>
</nav>
```

After:

```html
<nav class="navbar" aria-label="Navigation principale">
  <a href="#home">Accueil</a>
  <a href="#methods">Méthodes</a>
  <a href="data/reference_bibliographique/index_ref.html" class="refscilink-nav-link" data-refscilink-nav-link>Références</a>
</nav>
```

### Existing link group with peer classes

Before:

```html
<div class="nav-links">
  <a class="nav-link" href="#home">Home</a>
  <a class="nav-link" href="#about">About</a>
</div>
```

After:

```html
<div class="nav-links">
  <a class="nav-link" href="#home">Home</a>
  <a class="nav-link" href="#about">About</a>
  <a class="nav-link refscilink-nav-link" href="data/reference_bibliographique/index_ref.html" data-refscilink-nav-link>References</a>
</div>
```

---

## Installation report fields

The final report must include:

```text
References button: added / already present / not added / manual
Navigation integration: auto / navbar / floating_button / manual / skip
Navigation target: data/reference_bibliographique/index_ref.html
Navigation label: References
HTML entry point: index.html
Backup created: yes / no
```

If integration failed or was skipped, include a short reason.

---

## Minimal success criteria

Navigation integration is acceptable only if:

- selected HTML entry point is backed up before modification;
- no duplicate RefSciLink link is created;
- inserted link uses a project-relative href;
- inserted link is a real accessible `<a>` element;
- inserted link uses localized visible text;
- host navigation order is preserved;
- unrelated HTML is not reformatted or rewritten;
- no inline CSS or inline JavaScript is added;
- no global host CSS classes are overwritten;
- the integration mode is recorded or compatible with `refscilink.config.json`;
- final report clearly states whether the button was added, already present, skipped or left for manual insertion.
