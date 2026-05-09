# Brew

Break & Brew — kaviareň + biliard + craft beer, Banská Bystrica.

## Stack

- **Runtime:** Static Caddy
- **Base image:** `caddy:2-alpine`
- **Memory:** 64MB

## Prerequisites

- Caddy (alebo Docker)

## Setup

```bash
git clone https://github.com/sardonicrepulsion/brew.git
# Servovať cez Caddy alebo ľubovoľný static server
```

## Štruktúra

- `index.html` — hlavná stránka (SK)
- `404.html` — stránka nenájdená
- `version.json` — verzia pre /version endpoint
- `VERSION` — plain text verzia

## Endpointy

| Path | Popis |
|------|-------|
| `/` | Hlavná stránka |
| `/health` | Healthcheck (JSON) |
| `/healthz` | Healthcheck (JSON) |
| `/version` | Verzia aplikácie (JSON) |

## Environment Variables

Žiadne — čisto statický site.

## Deploy

Automatický deploy cez GitHub webhook → deployer → `dokku git:from-archive`.

```bash
# Manuálny deploy (ak webhook nefiruje):
git archive HEAD --format=tar.gz | dokku git:from-archive brew --archive-type tar.gz
```

## Versioning

Každá zmena bumpe verziu v `version.json`, `VERSION`, `package.json`, `Dockerfile` (LABEL) a `Caddyfile` (respond body).

## Tests

```bash
npm install
npm test
```
