# Changelog

## v0.8.3 - 2026-02-27

- Improved Shop Admin Rules section visuals while keeping behavior unchanged: consistent shadcn card structure, clearer descriptions, and cleaner spacing rhythm.
- Standardized inventory/tag multi-select presentation with explicit empty-state badges and consistent selected badge summaries.
- Simplified Exceptions presentation from nested cards to `Pinned | Banned` tabs within a single card.
- Added interaction coverage for rules editor controls (picker selection callback and tab switching behavior).
- Fixed mixed test-environment setup issue (`window is not defined`) via guarded browser-only mock in test setup.

## v0.8.2 - 2026-02-23

- Refactored `ShopAdminPage` into focused UI components under `src/components/shop-admin/` while preserving existing behavior and UX contract.
- Added reusable `MultiSelectPicker` to remove duplicated popover/command/checkbox patterns across categories/tags/status filters.
- Added dedicated `ShopSidebar`, `ShopAdminHeader`, `ShopRulesEditor`, `ShopLivePreview`, and `ShopAdvancedSheet` components to reduce cognitive load and improve maintainability.
- Fixed dialog accessibility warning by adding `DialogDescription` to delete confirmation content.
- Kept existing shop sync/store contracts intact (no route, payload, or domain behavior changes).

## v0.8.1 - 2026-02-23

- Reworked `/shops` into a production-style admin layout with shop sidebar and split workspace (`Rules editor` + always-visible `Live preview`), removing all tabs from Shop Manager.
- Added header actions for `Sync current shop`, `Open Player View`, and `Copy Link`, plus a `More` sheet for secondary actions.
- Added per-shop sync contract implementation via new store action that merges and persists only the selected location to LAN (`syncLocationToServer(locationId)`).
- Added clear sync state feedback (`Dirty` / `Synced • hh:mm`) and debounce-based live preview refresh behavior.
- Replaced binary legality switch with tri-state mode selection (`Any`, `Legal only`, `Illegal only`) and optional custom legal-status selection.
- Moved destructive actions behind confirmation in advanced actions panel.
- Added/updated regression tests for per-shop sync behavior, open-player-view sync semantics, and admin UI contract.

## v0.8.0 - 2026-02-22

- Added setting-scoped shop campaign schema (`2.0`) with legacy migration from `1.0` and server backup snapshots for safer upgrades.
- Added global setting selector in header and active-setting isolation for `/catalog` and `/shops` workflows.
- Added new `/catalog` page with tabs (`Items`, `Sets`, `Tags`, `Health`), built-in author catalog set, custom item sheet form, and optional bulk import dialog (Merge/Replace/Append).
- Added catalog metadata governance checks (missing tags, missing legal status, unknown tags) with CTA-driven filtered Items view.
- Added built-in item governance in catalog rows: built-in items cannot be deleted and can be cloned to custom items.
- Reworked `/shops` into rule-based flow with shop tabs and sub-tabs (`Rules`, `Preview`, `Share`) including include/exclude filters, legality switch, live matched count, exceptions (pin/ban), manual price overrides, and pricing profile selection.
- Updated player shop API output to evaluate location rules and pricing pipeline while keeping read-only `/shop/:locationId` routing intact.
- Added share controls for shop links and player column visibility configuration in shop share tab.
- Added regression tests for campaign normalization and rule-engine behavior.

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
