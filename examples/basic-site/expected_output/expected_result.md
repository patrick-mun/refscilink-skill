# Expected Result Validation Checklist

This checklist is used to validate a RefSciLink installation performed on:

```text
examples/basic-site/
```

---

## Installation report

Expected final report should mention:

- analysed Markdown file;
- display mode;
- theme mode;
- number of references detected;
- number of references requiring review;
- generated files.

Validation:

| Check | Status |
|---|---|
| Installation report produced | ☐ |
| Markdown file correctly identified | ☐ |
| Theme detection report produced | ☐ |

---

## Bibliography extraction

Expected references:

| Type | Expected |
|---|---|
| DOI references | >= 5 |
| PMID references | >= 1 |
| URL references | >= 1 |
| Preprint references | >= 1 |
| Incomplete references flagged | >= 1 |

Validation:

| Check | Status |
|---|---|
| References detected | ☐ |
| DOI values extracted | ☐ |
| PMID values extracted | ☐ |
| URL values extracted | ☐ |
| Incomplete reference flagged | ☐ |

---

## Theme detection

Expected values from style.css:

| Item | Expected value |
|---|---|
| Primary color | #007B83 |
| Secondary color | #00A6B2 |
| Radius | 18px |
| Theme style | scientific turquoise |
|
Validation:

| Check | Status |
|---|---|
| Primary color detected | ☐ |
| Secondary color detected | ☐ |
| Radius detected | ☐ |
| Theme file generated | ☐ |

---

## User interface

Expected behaviour:

| Check | Status |
|---|---|
| Références button visible | ☐ |
| Existing navigation preserved | ☐ |
| Existing layout preserved | ☐ |
| Bibliography page accessible | ☐ |
| Detailed reference page accessible | ☐ |
| Filters visible | ☐ |
| Validation controls visible | ☐ |

---

## Visual integration

Expected behaviour:

| Check | Status |
|---|---|
| Module visually consistent with host site | ☐ |
| No global CSS breakage | ☐ |
| Responsive layout preserved | ☐ |
| Existing buttons unaffected | ☐ |
| Existing cards unaffected | ☐ |

---

## Success criteria

The example installation is considered successful when:

- bibliography extraction works;
- theme detection works;
- references pages are generated;
- host design is preserved;
- navigation integration works;
- generated JSON files are valid.

When all sections are validated, the roadmap item:

```text
examples/basic-site/
```

can be marked:

```text
Oui
```
