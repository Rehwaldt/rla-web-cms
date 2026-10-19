# Deployment

The CMS runs on a Hetzner Cloud server (Ubuntu LTS, Docker) as three containers, defined in
[docker-compose.yml](docker-compose.yml):

```
internet ──443──> caddy ──> payload:3000 ──> postgres (PostGIS)
                    │            │
            Let's Encrypt    MEDIA_DIR on the host (uploads)
```

- **caddy** terminates HTTPS for `CMS_DOMAIN` and gets the certificate by itself.
- **payload** is the image built from the repo's [Dockerfile](../Dockerfile). On startup it runs
  the pending migrations from `src/migrations` (see "Schema changes" below).
- **postgres** keeps its data in the `pgdata` volume. It's only reachable from the server itself.

Server layout:

| Path | Contents |
|---|---|
| `/srv/rla-cms/app` | Clone of this repo; commands below run in `/srv/rla-cms/app/deploy` |
| `/srv/rla-cms/app/deploy/.env` | Secrets, from [.env.example](.env.example); never committed |
| `/srv/rla-cms/media` | Uploads (`MEDIA_DIR`), owned by uid 1001 |
| `/srv/rla-cms/backups` | Nightly database dumps |

## Prerequisites on the server

Docker Engine with the compose plugin, a firewall that allows only 22, 80 and 443, and swap
(the image build needs more memory than the server has). The domain's A and AAAA records must
point at the server before Caddy can get a certificate.

Docker publishes ports past `ufw`. Only Caddy's 80/443 are published publicly; keep it that way
and bind anything else to `127.0.0.1`, as `postgres` does.

## First deploy

```sh
sudo mkdir -p /srv/rla-cms/media /srv/rla-cms/backups
sudo chown -R "$USER" /srv/rla-cms
git clone https://github.com/Rehwaldt/rla-web-cms.git /srv/rla-cms/app
cd /srv/rla-cms/app && git checkout feat/website-migration   # until it's merged
cd deploy
cp .env.example .env
nano .env                                  # fill in the secrets
sudo chown -R 1001:1001 /srv/rla-cms/media
docker compose up -d --build
docker compose logs -f payload             # Ctrl+C to stop following
```

Payload connects to the database on the first request. Open `https://<CMS_DOMAIN>/admin` once:
the log shows the migrations running, and an empty database asks for the first admin user.
Skip that form if you copy the data over next. The copy brings its users with it.

## Copying the data over

The dev database on Neon was built by `pnpm dev`'s schema push. It has no record of the
migrations, so a full dump would clash with them. Instead, the migrations create the schema on
the server and only the **data** comes from Neon.

1. Start the stack and open the admin once, so the migrations create the empty schema (above).
2. On the PC, with Docker running, dump Neon's data (`$NEON_URL` is `DATABASE_URL` from the
   repo's `.env`):
   ```sh
   docker run --rm -v "$PWD:/out" postgis/postgis:18-3.6-alpine \
     pg_dump "$NEON_URL" --format=custom --data-only \
     --exclude-table-data=payload_migrations -f /out/neon-data.dump
   scp neon-data.dump <user>@<server>:/srv/rla-cms/
   ```
3. On the server, load it into the empty schema:
   ```sh
   docker compose stop payload
   docker compose exec -T postgres pg_restore -U payload -d payload \
     --data-only --disable-triggers --single-transaction < /srv/rla-cms/neon-data.dump
   docker compose start payload
   rm /srv/rla-cms/neon-data.dump
   ```
4. Copy the uploads from the PC (from the repo folder, in Git Bash). It's several GB, so it takes
   a while:
   ```sh
   tar -C public -cf - media | ssh <user>@<server> "tar -C /srv/rla-cms -xf -"
   ssh <user>@<server> "sudo chown -R 1001:1001 /srv/rla-cms/media"
   ```

## Updating

```sh
cd /srv/rla-cms/app && git pull
cd deploy && docker compose up -d --build
```

The new container applies any new migrations when it first connects.

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
