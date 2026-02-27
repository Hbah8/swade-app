# cross-repo-contract

## Purpose
Define a lightweight, reusable contract format for changes that span multiple repositories, services, or packages.

This skill exists to prevent:
- hidden coupling
- incompatible deployments
- “it compiles here” failures across repos

## When to use
Use a Cross-repo Contract section when:
- you change a shared API (REST/GraphQL)
- you change an event schema or message payload
- you change a shared package or type definitions
- multiple repos must land changes in a sequence

## Cross-repo Contract template
Include this section in the plan/contract document:

### Cross-repo Contract
- Systems/Repos involved:
- Public interfaces (API / Events / Files):
- Data contracts (schemas, required fields, validation):
- Compatibility strategy:
  - backward compatible? (yes/no)
  - versioning (semver? headers? event version?)
  - deprecation window
- Sequencing:
  - what lands first
  - feature flags / dual-write / adapters
  - rollout order
- Ownership & sign-off:
- Monitoring / alerting changes:
- Failure mode & rollback plan:

## Compatibility defaults
- Prefer additive changes.
- Prefer “old + new” dual-acceptance during a transition window.
- Introduce versioned endpoints/events when breaking changes are unavoidable.

## Evidence
A contract is not complete without:
- at least one example payload/schema
- explicit sequencing plan
- explicit ownership/sign-off
