# SWADE App - Product Roadmap

**Last Updated**: 2026-02-23 23:55  
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
| 2026-02-23 23:55 | Plan 005 committed locally; v0.8.2 ready for release approval | UAT approved and Stage 1 DevOps commit completed; awaiting explicit user confirmation for push/tag. |
| 2026-02-23 21:40 | Added Plan 005 (v0.8.2) refactor-only maintainability work | Code review noted ShopAdminPage maintainability risks; follow-up refactor reduces future change risk. |
| 2026-02-23 21:30 | Plan 004 committed locally; v0.8.1 ready for release | Shop Manager Admin Layout UAT approved and committed. All plans for v0.8.1 complete. |
| 2026-02-23 | Normalized Epic 0.8.2 + blocker wording to "Sync current shop" | Terminology alignment with Plan 004 contract (Sync-first decision) |
| 2026-02-21 14:00 | Initial roadmap created with v0.7.0 release | User requested equipment/shop management functionality to reduce GM prep time and enable in-session item management |
| 2026-02-21 14:00 | Added Epic 0.7.1: Location-Based Equipment & Pricing System | GM currently uses Excel tables; significant friction during sessions and prep |
| 2026-02-21 16:30 | Updated Epic 0.7.1 constraints: LAN/Tauri backend-first | Architectural assessment confirmed LAN proxy + Tauri packaging is viable and preferred for user's LAN-first usage |
| 2026-02-21 22:35 | Released v0.7.0 with Plan [001] Location-Based Equipment System | Plan 001 UAT approved, committed locally, tagged as v0.7.0, and pushed to origin. Epic 0.7.1 objectives delivered. |
| 2026-02-22 18:00 | Released v0.7.2 with Plan [002] Player Shop View Data Table | Plan 002 UAT approved, committed locally, tagged as v0.7.2, and pushed to origin. |
| 2026-02-23 12:10 | Released v0.8.0 with Plan [003] Setting-Scoped Catalog & Rule-Based Shops | Plan 003 UAT approved, committed locally, tagged as v0.8.0, and pushed to origin. Epic 0.8.1 objectives delivered. |
| 2026-02-23 | Added release v0.8.1 planning bucket with Plan [004] | Post-release UX refinement was requested after v0.8.0 to improve admin usability and reduce control clutter. |
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

## Release v0.8.0 - Setting-Scoped Catalog & Rules Engine

**Target Date**: 2026-02-23  
**Strategic Goal**: Transform shop management from JSON-first workflow to setting-scoped catalog with rule-based shop definitions, enabling faster GM workflow and cleaner UX.

### Epic 0.8.1: Setting-Scoped Catalog & Rule-Based Shops

**Priority**: P1  
**Status**: Delivered

**User Story**:  
As a Savage Worlds GM,  
I want catalogs and shops to be scoped to a selected setting (built-in sets + custom items + optional JSON import) and define shop inventory via rules (with exceptions),  
So that shop management is fast, clean, and shareable without relying on raw JSON as the primary UI.

**Business Value**:
- **Reduces cognitive load**: Setting-scoped catalogs eliminate confusion when managing multiple campaigns
- **Accelerates shop creation**: Rule-based definitions ("all weapons with medieval tag") replace manual allowlists
- **Improves data quality**: Built-in starter catalog provides immediate value; custom items via form reduce JSON errors
- **Preserves flexibility**: JSON import remains available for power users and catalog packs
- **Maintains player isolation**: Player view remains read-only computed results at `/shop/:locationId`

**Dependencies**:
- Extends Epic 0.7.1 (Location-Based Equipment System)
- Requires schema migration from v1.0 to v2.0 (setting-scoped domain)
- Must preserve backwards compatibility for existing campaigns

**Acceptance Criteria** (outcome-focused):
- [x] GM can select a setting and manage setting-scoped catalogs
- [x] GM has access to built-in starter catalog items
- [x] GM can create custom items via form (name, price, weight, tags, legal status)
- [x] GM can import catalog packs from JSON (optional workflow)
- [x] GM can define shop inventory using rules (tag-based, legal status filters)
- [x] GM can create exceptions to rules (include/exclude specific items)
- [x] GM can configure pricing profiles per shop
- [x] Player view remains isolated and read-only at `/shop/:locationId`
- [x] Schema migration from v1.0 to v2.0 is automatic and deterministic
- [x] Rollback to v1.0 is supported if needed

**Constraints**:
- Route MUST remain `/shop/:locationId` (no slug migration)
- Must use existing design system (shadcn/ui)
- Preserve LAN/Tauri-first approach (server endpoints remain authoritative)
- Schema migration must be automatic on first load of v2.0
- Must handle existing v1.0 data gracefully

**Status Notes**:
- 2026-02-22: Epic created based on user feedback (JSON-first workflow friction)
- 2026-02-22: Plan 003 created and critiqued; implementation started
- 2026-02-23: Code review approved; QA complete; UAT approved
- 2026-02-23: Epic delivered via Plan [003]. All acceptance criteria met. Released as v0.8.0.

---

## Release v0.8.1 - Shop Manager Admin UX Refinement

**Target Date**: 2026-Q1  
**Strategic Goal**: Improve Shop Manager usability with production-like admin layout to reduce configuration errors and accelerate GM workflow.

### Epic 0.8.2: Shop Manager Admin Layout

**Priority**: P1  
**Status**: Planned

**User Story**:  
As a Savage Worlds GM,  
I want the Shop Manager page to use a production-like admin layout with shops sidebar, structured rules editor, and embedded live preview,  
So that I can configure shops faster with fewer errors during prep and live sessions.

**Business Value**:
- **Reduces cognitive load**: Clean sidebar navigation replaces tabs, improving shop selection flow
- **Accelerates configuration**: Split-screen live preview eliminates tab-switching friction
- **Improves data safety**: Clear primary/secondary sync actions reduce accidental overwrites
- **Professional appearance**: Admin-style layout increases user confidence in tool reliability

**Dependencies**:
- Extends Epic 0.8.1 (Setting-Scoped Catalog & Rule-Based Shops)
- No new domain logic required; pure UI reorganization

**Acceptance Criteria** (outcome-focused):
- [ ] GM sees shops in left sidebar instead of tabs
- [ ] GM sees rules editor + live preview side-by-side (no separate Preview tab)
- [ ] GM can sync current shop to LAN without affecting other shops
- [ ] GM can access share/advanced actions from header (no Share/Advanced tabs)
- [ ] Mobile layout provides equivalent functionality (sidebar as sheet or stacked)

**Constraints**:
- No new color tokens or icon set changes
- Use existing shadcn/ui components (add via CLI if needed)
- "Sync current shop" semantics must be contract-accurate before release

**Status Notes**:
- 2026-02-23: Epic created based on user feedback (current layout feels cluttered and non-admin-like)
- 2026-02-23: Plan [004] created and under critique review

**Scope reference**: Plan [004]

---

## Active Release Tracker

**Current Working Release**: v0.8.2

| Plan ID | Title | UAT Status | Committed |
|---------|-------|------------|-----------|
| 005 | Shop Admin Page Refactor (Maintainability) | Approved | ✓ |

**Release Status**: 1 of 1 plans committed
**Ready for Release**: Yes (Awaiting explicit release confirmation)
**Blocking Items**: None

### Release Candidate

**v0.8.1** is ready for release:

| Plan ID | Title | UAT Status | Committed |
|---------|-------|------------|-----------|
| 004 | Shop Manager Admin Layout Refinement | Approved | ✓ |

### Previous Releases

| Version | Date | Plans Included | Status |
|---------|------|----------------|--------|
| v0.8.0 | 2026-02-23 | [003] Setting-Scoped Catalog & Rule-Based Shops | Released |
| v0.7.2 | 2026-02-22 | [002] Player Shop View Data Table + Filters | Released |
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
