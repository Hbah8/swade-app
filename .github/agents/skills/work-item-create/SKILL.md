---
name: work-item-create
description: Skill for Slugger agent to create a new work item shell with ID, slug, title, and raw request, and to bump the next ID.
---

## Goal

Create a new work item shell deterministically:
- allocate ID from `./.agent-output/.next-id`
- generate a safe slug + title
- create `./.agent-output/work/<ID>-<slug>.md` from template
- bump `.next-id`

No planning, no interpretation.

## Trigger

Use this skill when:
- a new user request arrives and no work item exists yet
- you need to create the initial work item shell

Do NOT use this skill to update existing work items.

## Inputs

Required:
- RAW_REQUEST (verbatim)
- `./.agent-output/.next-id` (numeric string)
- `./.github/agents/skills/work-item-create/templates/work-item.template.md`

## Outputs

Required:
- New file: `./.agent-output/work/<ID>-<slug>.md`
- Updated: `./.agent-output/.next-id`

## Steps

1) Read `.next-id`
   - must be numeric
   - keep zero-padding length (e.g., 3 digits)

2) Generate `slug`
   - kebab-case
   - 3–6 tokens
   - avoid stop words: `the, a, an, to, for, and, of`
   - avoid repo-specific terms unless clearly central (e.g., `tauri-msi` is OK if the request is explicitly about it)
   - fallback: `misc-request`

3) Generate `title`
   - 4–10 words, human-readable
   - mirrors slug intent

4) Create work item from template
   - copy template content verbatim
   - fill only allowed fields:
     - `id`, `slug`, `title`, `state=INTAKE`, `created_at`, `value_statement`
   - do not fill any other sections

5) Increment `.next-id`
   - `ID+1`
   - preserve padding

6) Emit confirmation
   - created path, ID, slug, next-id

## Allowed Edits

Only:
- `./.agent-output/.next-id`
- `./.agent-output/work/<ID>-<slug>.md`

## Forbidden

- Adding scope/constraints/assumptions/open questions
- Writing acceptance criteria
- Proposing options/solutions
- Asking questions
- Inventing commands or file paths beyond created output path
- Editing any source code or non-artifact files

## Quality Checklist

- [ ] `.next-id` was read and incremented correctly
- [ ] Work file name matches `<ID>-<slug>`
- [ ] Slug is kebab-case, 3–6 words, no filler
- [ ] Title is 4–10 words and consistent with slug
- [ ] `state` is `INTAKE`
- [ ] `value_statement` equals RAW_REQUEST verbatim
- [ ] No extra sections were modified or filled