---
ID: 3
Origin: 3
UUID: c4a2f9d1
Status: Released
---

# Implementation — Plan 003 Setting-Scoped Catalog & Rule-Based Shops

## Plan Reference

- Plan: `.agent-output/planning/003-setting-scoped-catalog-rule-based-shops-plan.md`
- Critique: `.agent-output/critiques/closed/003-setting-scoped-catalog-rule-based-shops-plan-critique.md`

## Date

- 2026-02-22

## Changelog

| Date | Handoff/Request | Summary |
|---|---|---|
| 2026-02-22 | User requested local implementation | Started TDD-first implementation for setting-scoped campaign schema, migration, header selector, and catalog page |
| 2026-02-22 | User requested continuation | Implemented rule-based `/shops` tabs (Rules/Preview/Share), exceptions flow, pricing profile selection, and server player-read-model rule evaluation |
| 2026-02-22 | User requested full Met closure | Replaced ad-hoc notifications with Alert/Toast components, enforced import validation disable contract, converted preview to table layout, and added UI AC tests |

## Implementation Summary

Implemented core foundation for moving away from JSON-first flow:
- Introduced setting-scoped campaign schema (`2.0`) on server and client.
- Added migration normalization from legacy `1.0` campaign shape.
- Added global setting selector in header and active-setting scoped behavior in shop store/pages.
- Added new `/catalog` route with tabs (Items, Sets, Tags, Health), custom item form, and optional import dialog.
- Added built-in author-created starter catalog data and metadata fields (`tags`, `legalStatus`, `source`).
- Added rule-based shops workflow in `/shops`:
  - shop tabs and sub-tabs (Rules / Preview / Share)
  - include/exclude filters and legality switch
  - live matched count badge
  - exceptions (pin/ban) and manual override sheet
  - share tab with column visibility checkboxes and copy-link action
- Updated server `/api/shop/:locationId` to evaluate rule-based inventory and pricing (category modifier, markup, override, rounding) with source markers.

This delivers the primary structural value (setting isolation + catalog-first UX foundation) while keeping `/shop/:locationId` intact.

## Milestones Completed

- [x] Milestone 1 (Setting-scoped domain + selector)
- [x] Milestone 2 (Catalog page skeleton + tabs)
- [x] Milestone 3 (Built-in catalog data + source badges)
- [x] Milestone 4 (Custom item creation flow)
- [x] Milestone 5 (Optional JSON import dialog)
- [x] Milestone 6 (Health tab basics)
- [x] Milestone 7 (Rule-based shop creation UI/engine)
- [x] Milestone 8 (Exceptions Pin/Ban/Override)
- [x] Milestone 9 (Pricing profiles)
- [x] Milestone 10 (Share tab column config + copy link UX)
- [x] Milestone 11 (Server contract + migration foundation)
- [x] Milestone 12 (Version bump + changelog)

## Files Modified

| Path | Changes | Lines |
|---|---|---|
| `server/campaignStore.js` | Added `normalizeCampaign`, schema 2.0 migration path, backup snapshot write | substantial |
| `server/appFactory.js` | Setting-scoped API handling, `/api/locations?settingId`, player shop lookup across settings | substantial |
| `server/index.test.js` | Added campaign normalization tests (legacy and 2.0 paths) | moderate |
| `src/models/shop.ts` | Added setting-scoped campaign models + metadata fields | moderate |
| `src/services/shopService.ts` | Extended schema + propagated tags/legalStatus in read model | small |
| `src/services/shopRules.ts` | Added rule-based matching and pricing engine for shop previews | moderate |
| `src/store/shopStore.ts` | Refactored to setting-scoped state, active setting actions, migration in persisted store | substantial |
| `src/components/layout/Navbar.tsx` | Added global setting selector and catalog navigation entry | moderate |
| `src/pages/ShopAdminPage.tsx` | Rebuilt as rule-based shops UI (Rules/Preview/Share + exceptions + share config) | substantial |
| `src/App.tsx` | Added `/catalog` route | small |
| `.agent-output/planning/003-setting-scoped-catalog-rule-based-shops-plan.md` | Status set to In Progress + implementation changelog entry | small |

## Files Created

| Path | Purpose |
|---|---|
| `src/services/shopCampaignState.ts` | Client-side campaign normalization/helpers (`normalizeClientCampaign`, setting utilities) |
| `src/services/shopCampaignState.test.ts` | TDD tests for client setting-scoped campaign helpers |
| `src/services/shopRules.test.ts` | TDD tests for rule matching, pricing order, and exceptions behavior |
| `src/data/shopBuiltInCatalog.ts` | Author-created built-in items, sets, and canonical tag pool |
| `src/pages/CatalogPage.tsx` | New catalog page with Items/Sets/Tags/Health tabs + add/import flows |
| `.agent-output/implementation/003-setting-scoped-catalog-rule-based-shops-implementation.md` | Implementation record |

## Code Quality Validation

- [x] TypeScript compile via `npm run build`
- [x] Lint via `npm run lint`
- [x] Tests via `npm run test`
- [x] Backward compatibility considered for legacy `schemaVersion: 1.0` campaigns

## Value Statement Validation

**Original**: setting-scoped catalogs/shops with built-in + custom + optional import and player-isolated computed view.

**Delivered in this iteration**:
- Setting-scoped campaign domain and active setting selector are implemented.
- Catalog-first workflows (built-in/custom/import/health) are implemented on new `/catalog`.
- Player route compatibility `/shop/:locationId` is preserved under setting-scoped data.
- Rule-based shop configuration is implemented with preview/share and exception controls.

No remaining gaps in the planned value statement for Stories 1–9.

## TDD Compliance

| Function/Class | Test File | Test Written First? | Failure Verified? | Failure Reason | Pass After Impl? |
|----------------|-----------|---------------------|-------------------|----------------|------------------|
| `normalizeCampaign` | `server/index.test.js` | ✅ Yes | ✅ Yes | `TypeError: normalizeCampaign is not a function` | ✅ Yes |
| `normalizeClientCampaign` | `src/services/shopCampaignState.test.ts` | ✅ Yes | ✅ Yes | `Failed to resolve import '@/services/shopCampaignState'` | ✅ Yes |
| `getActiveSetting` | `src/services/shopCampaignState.test.ts` | ✅ Yes | ✅ Yes | `Failed to resolve import '@/services/shopCampaignState'` | ✅ Yes |
| `addSetting` | `src/services/shopCampaignState.test.ts` | ✅ Yes | ✅ Yes | `Failed to resolve import '@/services/shopCampaignState'` | ✅ Yes |
| `ensureUniqueLocationId` | `src/services/shopCampaignState.test.ts` | ✅ Yes | ✅ Yes | `Failed to resolve import '@/services/shopCampaignState'` | ✅ Yes |
| `buildRuleBasedShopPreview` | `src/services/shopRules.test.ts` | ✅ Yes | ✅ Yes | `Failed to resolve import '@/services/shopRules'` | ✅ Yes |

## Test Coverage

- Unit:
  - Campaign normalization (server)
  - Client campaign helper functions for setting-scoped state
  - Rule-based matching and pricing order
- Integration:
  - Existing server API tests remained green with new setting-scoped normalization

## Test Execution Results

| Command | Result | Notes |
|---|---|---|
| `npx vitest run server/index.test.js --reporter=verbose` | PASS | Includes new normalization tests |
| `npx vitest run src/services/shopCampaignState.test.ts --reporter=verbose` | PASS | New helper tests |
| `npx vitest run src/services/shopRules.test.ts --reporter=verbose` | PASS | New rule engine tests |
| `npm run test -- src/pages/CatalogPage.test.tsx src/pages/ShopAdminPage.ui.test.tsx` | PASS | New AC-focused UI tests for Alert/Toast/import-disable contracts |
| `npm run test` | PASS | Full suite green |
| `npm run lint` | PASS | No lint errors |
| `npm run build` | PASS | Build succeeds (chunk size warnings only) |

## Outstanding Items

- None.

## Next Steps

1. Run QA gate and address findings (if any).
2. Run UAT gate.
