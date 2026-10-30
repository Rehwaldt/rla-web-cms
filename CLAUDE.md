# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this branch is

`feat/website-migration` is the only active line of work. Its goal is to **replace the legacy CMS
of the public rehwaldt.de website with Payload**. `main` holds parked WordPress-intranet and
WerkX (time tracking) work and is only a reference to pull code back from later. Don't
reintroduce those sources here unless asked.

- Payload CMS 3.85 / Next.js 16, Postgres via `@payloadcms/db-postgres`.
- Locales `de` (default), `en`, `zh`, `cs` (`src/locales.ts`). Missing translations fall back to
  `en`, then `de`.
- Path alias `@/*` → `src/*`.
- Domain vocabulary lives in [CONTEXT.md](CONTEXT.md). Use its terms for names and docs.

## Hard rules

- **English only.** Every collection/field/global name, slug, comment and doc is English. German
  appears only in content data, inside the importer (`src/migration/`), which reads the
  German-named legacy tables, and as the `de` side of the admin's translations (below).
- **Bilingual admin (English, German).** Every label, description, select option, tab, group and
  collection/global name is an inline `{ en, de }` object, never a plain string, and every named
  field gets an explicit label (Payload's generated ones are English only). Navigation groups come
  from `src/i18n/groups.ts`. German terms for domain concepts are listed in
  [CONTEXT.md](CONTEXT.md); German texts avoid addressing the reader and use gender-neutral words
  for people. Texts of custom admin components go in `src/i18n/translations.ts` and are read with
  `useTranslation<Translations, TranslationKeys>()`. `tests/unit/adminTranslations.unit.spec.ts`
  fails on anything untranslated.
- **No legacy baggage in the schema.** Collections model the website's concepts, not the legacy
  table layout. Legacy column names, delimiters and quirks are handled in the importer only.
- Localize human-readable text fields (`localized: true`). Don't localize codes, emails, phone
  numbers, URLs, numbers or dates. A required localized field uses `requiredInDefaultLocale`, not
  `required: true`, which demands a value in every locale.

## Commands

- `pnpm dev` / `pnpm build` / `pnpm start`
- `pnpm generate:types`: regenerates `src/payload-types.ts`. Run after any collection or field
  change; never hand-edit that file. `pnpm generate:importmap` after adding admin components.
- `pnpm payload migrate:create <name>`: after any schema change that should ship. `pnpm dev`
  pushes schema changes into the dev database, but production only runs the migrations in
  `src/migrations` (on startup). Commit the generated files; never edit an applied migration.
  The push happens on the first request that needs Payload (e.g. `/admin`), not when `pnpm dev`
  starts; drizzle's questions then wait in that terminal. It skips the migrations' data copies:
  when it warns about dropping columns a migration copies from, answer N (that exits `pnpm dev`),
  run the migration's add + copy SQL on the dev database, then restart and accept the drops.
  To avoid rename questions, split a change that adds and drops tables or columns into two
  migrations (add, then drop with the data copied in SQL). Payload names a select's enum
  `enum_{table}_{field}` without leading underscores, so a select called `status` gets the drafts'
  `_status` enum (the migration then lacks a `CREATE TYPE`); give such a field an `enumName`
  (projects: `project_status`). `migrate:down` rolls back the whole last batch, not one migration.
- `pnpm test:unit` (Vitest, no database; importer planners in `tests/unit/`) / `pnpm test:int`
  (Vitest, needs Postgres) / `pnpm test:e2e` (Playwright) / `pnpm test` (all). `pnpm lint`.
- `pnpm migrate:website [--dry-run]`: imports the legacy website database (see
  `src/migration/README.md`). Re-runnable; writes a report to `migration/reports/`.
  `pnpm migrate:website:verify [projectCode]` spot-checks the result. It ends by rebuilding the
  search index.
- `pnpm search:reindex`: rebuilds the site search's index (below) from scratch.
- `pnpm migrate:werkx --target <CMS url> [--dry-run]`: one-off import of employee dates and codes
  from WerkX (done on production 2026-10-29). Writes over the target's REST API with a login set in
  the shell (`CMS_TOKEN` or `CMS_EMAIL`/`CMS_PASSWORD`); see `src/migration/README.md`.
  `pnpm migrate:intranet` works the same way for the intranet's specialist groups and employee data (done on
  production 2026-10-30). `CMS_TOKEN` is the admin's `payload-token` cookie, valid 2 h after it was issued.
- Refreshing dev from production: full `pg_restore` of a fresh `backup.sh` dump into an emptied
  `public` schema (`--no-owner --no-privileges`), leaving out the PostGIS image's extras
  (`postgis_topology`, `postgis_tiger_geocoder`, `fuzzystrmatch`) via a TOC list. Dev then has the
  production users.

## Deployment

Production runs on a Hetzner Cloud server as Docker Compose (Caddy, Payload, PostGIS) from
`deploy/`; see [deploy/README.md](deploy/README.md). **Every push to this branch deploys to
production** (`.github/workflows/deploy-cms.yml`, except `*.md`-only pushes); the workflow
refuses schema changes without a migration. Never point `pnpm dev` or the importer at
the production database without `NODE_ENV=production`, or Payload pushes the dev schema into it.
The server's compose file needs `CMS_TAG` in its `.env` (`deploy/deploy.sh` writes it). That `.env` is
never synced with `deploy/.env.example`: a new variable needs a manual server step, so make it required
(`${VAR:?…}`) or it fails silently (as `COOKIE_DOMAIN` did). The website stack is separate, in
`/srv/rla-website/app/deploy` (its config: `app.env`). The server's clone
sits on a detached HEAD (`deploy.sh` checks out each commit), so `git pull` there fails; use fetch +
`checkout --detach`. The workflow reads repository-level secrets/variables, not environment ones. pnpm is
pinned via `packageManager`, and pnpm 12 also records that pin in `pnpm-lock.yaml`
(`packageManagerDependencies`); without it `--frozen-lockfile` fails in the image build.

## Schema building blocks (`src/fields`, `src/access`)

Reuse these instead of re-declaring the shapes:

- `richTextField(name, label)`: localized Lexical rich text with the fixed toolbar. Internal links
  may point to `projects` only; the field's `{name}Html` twin renders them as language-less
  `/p/{code}`.
- `flowField({ localized, captions })`: the "flow" grid of image/text/topic blocks with size
  and modifiers. An image's caption and link come from the media item's `project`. Edited in a
  visual editor (`src/components/cms/FlowField`) that renders the grid with `flow.css`, a port of
  the website's stylesheet; sizes, modifiers and block types live in `src/fields/flowBlocks.ts`,
  which the schema, the editor and the importer all read.
- `linksField`: per-language list of links, each either a project reference or an external URL.
- `featuredNewsField`: per-language, hand-sorted news items for the document's news section
  (Pages so far).
- `featuredProjectsField`: the same for projects, meant as the source of the front page's banner
  carousel (#40). Not read by the website yet, and the importer leaves it empty.
- `visibleInField`: languages whose website lists the entry. Together with drafts
  (`versions: { drafts: true }`) it replaces every legacy visibility flag.
- `legacyIdField`: id of the imported legacy record; the importer upserts by it.
- `countryField()`: ISO 3166-1 alpha-2 country select.
- `publishedOrAuthenticated` / `anyone`: read access. Anonymous requests (the website) only see
  published documents.
- `authenticated` (field access): personal data only logged-in users read or query (employees'
  dates). Derive what the website needs in a collection `beforeRead` hook, which still sees them.
- `websitePreview(slug)` / `websiteGlobalPreview(slug)` (`src/websitePreview.ts`): the Preview
  button, linking the website's `/{lang}/go/{slug}/{id}` resolver. Give it to every collection the
  website shows; where a document lives there is the website's business (its `go.php`).

## Collections

Projects, Project Categories (tree via `@payloadcms/plugin-nested-docs`), Topics, News, News Categories, Awards,
Publications, Publication Categories, Jobs, Pages, Employees, Offices, Mines, Mine Features,
Media, Users. Global: Project Gallery (curated, ordered featured projects per language).
Slugs are plural kebab-case.

Admin navigation: each collection's `admin.group` is a section from `src/i18n/groups.ts`, with a
Lucide icon in `src/app/(payload)/custom.scss`. Every section must be filed in a workspace or as
shared in `src/workspaces.ts` (a unit test checks). The navigation and the dashboard's collection
widget are custom (`src/components/cms/Workspaces`), rebuilt from Payload's `DefaultNav` and
`CollectionCards`; re-check them after a Payload upgrade.

## Site search (`src/search`)

`GET /api/search?q=…&locale=…` is the website's search (#10). It reads the hidden `search-index`
collection: one entry per published document and language (only languages in its `visibleIn`),
with title, secondary text and body as plain text. `sources.ts` says which fields each searchable
collection (projects, topics, publications, awards, news) contributes. Hooks rebuild a document's
entries from its main table on every change, so draft saves don't reach the index; the importer
skips them and rebuilds the whole index at its end. Matching is Postgres full-text search (word
starts, German/English stemming, computed at query time: the index is small) plus an
accent-insensitive substring match for compounds and Chinese.

## The legacy website being replaced

Under `Z:\website\website_rla\`: `1_php` is the live PHP site (its data access lives in
`utils/global/db.php`), `3_frontend` is the admin tool editors use today, `0_img` holds the image
files. Data comes from the legacy MySQL database configured via `LEGACY_WEB_DB_*`. The legacy
table → collection mapping and all legacy quirks are documented in `src/migration/README.md`.

## Migration decisions (2026-09-29)

- **Freeze and cut over.** Done 2026-10-27: the final import ran against production and the legacy
  admin tool is frozen. Production is now the only source of content; data only flows down to dev,
  never up. One-off data fixes on production ship as data migrations (e.g.
  `20261027_093710_fill_search_index`), not as scripts run over a tunnel.
- **Import everything**, including unpublished and retired records (as drafts), so the legacy
  database never has to be consulted again. Exceptions: legacy image slots and page sections the
  current site doesn't render, and one abandoned page draft.
- **Images:** only images referenced by imported records, originals only (Payload generates the
  responsive sizes). Every upload, imported or not, is shrunk to at most 2800 px on its longest
  edge (#28, `src/collections/mediaMaxEdge.ts`); smaller ones are stored byte for byte, and the
  website serves the original as its largest size. Retired employees get no portrait. Uploads stay on local
  disk (decided 2026-10-20): `public/media` in development, `/srv/rla-cms/media` on the server
  (mounted into the container), covered by Hetzner's daily backups. No object storage.
- **Consumer:** after cutover the PHP site reads Payload's REST API. Payload keeps clean names;
  any mapping to old names happens on the PHP side.
- **Projects** use Payload's automatic id. The shared project `code` is a separate unique field
  (empty for a few legacy entries that never had one).
