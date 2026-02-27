---
description: This prompt is used to verify that the implemented QA tests for the ShopAdminPage component meet the acceptance criteria and to generate a QA report.
model: GPT-5.3-Codex
agent: QA
---
Проверь поведение относительно acceptance criteria.
Сформируй QA отчёт в .agent-output/qa/001-...-qa.md.
Если ок — gates.qa: pass и если остальные обязательные gates pass/waived — обнови state: VERIFIED.