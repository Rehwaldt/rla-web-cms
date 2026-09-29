# Legacy website importer

The one place in this codebase that knows the legacy website database (German table and column
names). Everything it writes follows the Payload schema and the vocabulary in `CONTEXT.md`.

## Table → collection mapping

| Legacy table | Rows | Payload |
|---|---|---|
| `projekte` | 423 | `projects` |
| `aehnliche_projekte` | 100 | `projects.similarProjects` (stored on one side) |
| `projektkategorien` | 48 | `project-categories` (tree) |
| `projekte.galerieposition_{lang}` | — | global `project-gallery` (per-language ordered list) |
| `themen` | 11 | `topics` |
| `aktuell` | 223 | `news` |
| `auszeichnungen` | 20 | `awards` |
| `publikationen` / `publikationskategorien` | 75 / 4 | `publications` / `publication-categories` |
| `jobs` | 5 | `jobs` |
| `buero` | 13 | `pages` (`buero-profil-2026` is skipped — abandoned draft) |
| `mitarbeiter` | 60 | `employees` |
| `standorte` | 4 | `offices` |
| `bilder` | 8292 | `media` — only referenced images, full-size files from `0_img/` |
| `textelemente` | 172 | inlined as text blocks into the flows that reference them (`t123`) |
| `index_*` | — | not imported (site-search crawler index) |

## Legacy quirks the importer resolves

- **Visibility**: `aktiv = 0` → draft. `anzeige_{lang}` (projects, jobs) and
  `position_{lang} IS NOT NULL` (news, awards, publications) → `visibleIn`. Legacy `cz` → `cs`.
- **Strings**: trim; `''` and the literal string `'NULL'` → empty.
- **Project codes** (`kuerzel`): the placeholder `zz` → no code. References resolve
  case-insensitively (MySQL collation), e.g. `ggr` → `GGR`.
- **Links** (`links_{lang}`): `label;url|label;proj:CODE` → `links` items, `proj:` → project link.
- **Flows** (`bilder_flow`, `themen.flow`, `buero.flow_{lang}`): `size modifier…:ref|…` where ref
  is an image id, `t…` text element, `f…` topic, `a…` news. `separator` is a text-block modifier.
- **Project type**: `als_wettbewerb` → competition; else `als_projekt` → object if
  `objektplanung`, else concept. Rows matching neither are reported.
- **Completion**: `in_planung` → `ongoing`; `fertigstellung`, else `fertigstellung_geplant` →
  `completionYear`.
- **Country** (`land_{lang}`): free text in four languages → ISO code; region names
  (`Sachsen`, `Provinz Guangdong`, …) → `region` + their country.
- **Image → project** (`bilder.projekt`): project code → `media.project`; folder names starting
  with `_` (`_aktuell`, `_Team`) mean no project.
- **Dropped, not rendered by the current site**: `galeriebild`, `titelbilder`,
  `kontext*`/`planung*`/`baustelle*` + their image lists, `karte_*`, `tags`, `themen`,
  `intranet`, `bilder.{breite,hoehe,link,contclass,tags}`, `jobs.{links,ansprechperson}`,
  unreferenced `textelemente`.
- **Page keys**: `buero-profil` → `office-profile` etc. (English keys, mapped in the importer).
- Anything that can't be mapped cleanly (dangling references, missing files, HTML in plain-text
  fields, links to old `*.php` URLs, unknown countries) goes into the import report instead of
  being guessed.
