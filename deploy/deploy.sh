#!/usr/bin/env bash
# Deploys one service at one commit on the server: the CMS (this repo) or the website
# (Rehwaldt/rla-website, its own stack in /srv/rla-website, see its deploy/README.md).
#
# GitHub Actions calls it over SSH with a key that can run nothing else (a forced command in
# ~/.ssh/authorized_keys, see server-setup.md). It sends "<service> <commit> pull <user>" and the
# run's registry token on stdin; the image is pulled from ghcr.io with it and the login removed.
#
# By hand on the server (e.g. from ship.ps1, with the image already loaded):
#   /srv/rla-cms/app/deploy/deploy.sh cms <commit>
set -euo pipefail

fail() { echo "deploy.sh: $*" >&2; exit 1; }

main() {
  local args
  if [ -n "${SSH_ORIGINAL_COMMAND:-}" ]; then
    read -r -a args <<< "$SSH_ORIGINAL_COMMAND"
  else
    args=("$@")
  fi
  local service=${args[0]:-} commit=${args[1]:-} mode=${args[2]:-} user=${args[3]:-}

  [[ $commit =~ ^[0-9a-f]{40}$ ]] || fail "usage: deploy.sh cms|website <40-character commit> [pull <user>]"
  if [ "$mode" = pull ]; then
    [[ $user =~ ^[A-Za-z0-9-]+(\[bot\])?$ ]] || fail "pull needs a GitHub user name"
  fi

  # app_dir: the service repo's clone on the server, with its deploy files in deploy/
  local image tag_var app_dir
  case $service in
    cms)
      image=ghcr.io/rehwaldt/rla-web-cms; tag_var=CMS_TAG
      app_dir=$(dirname "$(dirname "$(readlink -f "$0")")") ;;
    website)
      image=ghcr.io/rehwaldt/rla-website; tag_var=WEBSITE_TAG
      app_dir=/srv/rla-website/app ;;
    *) fail "unknown service: $service" ;;
  esac
  cd "$app_dir/deploy"

  # Deploy files (compose file, Caddyfile, scripts) from the same commit as the image
  git -C "$app_dir" fetch --quiet origin
  git -C "$app_dir" checkout --quiet --detach "$commit"

  if [ "$mode" = pull ]; then
    local token
    read -r token || fail "pull needs the registry token on stdin"
    echo "$token" | docker login ghcr.io -u "$user" --password-stdin >/dev/null
    trap 'docker logout ghcr.io >/dev/null' EXIT
    docker pull --quiet "$image:$commit"
  fi
  docker image inspect "$image:$commit" >/dev/null 2>&1 || fail "image $image:$commit isn't on the server"

  # The running version is recorded in .env, so a plain `docker compose up -d` keeps it.
  if grep -q "^$tag_var=" .env; then
    sed -i "s/^$tag_var=.*/$tag_var=$commit/" .env
  else
    echo "$tag_var=$commit" >> .env
  fi
  docker compose up -d

  # Keep the 5 newest images of this service for rollbacks; the running one is the newest.
  docker image ls "$image" --format '{{.Repository}}:{{.Tag}}' | tail -n +6 | xargs -r docker image rm >/dev/null || true
  docker image prune -f >/dev/null

  echo "Deployed $service at $commit"
}

# Parsed in full before it runs: the checkout above may replace this very file.
main "$@"; exit $?
