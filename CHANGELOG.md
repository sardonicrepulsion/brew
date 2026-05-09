# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2026-05-09

### Added
- Host-layer security headers via `dokku caddy:labels:add`:
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (HSTS preload-grade)
  - `Cross-Origin-Opener-Policy: same-origin` (COOP)
  - `Cross-Origin-Resource-Policy: same-origin` (CORP)
- Comment in Caddyfile documenting that HSTS/COOP/CORP are intentionally emitted at host proxy layer to avoid header doubling

### Notes
- HSTS label requires inner double quotes around the value (`'"max-age=...; preload"'`) so Caddyfile parser treats `;` as part of the string rather than a token separator

## [0.1.0] - 2026-05-09

### Added
- Initial bootstrap — template snapshot of Break & Brew single-file HTML (3195 LOC)
- V2 baseline scaffold: Caddyfile, Dockerfile, app.json, version.json, VERSION
- Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Health endpoints `/health`, `/healthz`, `/version`
- Static file serving with cache headers
- 404 error page matching brand color scheme
- Vitest smoke tests for project structure
- GitHub Actions CI ready (via deployer webhook)
- Domain: brew.sardonicrepulsion.com
