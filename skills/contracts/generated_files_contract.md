<!-- Normative RefSciLink contract. Implements SH-001. -->

## Generated files contract

The following files are mandatory unless the installation mode explicitly reports why a file could not be created.

### Normative contracts reading rule

Before generating, updating or validating any RefSciLink module file, the assistant must read the contract index and apply the relevant normative contracts stored in:

```text
skills/contracts/README.md
```

When a dedicated contract exists in `skills/contracts/`, it is the authoritative specification for that generated file and takes priority over summarized guidance in this main skill file.

If a required contract file is missing, continue using the corresponding section in this main skill file and report that the dedicated contract has not yet been created.

| File | Type | Required role |
|---|---|---|
| `index_ref.html` | HTML | Bibliography list page |
| `reference.html` | HTML | Detailed reference page |
| `assets/css/reference.css` | CSS | Namespaced RefSciLink styles |
| `assets/js/reference.js` | JavaScript | Reference loading, rendering, filtering and validation UI |
| `json/references.json` | JSON | Structured bibliography data |
| `json/theme_refscilink.json` | JSON | Detected and editable visual theme |
| `tools/build_references.mjs` | Node.js ES Module | Local bibliography extraction helper |
| `tools/prompt_recherche_ia.md` | Markdown | AI enrichment prompt |
| `tools/schema_references.json` | JSON Schema | Reference data schema |
| `refscilink.config.json` | JSON | Persistent project-level configuration |

### Creation and update rules

- Create missing files.
- Update existing generated files only after backup.
- Never delete user files automatically.
- Never overwrite `references.json`, `theme_refscilink.json`, `index.html`, `reference.css` or `reference.js` without backup.
- Use relative paths compatible with static hosting and GitHub Pages.

### Minimal metadata

Generated JSON files should include metadata when possible:

```json
{
  "generated_by": "RefSciLink Skill",
  "version": "0.2.0-dev",
  "generated_at": "ISO-8601 timestamp"
}
```

Generated diagnostics and report codes must follow:

```text
skills/contracts/logging_diagnostics_strategy.md
```

Dry-run simulation must follow:

```text
skills/contracts/dry_run_mode_strategy.md
```

Rollback planning and restoration must follow:

```text
skills/contracts/rollback_mode_strategy.md
```

Machine-verifiable success criteria must follow:

```text
skills/contracts/success_criteria_strategy.md
```

### Visual adaptation priority

The generated file contract must never prevent adaptation to the user's visual identity.

Visual priority order:

1. Host website visual identity.
2. `theme_refscilink.json` overrides.
3. Automatic theme detection.
4. RefSciLink fallback theme.

---
