#!/bin/sh
# Nightly database dump. Run by cron on the server, see README.md.
# Keeps the dumps of the last KEEP_DAYS days in BACKUP_DIR.
set -eu

BACKUP_DIR=${BACKUP_DIR:-/srv/rla-cms/backups}
KEEP_DAYS=${KEEP_DAYS:-14}

cd "$(dirname "$0")"
mkdir -p "$BACKUP_DIR"

file="$BACKUP_DIR/payload-$(date +%Y-%m-%d_%H%M).dump"
docker compose exec -T postgres pg_dump -U payload -d payload --format=custom > "$file.partial"
mv "$file.partial" "$file"

find "$BACKUP_DIR" -name 'payload-*.dump' -mtime +"$KEEP_DAYS" -delete
echo "$(date -Iseconds) wrote $file"
