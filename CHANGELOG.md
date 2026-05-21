# Changelog

## [0.8.7] - 2026-05-21 — `chore(srcore#870)` — Calibrate LHCI score floors

### Changed

- `lighthouserc.json`: re-floored per-repo LHCI assertions to match observed main-branch baseline (perf=0.69, a11y=0.95, best-practices=0.93, seo=0.98). Previously every V2 repo carried the same default 0.80/0.93/0.95/0.95 floor regardless of its real score, causing repos with low real scores to fail green-CI gates spuriously and high-scoring repos to never get a tight gate. Calibrated to `max(observed - 0.02, 0.50)` so a real regression of ~2 points trips the gate.

## [0.8.6] - 2026-05-21 — `chore(srcore#872)` — Inline Playwright Chromium resolution in LH workflow

### Fixed

- `.github/workflows/lighthouse.yml`: replaced `uses: sardonicrepulsion/devops/.github/actions/resolve-playwright-chromium@main` (private cross-repo composite action ref — fails with "Unable to resolve action" at setup) with an inline `run:` step that resolves `/opt/playwright-browsers/chromium-*/chrome-linux/chrome` directly and exports `CHROME_PATH`. Unblocks LHCI runs across the V2 fleet.

## [0.8.5] - 2026-05-21 — `chore(srcore#867)` — Add Lighthouse CI score gates

### Added

- `.github/workflows/lighthouse.yml` — standalone LHCI workflow. Self-hosted ARM64. Builds image, boots on port 19130, runs `@lhci/cli@0.14.x autorun`, uploads report artifact. `continue-on-error: true` initially — thresholds will be calibrated from first run.
- `lighthouserc.json` — desktop preset, 2 runs, baseline thresholds (perf 0.80, a11y 0.93, best-practices 0.95, seo 0.95). PWA + crawlable + preconnect audits off.

Part of fleet-wide #867 LHCI rollout (17 V2 repos). Pattern from synth pilot (#854).

## [0.8.4] - 2026-05-21 — `chore(srcore#866)` — Canonicalise Caddyfile indent (tabs per `caddy fmt`)

### Changed

- `Caddyfile` reformatted with `caddy fmt --overwrite` (4-space → tab indent). No semantic change. Part of fleet-wide #866 sweep.

## [0.8.3] - 2026-05-21 — `chore(srcore#853)` — Long-cache static assets (Cache-Control max-age=30d)

### Added

- Caddyfile `@longcache` matcher applies `Cache-Control: public, max-age=2592000, must-revalidate` to `/js/*.js`, `/styles.css`, `/favicon.svg`, `/og-cover.svg`, `/icon-*.png`, `/manifest.webmanifest`. Closes Lighthouse `uses-long-cache-ttl` gap that fast 2.4.0 already had.

## [0.8.2] - 2026-05-21 — `chore(srcore#823)` — Bump GHA actions to Node 24-compatible versions

### Changed

- `actions/checkout@v4` → `@v6` (Node 24 runtime; @v4 deprecated Sep 2026).
- Also re-syncs `package-lock.json` (was 0.7.0) to source-of-truth.

GitHub forces Node 24 default on 2026-06-16; Node 20 removed 2026-09-16. Canary repo for fleet sweep (#823).

## [0.8.1] - 2026-05-15 — `refactor(srcore#760)` — Drop version literal from /health

### Changed

- `Caddyfile`: `/health` and `/healthz` respond bodies no longer carry a `version` field. Eliminates the Caddyfile-side source-of-truth that drifted in coin#22.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.8.0] - 2026-05-11

### Added (#00511 — sortable + filterable beer register)

- New `<section>` "Pivný register" below the menu — a sortable + filterable HTML table of beers recently poured. 12 sample rows seeded inline in `js/app.js` (`beerRegister` array) with fields: name, brewery, style (lager/IPA/APA/sour/stout/pale/wheat/belgian), ABV %, IBU, rating /10, date_tried.
- Per-header sort buttons (`data-sort="name|brewery|style|abv|ibu|rating|date_tried"`) — click toggles asc/desc/none, `aria-sort` reflects the active column, numeric columns default to descending on first click.
- Style filter chips above the table (multi-select, `aria-pressed`). Search box matches name + brewery (case-insensitive, locale-aware sort via `localeCompare('sk')`).
- "Clear filter" CTA inside the empty state — visible only when current filters produce zero rows.
- `css/app.css` adds the `.beer-register*` surface (chip pills, sort buttons, style badges, responsive table with horizontal scroll under 720 px).
- `tests/brew.test.js` gains a `describe("beer register (task #511)")` block pinning the HTML hooks, the JS dataset shape, the wiring of search/chips/sort/clear, and the CSS classes.

### Why

The site already names craft beer as a core pillar, but visitors had no way to see the rotating tap history at a glance. The register doubles as a small SEO surface (more relevant on-page text) and gives the bar a "what's good lately" answer that survives between menu updates.

### Version

- `package.json`, `version.json`, `VERSION`, `Caddyfile` health/version literals, and `Dockerfile` `LABEL version` bumped to 0.8.0 in lock-step.

## [0.7.0] - 2026-05-09

### Added

- `manifest.webmanifest` — PWA web app manifest with brand identity (`theme_color: #e4b36c`, `background_color: #100d0a`, `display: standalone`, Slovak locale)
- `favicon.svg` — standalone SVG icon file (extracted from inline data URI); referenced by manifest, `<link rel="icon">` and `<link rel="apple-touch-icon">`
- Caddyfile `@manifest` matcher: serves `*.webmanifest` with `Content-Type: application/manifest+json; charset=utf-8`

### Changed

- `index.html`: replaced inline data-URI `<link rel="icon">` and `<link rel="apple-touch-icon">` with file-based `/favicon.svg` references; added `<link rel="manifest" href="/manifest.webmanifest">`
- A11y: `<a class="skip-link">` and `<main id="main">` verified present (were already in template from v0.2.0 extraction)
- Bumped version to 0.7.0 across all version files

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
