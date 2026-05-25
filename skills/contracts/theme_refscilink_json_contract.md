# JSON contract — `json/theme_refscilink.json`

## Purpose

This contract defines the exact structure of the generated RefSciLink theme configuration file:

```text
data/reference_bibliographique/json/theme_refscilink.json
```

The goal is to make every AI coding assistant generate the same stable theme format so that `reference.css`, future theme detectors, local installers and human maintainers can rely on predictable visual configuration data.

This contract implements SH-007.

---

## Core principles

- Internal JSON keys must remain English and stable across all languages.
- The file must be valid UTF-8 JSON.
- The file must use two-space indentation.
- JSON comments and trailing commas are forbidden.
- Unknown string values must be represented as empty strings, not `null`.
- Unknown arrays must be represented as empty arrays.
- Unknown objects must be represented as empty objects only when the object is optional.
- The theme must preserve the host website visual identity before applying RefSciLink fallback values.
- The generated values must be editable by humans without changing `reference.css`.
- The file must describe visual decisions; it must not contain executable JavaScript, CSS code blocks or HTML.

---

## Root structure

The official generated root structure is mandatory:

```json
{
  "metadata": {},
  "theme_mode": "auto_override",
  "detected_from": [],
  "primary": "#007B83",
  "secondary": "#00A6B2",
  "background": "#f7fafb",
  "surface": "#ffffff",
  "text": "#102027",
  "muted": "#607d8b",
  "border": "#d8e3e7",
  "error": "#b00020",
  "success": "#176b3a",
  "font_family": "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
  "font_size_base": "16px",
  "line_height": "1.6",
  "radius": "12px",
  "button_radius": "999px",
  "card_radius": "18px",
  "shadow": "0 12px 30px rgba(0, 0, 0, 0.08)",
  "spacing_density": "normal",
  "color_scheme": "light",
  "css_variables": {},
  "manual_overrides": {},
  "detection": {},
  "notes": "Auto-detected values. Edit manually if needed."
}
```

Do not generate a root array for this file.

---

## Mandatory `metadata` object

The `metadata` object must be present and must contain at least these keys:

```json
{
  "generated_by": "RefSciLink Skill",
  "module_version": "0.2.0-dev",
  "schema_version": "1.0.0",
  "generated_at": "ISO-8601 timestamp",
  "updated_at": "ISO-8601 timestamp",
  "language": "fr",
  "source_project": "",
  "source_entrypoint": "index.html"
}
```

### Metadata field rules

| Key | Type | Rule |
|---|---:|---|
| `generated_by` | string | Must identify RefSciLink as the generator. |
| `module_version` | string | RefSciLink generated module version. |
| `schema_version` | string | Contract version for `theme_refscilink.json`. |
| `generated_at` | string | ISO-8601 timestamp. |
| `updated_at` | string | ISO-8601 timestamp for last intentional update. |
| `language` | string | Detected host website language or configured language. |
| `source_project` | string | Optional project name or root folder. Use empty string if unknown. |
| `source_entrypoint` | string | HTML entry point used for theme detection. |

---

Module versioning and legacy `version` compatibility must follow:

```text
skills/contracts/module_versioning_strategy.md
```

## Required root fields

| Key | Type | Rule |
|---|---:|---|
| `metadata` | object | Mandatory metadata object. |
| `theme_mode` | string | Must use one of the allowed controlled values. |
| `detected_from` | array of strings | Files inspected for theme detection. |
| `primary` | string | Primary accent color. |
| `secondary` | string | Secondary accent color. |
| `background` | string | Page or module background color. |
| `surface` | string | Card and panel surface color. |
| `text` | string | Main text color. |
| `muted` | string | Secondary text color. |
| `border` | string | Border color. |
| `error` | string | Error state color. |
| `success` | string | Success or validated state color. |
| `font_family` | string | CSS font-family value adapted from host site or fallback. |
| `font_size_base` | string | CSS length for base font size. |
| `line_height` | string | Unitless or CSS line-height value. |
| `radius` | string | General border radius. |
| `button_radius` | string | Button border radius. |
| `card_radius` | string | Card border radius. |
| `shadow` | string | CSS box-shadow value. |
| `spacing_density` | string | Must use one of the allowed controlled values. |
| `color_scheme` | string | Must use one of the allowed controlled values. |
| `css_variables` | object | RefSciLink CSS variable mapping generated from root fields. |
| `manual_overrides` | object | Optional human-maintained overrides preserved during regeneration. |
| `detection` | object | Human-readable detection report and confidence data. |
| `notes` | string | Short editable note for maintainers. |

---

## Controlled values

### `theme_mode`

Allowed values:

```text
auto_override
auto
manual
fallback
disabled
```

Meaning:

| Value | Meaning |
|---|---|
| `auto_override` | Host theme detected, with editable JSON overrides. |
| `auto` | Host theme detected and applied without explicit user overrides. |
| `manual` | Values were provided manually or by configuration. |
| `fallback` | Detection failed or was unavailable; RefSciLink fallback values are used. |
| `disabled` | Theme adaptation was explicitly disabled. |

### `spacing_density`

Allowed values:

```text
compact
normal
comfortable
spacious
```

### `color_scheme`

Allowed values:

```text
light
dark
auto
unknown
```

---

## Color and CSS value rules

Color fields must use stable CSS color strings:

- prefer hexadecimal colors such as `#007B83`;
- allow `rgb()`, `rgba()`, `hsl()`, `hsla()` only when copied from the host design system;
- do not store CSS variables directly in primary color fields unless the host site relies on variables and the fallback is also provided through `css_variables`;
- use fallback values when detection fails.

CSS length and shape fields must use CSS-compatible strings:

- `font_size_base`: `16px`, `1rem`, etc.;
- `radius`, `button_radius`, `card_radius`: `12px`, `999px`, `1rem`, etc.;
- `shadow`: valid CSS `box-shadow` value or `none`;
- `line_height`: unitless preferred, for example `1.6`.

---

## `detected_from` rules

`detected_from` must list project-relative files inspected for theme detection:

```json
"detected_from": [
  "index.html",
  "style.css"
]
```

Rules:

- use project-relative paths;
- include the selected HTML entry point when available;
- include CSS files used for visual detection;
- use an empty array when no files were inspected.

---

## `css_variables` object

`css_variables` must map generated theme values to the variables expected by `reference.css`.

Minimum recommended structure:

```json
"css_variables": {
  "--refscilink-color-primary": "#007B83",
  "--refscilink-color-secondary": "#00A6B2",
  "--refscilink-color-background": "#f7fafb",
  "--refscilink-color-surface": "#ffffff",
  "--refscilink-color-text": "#102027",
  "--refscilink-color-muted": "#607d8b",
  "--refscilink-color-border": "#d8e3e7",
  "--refscilink-color-error": "#b00020",
  "--refscilink-color-success": "#176b3a",
  "--refscilink-font-family": "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
  "--refscilink-radius": "12px",
  "--refscilink-radius-button": "999px",
  "--refscilink-radius-card": "18px",
  "--refscilink-shadow-card": "0 12px 30px rgba(0, 0, 0, 0.08)"
}
```

Rules:

- keys must be RefSciLink-scoped CSS custom properties beginning with `--refscilink-`;
- values must be strings;
- do not include global host variables such as `--primary` unless mapped to a RefSciLink variable;
- do not include CSS selectors or full CSS declarations.

---

## `detection` object

The `detection` object stores a concise report explaining how the theme was determined.

Recommended structure:

```json
"detection": {
  "status": "detected",
  "confidence": "medium",
  "strategy": "css_variables",
  "host_style_summary": "Scientific turquoise visual identity with rounded cards.",
  "warnings": []
}
```

### Detection field rules

| Key | Type | Rule |
|---|---:|---|
| `status` | string | Must use one of the allowed detection status values. |
| `confidence` | string | Must use one of the allowed confidence values. |
| `strategy` | string | Short detection strategy label. |
| `host_style_summary` | string | Human-readable design summary. |
| `warnings` | array of strings | Non-blocking detection concerns. |

Allowed `status` values:

```text
detected
partial
fallback
manual
disabled
failed
```

Allowed `confidence` values:

```text
high
medium
low
unknown
```

---

## Host visual identity priority

Generated values must follow this priority order:

1. explicit user configuration or existing `theme_refscilink.json` override;
2. host website design system and CSS variables;
3. automatic detection from HTML and CSS;
4. RefSciLink fallback values.

Do not replace a clear host design with the fallback scientific palette.

---

## Human editability rules

The file is intended to be editable by developers.

Rules:

- keep keys stable;
- keep values simple strings, arrays and objects;
- do not regenerate the file in a way that discards manual edits without backup;
- preserve unknown extra keys when safely updating an existing theme file;
- create a backup before overwriting an existing `theme_refscilink.json`.

### `manual_overrides` object

Developers may edit `manual_overrides` when they want durable visual changes that survive automatic theme regeneration.

Supported root override keys:

```json
"manual_overrides": {
  "primary": "#123456",
  "radius": "6px",
  "css_variables": {
    "--refscilink-color-primary": "#123456"
  }
}
```

Rules:

- root override keys use the same names as the generated theme fields;
- `css_variables` may override any `--refscilink-*` custom property used by `reference.css`;
- overrides must be simple strings;
- unsafe CSS variable names or values must be ignored by runtime code;
- automatic regeneration must preserve `manual_overrides`.

---

## Minimal generated example

```json
{
  "metadata": {
    "generated_by": "RefSciLink Skill",
    "module_version": "0.2.0-dev",
    "schema_version": "1.0.0",
    "generated_at": "2026-05-24T12:00:00+04:00",
    "updated_at": "2026-05-24T12:00:00+04:00",
    "language": "fr",
    "source_project": "basic-site",
    "source_entrypoint": "index.html"
  },
  "theme_mode": "auto_override",
  "detected_from": [
    "index.html",
    "style.css"
  ],
  "primary": "#007B83",
  "secondary": "#00A6B2",
  "background": "#f7fafb",
  "surface": "#ffffff",
  "text": "#102027",
  "muted": "#607d8b",
  "border": "#d8e3e7",
  "error": "#b00020",
  "success": "#176b3a",
  "font_family": "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
  "font_size_base": "16px",
  "line_height": "1.6",
  "radius": "12px",
  "button_radius": "999px",
  "card_radius": "18px",
  "shadow": "0 12px 30px rgba(0, 0, 0, 0.08)",
  "spacing_density": "normal",
  "color_scheme": "light",
  "css_variables": {
    "--refscilink-color-primary": "#007B83",
    "--refscilink-color-secondary": "#00A6B2",
    "--refscilink-color-background": "#f7fafb",
    "--refscilink-color-surface": "#ffffff",
    "--refscilink-color-text": "#102027",
    "--refscilink-color-muted": "#607d8b",
    "--refscilink-color-border": "#d8e3e7",
    "--refscilink-color-error": "#b00020",
    "--refscilink-color-success": "#176b3a",
    "--refscilink-font-family": "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    "--refscilink-radius": "12px",
    "--refscilink-radius-button": "999px",
    "--refscilink-radius-card": "18px",
    "--refscilink-shadow-card": "0 12px 30px rgba(0, 0, 0, 0.08)"
  },
  "manual_overrides": {},
  "detection": {
    "status": "detected",
    "confidence": "medium",
    "strategy": "css_variables",
    "host_style_summary": "Scientific turquoise visual identity with rounded cards.",
    "warnings": []
  },
  "notes": "Auto-detected values. Edit manually if needed."
}
```

---

## Minimal success criteria

A generated `theme_refscilink.json` is acceptable only if:

- the root is an object, not an array;
- `metadata` is present and includes `generated_by`, `module_version`, `schema_version`, `generated_at` and `updated_at`;
- `theme_mode` uses an allowed value;
- `detected_from` is an array;
- required color, typography, radius, shadow, spacing and color-scheme fields are present;
- unknown values use empty strings or fallback values, not `null`;
- `css_variables` maps values to `--refscilink-*` variables;
- `manual_overrides` is preserved when present;
- `detection` describes status, confidence and strategy;
- the file is valid JSON with two-space indentation;
- generated values preserve the host website visual identity when detectable;
- the file can later be used by `reference.css`, local installers and theme validation tools.
