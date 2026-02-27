# Work States

This repo uses a minimal state machine to keep multi-agent work deterministic.

## States
- **INTAKE**: clarify problem, context, constraints, open questions
- **OPTIONS**: generate 2–5 materially different approaches with tradeoffs
- **DECIDED**: record the selected approach and rationale (ADR-lite)
- **CONTRACT**: produce implementable specification + acceptance criteria + cross-repo contract if needed
- **IMPLEMENTED**: code and local checks complete per contract
- **VERIFIED**: review + QA evidence complete; ready for packaging/merge
- **SHIPPED** (optional): packaged/released/merged to main

## Allowed transitions
- INTAKE → OPTIONS → DECIDED → CONTRACT → IMPLEMENTED → VERIFIED → SHIPPED
- Backtracks (only with justification recorded in work item):
  - VERIFIED → IMPLEMENTED (fix)
  - VERIFIED → CONTRACT (spec correction)
  - DECIDED → OPTIONS (decision invalidated)

## Exit criteria (minimum)
### INTAKE exit
- Value statement, scope in/out, constraints, assumptions
- Open questions tagged `blocking` vs `non_blocking`
- **No blocking questions remain** (otherwise stop)

### OPTIONS exit
- 2–5 options that are materially different
- tradeoffs captured
- explicit recommendation + decision required

### DECIDED exit
- selected option recorded
- rejected options listed with reason
- decision owner/time recorded (if available)

### CONTRACT exit
- user story + acceptance criteria (verifiable)
- interfaces/data structures defined
- risks/dependencies
- Definition of Done

### IMPLEMENTED exit
- code changes complete
- unit tests/checks green
- implementation notes captured (what changed + why)

### VERIFIED exit
- Code Review passed (or waived with reason)
- QA passed (or waived with reason)
- Security review completed if applicable
- UAT passed if applicable

### SHIPPED exit (optional)
- packaging done
- release notes/version artifacts consistent
- merge/release executed with user confirmation

## Work Item (single source of truth)
All work is coordinated via:
- `./.agent-output/work/<ID>-<slug>.md`

Agents must read/update this file and must not advance state without meeting exit criteria.
