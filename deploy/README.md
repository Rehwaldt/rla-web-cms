# Deployment

The CMS runs on a Hetzner Cloud server (Ubuntu LTS, Docker) as three containers, defined in
[docker-compose.yml](docker-compose.yml):

```
internet ──443──> caddy ─┬─ CMS_DOMAIN ──────────────> payload:3000 ──> postgres (PostGIS)
                    │    │                               │     ▲
            Let's Encrypt│                               ▼     │ REST API
                         └─ WEBSITE_DOMAIN           MEDIA_DIR │ (uploads, on the host)
                              /api/media/file/* ────────▲      │
                              everything else ──> website:80 ──┘ (rla-website stack)
```

- **caddy** terminates HTTPS for `CMS_DOMAIN` and `WEBSITE_DOMAIN` and gets the certificates by
  itself. The website (Rehwaldt/rla-website, its own `deploy/` stack) joins this stack's network
  `rla-cms_default`; Caddy proxies to it as `website:80` and serves its `/api/media/file/`
  straight from `MEDIA_DIR` (read-only), and the website reads Payload as `http://payload:3000`.
  Until the website stack runs, `WEBSITE_DOMAIN` answers 502; the CMS is unaffected.
- **payload** is the image built from the repo's [Dockerfile](../Dockerfile). GitHub Actions
  builds it on every push and the server pulls it from `ghcr.io` (see "Updating"); the server
  itself (2 vCPU, 4 GB) has too little memory for `next build`. On startup it runs the pending
  migrations from `src/migrations` (see "Schema changes" below).
- **postgres** keeps its data in the `pgdata` volume. It's only reachable from the server itself.

Server layout:

| Path | Contents |
|---|---|
| `/srv/rla-cms/app` | Clone of this repo; commands below run in `/srv/rla-cms/app/deploy` |
| `/srv/rla-cms/app/deploy/.env` | Secrets, from [.env.example](.env.example); never committed |
| `/srv/rla-cms/media` | Uploads (`MEDIA_DIR`), owned by uid 1001 |
| `/srv/rla-cms/backups` | Nightly database dumps |

## Prerequisites on the server

[server-setup.md](server-setup.md) has every step of setting up the server, to rebuild it if needed.

Docker Engine with the compose plugin, the Hetzner Cloud Firewall (inbound TCP 22, 80, 443 and
UDP 443 only) and a 2 GB swap file as a safety net. Both domains' A and AAAA records must point
at the server before Caddy can get their certificates.

Docker publishes ports past `ufw`, so the Cloud Firewall, which filters before the server, is the
one that counts. Only Caddy's 80/443 are published publicly; keep it that way and bind anything
else to `127.0.0.1`, as `postgres` does.

## First deploy

On the server, once: folders, clone and secrets as in
[server-setup.md, step 7](server-setup.md#7-app-folders-and-secrets-as-tim), and the deploy key
for GitHub Actions as in [step 8](server-setup.md#8-automatic-deploys-from-github-actions).

Then start the workflow: GitHub → Actions → **Deploy CMS** → **Run workflow** (or push a
commit). It builds the image, checks out the same commit on the server and starts the stack.
Follow the log on the server with `docker compose logs -f payload` in `/srv/rla-cms/app/deploy`
(Ctrl+C stops following).

Payload connects to the database on the first request. Open `https://<CMS_DOMAIN>/admin` once:
the log shows the migrations running, and an empty database asks for the first admin user.
Skip that form if you copy the data over next. The copy brings its users with it.

## Copying the data over

The dev database on Neon was built by `pnpm dev`'s schema push. It has no record of the
migrations, so a full dump would clash with them. Instead, the migrations create the schema on
the server and only the **data** comes from Neon.

1. Start the stack and open the admin once, so the migrations create the empty schema (above).
   Don't create a user: the restore needs empty tables and brings Neon's users along (passwords
   carry over). If a user was created already, empty the database first with
   `docker compose down && docker volume rm rla-cms_pgdata && docker compose up -d`, then open
   the admin once more.
2. On the PC, with Docker running, dump Neon's data. In PowerShell in the repo folder, with
   `DATABASE_URL` from the repo's `.env` as the Neon URL. pg_dump warns about circular foreign
   keys; the restore below handles them.
   ```powershell
   $neon = '<DATABASE_URL from .env>'
   docker run --rm -e PGSSLROOTCERT=system -v "${PWD}:/out" postgis/postgis:18-3.6-alpine `
     pg_dump $neon --format=custom --data-only `
     --exclude-table-data=payload_migrations -f /out/neon-data.dump
   scp neon-data.dump <user>@<server>:/srv/rla-cms/
   Remove-Item neon-data.dump
   ```
3. On the server, load it into the empty schema:
   ```sh
   docker compose stop payload
   docker compose exec -T postgres pg_restore -U payload -d payload \
     --data-only --disable-triggers --single-transaction < /srv/rla-cms/neon-data.dump
   docker compose start payload
   rm /srv/rla-cms/neon-data.dump
   ```
4. Copy the uploads from the PC as one archive. It's several GB, so the upload takes a while.
   In PowerShell in the repo folder:
   ```powershell
   tar -C public -cf media.tar media
   scp media.tar <user>@<server>:/srv/rla-cms/
   Remove-Item media.tar
   ```
   Then on the server:
   ```sh
   # sudo: the media folder belongs to the app user (uid 1001), not to tim
   sudo tar -C /srv/rla-cms --no-same-owner -xf /srv/rla-cms/media.tar && rm /srv/rla-cms/media.tar
   sudo chown -R 1001:1001 /srv/rla-cms/media
   ```

## Updating

Push. Every push to `feat/website-migration` runs the **Deploy CMS** workflow
([deploy-cms.yml](../.github/workflows/deploy-cms.yml)), visible under the repo's Actions tab:

1. **Migrations check:** fails if the schema changed without a migration (see "Schema changes").
2. **Build:** builds the image and pushes it to `ghcr.io/rehwaldt/rla-web-cms:<commit>`.
3. **Deploy:** connects to the server with a key that can only run [deploy.sh](deploy.sh), which
   checks out the same commit, pulls the image, records it as `CMS_TAG` in `.env` and restarts
   the stack. The new container applies any new migrations when it first connects.

Pushes that only change `*.md` files don't deploy. To deploy again without a push: Actions →
Deploy CMS → Run workflow.

If GitHub Actions is unavailable, [ship.ps1](ship.ps1) does the same from the PC (Docker Desktop
running, `ssh tim@<server-IP>` working in PowerShell):

```powershell
powershell -ExecutionPolicy Bypass -File deploy\ship.ps1 -Server tim@<server-IP>
```

### Rolling back

The server keeps the 5 newest images (`docker image ls ghcr.io/rehwaldt/rla-web-cms`). To go
back to one of them, with the full commit hash:

```sh
/srv/rla-cms/app/deploy/deploy.sh cms <commit>
```

It also checks out that commit's deploy files. Rolling back across a migration needs a database
restore too (see "Backups"). The next push deploys the newest commit again.

### Schema changes

`pnpm dev` pushes schema changes straight into the dev database. Production never does: it only
runs the migration files. So every schema change that ships needs
`pnpm payload migrate:create <name>`, committed together with the change.

## Running the importer against the server

The importer (`pnpm migrate:website`) needs the legacy MySQL and `Z:\`, so it runs on the PC
and reaches the server's database through an SSH tunnel:

```sh
ssh -N -L 15432:127.0.0.1:5432 <user>@<server>     # keep open in a second terminal
```

Then, in PowerShell in the repo folder:

```powershell
$env:NODE_ENV = 'production'   # REQUIRED: otherwise Payload pushes the dev schema into production
$env:DATABASE_URL = 'postgresql://payload:<POSTGRES_PASSWORD>@localhost:15432/payload'
pnpm migrate:website
```

The importer saves new uploads into the PC's `public/media`. Copy them to the server afterwards
(step 4 above).

## Backups

Hetzner's server backups snapshot the whole disk daily. On top of that, [backup.sh](backup.sh)
dumps the database nightly and keeps 14 days. Add it to the deploy user's crontab
(`crontab -e`):

```
15 3 * * * /srv/rla-cms/app/deploy/backup.sh >> /srv/rla-cms/backups/backup.log 2>&1
```

Restoring a dump replaces the current database:

```sh
docker compose stop payload
docker compose exec -T postgres pg_restore -U payload -d payload --clean --if-exists \
  --single-transaction < /srv/rla-cms/backups/payload-<date>.dump
docker compose start payload
```

Copying the dumps off the server (e.g. to a Hetzner Storage Box) is still open.
