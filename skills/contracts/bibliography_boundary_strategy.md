# Bibliography section boundary strategy

## Purpose

This strategy defines the exact Markdown section boundaries used by `/create_module_ref` when extracting bibliographic references.

The goal is to avoid over-capturing notes, annexes, TODO sections or unrelated content while still supporting common bibliography subsection structures.

This strategy implements SH-013.

---

## Core principles

- Extract references only from a clearly identified bibliography section when one exists.
- Treat Markdown headings as structural boundaries.
- Preserve source line numbers and section metadata.
- Do not include heading lines in `raw_reference`.
- Allow well-known bibliography subsections inside the bibliography section.
- Stop capture conservatively when a new non-bibliographic section begins.
- Fall back to identifier-based extraction only when no bibliography heading is detected.
- Mark uncertain extraction as requiring manual review instead of silently inventing metadata.

---

## Heading model

The parser must recognize ATX Markdown headings from level 1 to 6:

```md
# References
## Bibliographie
### Articles
```

Heading comparison rules:

- trim leading and trailing whitespace;
- accept up to three leading spaces before `#`;
- compare heading titles case-insensitively;
- ignore trailing punctuation such as `:`, `.`, `—`, `-`;
- ignore optional closing `#` characters;
- compare French accented and unaccented variants equivalently;
- store the original visible heading text in source metadata.

---

## Bibliography start headings

Capture starts after a heading whose normalized text matches one of these values:

```text
References
Bibliography
Bibliographic references
Cited references
Literature cited
Cited literature
Works cited
Sources
Références
Références bibliographiques
Bibliographie
Sources bibliographiques
Littérature citée
Travaux cités
```

Rules:

- start headings may appear at any Markdown level from 1 to 6;
- the heading line itself is not a reference;
- `section_title` must store the original heading title without leading `#`;
- `section_level` must store the heading level;
- capture must begin on the first line after the heading.

---

## Primary stop rules

Once a bibliography section starts, capture stops before:

- any heading at the same level as the bibliography heading;
- any heading at a higher level than the bibliography heading;
- any explicit stop heading, even if it is nested below the bibliography heading;
- end of file.

Example:

```md
## Références
1. Doe J. Example article. 2024.

## Annexes
This line must not be captured.
```

The `## Annexes` heading stops extraction because it is at the same level as `## Références`.

---

## Explicit stop headings

These headings must stop capture even when nested inside the bibliography section:

```text
Annexe
Annexes
Appendix
Appendices
Notes
Internal notes
Notes internes
Acknowledgements
Acknowledgments
Remerciements
TODO
To do
Tasks
À faire
Further reading
Other resources
Autres ressources
Supplementary material
Matériel supplémentaire
```

Rules:

- the stop heading line must not be included in any reference block;
- any open reference buffer must be flushed before stopping;
- lines after a stop heading must not be scanned as part of the bibliography section.

---

## Allowed bibliography subsections

Lower-level headings may appear inside the bibliography section when they identify a bibliography category.

Allowed subsection headings include:

```text
Articles
Journal articles
Scientific articles
Books
Book chapters
Chapters
Preprints
Reports
Theses
Dissertations
Datasets
Websites
Web resources
Standards
Guidelines
Patents
Clinical trials
Articles scientifiques
Livres
Chapitres
Prépublications
Rapports
Thèses
Données
Sites web
Ressources web
Normes
Recommandations
Brevets
Essais cliniques
```

Rules:

- allowed subsection headings do not stop capture;
- allowed subsection heading lines are not included in `raw_reference`;
- references below an allowed subsection keep the parent bibliography `section_level`;
- `source_location.section_title` may include the subsection using `Parent / Subsection`.

Example:

```md
## References
### Articles
1. Doe J. Article. 2024.

### Books
2. Smith A. Book. 2020.
```

Both references must be extracted.

---

## Unknown nested headings

If a lower-level heading inside the bibliography section is neither an allowed bibliography subsection nor an explicit stop heading, the parser must stop capture.

This conservative rule prevents accidental capture of commentary sections such as:

```md
## References
1. Doe J. Article. 2024.

### Notes for the team
Check if this reference should be replaced.
```

The note must not become part of any reference.

---

## Reference buffer handling at boundaries

Before stopping capture or switching subsection:

- flush any open reference buffer;
- preserve `line_start` and `line_end`;
- do not include blank lines or heading lines in the buffer.

When a new reference marker appears, flush the previous buffer before starting the next one.

---

## No-heading fallback

If no bibliography heading is found, the parser may scan the whole file for strong bibliographic identifier signals:

- DOI;
- PMID;
- PMCID;
- HTTP or HTTPS URL.

Fallback extraction rules:

- extract only the matching line as a candidate reference;
- set `section_title` to an empty string;
- set `section_level` to `0`;
- set `extraction_status` to `manual_review_required`;
- do not capture surrounding paragraphs;
- do not treat generic headings such as `## Notes`, `## TODO` or `## Annexes` as bibliography starts.

---

## Source metadata mapping

Each extracted reference must preserve boundary metadata:

```json
{
  "source_location": {
    "line_start": 12,
    "line_end": 14,
    "section_title": "References / Articles",
    "section_level": 2
  }
}
```

Rules:

- `line_start` and `line_end` are 1-based Markdown source lines;
- `section_title` stores the active bibliography heading, optionally followed by an allowed subsection;
- `section_level` stores the original bibliography heading level, not the subsection level.

---

## Anti-overcapture examples

### Stop at same-level heading

```md
## References
1. Doe J. Example. 2024.

## TODO
- Replace this section.
```

Extract only the Doe reference.

### Stop at unknown nested heading

```md
## Bibliographie
1. Dupont A. Exemple. 2024.

### Notes internes
Ne pas publier.
```

Extract only the Dupont reference.

### Keep allowed subsection

```md
## Bibliography
### Preprints
- Smith A. Preprint title. 2023. https://example.org/preprint
```

Extract the Smith reference with `section_title` set to `Bibliography / Preprints`.

---

## Success criteria

An implementation satisfies SH-013 when:

- bibliography capture starts only on accepted bibliography headings;
- same-level and higher-level headings stop capture;
- explicit stop headings stop capture at any nested level;
- allowed bibliography subsections do not stop capture;
- unknown nested headings stop capture;
- heading lines are never included in `raw_reference`;
- no-heading fallback extracts only identifier-bearing lines;
- every extracted reference preserves source line and section boundary metadata;
- unrelated notes, annexes and TODO text are not extracted.
