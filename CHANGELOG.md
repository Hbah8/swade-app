# Changelog

## v0.7.0 - 2026-02-21

- Added location-based shop module with per-location inventory and pricing rules.
- Added JSON equipment catalog import and local campaign persistence.
- Added LAN proxy server (`/health`, `/api/campaign`, `/api/shop/:locationId`) with optional static SPA fallback.
- Added shop admin and player read-only shop routes (`/shops`, `/shop/:locationId`).
- Added Tauri-ready build pipeline scripts (`build:proxy`, `prepare:tauri`, `build:tauri`).
- Added Vitest setup and shop service tests (TDD red/green for pricing and catalog parsing).
