# rla-web-cms — website branch

Payload CMS 3 / Next.js app that replaces the legacy CMS of the public rehwaldt.de website: the
`web` MySQL database, edited through the PHP admin tool `website_rla/3_frontend` and rendered by
`website_rla/1_php`.

This branch (`feat/website-migration`) is deliberately scoped to the website only. The WordPress
intranet and WerkX (time-tracking) integrations live on `master` and will be brought back later.
See [CLAUDE.md](./CLAUDE.md) for the scope, the plan and the legacy data model.

## Stack

- [Payload CMS 3](https://payloadcms.com/) on [Next.js 16](https://nextjs.org/)
- **Postgres** via `@payloadcms/db-postgres`
- Localization: `de` (default) / `en`, with fallback
- [Leaflet](https://leafletjs.com/) for the custom map/location field

## Local development

1. Copy the example environment file and fill in real values:

   ```sh
   cp .env.example .env
   ```

   - `DATABASE_URL`: a Postgres connection string.
   - `PAYLOAD_SECRET`: any random string.
   - `LEGACY_WEB_DB_*`: the legacy `web` MySQL database. Only needed for the migration.

2. Install dependencies and start the dev server:

   ```sh
   pnpm install
   pnpm dev
   ```

3. Open `http://localhost:3000/admin` and create the first admin user.

### Docker (optional)

`docker-compose.yml` starts a local Postgres next to the app:

```sh
docker compose up
```

Point `DATABASE_URL` at `postgresql://payload:payload@postgres:5432/payload` (or whatever you set
in `docker-compose.yml`).

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | Standard Next.js dev/build/start |
| `pnpm generate:types` | Regenerates `src/payload-types.ts`. Run after any collection or field change |
| `pnpm generate:importmap` | Regenerates Payload's admin import map |
| `pnpm lint` | ESLint |
| `pnpm test` | Runs `test:int` (Vitest) and `test:e2e` (Playwright) |

## Collections

Projects (+ Project Categories, Project Gallery), Topics, News, Awards, Publications
(+ Publication Categories), Jobs, Pages, Employees, Offices, Mines (+ Mine Features), Media,
Users. See [CONTEXT.md](./CONTEXT.md) for what each term means.
