# Changelog

## v0.7.3 - 2026-02-22

- Fixed runtime proxy mismatch: `server/proxy.cjs` now uses shared server app factory logic instead of stale duplicated route code.
- Fixed player shop API output so `/api/shop/:locationId` preserves optional `category` and `notes` fields in live runtime responses.
- Fixed player shop UI behavior where category selector had no options and notes column appeared empty due to missing API fields.
- Added regression test for runtime proxy path to ensure `category` and `notes` are retained in shop responses.

## v0.7.2 - 2026-02-22

- Reworked player shop view (`/shop/:locationId`) to use a shadcn-based data table powered by TanStack Table.
- Added player-facing filters for item name, category, notes/features text, and final price range.
- Extended shop read model and API output with optional `category` and `notes` fields to support richer table display.
- Added focused tests for table filtering behavior and for propagation of `category`/`notes` through service and server shop responses.

## v0.7.1 - 2026-02-22

- Fixed LAN accessibility defaults: frontend dev server now exposes network host and proxy defaults to LAN-enabled binding.
- Fixed iOS player view blank-screen issue caused by unsupported `crypto.randomUUID` on older WebKit by adding resilient ID generation fallback.
- Added regression tests for proxy runtime LAN host behavior and browser-compatible ID generation fallback paths.

## v0.7.0 - 2026-02-21

- Added location-based shop module with per-location inventory and pricing rules.
- Added JSON equipment catalog import and local campaign persistence.
- Added LAN proxy server (`/health`, `/api/campaign`, `/api/shop/:locationId`) with optional static SPA fallback.
- Added shop admin and player read-only shop routes (`/shops`, `/shop/:locationId`).
- Added Tauri-ready build pipeline scripts (`build:proxy`, `prepare:tauri`, `build:tauri`).
- Added Vitest setup and shop service tests (TDD red/green for pricing and catalog parsing).
