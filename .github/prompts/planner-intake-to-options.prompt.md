---
description: This prompt is used to intake a new work item for the planner agent, extracting key information and generating options for how to proceed.
model: GPT-5.3-Codex (copilot)
---

Прочитай work item: ./.agent-output/work/001-<slug>.md.
Заполни INTAKE (Value/Scope/Constraints/Assumptions/Open Questions).
Если blocking вопросы — задай и остановись.
Если blocking нет — сформируй OPTIONS (2–5 вариантов + tradeoffs + recommendation) и обнови state: OPTIONS.