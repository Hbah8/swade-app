# Repo Profile (edit per repo)

This file captures repo-specific nuances so the agent system can be reused across repositories without hallucinating commands or layouts.

## Basics
- Repo name: swade-app
- Primary language/framework: Frontend -> React, Tailwind CSS, Vite, TypeScript; Backend -> 
- Package manager / build system: npm, vite
- Target platforms: windows, mobile, web

## Local dev
- Install command(s): npm install
- Build command(s): npm run build
- Test command(s): npx vitest --changed --reporter json --run
- Lint/format command(s): npm run lint

## CI/CD
- CI provider: None
- Required checks: npm run build -> green, npx vitest --changed --reporter json --run -> green, npm run lint -> green
- Branch protection rules: new branch per feature, PRs required for main
- Release tags / versioning strategy: bump version in package.json, tag with vX.Y.Z, update changelog

## Packaging / Deployment
- Packaging method (e.g., Tauri MSI, Docker, server deploy): Tauri MSI for desktop
- Artifact outputs: .msi
- Signing requirements: -
- Release checklist pointer (skill / doc): release-procedures skill

## Architecture constraints
- Module boundaries: UI components in `src/components`, pages in `src/pages`, domain logic in `src/domain`
- Public APIs: none
- Data/storage constraints: local state management with React context and hooks, zustand for global state, no external databases
- Performance constraints: target 90+ on Lighthouse for web, <100ms response time for backend

## Security constraints
- Secrets management:
- Dependency policy:
- Required scanning:

## Conventions
- Directory conventions: 
- Naming conventions:
- Commit message conventions: feat(scope): description, fix(scope): description, docs(scope): description, etc.
