---
name: github-mcp-commit-fast
description: Use this skill when the user wants the shortest reliable workflow to commit and push local changes to GitHub (with GitHub MCP involved), including authentication checks, pull/push conflict resolution, and common troubleshooting pitfalls.
---

# GitHub MCP Commit Fast

## Overview

Use this skill for the shortest safe path to commit and push changes while handling the most common failures (auth, non-fast-forward pushes, and merge/rebase conflicts).

Keep the flow minimal: inspect -> stage -> commit -> sync -> push.

## Quick Flow (Shortest Reliable Path)

1. Check branch and changed files.
2. Stage only intended files.
3. Commit with a clear message.
4. Push.
5. If push is rejected, pull with rebase, resolve conflicts, continue rebase, then push again.

Preferred commands:

```powershell
git status --short
git branch --show-current
git add <files>
git commit -m "<message>"
git push
```

If push is rejected (non-fast-forward):

```powershell
git pull --rebase origin <branch>
# resolve conflicts
# edit files, then:
git add <resolved-files>
git rebase --continue
git push
```

## MCP + Auth Checks (Do These When Push/Auth Fails)

Use the fastest checks first:

1. Confirm the repo remote points to the expected GitHub repo.
2. Confirm the authenticated GitHub account in MCP matches the target repo/org.
3. Confirm token/app permissions allow repo write access.
4. If org uses SSO, confirm authorization is enabled for the token/app.

Useful local checks:

```powershell
git remote -v
git config --get user.name
git config --get user.email
```

If using HTTPS + token and auth fails:

- Re-authenticate the GitHub MCP connection/session.
- Verify token scopes/permissions include repository write access.
- Verify the repo is not archived and branch is not protected against direct pushes.

If using SSH and auth fails:

- Confirm the SSH key is loaded and attached to the same GitHub account used by MCP/workflow.
- Confirm remote URL uses `git@github.com:` if SSH is intended.

## Conflict Resolution (Fast Recipes)

### Push Rejected (non-fast-forward)

Cause: Remote branch has commits you do not have locally.

Fix:

```powershell
git pull --rebase origin <branch>
# resolve conflicts if any
git add <resolved-files>
git rebase --continue
git push
```

### Rebase Conflict

1. Run `git status` to see conflicted files.
2. Edit conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
3. Keep the intended final content only.
4. `git add <file>` for each resolved file.
5. `git rebase --continue`.
6. Repeat until complete, then `git push`.

Abort rebase if needed:

```powershell
git rebase --abort
```

### Merge Conflict (if rebase is not used)

Prefer rebase for short personal feature branches. If merge is already in progress:

```powershell
git status
# resolve files
git add <resolved-files>
git commit
```

Abort merge if needed:

```powershell
git merge --abort
```

## Pitfalls (Common Time Wasters)

- Committing unrelated files because `git add .` was used blindly.
- Pushing to the wrong branch or wrong remote.
- Force-pushing without confirming branch ownership and impact.
- Resolving conflict markers incorrectly (leaving markers in file).
- Forgetting `git add` after conflict resolution, so rebase cannot continue.
- Auth looks valid but repo write fails due to branch protection or missing org/SAML authorization.
- Wrong Git identity (`user.email`) causing commit attribution or policy checks to fail.

## Decision Rules

- Prefer the smallest staged set that matches the requested change.
- Prefer `git pull --rebase` over merge for simple push rejections.
- Do not use `git push --force` unless explicitly requested or clearly safe (`--force-with-lease` if needed).
- If branch protection blocks direct push, switch to PR flow (use GitHub MCP to create/update PR after pushing to an allowed branch).

## What To Ask Only If Blocked

Ask the user only when necessary:

- Target branch is unclear.
- Conflicts change behavior and require product/code choice.
- Repo policy (protected branch / required PR) prevents direct push and no alternative branch is specified.

## Output Style For This Skill

When using this skill, keep responses short and action-oriented:

- State the next command(s).
- Explain failures in one line.
- Offer the shortest safe resolution path.
