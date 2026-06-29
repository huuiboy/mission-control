# VPS Service Environment

If you run `mission-control` under `systemd`, set the vault path there so it
survives restarts.

Full unit template:

See [mission-control.service](./mission-control.service.md).

If your app is launched by a different process manager, set the same
`OBSIDIAN_VAULT_DIR` value in that manager instead.

Suggested companion folders:

```text
/opt/mission-control/Agentic OS Vault/Daily
/opt/mission-control/Agentic OS Vault/Goals
/opt/mission-control/Agentic OS Vault/Journal
```
