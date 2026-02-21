# SWADE App — System Architecture

**Status**: CURRENT  
**Last Updated**: 2026-02-21  
**Owner**: Architect (Copilot)

## Changelog

| Date | Change | Rationale | Related |
|------|--------|-----------|---------|
| 2026-02-21 | Created baseline architecture doc | Repo had no architecture gold-standard; required for epic assessment | — |
| 2026-02-21 | Added ADR-001 (Shareable Campaign Packages) | Enables shareable shop/location views in a no-backend SPA | Epic 0.7.1 |
| 2026-02-21 | Added ADR-002 (Routing & Deep Link Reliability) | Shareable links must work from phones; BrowserRouter requires hosting fallback | Epic 0.7.1 |
| 2026-02-21 | Updated for LAN-first + Tauri-ready backend option; added ADR-003 | Backend is acceptable if packagable via Tauri (proxy.exe pattern) | Epic 0.7.1 |
| 2026-02-21 | Chosen share approach: LAN/Tauri backend first | Enables short links and avoids URL length limits for shops | Epic 0.7.1 |
| 2026-02-21 | Reconciled investigation: Tauri packaging supports bundled LAN proxy | Reduces technical uncertainty for planning | Analysis 001 |

## Purpose

SWADE App is a React + TypeScript app designed to run in the browser and (optionally) as a desktop-packaged app for:
- Character creation (builder)
- Rules reference (data-driven markdown)
- Future GM/player session tooling

**Current runtime**: no backend is used; persistence is via browser `localStorage`.

**Allowed evolution**: a local backend/proxy is acceptable if it can be packaged via Tauri (see `.github/agents/tauri-installer-setup/`), enabling LAN sharing and desktop distribution.

## High-Level Architecture

**Runtime boundary (current)**: Browser only

**Runtime boundary (optional future profile)**: Browser UI + local proxy server (LAN / desktop) bundled and managed by a launcher.

**Layers (pragmatic, not strict)**
- **UI**: React pages + components (`src/pages`, `src/components`)
- **State**: Zustand stores (`src/store`)
- **Domain models**: TypeScript types (`src/models`)
- **Content data**: static definition arrays (`src/data`)
- **Services**: pure logic utilities (validation/export) (`src/services`)

## Components

- **Router**: React Router v7 using `BrowserRouter` ([src/main.tsx](src/main.tsx))
- **Character Builder**: routed page `/character` ([src/App.tsx](src/App.tsx))
- **Rules Reference**: routed page `/rules` with data-driven content
- **Zustand Store**: `useCharacterStore` persisted as `sw-character-storage`
- **Exports**: JSON export/import and PDF export in `src/services`

Optional (future) components:
- **Local Proxy Server**: serves static assets + provides LAN-accessible APIs, compatible with Tauri packaging.

## Data Boundaries & Persistence

**Static (bundled)**
- Skills/edges/hindrances/races/rules live in `src/data/*`

**User data (persisted)**
- Character state persists in `localStorage` key `sw-character-storage`.

**Non-goals (current)**
- No server-side sync
- No accounts/auth

**Deployment profiles**
- **Web SPA (static hosting)**: no backend; any cross-device sharing must use URL payloads or manual import/export.
- **LAN Host (GM device)**: a local server can serve the SPA + campaign/shop data to other devices on the same network.
- **Tauri Desktop**: a launcher spawns a bundled proxy server (compiled to an EXE) and opens the UI in the default browser.

## Runtime Flows

### Character mutation flow
1. UI event (select attribute/skill/edge)
2. Store action (`set(...)`)
3. `recalc()` recomputes spent points + derived stats
4. Zustand `persist` writes to `localStorage`
5. UI re-renders

### Rules browsing flow
1. UI reads `RULES_DATA` sections (static)
2. Filters/searches client-side
3. Renders markdown sections

## Quality Attributes

- **Offline-first**: works without network
- **Fast iteration**: Vite dev server; purely client-side
- **Maintainability**: data-driven content and consistent store pattern

Primary constraints for future features:
- **Shareability without backend** must be solved via URL payloads or manual import/export.
- **LAN-first sessions** can instead rely on a local server on the GM machine (if enabled), removing URL-length constraints.

## Problem Areas / Design Debt Registry

- **Shareable content without backend**: any data created on the GM device is not visible to players unless transported (URL payload, QR, or import/export). This is a hard constraint in the Web SPA profile.
- **BrowserRouter deep links**: static hosting must provide SPA fallback routing; otherwise deep links like `/shop/...` may 404.
- **Copyright risk**: shipping full SWADE rulebook tables (including comprehensive gear lists/prices) may be legally problematic; prefer user-provided imports or limited/generic starter data.

## Decisions (ADRs)

### ADR-001 — Shareable Campaign Packages (URL-Embeddable Payload)

**Context**: Epic 0.7.1 requires that the GM can send players a link that shows a location-specific shop inventory and pricing. In the Web SPA profile (no backend), player devices cannot access the GM’s `localStorage`.

**Decision**:
- Define a **Campaign Package** JSON payload format for shareable content (e.g., shop/location view data) that can be embedded into a URL (compressed + base64url) or transported via QR.
- The Shop view will accept **either**:
  - a simple route param (e.g., `locationId`) for content that is fully static/bundled, **or**
  - a `package` payload (query param or fragment) that contains all overrides/custom items needed to render exactly what the GM sees.

**Why this is best**:
- Only architecture that meets **shareable + no backend** simultaneously.
- Avoids forcing players to manually import files for the common case of “GM sends link.”

**Consequences**:
- URLs can be long; must compress.
- Payload versioning is required (`schemaVersion`).
- Payload should exclude any sensitive/freeform GM notes by default.

**Alternatives considered**:
- Backend sync (deferred: acceptable if Tauri/LAN profile is adopted; see ADR-003).
- Rely on localStorage only (rejected: not shareable cross-device).
- File export/import only (possible fallback, but worse UX than link).

### ADR-002 — Routing & Deep Link Reliability for Share Links

**Context**: Players open links on phones; deep links must be reliable. Requirements differ by deployment profile.

**Decision**:
- Keep `BrowserRouter` for now, **but** require deployment to support SPA fallback (rewrite unknown routes to `index.html`).
- If the target hosting cannot support fallback, switch to `HashRouter` (planned alternative) to guarantee deep links.

**Notes**:
- In LAN/Tauri profiles, the local proxy server can provide SPA fallback reliably.

**Consequences**:
- Any new shareable page routes (e.g., `/shop/:slug`) must be included in hosting fallback config.
- If payload goes into query string, referrer logging and length limits must be considered; fragment-based payloads are safer but may require HashRouter.

---

### ADR-003 — Share Strategy by Deployment Profile (URL Package vs LAN/Tauri Backend)

**Context**: The product currently runs locally and is accessed by devices on the same network. A backend is acceptable if it remains packagable via Tauri.

**Decision**:
- Support **two share strategies**, selected by deployment profile:
  1. **Web SPA / no backend**: share via Campaign Package in URL (ADR-001).
  2. **LAN Host / Tauri Desktop**: share via short URLs that reference data served from a **local proxy server** running on the GM device.

**Epic 0.7.1 sequencing**:
- Implement **LAN/Tauri backend short-link sharing first**.
- Keep URL Campaign Packages as a secondary/fallback path (future work) for fully static hosting.

**Clarification / Evidence**:
- Investigation confirms the architecture is feasible with a packaged proxy server approach (compile Node proxy to `proxy.exe` via `pkg`, spawn from a headless Tauri launcher, serve static + SPA fallback). See [001-tauri-packaging-lan-proxy-analysis.md](../analysis/001-tauri-packaging-lan-proxy-analysis.md).

**Why this is best**:
- Keeps the app functional as a pure SPA, while enabling a higher-quality GM experience (short links, no URL size limits) when a local server is available.

**Consequences**:
- Requires a clear API boundary for campaign/shop data in server-enabled profiles.
- Requires a discovery story for players (GM shares `http://<gm-ip>:<port>/shop/<id>` or a QR).
- Requires basic security posture on LAN:
  - Bind scope is explicit (LAN interface only when enabled)
  - Prefer read-only endpoints for player access by default
  - Consider a simple session code/token for write operations (if/when writes exist)

## Roadmap Readiness Notes (Epic 0.7.1)

Architectural prerequisites to plan implementation:
- Finalize the **Campaign Package** schema (versioning + compression strategy)
- Decide the routing strategy (BrowserRouter+fallback vs HashRouter) for the Web SPA profile
- Decide the data ownership boundaries (prefer user-imported catalogs to reduce legal risk)

Architectural decision captured:
- Epic 0.7.1 targets **LAN/Tauri short-link sharing first** (local proxy server on GM device)
