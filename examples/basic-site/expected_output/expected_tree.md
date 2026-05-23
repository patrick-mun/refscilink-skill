# Expected Tree After RefSciLink Installation

This document describes the expected file structure after running:

```text
/create_module_ref
```

using:

```text
examples/basic-site/bibliographie.md
```

as the source bibliography file.

---

## Expected structure

```txt
examples/
└── basic-site/
    ├── index.html
    ├── style.css
    ├── bibliographie.md
    ├── README.md
    │
    ├── expected_output/
    │   ├── expected_tree.md
    │   └── expected_result.md
    │
    └── data/
        └── reference_bibliographique/
            ├── index_ref.html
            ├── reference.html
            │
            ├── assets/
            │   ├── css/
            │   │   └── reference.css
            │   └── js/
            │       └── reference.js
            │
            ├── json/
            │   ├── references.json
            │   └── theme_refscilink.json
            │
            └── tools/
                ├── build_references.mjs
                ├── prompt_recherche_ia.md
                └── schema_references.json
```

---

## Mandatory generated files

### references.json

Must contain extracted references.

Expected count:

```text
>= 10 references detected
```

### theme_refscilink.json

Must contain a detected theme profile.

Expected values close to:

```json
{
  "primary": "#007B83",
  "secondary": "#00A6B2",
  "radius": "18px"
}
```

### index_ref.html

Must provide:

- bibliography list;
- filters;
- validation controls;
- source links.

### reference.html

Must provide:

- detailed reference view;
- metadata;
- summaries;
- validation status.

---

## Validation result

If all files above exist and are usable, the installation structure test is considered successful.
