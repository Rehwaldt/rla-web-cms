# Legacy website importer

The one place in this codebase that knows the legacy website database (German table and column
names). Everything it writes follows the Payload schema and the vocabulary in `CONTEXT.md`.

```sh
pnpm migrate:website --dry-run   # read + plan, write only the report
pnpm migrate:website             # import (re-runnable: updates in place, never re-uploads files)
pnpm migrate:website:verify BUG  # counts, anonymous visibility, one sample project
```

Needs `LEGACY_WEB_DB_*`, `LEGACY_MINE_DB_NAME` (the Minescapes database `mine_data`, same server
and user) and `LEGACY_WEB_FILES_ROOT` (the folder holding `0_img` and `4_res`).
The report lands in `migration/reports/` (gitignored). A first run takes about 80 minutes,
about 50 of them generating image sizes; re-runs skip existing media but still take about 35
minutes, since every content document is written once per locale and phase.

## How it's built

- `legacy.ts` reads every table once and cleans values (trim, `''`/`'NULL'` → null).
- `plan/` maps the snapshot to a **plan**: a list of documents per collection, with per-locale
  values, that reference each other by legacy key (`ref('projects', 123)`) instead of Payload
  ids. Planning is pure apart from checking which files exist — that's the part worth testing.
- `write.ts` applies a plan: phase 1 writes each document without its references, phase 2 fills
  in references once every id is known, phase 3 writes globals and switches documents that were
  hidden in the legacy database to draft. Documents are matched by `legacyId` (PDFs by file name).

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
| `bilder` | 8292 | `media` — only referenced images, the files from `0_img/` (Media shrinks any over 2800 px on the longest edge) |
| `textelemente` | 172 | inlined as text blocks into the flows that reference them (`t123`) |
| `index_*` | — | not imported (site-search crawler index) |
| `mine_data.mines` | 53 | `mines` |
| `mine_data.features` / `mine_data.mine_features` | 28 / 83 | `mine-features` / `mines.features` |

## Legacy quirks the importer resolves

- **Visibility**: `aktiv = 0` → draft. `anzeige_{lang}` (projects, jobs) and
  `position_{lang} IS NOT NULL` (news, awards, publications) → `visibleIn`. Legacy `cz` → `cs`.
- **Strings**: trim; `''` and the literal string `'NULL'` → empty.
- **Project codes** (`kuerzel`): the placeholder `zz` → no code. References resolve
  case-insensitively (MySQL collation), e.g. `ggr` → `GGR`.
- **Links** (`links_{lang}`): `label;url|label;proj:CODE` → `links` items, `proj:` → project link.
- **Links in rich text**: Lexical encodes a link URL it considers invalid again on every save, so
  legacy hrefs are rewritten: `projekt.php?…proj=CODE` → internal link to the project (the HTML
  twin renders it as `/p/CODE`), `aktuell.php` etc. → `/aktuell` (the website adds the language),
  a bare e-mail address → `mailto:`. Each rewrite is reported, and so is any URL still invalid.
- **Flows** (`bilder_flow`, `themen.flow`, `buero.flow_{lang}`): `size modifier…:ref|…` where ref
  is an image id, `t…` text element, `f…` topic, `a…` news. `separator` is a text-block modifier.
- **Project type**: `als_wettbewerb` → competition; else `als_projekt` → object if
  `objektplanung`, else concept. Rows matching neither are reported.
- **Completion**: `in_planung` → `ongoing`; `fertigstellung`, else `fertigstellung_geplant` →
  `completionYear`.
- **Country** (`land_{lang}`): free text in four languages → ISO code; region names
  (`Sachsen`, `Provinz Guangdong`, …) → `region` + their country.
- **Read more** (`projekte.text_{lang}`): the comment `<!--RM-->` marks where the project text is
  cut. Lexical drops comments, so it becomes a horizontal rule at the same spot, splitting the
  paragraph it sits in. The website cuts at the first rule.
- **Definition lists** (`buero.text_{lang}`, only `buero-vita`): `<dt>`/`<dd>` pairs →
  `pages.timeline` (per language, the lists differ), since Lexical has no definition list. Empty
  and unclosed `<dd>`s in the legacy lists are absorbed.
- **Image → project** (`bilder.projekt`): project code → `media.project`; folder names starting
  with `_` (`_aktuell`, `_Team`) mean no project.
- **Dropped, not rendered by the current site**: `galeriebild`, `titelbilder`,
  `kontext*`/`planung*`/`baustelle*` + their image lists, `karte_*`, `tags`, `themen`,
  `intranet`, `bilder.{breite,hoehe,link,contclass,tags}`, `jobs.{links,ansprechperson}`,
  unreferenced `textelemente`.
- **Mines** (`mine_data`): English only. Feature names and `essential_use` get German from a
  table in `plan/mines.ts` (missing terms are reported); `Hipodrom` → `Hippodrome`. `object_id` →
  `code`; `mine_id` differing from it names the main mine → `parentMine`. Country `KO` → `XK`.
  `operation_type`, `current_state`, `product_type`, `morphology`, `function_after` → select
  values; unknown ones are reported. Features keep the legacy map's order (by color).
  `image_url` is empty everywhere and not imported.
- **Page keys**: `buero-profil` → `office-profile` etc. (English keys, mapped in the importer).
- Anything that can't be mapped cleanly (dangling references, missing files, HTML in plain-text
  fields, link URLs Lexical would encode, unknown countries) goes into the import report instead of
  being guessed.
