# Server setup

How the production server was set up (October 2026), step by step, so it can be rebuilt from
scratch. Once it's done, [README.md](README.md) takes over (first deploy, data copy, updates).

## 1. Order the server (Hetzner Cloud Console)

| Setting | Value |
|---|---|
| Location | Nuremberg (`nbg1`) |
| Image | Ubuntu 26.04 LTS |
| Type | CPX22 (shared vCPU, AMD x86: 2 vCPU, 4 GB RAM, 80 GB disk) |
| Networking | Public IPv4 **and** IPv6 (GitHub and the office network need IPv4) |
| SSH key | The admin's public key (kept in Proton Pass) |
| Backups | On (daily snapshots of the whole disk) |

It must be x86 (`uname -m` prints `x86_64`): the image is built on a Windows PC and only runs on
the same architecture.

## 2. Cloud Firewall (Hetzner Cloud Console → Firewalls)

Inbound rules, all from "Any IPv4" and "Any IPv6":

| Protocol | Port | Purpose |
|---|---|---|
| TCP | 22 | SSH |
| TCP | 80 | Let's Encrypt and the redirect to HTTPS |
| TCP | 443 | HTTPS |
| UDP | 443 | HTTP/3 |
| ICMP | | Ping (optional) |

No outbound rules: with none, all outbound traffic is allowed. Apply the firewall to the server.
It replaces `ufw` on the server, which Docker would bypass for published ports anyway. The
Hetzner web console (`>_` on the server page) doesn't go through it and stays the emergency way
in.

## 3. Updates (as root)

```sh
apt update && apt full-upgrade -y          # reboot if it says so
cat /etc/apt/apt.conf.d/20auto-upgrades    # both values must be "1"
# if not: apt install -y unattended-upgrades && dpkg-reconfigure -plow unattended-upgrades

cat > /etc/apt/apt.conf.d/52automatic-reboot <<'EOF'
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "04:00";
EOF
unattended-upgrade --dry-run --debug 2>&1 | tail -5
```

Security updates install by themselves; when one needs a reboot, the server reboots at 04:00 and
the containers start again on their own.

## 4. Admin user and SSH lockdown (as root)

Keep the root session open until the end, so a mistake can be undone.

```sh
adduser tim                                # password goes into Proton Pass
usermod -aG sudo tim
mkdir -p /home/tim/.ssh
cp /root/.ssh/authorized_keys /home/tim/.ssh/
chown -R tim:tim /home/tim/.ssh
chmod 700 /home/tim/.ssh && chmod 600 /home/tim/.ssh/authorized_keys
```

In a **new** window, `ssh tim@<server-IP>` and `sudo whoami` (prints `root`) must work. Then, back
in the root session:

```sh
cat > /etc/ssh/sshd_config.d/00-hardening.conf <<'EOF'
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
EOF
sshd -t && systemctl restart ssh
```

The `00-` prefix matters: sshd uses the first value it reads, and cloud images ship a later file
that turns password login on. Check with `sudo sshd -T | grep -E
'permitrootlogin|passwordauthentication|kbdinteractive'` (all `no`), and that `ssh root@…` now
fails.

## 5. Docker (as tim)

From Docker's official repository:

```sh
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
sudo tee /etc/apt/sources.list.d/docker.sources >/dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Container logs: at most 3 × 10 MB per container instead of unlimited
sudo tee /etc/docker/daemon.json >/dev/null <<'EOF'
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" }
}
EOF
sudo systemctl restart docker

sudo usermod -aG docker tim                # then log out and back in
```

Check: `docker run --rm hello-world` and `docker compose version`.

## 6. Swap (as tim)

2 GB as a safety net against out-of-memory kills. The image is never built on the server.

```sh
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
echo 'vm.swappiness=10' | sudo tee /etc/sysctl.d/99-swappiness.conf
sudo sysctl --system >/dev/null
```

Check: `free -h` shows `Swap: 2.0Gi`.

## 7. App folders and secrets (as tim)

```sh
sudo mkdir -p /srv/rla-cms/media /srv/rla-cms/backups
sudo chown -R "$USER" /srv/rla-cms
# -b: deploy/ only exists on this branch until it's merged into master
git clone -b feat/website-migration https://github.com/Rehwaldt/rla-web-cms.git /srv/rla-cms/app
cd /srv/rla-cms/app/deploy
cp .env.example .env
sed -i "s/^PAYLOAD_SECRET=$/PAYLOAD_SECRET=$(openssl rand -hex 32)/; s/^POSTGRES_PASSWORD=$/POSTGRES_PASSWORD=$(openssl rand -hex 24)/" .env
chmod 600 .env
sudo chown -R 1001:1001 /srv/rla-cms/media
docker compose config --quiet && echo "env ok"
```

Save `PAYLOAD_SECRET` and `POSTGRES_PASSWORD` from `.env` in Proton Pass. Rebuilding the server
from a database dump needs the same `PAYLOAD_SECRET` to keep users' sessions and API keys valid.

Next: DNS, then the first deploy in [README.md](README.md).
