---
ID: 2
Origin: 2
UUID: f3a81c9d
Status: UAT Approved
---

# 002 — Player Shop View: shadcn Data Table + Filters (Mobile-Friendly)

Target Release: **v0.7.2**  
Epic Alignment: **Post-0.7.1 Enhancement — Shop Player View UX**  
Primary Deployment Profile: **LAN Host / Tauri Desktop** (works in dev too)

## Changelog

| Date | Change | Rationale |
|------|--------|-----------|
| 2026-02-22 | Created plan | Replace the current list view with a filterable, readable shadcn Data Table for in-session use, especially on phones |
| 2026-02-22 | Revised: TanStack Table chosen | Align implementation contract with shadcn data-table guidance while keeping UX limited to requested filters |
| 2026-02-22 | Implementation started | Critique resolved and handoff moved to Implementer |
| 2026-02-22 | Code review approved | All quality findings resolved (JSDoc, accessibility, tech debt documentation); implementation ready for QA |
| 2026-02-22 | QA complete | QA validated filters, API propagation, and gates (lint/test/build) |
| 2026-02-22 | UAT approved | Value statement delivered; all acceptance criteria met; approved for release |
## Value Statement and Business Objective

As a Savage Worlds GM running sessions (with players browsing from phones), I want the read-only shop page to present available items in a clear, filterable shadcn Data Table (name, category, notes/functional details, price, weight) so that players can quickly find and understand items during play without scrolling through an unstructured list.

## Objective

Upgrade `/shop/:locationId` player view to:
- Display shop items in a compact, mobile-friendly **shadcn Data Table**.
- Provide filters:
  - text search by **name**
  - select filter by **category**
  - text search by **notes**
  - numeric **price range** filter
- Ensure the underlying API and view-model include the necessary fields (category + notes) while preserving the existing LAN/Tauri-friendly architecture.

## Repository Context (Current State)

- Player view page renders a simple list: `src/pages/ShopViewPage.tsx`.
- Server endpoint `/api/shop/:locationId` currently returns only: `id`, `name`, `basePrice`, `finalPrice`, `weight` (no `category`, `notes`).
- Catalog items already support `category` and `notes` (e.g., `weapons-catalog-ru.json`, and `server/data/campaign.json`).
- shadcn/ui primitives exist under `src/components/ui/` but **Table/DataTable** primitives are not yet present.
- TanStack Table is not currently installed.

## Scope

### In Scope (v0.7.2)

1) **Data contract upgrades**
- Include `category` and `notes` in the shop view read-model (`LocationShopViewItem`).
- Ensure both server implementation and client-side service mapping support these fields.

2) **UI upgrade to shadcn Data Table**
- Replace the current list rendering with a Data Table presentation.
- Implement the requested filters (name, category, notes, price range) client-side.

3) **Mobile readability**
- Ensure the table is usable on narrow screens:
  - keep the primary “Item” cell readable (name + category + notes summary)
  - avoid horizontal overflow where possible; allow horizontal scroll only as fallback.

### Out of Scope (Explicitly not planned)

- Buying flow / inventory updates / currency deduction.
- Pagination, column sorting, column hiding UI, export, bulk actions.
- New pages, modals, or extra shop features beyond the table + filters.
- Re-parsing `notes` into structured SWADE weapon stats.

## UX Requirements (Must Match)

- Filters present above the table:
  - Name search (text input)
  - Category (select)
  - Notes search (text input)
  - Price range (two numeric inputs: min/max)
- Table columns (desktop/tablet): **Name**, **Category**, **Notes**, **Price**, **Weight**.
- Mobile behavior:
  - “Item” column may render category + notes as secondary lines to keep it understandable without requiring many columns.
  - Price and weight must still be visible without excessive scrolling.

### Non-goals (Guardrails)

- Do not add sorting/pagination UI, column visibility UI, or row actions.
- If TanStack enables features by default, keep them disabled unless explicitly required by the UX above.

## Assumptions

- The shop view remains read-only and safe to expose on LAN.
- `notes` is plain text (no HTML) and should render as text only.
- A pure client-side filter implementation is sufficient for expected catalog sizes.

## OPEN QUESTIONS

OPEN QUESTION [CLOSED]: Should we include sorting/pagination because shadcn data-table examples often have them?
- Decision: **No**. Only filters + readable display are in scope to avoid expanding UX beyond the request.

OPEN QUESTION [CLOSED]: Do we need structured columns for weapon stats (damage/range/etc.)?
- Decision: **No**. Use `notes` as human-readable text, but format it for phone readability.

## Plan

1. Update shared models / view contracts
   - Objective: Ensure the typed contract includes everything the UI needs.
   - Where:
     - `src/models/shop.ts` (extend `LocationShopViewItem`)
     - Server response shape in `server/appFactory.js`
   - Acceptance criteria:
     - `LocationShopViewItem` includes `category?: string` and `notes?: string`.
     - `/api/shop/:locationId` returns these fields when present in catalog.

2. Align client-side shop view mapping
   - Objective: Keep server-enabled and potential client-side view building consistent.
   - Where:
     - `src/services/shopService.ts` (`buildLocationShopView` mapping)
     - `src/pages/ShopViewPage.tsx` types usage
   - Acceptance criteria:
     - If `buildLocationShopView` is used anywhere, it includes category/notes.
     - UI can render without `any` casts and without optional-field crashes.

3. Add minimal shadcn UI primitives required for a table
   - Objective: Provide the visual table primitives used by the Data Table.
   - Where:
     - Add `src/components/ui/table.tsx` (and any minimal related primitives that are strictly required)
   - Acceptance criteria:
     - Table primitives are reusable and match existing `src/components/ui/*` conventions.

4. Adopt TanStack Table as the data-table engine
   - Objective: Align with shadcn Data Table guidance: use shadcn `<Table />` + `@tanstack/react-table` for filtering.
   - Where:
     - `package.json` dependencies (add `@tanstack/react-table`)
     - A focused “shop items data table” component that owns TanStack configuration
   - Acceptance criteria:
     - TanStack is used for row modeling and filtering state.
     - Only the requested filters are implemented; sorting/pagination remain out of scope.

5. Implement Shop Data Table component (filters + rendering)
   - Objective: Provide a single, focused component responsible for presenting `LocationShopViewItem[]`.
   - Where:
     - New component under `src/components/shop/` or `src/pages/` (choose the smallest, most consistent placement)
   - Acceptance criteria:
     - Renders requested columns.
     - Filters work together (intersection semantics).
     - Category filter options are derived from current shop items.
     - Price filter uses `finalPrice` and supports min/max.
     - Notes are rendered as plain text, with mobile-friendly wrapping.

6. Wire Data Table into the player view route
   - Objective: Replace the old list UI while keeping loading/error/empty states stable.
   - Where:
     - `src/pages/ShopViewPage.tsx`
   - Acceptance criteria:
     - Existing empty-state message behavior remains.
     - Player view clearly indicates read-only mode.
     - Table + filters appear once data loads.

7. Validation (non-QA)
   - Objective: Basic confidence for refactor + contract change.
   - Expected checks:
     - Typecheck/build succeeds (`npm run build`).
     - Lint passes (`npm run lint`).
     - Existing tests still pass; add/update unit-level checks where it is natural (e.g., filter logic as a pure function).

8. Update Version and Release Artifacts
   - Objective: Align artifacts with Target Release **v0.7.2**.
   - Where:
     - `package.json` version bump to `0.7.2`
     - `CHANGELOG.md` add `v0.7.2` section describing the Shop Player View Data Table + filters
     - Verify Tauri/app packaging version files if applicable (e.g., `src-tauri/tauri.conf.json`), keep versions consistent
   - Acceptance criteria:
     - Version artifacts consistently reflect `0.7.2`.

## Testing Strategy (High Level, Non-QA)

- Unit-level: pure filter predicate logic for name/notes/category/price range.
- Integration-level (light): ensure `/api/shop/:locationId` includes the new optional fields without breaking existing clients.

## Dependencies / Tooling Impact

- Add dependency: `@tanstack/react-table` (minimal TanStack footprint required for shadcn-style Data Table).

## Risks & Mitigations

- Risk: Long `notes` makes table unreadable on phones.
  - Mitigation: render notes as wrapped secondary text within the main item cell on mobile; avoid dense multi-column layout.

- Risk: Large catalogs slow down filtering on weaker phones.
  - Mitigation: memoize filtered rows; keep filter logic O(n) and avoid heavy parsing.

- Risk: Contract drift between server and TS model.
  - Mitigation: keep `LocationShopViewItem` aligned and treat `category/notes` as optional.

## Handoff Notes

- Primary files involved:
  - `src/pages/ShopViewPage.tsx`
  - `src/models/shop.ts`
  - `src/services/shopService.ts`
  - `server/appFactory.js`
  - `src/components/ui/` (table primitives)

- Reference (UI spec): https://ui.shadcn.com/docs/components/radix/data-table
