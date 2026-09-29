# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this branch is

`feat/website-migration` is the only active line of work. Its goal is to **replace the legacy CMS
of the public rehwaldt.de website with Payload**. `master` holds parked WordPress-intranet and
WerkX (time tracking) work and is only a reference to pull code back from later. Don't
reintroduce those sources here unless asked.

- Payload CMS 3.85 / Next.js 16, Postgres via `@payloadcms/db-postgres`.
- Locales `de` (default), `en`, `zh`, `cs` (`src/locales.ts`). Missing translations fall back to
  `en`, then `de`.
- Path alias `@/*` → `src/*`.
- Domain vocabulary lives in [CONTEXT.md](CONTEXT.md). Use its terms for names and docs.

## Hard rules

- **English only.** Every collection/field/global name, slug, admin label, description, comment
  and doc is English. German appears only in content data and inside the importer
  (`src/migration/`), which reads the German-named legacy tables.
- **No legacy baggage in the schema.** Collections model the website's concepts, not the legacy
  table layout. Legacy column names, delimiters and quirks are handled in the importer only.
- Localize human-readable text fields (`localized: true`). Don't localize codes, emails, phone
  numbers, URLs, numbers or dates.

## Commands

- `pnpm dev` / `pnpm build` / `pnpm start`
- `pnpm generate:types`: regenerates `src/payload-types.ts`. Run after any collection or field
  change; never hand-edit that file. `pnpm generate:importmap` after adding admin components.
- `pnpm test:unit` (Vitest, no database; importer planners in `tests/unit/`) / `pnpm test:int`
  (Vitest, needs Postgres) / `pnpm test:e2e` (Playwright) / `pnpm test` (all). `pnpm lint`.
- `pnpm migrate:website [--dry-run]`: imports the legacy website database (see
  `src/migration/README.md`). Re-runnable; writes a report to `migration/reports/`.
  `pnpm migrate:website:verify [projectCode]` spot-checks the result.

## Schema building blocks (`src/fields`, `src/access`)

Reuse these instead of re-declaring the shapes:

- `richTextField(name)`: localized Lexical rich text with the fixed toolbar.
- `flowField({ localized, captions })`: the "flow" grid of image/text/news/topic blocks with size
  and modifiers. An image's caption and link come from the media item's `project`. Edited in a
  visual editor (`src/components/cms/FlowField`) that renders the grid with `flow.css`, a port of
  the website's stylesheet; sizes and modifiers live in `src/fields/flowLayout.ts`.
- `linksField`: per-language list of links, each either a project reference or an external URL.
- `visibleInField`: languages whose website lists the entry. Together with drafts
  (`versions: { drafts: true }`) it replaces every legacy visibility flag.
- `legacyIdField`: id of the imported legacy record; the importer upserts by it.
- `countryField()`: ISO 3166-1 alpha-2 country select.
- `publishedOrAuthenticated` / `anyone`: read access. Anonymous requests (the website) only see
  published documents.

## Collections

Projects, Project Categories (tree via `@payloadcms/plugin-nested-docs`), Topics, News, Awards,
Publications, Publication Categories, Jobs, Pages, Employees, Offices, Mines, Mine Features,
Media, Users. Global: Project Gallery (curated, ordered featured projects per language).
Slugs are plural kebab-case.

## The legacy website being replaced

Under `Z:\website\website_rla\`: `1_php` is the live PHP site (its data access lives in
`utils/global/db.php`), `3_frontend` is the admin tool editors use today, `0_img` holds the image
files. Data comes from the legacy MySQL database configured via `LEGACY_WEB_DB_*`. The legacy
table → collection mapping and all legacy quirks are documented in `src/migration/README.md`.

## Migration decisions (2026-09-29)

- **Freeze and cut over.** During development the importer may wipe and reload freely. At cutover
  it runs one last time and the legacy admin tool is switched off.
- **Import everything**, including unpublished and retired records (as drafts), so the legacy
  database never has to be consulted again. Exceptions: legacy image slots and page sections the
  current site doesn't render, and one abandoned page draft.
- **Images:** only images referenced by imported records, full-size originals only (Payload
  generates the responsive sizes). Retired employees get no portrait. Uploads live in
  `public/media` for now; production storage is decided before cutover.
- **Consumer:** after cutover the PHP site reads Payload's REST API. Payload keeps clean names;
  any mapping to old names happens on the PHP side.
- **Projects** use Payload's automatic id. The shared project `code` is a separate unique field
  (empty for a few legacy entries that never had one).
