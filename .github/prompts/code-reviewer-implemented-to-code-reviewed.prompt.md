---
description: This prompt is used by the code reviewer agent to review the implementation of a work item after the implementer agent has marked it as implemented.
model: GPT-5.3-Codex (copilot)
---

Прочитай изменения и contract. Сделай ревью.
Запиши отчёт в .agent-output/code-review/001-...-code-review.md, обнови gates.code_review: pass|fail и список замечаний.