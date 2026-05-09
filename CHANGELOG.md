# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.0] - 2026-05-09

### Security
- Replaced loose `<meta http-equiv="Content-Security-Policy">` with strict server-side Caddy header
- Dropped `'unsafe-inline'` from `script-src` and `style-src`
- Added `require-trusted-types-for 'script'` and `trusted-types brew-template 'allow-duplicates'`
- Added `frame-ancestors 'none'` and `manifest-src 'self'`
- Constrained `img-src` to `'self' data: https://images.unsplash.com` (no wildcard `https:`)
- Removed `<meta http-equiv="Content-Security-Policy">` from `index.html` — server header is now authoritative

## [0.5.0] - 2026-05-09

### Added
- GitHub Actions CI workflow on self-hosted ARM64 runner (`sardonic-arm64-brew`)
- `static-tests` job: `npm ci && npm test` (vitest) on `[self-hosted, linux, ARM64]`
- `version-consistency` job: validates `package.json` and `version.json` versions match
- Reusable workflow `.github/workflows/version-consistency.yml` (supports `workflow_call`)
- Systemd unit `actions.runner.sardonicrepulsion-brew.sardonic-arm64-brew.service`

## [0.4.0] - 2026-05-09

### Added
- Host-layer security headers via `dokku caddy:labels:add`:
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (HSTS preload-grade)
  - `Cross-Origin-Opener-Policy: same-origin` (COOP)
  - `Cross-Origin-Resource-Policy: same-origin` (CORP)
- Comment in Caddyfile documenting that HSTS/COOP/CORP are intentionally emitted at host proxy layer to avoid header doubling

### Notes
- HSTS label requires inner double quotes around the value (`'"max-age=...; preload"'`) so Caddyfile parser treats `;` as part of the string rather than a token separator

## [0.2.0] - 2026-05-09

### Changed
- Extracted inline `<style>` block (1958 lines) to `css/app.css` — enables strict CSP in task #437
- Extracted inline `<script>` blocks to `js/app.js` (469 lines, concatenated in source order)
- `index.html` reduced from 3195 to 768 lines; no functional changes to CSS or JS logic
- Bumped version to 0.2.0 across all version files

### Added
- `css/app.css` — extracted stylesheet
- `js/app.js` — extracted scripts (js-class-toggle + main IIFE)
- Tests: assert external asset files exist and index.html contains no inline style/script blocks

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
