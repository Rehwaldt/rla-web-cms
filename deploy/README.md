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
  The edit view's Preview button opens `https://WEBSITE_DOMAIN/{lang}/go/…`, and with
  `COOKIE_DOMAIN` set the website sees the CMS login and shows editors an "Edit in CMS" bar (#31).
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

### On-prem copy

n8n on an office Linux machine (server02) starts [pull-backups.sh](pull-backups.sh) every
morning, which pulls the dumps and the uploads into `/srv/rla-cms-offsite/{dumps,media}`.
server02 connects out to the server; nothing connects into the office. It logs in with
two keys that can each only read one folder (`rrsync -ro` as forced command), and the server
holds no key to the office, so nobody who takes over the server can delete the copies.

- Dumps are copied once and never overwritten. It keeps all of the last 30 days and the first
  dump of each month for 12 months.
- Uploads are never deleted there; one that changes on the server keeps its old version in
  `media-replaced/<date>/`.
- The run fails (exit code 1, a `pull-backups.sh: …` message) when the newest dump is older than
  36 hours, i.e. when the dump on the server or the pull itself stopped working. n8n then sends a
  notification. If n8n itself stops, nothing does: its Executions list shows the last run.

Setup, on **server02** first (as the user that will run it, with sudo):

```sh
# Prerequisites: rsync, ~10 GB free, and the server reachable on port 22. The last command must
# answer "Permission denied (publickey)"; a timeout means the office firewall blocks it.
rsync --version | head -1
df -h /srv
ssh -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null tim@159.69.84.183 true

sudo mkdir -p /srv/rla-cms-offsite && sudo chown "$USER" /srv/rla-cms-offsite
git clone -b feat/website-migration https://github.com/Rehwaldt/rla-web-cms.git /srv/rla-cms-offsite/app
for k in dumps media; do ssh-keygen -t ed25519 -N '' -C "rla-offsite-$k" -f ~/.ssh/rla-offsite-$k; done
cat >> ~/.ssh/config <<'EOF'
Host rla-offsite-dumps rla-offsite-media
  HostName 159.69.84.183
  User tim
  IdentitiesOnly yes
Host rla-offsite-dumps
  IdentityFile ~/.ssh/rla-offsite-dumps
Host rla-offsite-media
  IdentityFile ~/.ssh/rla-offsite-media
EOF
cat ~/.ssh/rla-offsite-dumps.pub ~/.ssh/rla-offsite-media.pub
```

Then on the **Hetzner server** (as tim), with the two lines printed last:

```sh
command -v rrsync                      # /usr/bin/rrsync, part of the rsync package
echo 'command="/usr/bin/rrsync -ro /srv/rla-cms/backups",restrict <rla-offsite-dumps.pub line>' >> ~/.ssh/authorized_keys
echo 'command="/usr/bin/rrsync -ro /srv/rla-cms/media",restrict <rla-offsite-media.pub line>' >> ~/.ssh/authorized_keys
echo "159.69.84.183 $(cut -d' ' -f1,2 /etc/ssh/ssh_host_ed25519_key.pub)"   # for server02's known_hosts
```

Back on **server02**: trust the server's key and run once (the first run copies all uploads,
several GB):

```sh
echo '<line printed last on the server>' >> ~/.ssh/known_hosts
/srv/rla-cms-offsite/app/deploy/pull-backups.sh   # ends with "pulled; newest dump …"
ssh rla-offsite-dumps ls                           # refused: the key only does rsync
```

**Schedule in n8n.** n8n starts the script over SSH, as the same user on server02, with a key
that can only run the script; n8n's credential gives no shell. On server02:

```sh
systemctl is-active ssh                # active: n8n needs server02's SSH server
ssh-keygen -t ed25519 -N '' -C n8n-pull-backups -f ~/n8n-pull-backups
echo "command=\"/srv/rla-cms-offsite/app/deploy/pull-backups.sh\",restrict $(cat ~/n8n-pull-backups.pub)" >> ~/.ssh/authorized_keys
cat ~/n8n-pull-backups                 # private key, for the n8n credential below
```

In n8n:

1. Credential **SSH Private Key**: host server02's LAN name or IP (not `localhost`, which in a
   Docker container is the container itself), port 22, the user from above, the private key.
   Then `rm ~/n8n-pull-backups ~/n8n-pull-backups.pub` on server02.
2. Workflow **Pull backups from Hetzner**:
   - **Schedule Trigger**: daily at 07:00, after the server's 03:15 UTC dump and its 04:00
     update reboots.
   - **SSH** → Execute Command, command `pull-backups.sh` (the key runs the script whatever the
     command says), the credential above. Settings → On Error: *Continue (using error output)*,
     so an unreachable server02 alerts too.
   - **If** `{{ $json.code }}` is not equal to `0` → a notification node with
     `{{ $json.stderr }}`. Connect the SSH node's error output to the same notification.
3. Run it once with **Execute workflow**: the SSH output's `code` is `0` and `stdout` ends with
   `pulled; newest dump …`. Activate the workflow.

To revoke server02's access, delete the two lines ending in `rla-offsite-dumps` and
`rla-offsite-media` from the server's `~/.ssh/authorized_keys`; n8n's, the line ending in
`n8n-pull-backups` from server02's. Update the script there with
`git -C /srv/rla-cms-offsite/app pull` (switch the clone to `main` once this branch is merged).

To restore from the on-prem copy, `scp` the dump to the server and restore it as above; the
uploads go back with `rsync -rt /srv/rla-cms-offsite/media/ tim@159.69.84.183:/srv/rla-cms/media/`
(a normal key, not the restricted ones). Restoring needs the same `PAYLOAD_SECRET`, which is in
the password manager, not in the copy.
