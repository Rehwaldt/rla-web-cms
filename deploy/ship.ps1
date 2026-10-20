# Builds the production image on this PC and starts it on the server. The server has too little
# memory for `next build`, so it never builds; it only loads the finished image.
#
# Usage, in PowerShell in the repo folder (the -ExecutionPolicy part is only needed if Windows
# refuses to run scripts):
#   powershell -ExecutionPolicy Bypass -File deploy\ship.ps1 -Server tim@<server-IP>
#
# Ships the current commit, which must be committed and pushed: the server checks out the same
# commit for its deploy files (compose file, Caddyfile, backup script).

param(
  [Parameter(Mandatory = $true)][string]$Server,
  [string]$AppDir = '/srv/rla-cms/app'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent

function Step([string]$What, [scriptblock]$Command) {
  Write-Host "==> $What" -ForegroundColor Cyan
  & $Command
  if ($LASTEXITCODE -ne 0) { throw "$What failed (exit code $LASTEXITCODE)" }
}

if (git -C $root status --porcelain --untracked-files=no) {
  throw 'Uncommitted changes. Commit (and push) first, so the image matches a commit.'
}
$commit = (git -C $root rev-parse --short HEAD).Trim()
if (-not (git -C $root branch -r --contains HEAD)) {
  throw "Commit $commit isn't pushed yet. Push first, so the server can check it out."
}

$tar = Join-Path $env:TEMP "rla-web-cms-$commit.tar"
$remoteTar = "/tmp/rla-web-cms-$commit.tar"

try {
  Step "Building image for $commit" { docker build -t rla-web-cms:latest -t "rla-web-cms:$commit" $root }
  Step 'Saving image to a file' { docker save -o $tar rla-web-cms:latest "rla-web-cms:$commit" }
  Step "Uploading to $Server" { scp $tar "${Server}:$remoteTar" }
  Step 'Loading image and restarting on the server' {
    ssh $Server ("docker load -i $remoteTar && rm $remoteTar" +
      " && git -C $AppDir fetch --quiet origin && git -C $AppDir checkout --quiet --detach $commit" +
      " && cd $AppDir/deploy && docker compose up -d && docker image prune -f")
  }
}
finally {
  if (Test-Path $tar) { Remove-Item $tar }
}

Write-Host "==> Deployed $commit. Follow the log with: ssh $Server 'cd $AppDir/deploy && docker compose logs -f payload'" -ForegroundColor Green
