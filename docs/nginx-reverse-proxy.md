# Nginx Reverse Proxy

Use this on the VPS to expose `mission-control` at `tryl.apexledger.pro`.

## Assumptions

- the app listens on `127.0.0.1:3000`
- `mission-control` runs under `systemd`
- the DNS `A` record for `tryl.apexledger.pro` points to the VPS

## HTTP config

```nginx
server {
    listen 80;
    server_name tryl.apexledger.pro;

    client_max_body_size 20m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
}
```

## HTTPS config

After you install a TLS certificate, use this version:

```nginx
server {
    listen 80;
    server_name tryl.apexledger.pro;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tryl.apexledger.pro;

    ssl_certificate /etc/letsencrypt/live/tryl.apexledger.pro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tryl.apexledger.pro/privkey.pem;

    client_max_body_size 20m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
}
```

## Apply steps

1. Save the config under `/etc/nginx/sites-available/mission-control`.
2. Link it into `/etc/nginx/sites-enabled/mission-control`.
3. Run `sudo nginx -t`.
4. Reload Nginx with `sudo systemctl reload nginx`.
5. Open `https://tryl.apexledger.pro`.

If `mission-control` listens on a different port, change the `proxy_pass`
target in both config examples to match.

## TLS

If you use Let's Encrypt, install `certbot` on the VPS and request a cert for
`tryl.apexledger.pro` after the HTTP config is working.
