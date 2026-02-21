---
ID: 1
Origin: 1
UUID: a4c9b2e1
Status: Planned
---

# 001 — Tauri Packaging for LAN Proxy — Analysis

## Changelog

| Date | Change | Rationale |
|------|--------|-----------|
| 2026-02-21 | Closed analysis as Planned and handed off to plan | Technical unknowns reduced enough to plan implementation work |

## Value Statement and Business Objective
Enable GM-to-player sharing over LAN with short links by packaging the SPA together with a local proxy/server in a Tauri MSI installer, ensuring the desktop build can serve shop/location data without relying on long URL payloads or external hosting.

## Objective
Determine whether a LAN proxy/server (Node-based) can be packaged with Tauri for the SWADE app and outline constraints/requirements for doing so safely and reliably.

## Context
- Current architecture: React SPA, BrowserRouter, localStorage persistence.
- Sharing decision for Epic 0.7.1: **LAN/Tauri backend first** (short links served from GM device).
- Tauri installer skill exists in `.github/agents/tauri-installer-setup/SKILL.md` describing a proxy.exe + headless launcher pattern.

## Methodology
- Review Tauri installer skill doc for packaging patterns (proxy.exe, headless launcher, MSI build steps).
- Map those patterns to current app constraints (React+Vite, no backend today).
- Identify blockers, risks, and required components.

## Findings
### Verified
- Tauri can bundle arbitrary resources (e.g., proxy.exe + built SPA) into an MSI and launch a hidden window that spawns the proxy and opens the browser (per Tauri skill). 
- The skill prescribes a Node proxy compiled to a standalone EXE via `pkg`, avoiding a Node runtime dependency for end users.
- The launcher flow includes port selection, /health gating, and SPA fallback serving from the proxy.

### High-confidence inference
- Our SPA (Vite build output) can be served by the proxy in production mode, matching the skill’s “SERVE_STATIC=true” pattern.
- BrowserRouter deep links are safe in the Tauri/LAN profile because the proxy handles SPA fallback (rewrite to index.html).
- Sharing short links (http://GM-IP:PORT/shop/...) is viable as long as the proxy binds to LAN and serves the shop routes + API.

### Hypotheses
- **H1 (Med confidence):** The current codebase lacks the proxy server implementation; we need to add it plus a build script to produce proxy.exe via `pkg`. Fastest disconfirming test: search repo for `proxy` server code or scripts; if absent, we must implement.
- **H2 (Med confidence):** MSI size impact is acceptable (< ~50-70 MB) when bundling proxy.exe + web assets. Missing telemetry: actual build artifact sizes after adding proxy and running `pkg` + `tauri build`.

## System Weaknesses
- No existing proxy/server code; risk of schedule slip if not scoped in the plan.
- LAN exposure risk if the proxy binds to 0.0.0.0 by default without user consent.
- Build pipeline complexity (pkg + prepare + tauri build) can fail if ordering is wrong.

## Instrumentation Gaps
- No size/footprint measurement in CI for MSI and proxy.exe outputs (normal telemetry).
- No startup logging/health timing from launcher → proxy (debug telemetry).

## Analysis Recommendations (next investigative steps)
- Confirm presence/absence of proxy code; if absent, implement the template from the Tauri skill.
- Define the minimal API surface for shops (read-only) and ensure SPA fallback is wired in the proxy.
- Add build scripts: `build:proxy` (pkg), `prepare:tauri` (copy dist), `build:tauri` (chain) per skill.
- Add LAN bind guardrail: explicit opt-in to bind beyond localhost.

## Open Questions
- Do we need to ship a minimal default equipment catalog inside the MSI, or rely solely on JSON import for legality?
- What port selection policy is acceptable (e.g., start at 5174) to avoid conflicts with dev servers?
