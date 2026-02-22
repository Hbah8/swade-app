**Набор user stories для одного эпика**, который объединяет:

* Setting-scoped каталог
* Built-in наборы
* Custom items
* Bulk JSON import (опционально)
* Rule-based shops
* Player view

---

# 🎯 EPIC: Setting-Scoped Catalog & Rule-Based Shops

## Цель эпика

Перейти от JSON-first управления ассортиментом к:

> Setting-scoped Catalog (core + custom + import)
>
> * Rule-based Shops
> * Controlled metadata governance
> * Isolated player view

JSON становится вспомогательным инструментом, а не основной точкой входа.

---

Cеттинг: **70s Vegas, криминал, мафия, подполье, казино, утилизация тел, прослушка, оружейка**.

---

# 1️⃣ Минимальный, но достаточный набор тегов для 70s Vegas

## A. По легальности / доступности

```
legal
restricted
illegal
underground
military
police
```

Почему так:

* `legal` — обычный товар
* `restricted` — условно разрешённый
* `illegal` — запрещённый
* `underground` — продаётся только в подполье
* `military` — военный характер
* `police` — служебный

Это позволяет делать Chinatown vs Strip без костылей.

---

## B. По типу использования

```
firearm
melee
explosive (на будущее)
tool
cleaning
disposal
surveillance
interrogation
deception
restraint
medical
```

Покрытие:

* `firearm` → оружейный
* `cleaning` + `disposal` → прачечная
* `surveillance` → прослушка
* `interrogation` → сыворотка
* `deception` → карты
* `restraint` → наручники/стяжки
* `medical` → фарма

---

## C. По тематике сеттинга (опционально, но полезно)

```
luxury
mafia
street
professional
starter
```

Это даст:

* “Strip luxury weapons”
* “starter gear”
* “mafia classic”

---

## Итоговый рекомендуемый пул (17 тегов)

```
legal
restricted
illegal
underground
military
police
firearm
melee
tool
cleaning
disposal
surveillance
interrogation
deception
restraint
medical
luxury
```

Больше не нужно.

---

# 📘 Story 1 — Setting-Scoped Domain

### Title

As a GM, I want catalogs and shops to be scoped to a setting so different campaigns don’t mix data.

### Acceptance Criteria

* Application provides a Setting selector using `Select` in global header.
* `/catalog` and `/shops` operate strictly within selected setting.
* Header displays active setting name.
* Switching setting reloads `DataTable` content.
* No cross-setting item leakage.

---

# 📘 Story 2 — Built-In Catalog Sets (Out-of-the-Box)

### Title

As a GM, I want default catalog sets available without importing JSON.

### Acceptance Criteria

* `/catalog` includes `Tabs`: Items | Sets | Tags | Health.
* Sets tab renders each built-in set as a `Card` with:

  * Name
  * `Badge` with item count
  * Button “View items”.
* Built-in items appear in Items `DataTable` with `Badge` “Built-in”.
* Built-in items cannot be deleted (Delete action disabled in `DropdownMenu` or hidden in `Sheet`).
* Built-in items can be cloned to Custom via `DropdownMenu` → “Clone”.

---

# 📘 Story 3 — Add Custom Item via Form

### Title

As a GM, I want to create individual items without using JSON.

### Acceptance Criteria

* `/catalog` header includes `Button` “Add Item”.
* Clicking opens `Sheet` with form:

  * `Input` name
  * `Select` category
  * `Input` basePrice
  * `Input` weight
  * Tags via `Popover` + `Command` (multi-select)
  * Legal status via `Select`
* Required fields validated.
* Validation errors shown via `Alert (destructive)` or inline error.
* On save:

  * Item appears in `DataTable`
  * `Badge` “Custom” shown
  * `Toast` confirms creation.

---

# 📘 Story 4 — Bulk JSON Import as Optional Pack

### Title

As a GM, I want to bulk import items via JSON, but not depend on it for normal workflow.

### Acceptance Criteria

* `/catalog` header includes `Button` “Import Pack”.
* Clicking opens `Dialog` with:

  * `Textarea` for JSON
  * `Tabs`: Merge | Replace | Append
  * `Button` Validate
  * `Button` Import
* Validation:

  * Schema errors → `Alert (destructive)` and import disabled
  * Unknown tags → `Alert (warning)` but import allowed
* Imported items show `Badge` “Imported”.
* Successful import triggers `Toast`.

⚠ Import does NOT appear on `/shops`.

---

# 📘 Story 5 — Catalog Metadata Governance

### Title

As a GM, I want metadata quality to be visible and enforceable without blocking basic usage.

### Acceptance Criteria

* `/catalog` contains `Tabs` → Health.
* Health tab shows:

  * Items missing tags
  * Items missing legalStatus
  * Unknown tags
* Issues shown via `Alert` components.
* Each issue provides CTA button that applies filtered view in Items tab.
* Rule-based shops require tags/legalStatus only if corresponding filters are used.
* If rule requires metadata that is missing:

  * Blocking `Alert` shown in `/shops`
  * CTA navigates to `/catalog?tab=Health`.

This resolves strict vs legacy conflict.

---

# 📘 Story 6 — Rule-Based Shop Creation

### Title

As a GM, I want to define shop inventory using rules instead of manual selection.

### Acceptance Criteria

* `/shops` uses `Tabs` for shops (3–5 expected).
* Each shop contains sub-tabs:

  * Rules
  * Preview
  * Share
* Rules tab includes:

  * Include categories (`Select`)
  * Include tags (`Popover + Command`)
  * Exclude tags (`Popover`)
  * Legality filter (`Switch`)
  * Markup % (`Input`)
  * Pricing profile (`Select`)
* Live matched item count shown via `Badge`.
* No item list rendered in Rules tab.

---

# 📘 Story 7 — Exceptions (Pin / Ban / Override)

### Title

As a GM, I want to override rule logic for specific items without converting shop to manual mode.

### Acceptance Criteria

* Rules tab contains Exceptions section.
* Pinned and Banned lists displayed in `ScrollArea`.
* Add exception via `Dialog` with searchable `Command` list.
* Preview `DataTable` shows:

  * Source `Badge`: rule / pinned / override
* Row click opens `Sheet` with:

  * Pin / Ban (`Button`)
  * Manual price override (`Input + Button`)
* Override is visually indicated in table.

Exceptions are secondary, not primary workflow.

---

# 📘 Story 8 — Pricing Profiles

### Title

As a GM, I want reusable pricing logic across shops.

### Acceptance Criteria

* Pricing profile selected via `Select`.
* Pricing calculation order:
  base → category modifier → shop markup → override → rounding.
* Preview updates instantly.
* Pricing logic does not duplicate item data.

---

# 📘 Story 9 — Player View Isolation

### Title

As a GM, I want players to see only final computed results.

### Acceptance Criteria

* `/shop/{name}` renders read-only `DataTable`.
* No edit controls rendered.
* Share tab allows:

  * Column visibility configuration via `Checkbox` inside `Popover`
  * Copy link (`Button`)
  * `Toast` confirmation
* Player view cannot access Rules or Exceptions.

---

