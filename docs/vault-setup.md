# Obsidian Vault Setup

This project can write daily markdown into a dedicated Obsidian vault on your VPS.

Recommended vault root:

```text
/opt/mission-control/Agentic OS Vault
```

Recommended folder layout:

```text
Agentic OS Vault/
  Daily/
  Goals/
  Journal/
```

How entries map:

- chat entries go to `Daily/YYYY-MM-DD.md`
- goal entries go to `Goals/YYYY-MM-DD.md`
- journal entries go to `Journal/YYYY-MM-DD.md`

Environment variable:

```bash
OBSIDIAN_VAULT_DIR=/opt/mission-control/Agentic OS Vault
```

Why this layout works well:

- Obsidian can open the root folder directly as a vault
- each entry type stays organized without needing a database
- the files remain portable plain markdown

## VPS startup checklist

1. Create the vault directory on the VPS.
2. Create the `Daily`, `Goals`, and `Journal` folders.
3. Set `OBSIDIAN_VAULT_DIR` in the service environment.
4. Restart the app service.
5. Open the vault root in Obsidian and confirm the first note appears.

## Suggested next step

If you later want journal and goal forms in the UI, they can reuse the same
markdown writer and land in their matching folders automatically.
