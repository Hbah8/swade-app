# release-procedures

## Purpose
Provide a repo-portable release checklist that ensures versioning, packaging, and release notes stay consistent.

This skill is invoked by DevOps (and optionally Planner) when preparing a release.

## Inputs
- Target release version (e.g., v0.6.2)
- Repo profile (`.github/agents/repo.profile.md`) for packaging specifics

## Checklist (generic)
1. Confirm work item is in state VERIFIED and gates are PASS (or waived with justification).
2. Confirm target version and tag format (semver, prefixes).
3. Update version artifacts (repo-specific):
   - `package.json` / `Cargo.toml` / `pyproject.toml` / etc.
4. Update `CHANGELOG.md` (user-facing, concise).
5. Ensure build is reproducible (clean install/build).
6. Package artifacts per repo profile:
   - If Tauri: consult `tauri-installer-setup` skill.
7. Run smoke checks on produced artifact.
8. Create release notes summary (what changed, known issues).
9. Create git tag and release entry (if applicable).
10. Rollback plan: how to revert tag/release and how users downgrade.

## Anti-patterns
- Bumping version without corresponding release notes
- Packaging without verifying gates/evidence
- Inventing commands; use repo profile as source of truth
