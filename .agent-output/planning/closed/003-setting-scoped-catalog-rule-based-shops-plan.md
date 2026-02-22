---
ID: 3
Origin: 3
UUID: c4a2f9d1
Status: Released
---

# Plan 003 — Setting-Scoped Catalog & Rule-Based Shops

**Target Release**: v0.8.0  
**Epic Alignment**: Setting-Scoped Catalog & Rule-Based Shops (from UserStories.md)  
**Status**: Released

## Changelog

| Date | Change | Rationale |
|------|--------|-----------|
| 2026-02-22 | Created plan | Move shop management away from JSON-first workflow toward setting-scoped catalog + rule-based shops |
| 2026-02-22 | Revised per Critique 003 findings | Pin down setting-scope API contract and make migration/rollback behavior deterministic |
| 2026-02-22 | Implementation started (local mode) | Begin TDD-first execution for setting-scoped domain, migration contract, catalog route, and shop rule engine |
| 2026-02-23 | Code Review Approved | Implementation passed code review with minor recommendations; approved for QA testing |
| 2026-02-23 | QA Complete | Automated tests/lint/build passed; QA report published |
| 2026-02-23 | UAT Approved | Value delivery validated; all acceptance criteria met; approved for v0.8.0 release |

## Value Statement and Business Objective

As a GM, I want catalogs and shops to be scoped to a selected setting (built-in sets + custom items + optional JSON import) and define shop inventory via rules (with exceptions) while players see only computed read-only results, so that shop management is fast, clean, and shareable without relying on raw JSON as the primary UI.

## Objective

Deliver a new catalog + shops management experience that:
- isolates data per **Setting**,
- provides a **built-in** (author-created) starter catalog + sets,
- supports **custom items** via form,
- keeps **JSON import** as an optional pack workflow,
- defines shop inventory via **rules** (plus exceptions and pricing profiles),
- preserves player isolation on `/shop/:locationId` (read-only computed results only).

## Repo Context (Current State)

- Admin UX is currently JSON import + per-location allowlist + manual override ([src/pages/ShopAdminPage.tsx](src/pages/ShopAdminPage.tsx)).
- Player view uses server read model at `/api/shop/:locationId` and renders a read-only table ([src/pages/ShopViewPage.tsx](src/pages/ShopViewPage.tsx)).
- GM state is persisted in Zustand key `sw-shop-storage` and also syncs to `server/data/campaign.json` via `/api/campaign`.
- Current domain model does not include: settings, tags, legalStatus, item sources (built-in/custom/imported), rule-based shop definitions, exceptions, pricing profiles.

## Constraints / Guardrails

- Route MUST remain `/shop/:locationId` (no slug migration).
- Must use existing design system primitives (shadcn/ui components already in repo) and avoid extra UX not described in UserStories.
- Preserve LAN/Tauri-first approach (server endpoints remain the authoritative player read model; SPA renders it).
- Avoid shipping copyrighted SWADE rulebook tables; built-in set is explicitly **author-created**.

## Assumptions

- The built-in catalog (70s Vegas starter) content is fully user-authored and safe to bundle.
- The system can enforce **global uniqueness of `locationId` across all settings**, because player route contains only `locationId`.
  - Implementation should guarantee uniqueness by construction (e.g., prefix with setting id or generate stable random IDs).

## Contract Decisions (Clarifies Critique Findings)

These are binding plan-level contracts to keep implementation deterministic and enable fast hotfixes.

1) **Setting scope transport (admin flows)**
- `/api/campaign` returns and persists the **entire multi-setting campaign document** (all settings + their catalogs/shops).
- The active setting is a **client-side selection** (header selector) used to scope UI rendering and mutations.
- Server endpoints must not rely on implicit setting selection via headers.
- If any endpoint supports filtering by setting (e.g., location listing), the **only** supported selection mechanism is query param `?settingId=...`.
  - Missing `settingId` MUST default to “all settings” for backwards compatibility.

2) **Authoritative computation boundary**
- Player view `/api/shop/:locationId` remains authoritative for the player read model.
- Admin preview MAY reuse the same evaluation logic contract, but must not require the player route to change.

## OPEN QUESTION [CLOSED]

- Target release confirmed as v0.8.0.
- Player route confirmed as `/shop/:locationId`.
- Built-in catalog confirmed as author-created and OK to bundle.

## Plan (Milestones)

### 1) Setting-Scoped Domain + Setting Selector (Story 1)

**Objective**: Introduce a first-class “Setting” scope that isolates catalogs and shops.

**Work** (high level):
- Define `Setting` domain model and setting-scoped “campaign” structure for shop data.
- Add a global Setting selector in the header (shadcn `Select`).
- Ensure `/catalog` and `/shops` load and mutate data only for the active setting.
- Update persistence boundaries:
  - Client persistence (Zustand) must store “active setting” + per-setting state.
  - Server persistence (`server/data/campaign.json`) must store the same setting-scoped structure.
  - `/api/campaign` MUST persist and return the full multi-setting document (no implicit setting state on the server).
  - If any “list” endpoints support filtering, `?settingId=...` is the only supported mechanism.

**Acceptance Criteria**:
- Active setting name shown in header.
- Switching setting reloads catalog/shop tables.
- No cross-setting item leakage.

### 2) Add Catalog Page Skeleton + Tabs (Story 2 baseline)

**Objective**: Add `/catalog` with Tabs: Items | Sets | Tags | Health.

**Work**:
- Create a new routed page `/catalog`.
- Add the tab layout and placeholder content for each tab.
- Add navigation entry in the global navbar.

**Acceptance Criteria**:
- `/catalog` exists and renders the required Tabs.

### 3) Built-In Catalog Sets (Story 2)

**Objective**: Provide built-in sets out of the box, and clearly mark built-in items.

**Work**:
- Create built-in catalog data (author-created) as static data files.
- Define “item source” metadata (built-in/custom/imported) and render a `Badge` in Items table.
- Implement Sets tab as a list of `Card`s with: Name, `Badge` item count, “View items” button.
- Enforce governance rules:
  - Built-in items cannot be deleted.
  - Built-in items can be cloned to Custom via a row action.

**Acceptance Criteria**:
- Built-in items appear in Items table with `Badge` “Built-in”.
- Built-in items cannot be deleted.
- “Clone” action creates a custom copy.

### 4) Add Custom Item via Sheet Form (Story 3)

**Objective**: Add a first-class item creation workflow without JSON.

**Work**:
- Add “Add Item” button in Catalog header.
- Implement `Sheet` form with required fields:
  - name, category, basePrice, weight
  - tags via Popover + Command multi-select
  - legalStatus via Select
- Implement validation (zod/react-hook-form) and display errors via destructive Alert or inline.
- Persist on save and show toast confirmation.

**Acceptance Criteria**:
- Saving adds item to Items table and shows `Badge` “Custom”.

### 5) Optional Bulk JSON Import Pack (Story 4)

**Objective**: Keep JSON import available, but clearly optional and contained to `/catalog`.

**Work**:
- Add “Import Pack” button in Catalog header.
- Implement `Dialog` with JSON textarea, Tabs (Merge | Replace | Append), Validate and Import actions.
- Validation behavior:
  - Schema errors block import (destructive Alert).
  - Unknown tags warn but allow import (warning Alert).
- Imported items show `Badge` “Imported”.
- Ensure JSON import UI does not appear on `/shops`.

**Acceptance Criteria**:
- Import succeeds and toast confirms.

### 6) Catalog Metadata Governance (Health Tab) (Story 5)

**Objective**: Make metadata quality visible and enforceable, without blocking basic browsing.

**Work**:
- Define the canonical tag list for the setting (the 17-tag pool from UserStories).
- Implement Health tab reports:
  - items missing tags
  - items missing legalStatus
  - unknown tags
- Each issue has a CTA that applies the corresponding filter in Items tab.
- Define the contract for rule-based shops:
  - tags/legalStatus are required only if the shop rules actually use those filters.
  - if a rule requires metadata that’s missing, show blocking Alert in `/shops` with CTA to `/catalog?tab=Health`.

**Acceptance Criteria**:
- Health tab shows the issues and provides CTAs to Items filters.

### 7) Rule-Based Shop Creation (Story 6)

**Objective**: Replace per-item selection with rule-based inventory, scoped per setting.

**Work**:
- Update `/shops` to use Tabs for shops (3–5 expected) within active setting.
- Each shop tab contains sub-tabs: Rules | Preview | Share.
- Rules tab fields:
  - include categories (Select)
  - include tags (Popover + Command)
  - exclude tags (Popover)
  - legality filter (Switch)
  - markup % (Input)
  - pricing profile (Select)
- Show live matched count via `Badge`.
- Do not render an item list in Rules tab.

**Acceptance Criteria**:
- Rules UI exists and shows live matched count.

### 8) Exceptions: Pin / Ban / Override (Story 7)

**Objective**: Allow per-item overrides without reverting to manual mode.

**Work**:
- Add Exceptions section in Rules tab:
  - Pinned list and Banned list, displayed in `ScrollArea`.
  - Add exception via Dialog with searchable Command list.
- Preview tab renders a DataTable of matched items.
  - Rows display Source Badge: rule / pinned / override.
  - Row click opens `Sheet` allowing: Pin / Ban, Manual price override.
  - Overrides are visually indicated.

**Acceptance Criteria**:
- Preview indicates rule vs pinned vs override sources.

### 9) Pricing Profiles (Story 8)

**Objective**: Provide reusable pricing logic across shops without duplicating item data.

**Work**:
- Define pricing profile objects per setting.
- Implement calculation order contract:
  1) base → 2) category modifier → 3) shop markup → 4) override → 5) rounding
- Ensure preview updates instantly as rules/profiles change.

**Acceptance Criteria**:
- Pricing profile selection affects preview pricing.

### 10) Player View Isolation + Share Controls (Story 9)

**Objective**: Players see only computed results; GM controls share settings.

**Work**:
- Keep `/shop/:locationId` read-only; ensure no edit controls are reachable.
- Share sub-tab in `/shops`:
  - Column visibility configuration via Checkbox inside Popover
  - Copy link button + toast
- Enforce that Player view cannot access Rules/Exceptions.

**Acceptance Criteria**:
- Player view remains read-only.
- Share tab can configure columns and copy a link.

### 11) Server Contract + Migration (Cross-Cutting)

**Objective**: Keep LAN/Tauri player endpoint authoritative and migrate existing data safely.

**Work**:
- Update server data schema to support multi-setting state.
- Update `/api/campaign` and `/api/shop/:locationId` to operate in a setting-scoped world while keeping player route unchanged.
- Implement one-time migration path from existing single-setting `schemaVersion: 1.0` into the new structure.
  - Ensure location ids are unique across all settings.

**Migration / rollback contract (hotfix readiness)**:
- **Precedence**: In LAN/Tauri profile, `server/data/campaign.json` is the source of truth when reachable; client `localStorage` is a cache/offline fallback.
- **Idempotency**: Migration must be safe to run multiple times without duplicating settings/shops/items.
- **Backup**: Before writing a migrated campaign document, server persistence must create a backup snapshot of the previous file contents (at least one retained backup).
- **Failure mode**: If migration fails or yields invalid state, system must fall back to a safe minimal state (no crash), preserve the pre-migration backup, and surface a visible sync/migration error in the admin UI.
- **Offline-first behavior**: If server is unreachable, client may migrate its local persisted state and continue; next successful sync must persist the migrated structure.

**Acceptance Criteria**:
- Existing installs migrate without data loss.
- `/shop/:locationId` continues to function.

### 12) Version Management and Release Artifacts

**Objective**: Align repository artifacts to `v0.8.0` and document changes.

**Work**:
- Update version to `0.8.0`.
- Add CHANGELOG entry for v0.8.0 describing delivered stories.
- Coordinate with Roadmap agent to mark v0.8.0 as active/delivered when merged.

**Acceptance Criteria**:
- `package.json` + `CHANGELOG.md` reflect v0.8.0.

## Testing Strategy (High Level)

- Unit tests for:
  - catalog import validation and merge modes
  - rule evaluation (include/exclude tags/categories, legality)
  - pricing profile calculation order
  - migration logic from schemaVersion 1.0
- Integration tests for:
  - `/api/campaign` persistence of setting-scoped data
  - `/api/shop/:locationId` output shape remains player-safe
- UI smoke tests (component-level) to ensure:
  - setting switch reloads content
  - player view remains read-only

## Validation / Tooling

- `npm run lint`
- `npm run test`
- `npm run build`

## Risks and Mitigations

- **Location id uniqueness** (route contains only locationId): mitigate by generating ids that include setting scope or random GUID and validating uniqueness.
- **Schema migration errors**: mitigate via schemaVersioned migrations with rollback-safe defaults.
- **Dual persistence divergence (server vs localStorage)**: mitigate by explicitly declaring precedence + idempotent migrations + backup snapshots.
- **Contract drift (pricing logic duplication)**: mitigate by treating server read model as authoritative for player view; client computations used for admin preview only.
- **Metadata governance friction**: mitigate by enforcing only when rules use metadata; otherwise Health tab is advisory.

## Handoff Notes (for Critic/Implementer)

- Keep UX strictly to what UserStories specify (no extra filters/pages/modals).
- Prefer minimal new components; use existing shadcn/ui set and add only the ones explicitly required by the stories.
- Maintain backwards compatibility for existing campaign.json and `sw-shop-storage` via migration.
