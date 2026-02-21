---
ID: 1
Origin: 1
UUID: a4c9b2e1
Status: Committed
---

# 001 — Location-Based Shops & Pricing (LAN/Tauri Backend-First) — Implementation Plan

Target Release: **v0.7.0**  
Epic Alignment: **Epic 0.7.1 — Location-Based Equipment & Pricing System**  
Primary Deployment Profile: **LAN Host / Tauri Desktop**

## Changelog

| Date | Change | Rationale |
|------|--------|-----------|
| 2026-02-21 | Created plan from analysis 001 | Epic is ready for detailed planning; share strategy selected (LAN/Tauri short links) |
| 2026-02-21 | Implementation started | Plan approved and handed off to Implementer |

## Value Statement and Business Objective

As a Savage Worlds GM and player (on phones), I want to open a location-specific shop via a short LAN link, so that we can quickly see what is available and how much it costs (percent markup or manual override) without maintaining Excel tables, and in a way that can later be packaged as a Tauri MSI.

## Objective

Deliver a LAN-hosted “Shop by Location” module that:
- Lets the GM import an equipment catalog from JSON and define locations with per-location inventory + pricing rules.
- Serves a player-safe, read-only shop view over LAN via short URLs.
- Is compatible with the Tauri packaging model (bundled local proxy server + SPA assets + deep-link fallback).

## Scope

### In scope (v0.7.0)
- Equipment catalog import from JSON (standard + custom items).
- Locations and per-location rules:
  - availability (what is sold)
  - pricing (percent markup and per-item manual overrides)
- Player read-only shop view by location via LAN URL.
- Local proxy server (LAN mode) that serves:
  - SPA static assets with deep-link fallback
  - read-only API for shop/location view data
- “Tauri-ready” packaging preparation:
  - build pipeline steps and resource layout compatible with `.github/agents/tauri-installer-setup/`
  - health-gated startup contract (`/health`)

### Out of scope (explicitly deferred)
- Player purchasing that modifies GM data or character sheets.
- Authentication/accounts.
- Real-time collaboration.
- URL-embedded Campaign Packages (ADR-001) as the primary sharing method.
- Full copyrighted SWADE gear tables bundled into the app.

## Key Architectural Constraints (must be enforced)

- LAN/Tauri backend-first sharing (short link) is the primary path.
- Player endpoints are **read-only** by default.
- LAN exposure is explicit and intentional (avoid accidental public binding).
- Catalog content policy: default to **user-imported JSON** (legal risk reduction).

## Assumptions

- GM machine can run a local server process (Node/proxy) and players are on the same network.
- “Standard items” are provided via JSON import rather than bundling full rulebook tables.
- Tauri packaging will follow the proxy.exe + headless launcher pattern described in `.github/agents/tauri-installer-setup/`.

## OPEN QUESTIONS

OPEN QUESTION [RESOLVED]: Do we ship a default catalog?
- Resolution: ship none (or only a minimal original starter set); primary path is JSON import.

OPEN QUESTION [RESOLVED]: Port selection policy?
- Resolution: dynamic port selection starting from a defined base (e.g., 5174) for server-enabled profiles, consistent with the Tauri skill.

## Plan

1. Define domain model and JSON schema contracts
   - Objective: ensure consistent typed models across UI, store, and server APIs.
   - Where: `src/models/` (+ server-side shared types if needed).
   - Acceptance criteria:
     - A versioned JSON schema for equipment catalog import exists.
     - A stable read-model for “ShopView(locationId)” exists.

2. Implement GM data management (catalog + locations + pricing rules)
   - Objective: allow the GM to create/manage the content that will be served.
   - Where: new Shop admin page/components + a campaign/shop store.
   - Acceptance criteria:
     - GM can import a catalog JSON and see items.
     - GM can create locations and configure availability and pricing rules.
     - GM can view the resulting computed prices for a selected location.

3. Implement player shop view route (read-only)
   - Objective: provide a phone-friendly location shop view for players.
   - Where: new route/page (e.g., `/shop/:locationId`) rendered by the SPA.
   - Acceptance criteria:
     - The page renders from server-provided read-model data.
     - No mutation actions are exposed to unauthenticated clients.

4. Add local proxy server (LAN mode) with deep-link fallback
   - Objective: host the SPA and shop API on the GM machine.
   - Where: new server directory (Node/Express).
   - Acceptance criteria:
     - `/health` endpoint is present.
     - Static serving of the SPA works and supports deep links (SPA fallback).
     - Shop read-only API endpoints exist (location list, shop view by location).

5. Add persistence for GM campaign/shop state on the server
   - Objective: ensure GM configuration survives server restarts.
   - Where: server-side storage (file-based JSON is acceptable for v0.7.0).
   - Acceptance criteria:
     - Data loads on start, saves on change.
     - Corruption handling is fail-safe (does not crash the server without a clear error).

6. Security posture for LAN exposure
   - Objective: avoid accidental exposure beyond the intended LAN usage.
   - Where: server config.
   - Acceptance criteria:
     - Server binds to localhost by default; LAN binding requires explicit opt-in.
     - CORS policy is restrictive and intentional.
     - Player endpoints are read-only.

7. Developer workflow integration
   - Objective: make day-to-day development smooth.
   - Where: package scripts + Vite proxy config.
   - Acceptance criteria:
     - One command can run UI + server in dev.
     - Production build can be served by the proxy.

8. Tauri packaging preparation (Tauri-ready)
   - Objective: ensure the project can be packaged according to the existing Tauri skill.
   - Where: `src-tauri/` + build scripts.
   - Acceptance criteria:
     - A build pipeline exists that produces: Vite build → proxy binary → Tauri MSI.
     - The launcher uses `/health` gating and opens the default browser.
     - Proxy and SPA resources are bundled correctly.

9. Validation (non-QA)
   - Objective: confirm build health and basic runtime correctness.
   - Acceptance criteria:
     - `npm run lint` passes.
     - `npm run build` passes.
     - LAN mode can be started locally and accessed from a second device on the same network.
     - Tauri build can be executed in an environment with prerequisites installed.

10. Update Version and Release Artifacts
   - Objective: align artifacts with Target Release v0.7.0.
   - Acceptance criteria:
     - Version updated from `0.0.0` to `0.7.0`.
     - CHANGELOG entry added describing the shop module and LAN/Tauri mode.
     - README updated with how to run LAN mode and (if included) how to build the MSI.

## Testing Strategy (high level, non-QA)

- Unit-level checks for:
  - pricing computation (percent markup + manual overrides)
  - JSON catalog schema parsing/validation
- Integration-level checks for:
  - proxy server endpoints (`/health`, shop read APIs)
  - SPA fallback for deep links

## Tooling / Prerequisites Impact

- For MSI builds: Rust toolchain, Tauri CLI, WiX Toolset, and `pkg` (per `.github/agents/tauri-installer-setup/`).

## Risks & Rollback

- Risk: Tauri prerequisites missing on developer machines.
  - Rollback: keep LAN mode runnable via Node directly; defer MSI build validation to environments with prerequisites.
- Risk: LAN server binds too broadly.
  - Mitigation: localhost by default; explicit opt-in for LAN binding.

## Handoff Notes

- Architecture references:
  - `.agent-output/architecture/system-architecture.md` (ADR-003)
  - `.agent-output/architecture/001-location-shops-architecture-findings.md`
- Investigation note:
  - `.agent-output/analysis/closed/001-tauri-packaging-lan-proxy-analysis.md`
