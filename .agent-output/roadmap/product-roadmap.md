# SWADE App - Product Roadmap

**Last Updated**: 2026-02-21 22:35  
**Roadmap Owner**: roadmap agent  
**Strategic Vision**: Comprehensive digital toolset for Savage Worlds GMs and players, eliminating preparation overhead and enabling seamless in-session reference and management.

---

## Master Product Objective

**Provide Savage Worlds GMs and players with comprehensive digital tools for character creation, rules reference, and session management.**

*This objective is immutable and defines the core mission of the product.*

---

## Change Log

| Date & Time | Change | Rationale |
|-------------|--------|-----------|
| 2026-02-21 14:00 | Initial roadmap created with v0.7.0 release | User requested equipment/shop management functionality to reduce GM prep time and enable in-session item management |
| 2026-02-21 14:00 | Added Epic 0.7.1: Location-Based Equipment & Pricing System | GM currently uses Excel tables; significant friction during sessions and prep |
| 2026-02-21 16:30 | Updated Epic 0.7.1 constraints: LAN/Tauri backend-first | Architectural assessment confirmed LAN proxy + Tauri packaging is viable and preferred for user's LAN-first usage |
| 2026-02-21 22:35 | Released v0.7.0 with Plan [001] Location-Based Equipment System | Plan 001 UAT approved, committed locally, tagged as v0.7.0, and pushed to origin. Epic 0.7.1 objectives delivered. |
| 2026-02-22 18:00 | Released v0.7.2 with Plan [002] Player Shop View Data Table | Plan 002 UAT approved, committed locally, tagged as v0.7.2, and pushed to origin. |
---

## Release v0.7.0 - GM Session Tools

**Target Date**: 2026-Q2  
**Strategic Goal**: Extend beyond character creation into live session support, starting with equipment and shop management.

### Epic 0.7.1: Location-Based Equipment & Pricing System

**Priority**: P1  
**Status**: Delivered

**User Story**:  
As a Savage Worlds GM,  
I want to manage equipment catalogs with location-specific availability and pricing,  
So that I can quickly reference item costs during sessions without searching through Excel tables and share catalogs with players via shareable links.

**Business Value**:
- **Reduces GM prep time**: Eliminates manual Excel lookups and calculations
- **Improves session flow**: Instant access to location-specific item lists
- **Enables player self-service**: Shareable links let players browse shops from their phones
- **Flexible pricing control**: Supports both percentage-based markup and manual price overrides per location
- **Scales with campaign complexity**: Handles both core SWADE items and custom campaign-specific equipment

**Dependencies**:
- None (extends existing data-driven architecture)
- GM campaign/shop data persists locally (file or `localStorage` pattern)
- Requires Tauri build toolchain (Rust, pkg, WiX) for MSI packaging

**Acceptance Criteria** (outcome-focused):
- [x] GM can define locations/settlements with unique shop inventories
- [x] GM can configure equipment availability per location (which items are sold)
- [x] GM can set prices using either percentage modifier (e.g., "+20% frontier markup") or manual override
- [x] GM can import equipment catalogs from JSON files (standard + custom items)
- [x] GM can create/edit custom equipment items
- [x] Players and GM can view filtered equipment catalog for a specific location via LAN
- [x] System generates short shareable URLs for location-specific shop views (LAN/Tauri mode)
- [x] Local proxy server serves shop data and SPA with fallback for deep links
- [x] Solution is packagable via Tauri (proxy.exe + headless launcher + MSI)
- [x] UI integrates seamlessly with existing character builder (accessible via navigation)

**Constraints**:
- LAN/Tauri deployment profile: local proxy server on GM device, players connect via LAN
- Must be packagable via Tauri (proxy.exe compiled via pkg, headless launcher, MSI installer)
- Must follow existing data-driven patterns for UI and domain models
- Use shadcn/ui components for consistency
- Equipment catalogs imported via JSON (avoid shipping copyrighted rulebook tables verbatim)
- LAN access is read-only for players by default; no authentication required for shop views
- Basic LAN security posture: explicit opt-in to bind beyond localhost

**Status Notes**:
- 2026-02-21 14:00: Epic created based on user pain point (Excel-based shop tracking)
- 2026-02-21 15:00: Architectural assessment completed; LAN/Tauri backend approach approved
- 2026-02-21 16:30: Epic constraints updated to reflect LAN/Tauri deployment profile
- 2026-02-21 16:30: Awaiting plan creation/revision by planner agent
- 2026-02-21 22:35: Epic delivered via Plan [001]. All acceptance criteria met. Released as v0.7.0.

**Notes for Architect & Planner**:
- **Architecture docs**: See `.agent-output/architecture/system-architecture.md` (ADR-003) and `001-location-shops-architecture-findings.md`
- **Investigation note**: See `.agent-output/analysis/001-tauri-packaging-lan-proxy-analysis.md`
- **Data model**: `EquipmentDefinition[]` (like EdgeDefinition), `Location`, `LocationInventory`, `PricingRule`
- **Shareable URLs**: Short links pointing to GM device proxy (e.g., `http://GM-IP:PORT/shop/:locationId`)
- **Pricing flexibility**: base price + location modifier (percentage or absolute override)
- **Equipment source**: User-imported JSON catalogs (minimal bundled starter set optional)
- **Proxy requirements**: Express server with `/health`, SPA static serving + fallback, shop API endpoints (read-only)
- **Build pipeline**: `build:proxy` (pkg) → `prepare:tauri` (copy dist) → `tauri build` (MSI)

---

## Active Release Tracker

**Current Working Release**: v0.7.2

| Plan ID | Title | UAT Status | Committed |
|---------|-------|------------|----------|
| 002 | Player Shop View: shadcn Data Table + Filters (Mobile-Friendly) | Released | Yes |

**Release Status**: Planning completed, implementation in progress
**Ready for Release**: No
**Blocking Items**: Pending implementation and QA/UAT for Plan 002

### Previous Releases

| Version | Date | Plans Included | Status |
|---------|------|----------------|--------|
| v0.7.0 | 2026-02-21 | [001] Location-Based Equipment System (LAN/Tauri) | Released |
| v0.6.x | N/A | Character creation, rules reference | Base version |

---

## Backlog / Future Consideration

### Epic: Inventory Management for Player Characters
**Priority**: P2  
**Description**: Extend shop system to track purchased items on character sheets, manage encumbrance, and handle currency.

### Epic: NPC/Bestiary Database
**Priority**: P2  
**Description**: Quick-reference database for stock NPCs and monsters with stat blocks, similar to equipment catalog.

### Epic: Combat Tracker
**Priority**: P2  
**Description**: Initiative tracking, status effects, and round management for combat encounters.

### Epic: Collaborative Session Mode
**Priority**: P3  
**Description**: Real-time session state sharing between GM and players (requires backend).

---

*End of Roadmap*
