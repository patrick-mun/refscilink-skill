# JSON contract — `refscilink.config.json`

## Purpose

This contract defines the exact structure of the project-level RefSciLink configuration file:

```text
refscilink.config.json
```

The goal is to make `/create_module_ref` safely rerunnable without asking the same questions repeatedly, while preserving user choices, host-project constraints and static-hosting compatibility.

This contract implements SH-008.

---

## Core principles

- The configuration file must live at the host project root.
- The file must be valid UTF-8 JSON.
- The file must use two-space indentation.
- JSON comments and trailing commas are forbidden.
- Internal keys must remain English and stable.
- Unknown string values must be represented as empty strings, not `null`.
- Unknown arrays must be represented as empty arrays.
- Unknown objects must be represented as empty objects only when optional.
- Paths must be project-relative by default.
- Absolute paths are forbidden unless explicitly justified by a local-only workflow note.
- Existing human-edited values must be preserved unless the user explicitly asks to change them.
- The configuration must never override scientific validation rules.

---

## Root structure

The official generated root structure is mandatory:

```json
{
  "metadata": {},
  "source": {},
  "output": {},
  "display": {},
  "theme": {},
  "language": {},
  "enrichment": {},
  "safety": {},
  "runtime": {}
}
```

For backward compatibility, the assistant may read older flat keys such as `source_markdown`, `output_dir`, `display_mode`, `theme_mode`, `language` and `enrichment_mode`, but new generation must use the official object structure.

---

## Mandatory `metadata` object

The `metadata` object must be present and must contain at least these keys:

```json
{
  "generated_by": "RefSciLink Skill",
  "version": "0.2.0-dev",
  "schema_version": "1.0.0",
  "created_at": "ISO-8601 timestamp",
  "updated_at": "ISO-8601 timestamp"
}
```

### Metadata field rules

| Key | Type | Rule |
|---|---:|---|
| `generated_by` | string | Must identify RefSciLink as the generator. |
| `version` | string | RefSciLink module or skill version. |
| `schema_version` | string | Contract version for `refscilink.config.json`. |
| `created_at` | string | ISO-8601 timestamp from first config creation. |
| `updated_at` | string | ISO-8601 timestamp from last config update. |

---

## Mandatory `source` object

```json
"source": {
  "markdown_file": "bibliographie.md",
  "markdown_candidates": [],
  "html_entrypoint": "index.html",
  "html_entrypoint_candidates": []
}
```

### Source field rules

| Key | Type | Rule |
|---|---:|---|
| `markdown_file` | string | Project-relative Markdown file selected for bibliography extraction. |
| `markdown_candidates` | array of strings | Candidate Markdown files discovered during inspection. |
| `html_entrypoint` | string | Project-relative HTML file receiving navigation integration. |
| `html_entrypoint_candidates` | array of strings | Candidate HTML entry points discovered during inspection. |

If no Markdown file is selected, use an empty string and run in install-only mode.

If no HTML entry point is found, use an empty string and skip navigation integration with a clear report.

---

## Mandatory `output` object

```json
"output": {
  "module_dir": "data/reference_bibliographique",
  "index_file": "data/reference_bibliographique/index_ref.html",
  "detail_file": "data/reference_bibliographique/reference.html",
  "references_json": "data/reference_bibliographique/json/references.json",
  "theme_json": "data/reference_bibliographique/json/theme_refscilink.json"
}
```

### Output field rules

| Key | Type | Rule |
|---|---:|---|
| `module_dir` | string | Project-relative module directory. |
| `index_file` | string | Project-relative bibliography index page. |
| `detail_file` | string | Project-relative detail page. |
| `references_json` | string | Project-relative references JSON path. |
| `theme_json` | string | Project-relative theme JSON path. |

Default output must remain:

```text
data/reference_bibliographique/
```

unless the user explicitly requests another location.

---

## Mandatory `display` object

```json
"display": {
  "mode": "page",
  "navigation_label": "",
  "navigation_integration": "auto",
  "navigation_target": "data/reference_bibliographique/index_ref.html"
}
```

### Display field rules

| Key | Type | Rule |
|---|---:|---|
| `mode` | string | Must use one of the allowed display mode values. |
| `navigation_label` | string | Visible label. Empty means derive from detected language. |
| `navigation_integration` | string | Must use one of the allowed navigation integration values. |
| `navigation_target` | string | Project-relative link target for the References navigation item. |

Allowed `mode` values:

```text
page
panel
both
none
```

Allowed `navigation_integration` values:

```text
auto
navbar
floating_button
manual
skip
```

---

## Mandatory `theme` object

```json
"theme": {
  "mode": "auto_override",
  "config_file": "data/reference_bibliographique/json/theme_refscilink.json",
  "preserve_host_identity": true
}
```

### Theme field rules

| Key | Type | Rule |
|---|---:|---|
| `mode` | string | Must use one of the allowed theme mode values. |
| `config_file` | string | Project-relative path to `theme_refscilink.json`. |
| `preserve_host_identity` | boolean | Must default to `true`. |

Allowed `mode` values:

```text
auto_override
auto
manual
fallback
disabled
```

The host website visual identity remains the priority even when a config file exists.

---

## Mandatory `language` object

```json
"language": {
  "mode": "auto",
  "detected": "",
  "generated_ui": ""
}
```

### Language field rules

| Key | Type | Rule |
|---|---:|---|
| `mode` | string | `auto` or a BCP 47-like language code such as `fr` or `en`. |
| `detected` | string | Detected host website language. |
| `generated_ui` | string | Language used for generated visible UI text. |

Rules:

- technical specification text remains English;
- JSON keys remain English;
- visible generated UI text follows `generated_ui`;
- if `mode` is `auto`, detection priority from `skills/create_module_ref.md` applies.

---

## Mandatory `enrichment` object

```json
"enrichment": {
  "mode": "extract_only",
  "allow_network": false,
  "allow_ai_summaries": false,
  "require_human_validation": true
}
```

### Enrichment field rules

| Key | Type | Rule |
|---|---:|---|
| `mode` | string | Must use one of the allowed enrichment mode values. |
| `allow_network` | boolean | Whether scientific metadata lookup may use network access. |
| `allow_ai_summaries` | boolean | Whether AI-generated summaries may be prepared. |
| `require_human_validation` | boolean | Must default to `true`. |

Allowed `mode` values:

```text
install_only
extract_only
extract_and_enrich
deferred_enrichment
no_external_api
offline
```

AI-generated summaries must never be marked as validated by default, regardless of config values.

---

## Mandatory `safety` object

```json
"safety": {
  "backup_before_overwrite": true,
  "backup_dir": "backup/refscilink",
  "overwrite_user_files": false,
  "preserve_manual_edits": true,
  "dry_run": false
}
```

### Safety field rules

| Key | Type | Rule |
|---|---:|---|
| `backup_before_overwrite` | boolean | Must default to `true`. |
| `backup_dir` | string | Project-relative backup directory. |
| `overwrite_user_files` | boolean | Must default to `false`. |
| `preserve_manual_edits` | boolean | Must default to `true`. |
| `dry_run` | boolean | Simulate installation without modifying files when `true`. |

Never overwrite `references.json`, `theme_refscilink.json`, manually edited generated files or host `index.html` without backup.

Dry-run behaviour must follow:

```text
skills/contracts/dry_run_mode_strategy.md
```

---

## Mandatory `runtime` object

```json
"runtime": {
  "static_hosting": true,
  "github_pages_compatible": true,
  "node_required_for_tools": true,
  "minimum_node_version": "18"
}
```

### Runtime field rules

| Key | Type | Rule |
|---|---:|---|
| `static_hosting` | boolean | Must default to `true`. |
| `github_pages_compatible` | boolean | Must default to `true`. |
| `node_required_for_tools` | boolean | Whether local extraction tools require Node.js. |
| `minimum_node_version` | string | Minimum Node.js major version for local tools. |

Generated browser pages must remain usable on static hosting without a backend.

---

## Path rules

All paths should be project-relative and use forward slashes:

```json
"module_dir": "data/reference_bibliographique"
```

Forbidden by default:

```json
"module_dir": "/Users/example/project/data/reference_bibliographique"
```

Rules:

- do not store machine-specific absolute paths in committed config files;
- normalize Windows separators to forward slashes when writing JSON;
- keep paths relative to the host project root;
- preserve user-provided relative custom output directories.

---

## Idempotence and rerun behaviour

On future executions, the assistant must:

1. read `refscilink.config.json` if it exists;
2. validate it against this contract as far as possible;
3. reuse existing values instead of asking again;
4. ask the user only when required values are missing, ambiguous or explicitly requested for change;
5. preserve unknown extra keys when safely updating the file;
6. update `metadata.updated_at` when writing changes;
7. preserve `metadata.created_at` when the file already exists;
8. create a backup before overwriting an existing config.

If the config conflicts with explicit user instructions, the current user instruction takes priority and the config should be updated after confirmation or clear reporting.

---

## Legacy flat-key compatibility

Older config files may contain:

```json
{
  "source_markdown": "bibliographie.md",
  "output_dir": "data/reference_bibliographique",
  "display_mode": "page",
  "theme_mode": "auto_override",
  "language": "auto",
  "detected_language": "fr",
  "enrichment_mode": "extract_only",
  "created_by": "RefSciLink Skill",
  "version": "0.2.0-dev"
}
```

The assistant may read this shape, but new writes should migrate to the official object structure after backup.

---

## Minimal generated example

```json
{
  "metadata": {
    "generated_by": "RefSciLink Skill",
    "version": "0.2.0-dev",
    "schema_version": "1.0.0",
    "created_at": "2026-05-24T12:00:00+04:00",
    "updated_at": "2026-05-24T12:00:00+04:00"
  },
  "source": {
    "markdown_file": "bibliographie.md",
    "markdown_candidates": [
      "bibliographie.md"
    ],
    "html_entrypoint": "index.html",
    "html_entrypoint_candidates": [
      "index.html"
    ]
  },
  "output": {
    "module_dir": "data/reference_bibliographique",
    "index_file": "data/reference_bibliographique/index_ref.html",
    "detail_file": "data/reference_bibliographique/reference.html",
    "references_json": "data/reference_bibliographique/json/references.json",
    "theme_json": "data/reference_bibliographique/json/theme_refscilink.json"
  },
  "display": {
    "mode": "page",
    "navigation_label": "",
    "navigation_integration": "auto",
    "navigation_target": "data/reference_bibliographique/index_ref.html"
  },
  "theme": {
    "mode": "auto_override",
    "config_file": "data/reference_bibliographique/json/theme_refscilink.json",
    "preserve_host_identity": true
  },
  "language": {
    "mode": "auto",
    "detected": "fr",
    "generated_ui": "fr"
  },
  "enrichment": {
    "mode": "extract_only",
    "allow_network": false,
    "allow_ai_summaries": false,
    "require_human_validation": true
  },
  "safety": {
    "backup_before_overwrite": true,
    "backup_dir": "backup/refscilink",
    "overwrite_user_files": false,
    "preserve_manual_edits": true,
    "dry_run": false
  },
  "runtime": {
    "static_hosting": true,
    "github_pages_compatible": true,
    "node_required_for_tools": true,
    "minimum_node_version": "18"
  }
}
```

---

## Minimal success criteria

A generated `refscilink.config.json` is acceptable only if:

- the root is an object, not an array;
- mandatory objects `metadata`, `source`, `output`, `display`, `theme`, `language`, `enrichment`, `safety` and `runtime` are present;
- `metadata` includes `generated_by`, `version`, `schema_version`, `created_at` and `updated_at`;
- controlled values match the allowed lists;
- paths are project-relative by default;
- no unknown values are represented as `null`;
- `safety.backup_before_overwrite` defaults to `true`;
- `safety.overwrite_user_files` defaults to `false`;
- `theme.preserve_host_identity` defaults to `true`;
- `enrichment.require_human_validation` defaults to `true`;
- generated browser output remains static-hosting compatible;
- the file is valid JSON with two-space indentation;
- future `/create_module_ref` runs can reuse the config without re-asking already answered questions.
