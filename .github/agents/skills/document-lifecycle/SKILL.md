# document-lifecycle

## Purpose
Provide a single, repo-portable lifecycle for **agent-produced artifacts**: where they live, how they are named, how they are revised, and how they relate to **work item state**.

This skill exists to prevent:
- fragmented context across many chat messages
- duplicate or conflicting documents
- hand-offs that do not update shared state

## Canonical artifact root
All agent-produced documents MUST live under:

- `./.agent-output/`

> Source code, tests, and app docs remain in the repository as usual. This lifecycle is only for *agent artifacts*.

## Work Item (single source of truth)
A work item document is the authoritative coordination object:

- `./.agent-output/work/<ID>-<slug>.md`

Work item doc MUST include:
- `state`: INTAKE | OPTIONS | DECIDED | CONTRACT | IMPLEMENTED | VERIFIED | SHIPPED
- `decision` (when applicable)
- `gates` (critic/architect/code_review/qa/security/uat/devops)
- `open_questions` (blocking/non-blocking)
- `evidence` (links/notes to supporting outputs)

### ID allocation
Use a monotonic numeric ID stored in:

- `./.agent-output/.next-id`

If the file does not exist, create it with `001`.

## Canonical subfolders
Use these standard locations:

- `./.agent-output/planning/` — Planner outputs (INTAKE/OPTIONS/plan drafts)
- `./.agent-output/critiques/` — Critic outputs
- `./.agent-output/architecture/` — Architect outputs (ADRs, architecture notes)
- `./.agent-output/analysis/` — Analyst outputs
- `./.agent-output/code-review/` — Code Reviewer outputs
- `./.agent-output/qa/` — QA outputs
- `./.agent-output/uat/` — UAT outputs
- `./.agent-output/deployment/` — DevOps outputs

## Naming convention
`<ID>-<slug>-<type>.md`

Examples:
- `003-workspace-search-intake.md`
- `003-workspace-search-options.md`
- `003-workspace-search-critique.md`
- `003-workspace-search-adr.md`
- `003-workspace-search-qa.md`

## Revision protocol
- Do NOT create “v2/v3” files.
- Update the same artifact file in-place and record major changes in a short **Changelog** section at the top.
- Cross-link related artifacts from the work item.

## Gate protocol
Gates live in the work item front matter.
Each gate MUST be one of: `pending | pass | fail | n/a`.

A gate can only be set to `pass` when evidence exists and is linked in the work item.

## Anti-patterns (blocked)
- Creating plan/critique docs without linking them from the work item
- Advancing `state` without meeting exit criteria
- Inventing file paths/commands that were not verified in the repo
