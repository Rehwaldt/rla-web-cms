# Deployment

The CMS runs on a Hetzner Cloud server (Ubuntu LTS, Docker) as three containers, defined in
[docker-compose.yml](docker-compose.yml):

```
internet ──443──> caddy ──> payload:3000 ──> postgres (PostGIS)
                    │            │
            Let's Encrypt    MEDIA_DIR on the host (uploads)
```

- **caddy** terminates HTTPS for `CMS_DOMAIN` and gets the certificate by itself.
- **payload** is the image built from the repo's [Dockerfile](../Dockerfile). It's built on the
  PC and copied over by [ship.ps1](ship.ps1), because the server (2 vCPU, 4 GB) has too little
  memory for `next build`. On startup it runs the pending migrations from `src/migrations` (see
  "Schema changes" below).
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
UDP 443 only) and a 2 GB swap file as a safety net. The domain's A and AAAA records must point at
the server before Caddy can get a certificate.

Docker publishes ports past `ufw`, so the Cloud Firewall, which filters before the server, is the
one that counts. Only Caddy's 80/443 are published publicly; keep it that way and bind anything
else to `127.0.0.1`, as `postgres` does.

On the PC: Docker Desktop running, and `ssh tim@<server-IP>` working in PowerShell.

## First deploy

On the server, once: folders, clone and secrets as in
[server-setup.md, step 7](server-setup.md#7-app-folders-and-secrets-as-tim).

Then on the PC, in PowerShell in the repo folder:

```powershell
powershell -ExecutionPolicy Bypass -File deploy\ship.ps1 -Server tim@<server-IP>
```

It builds the image, uploads it (about 350 MB), checks out the same commit on the server and
starts the stack. Follow the log on the server with `docker compose logs -f payload` in
`/srv/rla-cms/app/deploy` (Ctrl+C stops following).

Payload connects to the database on the first request. Open `https://<CMS_DOMAIN>/admin` once:
the log shows the migrations running, and an empty database asks for the first admin user.
Skip that form if you copy the data over next. The copy brings its users with it.

## Copying the data over

The dev database on Neon was built by `pnpm dev`'s schema push. It has no record of the
migrations, so a full dump would clash with them. Instead, the migrations create the schema on
the server and only the **data** comes from Neon.

1. Start the stack and open the admin once, so the migrations create the empty schema (above).
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
   tar -C /srv/rla-cms -xf /srv/rla-cms/media.tar && rm /srv/rla-cms/media.tar
   sudo chown -R 1001:1001 /srv/rla-cms/media
   ```

## Updating

Commit and push, then run `ship.ps1` again (above). It refuses uncommitted or unpushed work, so
what runs on the server always matches a commit. The new container applies any new migrations
when it first connects.

Every shipped image stays on the server, tagged with its commit (`docker image ls rla-web-cms`).
To roll back, retag an older one and restart:

```sh
docker tag rla-web-cms:<commit> rla-web-cms:latest
cd /srv/rla-cms/app/deploy && docker compose up -d
```

Rolling back across a migration needs a database restore too (see "Backups"). Delete old images
now and then with `docker image rm rla-web-cms:<commit>`.

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
