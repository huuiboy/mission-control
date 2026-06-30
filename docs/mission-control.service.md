# mission-control.service

Use this as the `systemd` unit for the VPS.

```ini
[Unit]
Description=Mission Control
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/mission-control
Environment=NODE_ENV=production
Environment=OBSIDIAN_VAULT_DIR=/opt/mission-control/Agentic OS Vault
EnvironmentFile=-/opt/mission-control/.env
ExecStart=/usr/bin/npm run start -- --hostname 127.0.0.1 --port 3001
Restart=always
RestartSec=5
User=www-data
Group=www-data

[Install]
WantedBy=multi-user.target
```

## Install steps

1. Save the unit as `/etc/systemd/system/mission-control.service`.
2. Run `sudo systemctl daemon-reload`.
3. Run `sudo systemctl enable mission-control`.
4. Run `sudo systemctl restart mission-control`.
5. Check status with `sudo systemctl status mission-control`.

## Notes

- If your Node or npm binary lives somewhere else, update `ExecStart`.
- If you installed Node with `nvm`, use the absolute binary path instead of a
  shell alias or profile-dependent command.
- If you prefer a non-root deploy user, replace `User` and `Group`.
- Put your OpenAI variables in `/opt/mission-control/.env`:

```text
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.5
```

`OPENAI_MODEL` is optional; leave it out to use the app default.

- The vault path should already exist:

```text
/opt/mission-control/Agentic OS Vault
```

## Optional companion folders

```text
/opt/mission-control/Agentic OS Vault/Daily
/opt/mission-control/Agentic OS Vault/Goals
/opt/mission-control/Agentic OS Vault/Journal
```
