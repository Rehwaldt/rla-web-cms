# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this branch is

`feat/website-migration` is a deliberately narrowed version of `rla-web-cms`. Its only goal is to
**replace the legacy CMS of the public rehwaldt.de website with Payload**.

The long-term vision on `master` is one Payload instance serving the website, the WordPress
intranet and WerkX (time tracking). This branch parks the intranet and WerkX parts. Their code
(WP/werkx ETL scripts, the Project Phases/Partials/Services/Flags collections, the Employee WerkX
tab, `fields/color.ts`) was removed here, and can be pulled back from `master` when it's needed
again. Don't reintroduce WordPress or WerkX sources on this branch unless asked.

- Payload CMS 3.85 / Next.js 16, Postgres via `@payloadcms/db-postgres`.
- Localization `de` (default) / `en` with fallback. `zh` and `cs` will be added for the migration
  (the legacy site serves de/en/zh/cz; `cz` in legacy columns maps to Payload's `cs`).
- Path alias `@/*` → `src/*`.
- `src/fields/location.ts` is a point + address group rendered by a Leaflet map
  (`src/components/cms/MapFieldLoader.tsx` → `MapField.tsx`, client-only to avoid SSR issues).
- `src/fields/flow.ts` is the shared "flow" blocks field, mirroring the legacy pipe-delimited
  `flow`/`bilder_flow` columns.
- This branch is the only active line of work; `master` is kept only as a reference to pull
  parked code back from.

## Commands

- `pnpm dev` / `pnpm build` / `pnpm start`
- `pnpm generate:types`: regenerates `src/payload-types.ts`. Run after any collection or field
  change; never hand-edit that file.
- `pnpm test:int` (Vitest) / `pnpm test:e2e` (Playwright) / `pnpm test` (both). `pnpm lint`.

## The legacy website being replaced

All under `Z:\website\website_rla\`:

- `1_php`: the live public site (plain PHP). SQL lives in `utils/global/db.php`. Models in
  `models/` (e.g. `employee.php`, `project.php`). Translations use `Lang::pick(row, base)`: the
  `{base}_{lang}` column, falling back to en, then de. (There is no `1_php_tim`; older notes that
  mention it mean `1_php`.)
- `3_frontend`: the admin tool where editors actually edit the data (`_edit_*.php` pages). It
  publishes to production by uploading a mysqldump to `1_php/sync/`.
- `0_img`: image files. `bilder.pfad` is relative to this folder. Resized variants are generated
  into an adaptive folder; only full-size originals are migrated.
- Data: the `web` MySQL database on server02 (`LEGACY_WEB_DB_*`). The map pages also read a
  separate `mine_data` database (→ `Mines`/`MineFeatures`).

### `web` tables → Payload

| `web` table | Rows | Payload |
|---|---|---|
| `projekte` | 423 | `Projects` (slug `project`, id = legacy `kuerzel`) |
| `aehnliche_projekte` | 100 | `Projects.similarProjects` (symmetric) |
| `projektkategorien` | 48 | `ProjectCategories` |
| `aktuell` | 223 | `News` |
| `auszeichnungen` | 20 | `Awards` |
| `publikationen` / `publikationskategorien` | 75 / 4 | `Publications` / `PublicationCategories` |
| `jobs` | 5 | `Jobs` |
| `themen` | 11 | `Themes` |
| `mitarbeiter` | 60 | `Employee` (public profile fields) |
| `standorte` | 4 | `OfficeLocation` |
| `buero` | 13 | not modeled yet (office/about pages) |
| `textelemente` | 172 | not modeled yet (text snippets keyed by `class`) |
| `bilder` | 8292 | `Media`: only referenced, full-size images |
| `index_*` | — | not migrated: the site search crawler's index |

## Migration decisions (2026-09-29)

- **Freeze and cut over.** During development the importer may wipe and reload freely. At cutover
  it runs one final time and `3_frontend` is switched off. There is no continuous two-way sync,
  and there are no "owned by legacy" read-only fields.
- **News comes from `web.aktuell`**, not from WordPress.
- **Images:** migrate only images referenced by a migrated record, deduplicated by path,
  full-size only (Payload generates the smaller sizes). Retired employees get no portrait.
- **Consumer:** after cutover, `1_php/utils/global/db.php` is rewritten to read Payload's REST API.
  Payload keeps clean field names; the mapping to the old names lives in the PHP side.
- **Legacy ids** are stored on migrated records so re-imports stay stable.
- **Importer shape:** each table gets a MySQL reader, a pure mapping function (legacy row →
  Payload data, tested with small hand-written fixtures), and one shared module that writes to
  Payload. File and database access stay out of the mapping functions.
