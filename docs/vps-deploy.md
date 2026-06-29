# VPS Deployment Runbook

Use this on the Ubuntu 24 VPS at `/opt/mission-control`.

You can also use the helper script in [vps-deploy.sh](./vps-deploy.sh) if you
want one command to create the vault, service, and Nginx config.

Preview mode:

```bash
PRINT_ONLY=1 sudo bash /opt/mission-control/docs/vps-deploy.sh
```

That prints the generated files without writing them.

## Preflight

Before you start, confirm where Node and npm live:

```bash
which node
which npm
```

If those commands print paths under `nvm`, copy the full paths into the
systemd service instead of relying on shell startup files.

## 1. Create the Obsidian vault folders

```bash
sudo mkdir -p "/opt/mission-control/Agentic OS Vault/Daily"
sudo mkdir -p "/opt/mission-control/Agentic OS Vault/Goals"
sudo mkdir -p "/opt/mission-control/Agentic OS Vault/Journal"
sudo chown -R www-data:www-data "/opt/mission-control/Agentic OS Vault"
```

If the app files are owned by a different deploy user, keep the vault folders
owned by that same account or adjust `User` and `Group` in the service file.

## 2. Install the systemd service

Save the unit file from [mission-control.service.md](./mission-control.service.md) as:

```text
/etc/systemd/system/mission-control.service
```

Then run:

```bash
sudo systemctl daemon-reload
sudo systemctl enable mission-control
sudo systemctl restart mission-control
sudo systemctl status mission-control
```

## 3. Enable Nginx

Save the config from [nginx-reverse-proxy.md](./nginx-reverse-proxy.md) as:

```text
/etc/nginx/sites-available/mission-control
```

Then enable it:

```bash
sudo ln -s /etc/nginx/sites-available/mission-control /etc/nginx/sites-enabled/mission-control
sudo nginx -t
sudo systemctl reload nginx
```

If you use UFW, allow web traffic:

```bash
sudo ufw allow 'Nginx Full'
```

## 4. Issue TLS

After DNS for `tryl.apexledger.pro` points to the VPS:

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tryl.apexledger.pro
```

## Final check

Open:

```text
https://tryl.apexledger.pro
```

Confirm:

- the app loads
- the service stays active after restart
- the vault notes appear under `/opt/mission-control/Agentic OS Vault`
