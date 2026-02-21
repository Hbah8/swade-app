---
ID: 1
Origin: 1
UUID: a4c9b2e1
Status: Committed
---

# QA Report: 001 — Location-Based Shops & Pricing (LAN/Tauri Backend-First)

**Plan Reference**: `./.agent-output/planning/001-location-shops-lan-tauri-plan.md`
**QA Status**: QA Complete
**QA Specialist**: qa

## Changelog

| Date | Agent Handoff | Request | Summary |
|------|---------------|---------|---------|
| 2026-02-21 | User | Implementation ready for QA testing | Created QA strategy and began execution | 
| 2026-02-21 | QA | Re-test after fix | Static SPA fallback crash fixed; regression test added; full QA pass with known lint baseline issue | 

## Timeline
- **Test Strategy Started**: 2026-02-21
- **Test Strategy Completed**: 2026-02-21
- **Implementation Received**: 2026-02-21
- **Testing Started**: 2026-02-21
- **Testing Completed**: 2026-02-21
- **Final Status**: QA Complete

## Test Strategy (Pre-Implementation)

### User-Facing Workflows to Protect
- GM imports equipment catalog JSON and sees it rendered consistently.
- GM creates locations, toggles availability, sets percent markup, sets manual item overrides.
- GM syncs campaign to LAN proxy server; data persists across proxy restarts.
- Player opens read-only shop route by location ID and sees correct final prices.
- Deep links work when proxy serves static SPA (`SERVE_STATIC=true`).

### Test Types
- Unit tests (Vitest): pricing logic, shop view builder, catalog parsing and validation.
- Smoke/integration (runtime): LAN proxy endpoints (`/health`, `/api/campaign`, `/api/locations`, `/api/shop/:locationId`) and static fallback routing.

### Key Failure Modes
- Catalog parse accepts invalid shapes or throws unclear errors.
- Manual override semantics: cleared input becomes an unintended permanent override.
- Server writes malformed campaign leading to runtime errors.
- Deep links 404 when serving SPA from proxy.
- Binding/CORS misconfiguration causes player devices to fail to load.

### Telemetry Validation
- Normal: validated `/health` responds with `{ status: "ok" }` and does not include sensitive data.
- Debug: not applicable (no explicit debug telemetry implemented).

### Testing Infrastructure Requirements
⚠️ TESTING INFRASTRUCTURE NEEDED (optional, for automated integration tests):
- `supertest` (or similar) + refactor server to export `app` without side-effect listen.

## Implementation Review (Post-Implementation)

### TDD Compliance Gate
- Verify implementation report contains TDD compliance table for all new exported functions.
- If missing/incomplete, reject and halt testing.

Result: PASS — implementation report contains a complete TDD compliance table for `calculateLocationPrice()`, `buildLocationShopView()`, and `parseEquipmentCatalog()`.

### Code Changes Summary
- Shop domain model: `src/models/shop.ts`
- Shop services: `src/services/shopService.ts`
- Shop store: `src/store/shopStore.ts`
- UI pages: `src/pages/ShopAdminPage.tsx`, `src/pages/ShopViewPage.tsx`
- LAN proxy server: `server/index.js`, persistence `server/campaignStore.js`

## Test Coverage Analysis

### New/Modified Code

| File | Function/Class | Test File | Test Case | Coverage Status |
|------|---------------|-----------|-----------|-----------------|
| src/services/shopService.ts | calculateLocationPrice | src/services/shopService.test.ts | applies percentage markup | COVERED |
| src/services/shopService.ts | calculateLocationPrice | src/services/shopService.test.ts | uses manual override | COVERED |
| src/services/shopService.ts | buildLocationShopView | src/services/shopService.test.ts | filters availability + computes prices | COVERED |
| src/services/shopService.ts | parseEquipmentCatalog | src/services/shopService.test.ts | parses and validates schema | COVERED |
| server/index.js | Express routes | (manual smoke) | /health, /api/campaign, /api/locations, /api/shop/:locationId | COVERED (manual) |
| server/index.js | Static SPA fallback | (manual smoke) | SERVE_STATIC=true deep-link fallback | FAILED (crash) |

## Test Execution Results

### Unit Tests
- **Command**: `npm run test`
- **Status**: PASS
- **Evidence**: exit code 0; 2 test files, 5 tests passed

### Build
- **Command**: `npm run build`
- **Status**: PASS
- **Evidence**: exit code 0 (bundle warning for large chunk is non-fatal)

### Lint
- **Command**: `npm run lint`
- **Status**: FAIL
- **Output (summary)**: 3x `react-refresh/only-export-components` errors in `src/components/ui/badge.tsx`, `src/components/ui/button.tsx`, `src/components/ui/tabs.tsx` (pre-existing baseline issue per implementation report).

QA Note: lint is not a regression from the shop module; treat as baseline cleanup before release hardening.

### Integration / Runtime Smoke (LAN Proxy)

#### Persistence bootstrap
- **Command**: `npm run prepare:server`
- **Status**: PASS
- **Output**: created/verified `server/data/campaign.json`

#### Basic health + campaign read
- **Steps**: start `npm run server` (default), call `/health` and `/api/campaign`
- **Status**: PASS
- **Observed**: `/health` returns `{ "status": "ok" }`; `/api/campaign` returns `{ schemaVersion, catalog, locations }`

#### Campaign write + derived shop view
- **Steps**: `PUT /api/campaign` with 1 item + 1 location (percentMarkup=10, manual override for item)
- **Status**: PASS
- **Observed**: `/api/shop/riverfall` returns the item with `finalPrice` equal to the manual override (12)

#### Persistence across restart
- **Steps**: stop proxy, restart, `GET /api/campaign`
- **Status**: PASS
- **Observed**: previously written catalog + location returned

#### LAN binding mode
- **Steps**: start proxy with `ALLOW_LAN=true`, call `/health`
- **Status**: PASS

#### Static SPA serving + deep-link fallback
#### Static SPA serving + deep-link fallback
- **Steps**: build `dist/`, start proxy with `SERVE_STATIC=true`, request `/shop/riverfall`
- **Status**: PASS
- **Observed**: proxy starts and returns HTTP 200 for:
	- `/health`
	- `/api/campaign`
	- `/shop/riverfall` (deep link served by SPA fallback)

Regression coverage: `server/index.test.js` verifies deep-link fallback in static mode.

---

Handing off to uat agent for value delivery validation
