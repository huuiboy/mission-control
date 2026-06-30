# VPS Service Environment

If you run `mission-control` under `systemd`, set the vault path there so it
survives restarts.

If Hermes should use ChatGPT on the VPS, also put the OpenAI values in
`/opt/mission-control/.env` and let the service load them:

```text
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.5
```

`OPENAI_MODEL` is optional; leave it out if you want the app default.

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
