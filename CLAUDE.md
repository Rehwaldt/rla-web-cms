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
- `pnpm test:unit` (Vitest, no database; importer planners in `tests/unit/`) / `pnpm test:int`
  (Vitest, needs Postgres) / `pnpm test:e2e` (Playwright) / `pnpm test` (all). `pnpm lint`.
- `pnpm migrate:website [--dry-run]`: imports the legacy website database (see
  `src/migration/README.md`). Re-runnable; writes a report to `migration/reports/`.
  `pnpm migrate:website:verify [projectCode]` spot-checks the result.

## Deployment

Production runs on a Hetzner Cloud server as Docker Compose (Caddy, Payload, PostGIS) from
`deploy/`; see [deploy/README.md](deploy/README.md). **Every push to this branch deploys to
production** (`.github/workflows/deploy-cms.yml`, except `*.md`-only pushes); the workflow
refuses schema changes without a migration. Never point `pnpm dev` or the importer at
the production database without `NODE_ENV=production`, or Payload pushes the dev schema into it.
The server's compose file needs `CMS_TAG` in its `.env` (`deploy/deploy.sh` writes it). The server's clone
sits on a detached HEAD (`deploy.sh` checks out each commit), so `git pull` there fails; use fetch +
`checkout --detach`. The workflow reads repository-level secrets/variables, not environment ones. pnpm is
pinned via `packageManager`, and pnpm 12 also records that pin in `pnpm-lock.yaml`
(`packageManagerDependencies`); without it `--frozen-lockfile` fails in the image build.

## Schema building blocks (`src/fields`, `src/access`)

Reuse these instead of re-declaring the shapes:

- `richTextField(name, label)`: localized Lexical rich text with the fixed toolbar. Internal links
  may point to `projects` only; the field's `{name}Html` twin renders them as language-less
  `/p/{code}`.
- `flowField({ localized, captions })`: the "flow" grid of image/text/news/topic blocks with size
  and modifiers. An image's caption and link come from the media item's `project`. Edited in a
  visual editor (`src/components/cms/FlowField`) that renders the grid with `flow.css`, a port of
  the website's stylesheet; sizes, modifiers and block types live in `src/fields/flowBlocks.ts`,
  which the schema, the editor and the importer all read.
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
