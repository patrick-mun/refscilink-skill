# Basic Site Example

## Purpose

This folder contains the official demonstration website used to validate RefSciLink installations.

The site intentionally contains:

- a visual identity;
- a navigation bar;
- buttons;
- cards;
- a dedicated CSS theme;
- a Markdown bibliography file.

The goal is to verify that the RefSciLink skill can:

1. detect bibliographic references;
2. generate the bibliography module;
3. insert a "Références" button;
4. adapt the generated interface to the host website theme;
5. preserve the existing design.

---

## Files

```txt
index.html
style.css
bibliographie.md
```

---

## Run locally

### Python

```bash
cd examples/basic-site
python3 -m http.server 8000
```

Open:

```txt
http://localhost:8000
```

---

## RefSciLink validation scenario

Run the installation skill:

```text
/create_module_ref
```

When asked for a bibliography source file, select:

```text
bibliographie.md
```

Recommended display mode:

```text
Page dédiée + bouton Références
```

Recommended theme mode:

```text
Auto + Override
```

---

## Expected outcome

The skill should:

- detect the bibliography section;
- extract the references;
- create `data/reference_bibliographique/`;
- generate `references.json`;
- generate `theme_refscilink.json`;
- add a visible "Références" entry to the site;
- reuse the site's turquoise scientific theme.

See:

```txt
expected_output/expected_tree.md
expected_output/expected_result.md
```

for validation details.
