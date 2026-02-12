# SWADE App — AI Coding Instructions

Character generator and rules reference SPA for **Savage Worlds Adventure Edition**.

## Architecture

Pure client-side React 19 + TypeScript SPA — no backend. State via Zustand with `localStorage` persistence (`sw-character-storage` key).

**Data flow**: UI event → Zustand action → `recalc()` (points + derived stats) → persist → re-render.

**Key principle**: Game content is **data-driven**. Static arrays in `src/data/` define skills, edges, hindrances, races, and rules. The UI auto-renders from these arrays — adding game content requires zero component changes.

## Project Layout

```
src/
├── models/          # Domain types: SWCharacter, DieType, Edge, Skill, etc.
├── data/            # Static SWADE game data (SkillDefinition[], EdgeDefinition[], etc.)
├── store/           # Zustand store — single store, all character mutations + recalc
├── services/        # Pure logic: characterValidator.ts, pdfExporter.ts, jsonExporter.ts
├── lib/utils.ts     # Die helpers (raiseDie, lowerDie, dieToIndex, cn) 
├── components/
│   ├── character/   # Builder UI: AttributeSelector, SkillSelector, EdgePicker, etc.
│   ├── layout/      # Navbar, Layout (wraps <Outlet />)
│   └── rules/       # RuleExplorer (sidebar + content browser)
└── pages/           # Route components: HomePage, CharacterBuilderPage, RulesPage
```

Routes: `/` (Home), `/character` (Builder), `/rules` (Reference) — defined in `App.tsx` via React Router v7.

## Zustand Store Pattern (`store/characterStore.ts`)

**Intent preservation rule**: Do not remove store fields/actions just to silence warnings. Preserve existing intent, then move state updates to safe lifecycle boundaries (store actions/effects/event handlers).

**React safety rule**: Never call any store action that performs `set(...)` during component render (e.g. no `validate()` calls in render). Compute pure values in render; perform mutations only in actions/effects/handlers.

Every mutation that changes attributes/skills/edges/hindrances calls the internal `recalc()` function which:
1. Recomputes `spentAttributePoints` (sum of `dieToIndex()` for all 5 attributes)
2. Recomputes `spentSkillPoints` via `computeSkillPointsSpent()` (cost depends on attribute relationship)
3. Recomputes `derivedStats` (Pace/Parry/Toughness)

The `creation` field tracks **spent** points (not remaining). Remaining = `total - spent`, computed in components.

```typescript
// Store actions always: spread → mutate → recalc → return
setAttribute: (attr, die) =>
  set((s) => { character: recalc({ ...s.character, attributes: { ...s.character.attributes, [attr]: die } }) });
```

Hindrance points are tracked separately — `hindrancePoints` incremented/decremented directly on add/remove (Major = 2, Minor = 1).

## Quick Reference

See `.github/instructions/` for detailed guidance:

| File | Content |
|---|---|
| `game-rules.instructions.md` | Skill costs, validation limits, derived stats, edge requirements |
| `styling.instructions.md` | Tailwind theme tokens, `cn()`, common UI patterns |
| `dev-commands.instructions.md` | `npm run` scripts, import alias convention |
| `common-tasks.instructions.md` | Recipes for adding edges, pages, modifying calculations, testing |
| `data-layer.instructions.md` | Data definitions arrays, factory functions, adding game content |
| `vite-template-react.instructions.md` | Vite + React + SWC project template setup |
