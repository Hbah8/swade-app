---
description: This prompt is used by the architect agent to create a contract for a work item after the critic agent has made a decision on the options.
model: GPT-5.3-Codex (copilot)
agent: Architect
---

Прочитай work item 001. Сформируй CONTRACT: user story + verifiable acceptance criteria + интерфейсы/структуры данных + риски/dep + DoD.
Запиши контракт в work item (секция Contract) и/или создай документ в .agent-output/architecture/001-...-architecture-findings.md.
Обнови state: CONTRACT, gates.architect: pass|fail.