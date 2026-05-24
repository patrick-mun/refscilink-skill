# RefSciLink normative contracts

## Purpose

This folder contains the normative generated-file contracts used by the `/create_module_ref` skill.

The main skill file, `skills/create_module_ref.md`, defines the installation workflow. The files in this folder define the exact expected structure and behaviour of generated module files.

When a dedicated contract exists here, it is authoritative and takes priority over summarized guidance in the main skill file.

---

## Mandatory reading rule

Before generating, updating or validating a RefSciLink module file, the assistant must read the matching contract from this folder.

If no dedicated contract exists for a file yet, use the relevant section in `skills/create_module_ref.md` and report that the dedicated contract is still missing.

---

## Contract index

| Scope | Generated file or concern | Contract |
|---|---|---|
| SH-001 | Generated file set, creation/update rules, metadata and visual priority | `generated_files_contract.md` |
| SH-002 | Bibliography index page | `index_ref_html_contract.md` |
| SH-003 | Reference detail page | `reference_html_contract.md` |
| SH-004 | Browser behaviour and rendering engine | `reference_js_contract.md` |
| SH-005 | Visual integration and CSS isolation | `reference_css_contract.md` |
| SH-006 | Structured bibliography data | `references_json_contract.md` |
| SH-007 | Editable theme configuration | `theme_refscilink_json_contract.md` |
| SH-008 | Project-level persistent configuration | `refscilink_config_contract.md` |
| SH-009 | Host navigation integration | `navigation_integration_contract.md` |
| SH-010 | Multi-page website handling | `multi_page_websites_contract.md` |
| SH-011 | Markdown parsing strategy | `markdown_parsing_strategy.md` |
| SH-012 | DOI, PMID, PMCID and URL extraction strategy | `metadata_identifier_extraction_strategy.md` |
| SH-013 | Bibliography section boundary strategy | `bibliography_boundary_strategy.md` |
| SH-014 | Reference numbering and stable ID strategy | `reference_numbering_strategy.md` |
| SH-015 | Reference status lifecycle strategy | `reference_status_lifecycle_strategy.md` |
| SH-016 | Logging and diagnostics strategy | `logging_diagnostics_strategy.md` |

---

## Reading by generated file

| When modifying | Read first |
|---|---|
| `data/reference_bibliographique/index_ref.html` | `index_ref_html_contract.md` |
| `data/reference_bibliographique/reference.html` | `reference_html_contract.md` |
| `data/reference_bibliographique/assets/js/reference.js` | `reference_js_contract.md` |
| `data/reference_bibliographique/assets/css/reference.css` | `reference_css_contract.md` |
| `data/reference_bibliographique/json/references.json` | `references_json_contract.md` |
| `data/reference_bibliographique/json/theme_refscilink.json` | `theme_refscilink_json_contract.md` |
| `refscilink.config.json` | `refscilink_config_contract.md` |
| Host navigation entry or References button | `navigation_integration_contract.md` |
| Multiple HTML entry points or multi-page websites | `multi_page_websites_contract.md` |
| Markdown bibliography extraction | `markdown_parsing_strategy.md` |
| Markdown bibliography section boundaries | `bibliography_boundary_strategy.md` |
| DOI, PMID, PMCID and URL extraction | `metadata_identifier_extraction_strategy.md` |
| Reference numbering, stable IDs and rerun matching | `reference_numbering_strategy.md` |
| Reference status lifecycle, filters and validation states | `reference_status_lifecycle_strategy.md` |
| Logging, diagnostics and report codes | `logging_diagnostics_strategy.md` |
| Generated module structure or backup behaviour | `generated_files_contract.md` |

---

## Maintenance rule

When a contract changes, update:

- `skills/create_module_ref.md` if the installation workflow or contract index changes;
- `SKILL_HARDENING_CHECKLIST.md` if the hardening status changes;
- `README.md`, `AGENTS.md`, `CLAUDE.md`, `.codex/context.md` or `.github/copilot-instructions.md` only when their documented behaviour is affected.
