# RefSciLink Contract — Official Tests Strategy

## Scope

This contract defines the official reproducible test workflow for RefSciLink hardening task SH-020.

It applies to:

- validation of the repository reference implementation;
- validation of `examples/basic-site/`;
- validation of future changes to `/create_module_ref`;
- CI-compatible checks that must run without network access.

The official executable test is:

```text
tests/refscilink/validate_basic_site.mjs
```

The npm wrapper is:

```text
npm run test:basic-site
```

---

## Mandatory reading rule

Before changing official validation behaviour, an assistant must read:

```text
skills/contracts/success_criteria_strategy.md
skills/contracts/logging_diagnostics_strategy.md
skills/contracts/dry_run_mode_strategy.md
skills/contracts/references_json_contract.md
skills/contracts/official_tests_strategy.md
```

If the executable test and this contract disagree, this contract defines the intended behaviour and the executable test must be updated.

---

## Test fixture

The canonical fixture is:

```text
examples/basic-site/
```

The canonical Markdown input is:

```text
examples/basic-site/bibliographie.md
```

The expected extraction count is:

```text
10 references
```

The test must run in temporary directories and must not modify the repository fixture.

---

## Mandatory test cases

The official test must verify:

1. Required module files exist.
2. `references.json`, `theme_refscilink.json`, `schema_references.json` and `refscilink.config.json` parse as JSON.
3. `build_references.mjs` passes `node --check`.
4. Root `references.json` has `metadata` and a `references` array.
5. `metadata.reference_count` matches the number of references.
6. Reference IDs are unique and follow the `refNNN` pattern.
7. Reference numbers are unique positive integers.
8. Reference statuses use controlled values from the relevant contracts.
9. The official fixture extraction succeeds from a clean temporary directory.
10. The official fixture extraction produces exactly 10 references.
11. The extraction output includes `REFSCILINK_EXTRACT_OK`.
12. Dry-run execution succeeds.
13. Dry-run execution does not write `references.json`.
14. Dry-run execution does not create backup files.
15. Dry-run output includes `REFSCILINK_DRY_RUN_ENABLED`, `REFSCILINK_DRY_RUN_WOULD_WRITE_JSON` and `REFSCILINK_DRY_RUN_NO_WRITE`.

---

## Report format

The official test must print a machine-readable JSON report to stdout.

Required root fields:

```json
{
  "status": "pass",
  "checks": [],
  "summary": {}
}
```

Allowed report statuses:

```text
pass
fail
warning
manual_review_required
```

Any failed mandatory test case must make the process exit with a non-zero status.

---

## Network rule

The official test must not require internet access, API keys or external scientific metadata services.

Scientific enrichment tests must be added separately and must never block the local installation test.

---

## Repository safety rule

The official test must not:

- modify files in `examples/basic-site/`;
- modify files in `data/reference_bibliographique/`;
- create backups inside the repository;
- require destructive cleanup commands.

Temporary files may be created under the operating system temporary directory.

---

## Success criteria

SH-020 is considered complete when:

- `tests/refscilink/validate_basic_site.mjs` exists;
- `npm run test:basic-site` executes the official test;
- the test exits with status 0 on the current repository state;
- the test report status is `pass`;
- this contract is indexed in `skills/contracts/README.md`;
- `skills/create_module_ref.md` documents when to run the official test.
