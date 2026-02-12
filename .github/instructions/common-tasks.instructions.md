# Common Tasks

**Add a new Edge**: Append to `EDGE_DEFINITIONS` in `data/edges.ts`. No other changes needed.

**Add a new page**: Create in `src/pages/`, add `<Route>` in `App.tsx`, add entry to `NAV_ITEMS` in `components/layout/Navbar.tsx`.

**Modify point calculations**: Edit `computeSkillPointsSpent()` or `recalc()` in `characterStore.ts`. These are the single source of truth for cost logic.

**Add a shadcn/ui component**: Run `npx shadcn@latest add <name>`. Component appears in `src/components/ui/`. Import via `@/components/ui/<name>`.

**Replace custom UI with shadcn**: When refactoring, prefer shadcn `<Button>`, `<Card>`, `<Dialog>`, `<Select>`, `<Input>`, `<Badge>` etc. over hand-rolled equivalents. Always use `cn()` for class merging.

**No test suite yet** — use Vitest when adding. Priority targets: `computeSkillPointsSpent()`, `validateCharacter()`, `canTakeEdge()`, die helpers in `utils.ts`.
