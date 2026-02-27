---
description: This prompt is used by the implementer agent to implement a work item according to the contract created by the architect agent.
model: GPT-5.3-Codex (copilot)
---

Прочитай work item 001 и все связанные артефакты. Реализуй строго по CONTRACT.
Где уместно — test-first (особенно для багфикса/логики).
Создай implementation doc в .agent-output/implementation/001-...-implementation.md, приложи evidence, обнови work item state: IMPLEMENTED.