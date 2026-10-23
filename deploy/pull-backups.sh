#!/usr/bin/env bash
# Pulls the nightly database dumps and the uploads from the server to an on-prem machine.
# Runs there, not on the server: n8n starts it every morning over SSH (with a key that can run
# nothing else), from a clone of this repo, see README.md ("On-prem copy"). The server holds no
# key to the on-prem machine, so nobody who takes over the server can delete these copies.
#
# It logs in with two keys that may only read one folder each (rrsync -ro as forced command):
# the ssh config aliases DUMPS_HOST (/srv/rla-cms/backups) and MEDIA_HOST (/srv/rla-cms/media).
# What reached the on-prem side is never overwritten or deleted from the server's side:
# - dumps are copied once and pruned here: all of the last KEEP_DAYS days, and the first one of
#   each month for KEEP_MONTHS months
# - uploads are never deleted; one that changes on the server keeps its old version in
#   media-replaced/<date>/
set -euo pipefail
umask 077

DEST=${DEST:-/srv/rla-cms-offsite}
DUMPS_HOST=${DUMPS_HOST:-rla-offsite-dumps}
MEDIA_HOST=${MEDIA_HOST:-rla-offsite-media}
KEEP_DAYS=${KEEP_DAYS:-30}
KEEP_MONTHS=${KEEP_MONTHS:-12}
# The server dumps at 03:15 UTC; anything older than this means the dump or the pull is broken
MAX_AGE_HOURS=${MAX_AGE_HOURS:-36}

fail() { echo "$(date -Iseconds) pull-backups.sh: $*" >&2; exit 1; }

# Oldest first (the names sort by date), so the first dump seen of a month is the one kept
prune_dumps() {
  local daily_cutoff monthly_cutoff kept_month='' file name day month
  daily_cutoff=$(date -d "-$KEEP_DAYS days" +%F)
  monthly_cutoff=$(date -d "-$KEEP_MONTHS months" +%Y-%m)
  for file in "$DEST"/dumps/payload-*.dump; do
    [ -e "$file" ] || continue
    name=$(basename "$file")            # payload-2026-10-21_0315.dump
    day=${name:8:10} month=${name:8:7}
    [[ $day < $daily_cutoff ]] || continue
    if [[ $month != "$kept_month" && ! $month < $monthly_cutoff ]]; then
      kept_month=$month
      continue
    fi
    rm -- "$file"
  done
}

check_newest_dump() {
  local newest
  newest=$(find "$DEST/dumps" -name 'payload-*.dump' -mmin -$((MAX_AGE_HOURS * 60)) | sort | tail -n 1)
  [ -n "$newest" ] || fail "no dump younger than $MAX_AGE_HOURS hours in $DEST/dumps"
  [ -s "$newest" ] || fail "$newest is empty"
  echo "$newest"
}

main() {
  mkdir -p "$DEST/dumps" "$DEST/media"

  # -t keeps the server's timestamps, which check_newest_dump relies on
  rsync -t --ignore-existing --include='payload-*.dump' --exclude='*' \
    "$DUMPS_HOST:./" "$DEST/dumps/" || fail "copying the dumps failed"
  rsync -rt --backup --backup-dir="$DEST/media-replaced/$(date +%F)" \
    "$MEDIA_HOST:./" "$DEST/media/" || fail "copying the uploads failed"

  prune_dumps
  local newest
  newest=$(check_newest_dump)
  echo "$(date -Iseconds) pulled; newest dump $newest"
}

main "$@"
