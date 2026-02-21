# 001 — Location-Based Shops & Pricing — Architecture Findings

**Date**: 2026-02-21  
**Trigger**: Epic 0.7.1 (Location-Based Equipment & Pricing System) created in roadmap  
**Status**: open  
**Verdict**: **APPROVED_WITH_CHANGES**

## Outcome Summary

The epic is feasible within the current architecture. The critical architectural choice is **how sharing works across devices**.

- In a **pure Web SPA / no backend** deployment, the robust solution is a **shareable payload** (compressed JSON) embedded in the URL (or QR), plus strict schema/versioning.
- In a **LAN-first** deployment (devices on the same network), a small backend running on the GM device can serve the shop view and data, enabling **short links** without URL-length constraints.
- A backend is acceptable if it remains **Tauri-packagable** (proxy.exe pattern).

**Decision (2026-02-21)**: Implement **LAN/Tauri backend short-link sharing first** for Epic 0.7.1.

**Clarification / Evidence**:
- Investigation supports feasibility of packaging a LAN proxy with Tauri using the `proxy.exe` + headless launcher pattern. See [001-tauri-packaging-lan-proxy-analysis.md](../analysis/001-tauri-packaging-lan-proxy-analysis.md).

## Fit With Current Architecture

- **Data-driven approach** aligns with existing `src/data/*` definition arrays.
- Existing **Zustand + localStorage** persistence pattern is compatible with campaign/shop state.
- Existing routing (`BrowserRouter`) can host a new page/route, but deep-link reliability depends on hosting fallback.

## Must-Fix Requirements / Changes to Epic Definition

1. **“Standard items” should default to JSON import**
  - Shipping full gear tables from the rulebook may be a copyright/legal risk.
  - User confirmed: importing a JSON catalog is acceptable.
  - Architecture recommendation: ship only a minimal original starter set (optional) and lean on **user-imported catalogs**.

2. **Sharing strategy must be selected (two valid options)**
  - **Option A (no backend)**: share link transports data as a Campaign Package payload. *(Deferred for Epic 0.7.1)*
  - **Option B (LAN/Tauri backend)**: share link points to the GM-hosted server route (short link). *(Selected for Epic 0.7.1)*
  - If GM customizes availability/prices/items, players must receive those changes via **payload** (Option A) or via **server** (Option B).

3. **Routing reliability depends on deployment profile**
  - In **LAN/Tauri backend** mode, the local server should always provide SPA fallback (deep links OK with `BrowserRouter`).
  - In **static hosting** mode, direct navigation to `/shop/...` requires SPA fallback; without it, switching to `HashRouter` remains the fallback plan.

## Recommended Architecture (Module-Level)

### Domain model (conceptual)
- `EquipmentItemDefinition`: id/name/category/basePrice/weight/tags
- `Location`: id/name/notes?
- `LocationPricingRule`: either percentage markup (e.g., +20%) or manual override map `{equipmentId: price}`
- `LocationInventory`: allowlist/denylist rules + per-item overrides

### Persistence boundary
- Keep `sw-character-storage` unchanged.
- Add a separate persisted store key (e.g., `sw-campaign-storage`) for GM-managed locations, custom items, and pricing rules.

### Shareable link boundary (“Campaign Package”)
- Define `schemaVersion` + `createdAt` + `locationId/slug` + payload sections:
  - `catalogOverrides` (custom equipment items)
  - `locationDefinition`
  - `inventoryRules`
  - `pricingRules`
- Compress (e.g., LZ-based) and base64url encode.
- Decode in the shop viewer route and render purely client-side.

**Note**: For Epic 0.7.1 this package path is optional/deferred because LAN/Tauri short links are the primary mechanism.

## Observability (Normal vs Debug)

Even without a backend, minimal client-side telemetry improves diagnosability. If a LAN/Tauri backend is added, it should also emit minimal structured logs.

**Normal (always-on, low volume, no PII):**
- Log (console or in-memory) state transitions for package decoding: `decode_start`, `decode_success`, `decode_fail` with reason category.

**Normal (LAN/Tauri backend, always-on):**
- Request start/finish for shop view and campaign data endpoints with duration + status.

**Debug (opt-in via localStorage flag, higher volume):**
- Include payload size, compression ratio, schemaVersion, and parse timings.
- Never print the raw payload by default (may include campaign data).

## Risks

- **URL length limits**: very large catalogs/overrides may exceed messenger/browser limits.
  - Mitigation: share “location recipe” when possible; otherwise keep payload scoped to a single location view.
  - Mitigation (LAN/Tauri): prefer short-link server mode for large catalogs.
- **Legal/content risk**: embedding complete SWADE gear tables.
  - Mitigation: user-imported catalogs; keep any shipped data minimal and original.
- **Data drift**: payload schema changes over time.
  - Mitigation: versioned schema + backward compatibility window.

## Planner/Implementer Requirements (Contract)

The implementation plan MUST include:
- A versioned “Campaign Package” schema and decode error taxonomy
- A decision on routing strategy + a note on hosting fallback (static hosting) or server fallback (LAN/Tauri)
- A data policy for “standard SWADE items” that avoids copying rulebook tables verbatim
- A deployment-profile decision for sharing: payload vs LAN/Tauri backend

Given the chosen direction, the plan MUST ALSO include (LAN/Tauri):
- API boundary for shop/location read models (player-safe, read-only by default)
- Server-side SPA fallback behavior for deep links
- Basic LAN security posture (explicit bind interface; avoid accidental exposure)

## Next Actions

- Update epic acceptance criteria to explicitly require schema versioning and a chosen sharing strategy.
- Confirm whether Epic 0.7.1 targets LAN/Tauri short-link sharing first (recommended for your current usage) or URL payload first.

Completed:
- Sharing strategy chosen: **LAN/Tauri short-link sharing first**

