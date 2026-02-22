# 002 — Player Shop View Data Table — Architecture Findings

**Date**: 2026-02-22  
**Trigger**: Review of Plan 002 (v0.7.2) — migrate `/shop/:locationId` player view to shadcn Data Table + filters  
**Status**: open  
**Verdict**: **APPROVED**

## Outcome Summary

The plan aligns with the current LAN/Tauri-first architecture (server serves a player-safe read model; the SPA renders a read-only view). The requested UX (filters + readability on phones) is achievable.

The previously-blocking concern is resolved: Plan 002 now explicitly adopts **shadcn `<Table />` primitives + `@tanstack/react-table`** as the “data-table” engine while keeping UX strictly limited to the requested filters.

## Fit With Current Architecture

- **Deployment profile**: stays inside the LAN/Tauri model (short link → proxy → SPA → `/api/shop/:locationId`). No new backend responsibilities are introduced.
- **Data boundaries**: using `server/data/campaign.json` as the source of truth remains intact; adding `category`/`notes` to the read model is additive and backward compatible.
- **Layering**: model changes in `src/models/shop.ts` + server response shape are an appropriate contract boundary.

## Must-Change Requirements (Blocking)

None.

2) **Ensure `category` and `notes` are returned by the server read model**

- The plan already states this; it is mandatory for the UI requirement (“category” select + “notes” search).
- Treat both fields as optional to keep older catalogs valid.

## Strong Recommendations (Non-blocking but high value)

1) **Avoid contract drift and duplicated price logic**

Today, pricing computation exists both:
- on the server in `server/appFactory.js` (for `/api/shop/:locationId`), and
- in client utility `src/services/shopService.ts` (`calculateLocationPrice` / `buildLocationShopView`).

This duplication is tolerable short-term, but it is a known drift risk. Recommendation:
- Make the server read model authoritative for the player view.
- Keep client-side price computation for admin preview and tests only, or explicitly document it as a secondary path.

2) **Mobile-first table rendering requirement should be verifiable**

Add a concrete acceptance note like: “On ≤390px width, the default view shows Item (name + category + notes summary) plus Price and Weight without requiring horizontal scrolling; desktop shows separate Category/Notes columns.”

3) **Security: notes are untrusted text**

- Notes must be rendered as plain text only (no markdown parsing, no HTML injection).
- Filtering must be case-insensitive and must not interpret regex input.

## Risks

- **Dependency bloat** if TanStack is introduced for a single table.
  - Mitigation: keep the wrapper component narrow, avoid generic table framework patterns; do not add pagination/sorting UI unless requested.

- **Phone readability** if notes are long.
  - Mitigation: responsive layout + wrapping + optional truncation for the table row, but keep full notes accessible within the row layout (e.g., wrapped text) without adding new modals.

## Verdict

**APPROVED** — architectural concerns addressed; proceed to Critic/Implementer.
