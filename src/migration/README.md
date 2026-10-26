# Legacy website importer

The one place in this codebase that knows the legacy website database (German table and column
names). Everything it writes follows the Payload schema and the vocabulary in `CONTEXT.md`.

```sh
pnpm migrate:website --dry-run      # read + plan, write only the report
pnpm migrate:website                # import (re-runnable: updates in place, never re-uploads files)
pnpm migrate:website --only mines   # only some sections: website, mines, excursions
pnpm migrate:website:verify BUG     # counts, anonymous visibility, one sample project
pnpm migrate:snapshot mines         # freeze a source (see Snapshots)
```

Needs `LEGACY_WEB_DB_*`, `LEGACY_WEB_FILES_ROOT` (the folder holding `0_img` and `4_res`) and
`LEGACY_SNAPSHOTS_ROOT` (default `Z:/website/website_rla/strato_backups`).
The report lands in `migration/reports/` (gitignored). A first run takes about 80 minutes,
about 50 of them generating image sizes; re-runs skip existing media but still take about 35
minutes, since every content document is written once per locale and phase.

## Snapshots

Sources that are switched off before the cutover are frozen once and imported from the freeze,
so they can go: `pnpm migrate:snapshot <source>` writes a dated folder
(`{LEGACY_SNAPSHOTS_ROOT}/{source}/YYYY-MM-DD/`), and the importer reads the newest one.

- `mines` → `mine_data/`: the three Minescapes tables of the mine database `mine_data` (on the
  website database's server, `LEGACY_MINE_DB_NAME`), raw rows as JSON.
- `excursions` → `wien_wp/`: the WordPress site wien.rehwaldt.de over its REST API (stations,
  posts, categories, the images they use as `media.json` + `files/`, originals where WordPress
  scaled them). Needs `LEGACY_WP_PASSWORD`, the site password of its "Password Protected" plugin.

The website database keeps changing until the cutover and is read live.

## How it's built

- `legacy.ts` reads every table once (the mine tables from their snapshot) and cleans values
  (trim, `''`/`'NULL'` → null).
- `plan/` maps the snapshot to a **plan**: a list of documents per collection, with per-locale
  values, that reference each other by legacy key (`ref('projects', 123)`) instead of Payload
  ids. Planning is pure apart from checking which files exist — that's the part worth testing.
- `write.ts` applies a plan: phase 1 writes each document without its references, phase 2 fills
  in references once every id is known, phase 3 writes globals and switches documents that were
  hidden in the legacy database to draft. Documents are matched by `legacyId` (PDFs by file name).
  References may point at documents of sections this run doesn't import.

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
| WordPress `station` posts | 35 | `excursions` `berlin-2026` (published), its days and stops |
| WordPress posts + categories | 25 / 5 | `excursions` `wien-2025` (draft), its days and stops |
| WordPress media | 48 | `media` — only images of stops, 6 of them already imported from `bilder` |

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
  News aren't blocks: the legacy flow renderer skipped them and the front page listed them as its
  news row, so a page's `a…` entries become its `featuredNews` (per language, in flow order).
  Projects and topics have no featured news; `a…` entries there are dropped and reported.
  `pages.featuredProjects` (the planned carousel's slides) stays empty: the legacy carousel was a
  proof of concept built from the page image and the flow's images, not an editorial selection.
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
- **Excursions** (WordPress snapshot `wien_wp`): the site holds two excursions in two shapes,
  unified into one. Berlin 2026 is the `station` post type: the REST API serves it last stop
  first (reversed), ACF `date` (Ymd) groups the stops into days in calendar order, `type`
  `meet_up` → `meetUp`, `time` → `HH:mm`, `coords` → `location`, `guide` → `guidedBy`, `planer` →
  `designedBy`, `completion` → `completionYear`, featured image + `images` gallery → `images`.
  Vienna 2025 is ordinary posts: the day categories Donnerstag/Freitag/Samstag → 11.–13.09.2025,
  posts without one go on a day without a date (reported), in the order they were written;
  "Speisen und Schlafen" → `food` (the hotel → `meetUp`); paragraphs that are only a link or a bare
  URL → `links`, the rest → `description`. Links to `rehwaldt.de/projekt.php?proj=CODE` → project
  links; one link with title and URL swapped is fixed. WordPress has no alt texts: an image gets
  its first stop's title. "Foto: …" / "Fotograf: …" in a caption → `credit`; the rest of a caption
  is dropped (reported; media get captions later). A stop image whose file name is that of a
  single `bilder` image uses that media item instead of a copy. Matched by `slug` (excursions) and
  file name (images).
- Anything that can't be mapped cleanly (dangling references, missing files, HTML in plain-text
  fields, link URLs Lexical would encode, unknown countries) goes into the import report instead of
  being guessed.
