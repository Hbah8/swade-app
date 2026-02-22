# SWADE App — AI Coding Instructions

Character generator and rules reference SPA for **Savage Worlds Adventure Edition**.

## Core Principles
- Do not spam with similar commands

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
| `swade-mastery skill` | Complete SWADE rules: dice mechanics, character creation, combat, conditions, size system, bennies, terminology |
| `game-rules.instructions.md` | Code-specific rule mappings: skill costs, validation, derived stats, edge requirements |
| `styling.instructions.md` | Tailwind theme tokens, `cn()`, common UI patterns |
| `dev-commands.instructions.md` | `npm run` scripts, import alias convention |
| `common-tasks.instructions.md` | Recipes for adding edges, pages, modifying calculations, testing |
| `data-layer.instructions.md` | Data definitions arrays, factory functions, adding game content |
| `vite-template-react.instructions.md` | Vite + React + SWC project template setup |

## Agents usage

See `.github/agents/` for detailed guidance:
| File | Content |
|---|---|
| `architect.agent.md` | Agent design patterns: tool use, memory management, response formatting |
| `analyst.agent.md` | Investigation techniques, gap tracking, handoff protocol |
| `code-reviewer.agent.md` | Code review best practices: checklist, common issues, feedback formatting |
| `qa.agent.md` | Testing strategies: test case design, edge cases, bug reporting format |
| `roadmap.agent.md` | Roadmap creation: feature breakdown, prioritization, user story formatting |
| `implementer.agent.md` | Implementation patterns: incremental development, commit message guidelines, PR formatting |

## CLI output
Before running a new command, explicitly wait for the previous command's output. If you run commands, you must read the full output and to confirm success before proceeding. Do not run multiple commands in parallel or run new commands before confirming the previous command's success.

Example of reading terminal output:
* @workspace /terminal Read the last output of npm run lint