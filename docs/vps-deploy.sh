#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/mission-control}"
APP_USER="${APP_USER:-www-data}"
APP_GROUP="${APP_GROUP:-www-data}"
APP_HOSTNAME="${APP_HOSTNAME:-tryl.apexledger.pro}"
APP_PORT="${APP_PORT:-3001}"
VAULT_DIR="${VAULT_DIR:-$APP_DIR/Agentic OS Vault}"
OPENAI_ENV_FILE="${OPENAI_ENV_FILE:-$APP_DIR/.env}"
OPENAI_MODEL="${OPENAI_MODEL:-}"
SERVICE_NAME="${SERVICE_NAME:-mission-control}"
PRINT_ONLY="${PRINT_ONLY:-0}"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available/${SERVICE_NAME}"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled/${SERVICE_NAME}"
OPENAI_ENV_LINES=()

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this script as root (for example: sudo bash docs/vps-deploy.sh)." >&2
  exit 1
fi

if [[ ! -d "$APP_DIR" ]]; then
  echo "Expected app directory does not exist: $APP_DIR" >&2
  exit 1
fi

NPM_BIN="${NPM_BIN:-$(command -v npm 2>/dev/null || true)}"

if [[ -z "$NPM_BIN" ]]; then
  echo "npm is not installed or not on PATH." >&2
  echo "If you use nvm, set NPM_BIN to the absolute path before running this script." >&2
  exit 1
fi

if [[ -n "${OPENAI_API_KEY:-}" ]]; then
  OPENAI_ENV_LINES+=("OPENAI_API_KEY=${OPENAI_API_KEY}")
fi

if [[ -n "${OPENAI_MODEL:-}" ]]; then
  OPENAI_ENV_LINES+=("OPENAI_MODEL=${OPENAI_MODEL}")
fi

SERVICE_CONFIG=$(cat <<EOF
[Unit]
Description=Mission Control
After=network.target

[Service]
Type=simple
WorkingDirectory=${APP_DIR}
Environment=NODE_ENV=production
Environment=OBSIDIAN_VAULT_DIR=${VAULT_DIR}
EnvironmentFile=-${OPENAI_ENV_FILE}
ExecStart=${NPM_BIN} run start -- --hostname 127.0.0.1 --port ${APP_PORT}
Restart=always
RestartSec=5
User=${APP_USER}
Group=${APP_GROUP}

[Install]
WantedBy=multi-user.target
EOF
)

NGINX_CONFIG=$(cat <<EOF
server {
    listen 80;
    server_name ${APP_HOSTNAME};

    client_max_body_size 20m;

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
}
EOF
)

if [[ "$PRINT_ONLY" == "1" ]]; then
  printf '%s\n' "=== ${SERVICE_FILE} ==="
  printf '%s\n' "$SERVICE_CONFIG"
  if [[ ${#OPENAI_ENV_LINES[@]} -gt 0 ]]; then
    printf '%s\n' "=== ${OPENAI_ENV_FILE} ==="
    printf '%s\n' "${OPENAI_ENV_LINES[@]}"
  fi
  printf '%s\n' "=== ${NGINX_SITES_AVAILABLE} ==="
  printf '%s\n' "$NGINX_CONFIG"
  printf '%s\n' "=== Vault folders ==="
  printf '%s\n' "$VAULT_DIR/Daily"
  printf '%s\n' "$VAULT_DIR/Goals"
  printf '%s\n' "$VAULT_DIR/Journal"
  exit 0
fi

mkdir -p "$VAULT_DIR/Daily" "$VAULT_DIR/Goals" "$VAULT_DIR/Journal"
chown -R "$APP_USER:$APP_GROUP" "$VAULT_DIR"

if [[ ${#OPENAI_ENV_LINES[@]} -gt 0 ]]; then
  printf '%s\n' "${OPENAI_ENV_LINES[@]}" > "$OPENAI_ENV_FILE"
  chmod 600 "$OPENAI_ENV_FILE"
else
  rm -f "$OPENAI_ENV_FILE"
fi

printf '%s\n' "$SERVICE_CONFIG" > "$SERVICE_FILE"
printf '%s\n' "$NGINX_CONFIG" > "$NGINX_SITES_AVAILABLE"

ln -sf "$NGINX_SITES_AVAILABLE" "$NGINX_SITES_ENABLED"

systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"

if command -v nginx >/dev/null 2>&1; then
  nginx -t
  systemctl reload nginx
fi

if command -v ufw >/dev/null 2>&1; then
  ufw allow 'Nginx Full' >/dev/null 2>&1 || true
fi

echo "Done."
echo "Vault: $VAULT_DIR"
echo "Service: $SERVICE_FILE"
echo "Nginx: $NGINX_SITES_AVAILABLE"
