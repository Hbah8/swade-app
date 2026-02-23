Ок, конкретика.

## 1) Как “Tabs только внутри магазина” сочетаются с “живой результат сразу”

Это не про отдельную вкладку “Preview”, а про **встроенный preview прямо на вкладке Rules**.

Модель такая:

* Tabs внутри магазина остаются: **Rules | Share | (опционально) Advanced**
* Но **Rules** — это не “форма”, а **двухпанельный редактор**:

  * слева: правила (фильтры, pricing, exceptions)
  * справа: **живой результат** (мини data-table + summary), который обновляется при каждом изменении правил (или по кнопке Apply, если хочешь дебаунс/explicit apply)

Тогда вкладка “Preview” в классическом смысле становится:

* либо вообще не нужна (потому что preview всегда виден),
* либо превращается в “Player View” (полноэкранный вид как у игроков), если тебе это важно как отдельный режим.

**Итог:** “Preview” как таб может быть “для полного player-like режима”, а “живой результат” — всегда в Rules.

---

## 2) Конкретный макет структуры (без кода), production-like

Ниже макет уровня экрана + компоненты shadcn.

---

# Screen: Shop Manager

## A) Верхняя зона страницы

**[PageHeader]**

* `Breadcrumb` (опционально): Home / Shop Manager
* Title: **Shop Manager**
* Subtitle: “Define rule-based inventories per shop and share player links.”
* Справа: глобальные действия

  * `Button` (outline): **Sync to LAN** (бывший Save to LAN Server)
  * `DropdownMenu` (иконка/кебаб): Import/Export, Settings, Danger zone

**Важно:** глобальная “Sync to LAN” должна явно говорить что она делает:

* либо “Sync ALL shops”
* либо “Sync CURRENT shop”
  (я бы делал **Sync All** с подтверждением + статусом)

---

## B) Основная сетка (ключевая)

Двухколоночный layout:

### B1) Left Sidebar (магазины)

Компоненты:

* `Card` или просто контейнер + `Separator`
* `Input` + `Button` (Add shop) — компактно
* `ScrollArea` — список магазинов
* каждый магазин — `Button` (variant ghost) + `Badge` статуса

**Структура sidebar:**

**Sidebar Header**

* `Label`: Shops
* `Button` (sm): **New shop**
* ниже: `Input` (search shops) — опционально

**Shop List (ScrollArea)**
Каждый item:

* Название: “Downtown Guns”
* `Badge`:

  * **Saved** / **Unsaved** / **Draft**
* второй бейдж (опционально): `matchedCount` (например “12”)
* `DropdownMenu` на item: Rename / Duplicate / Delete

**Почему так лучше Tabs:**

* 3–5 магазинов — идеально.
* Нет распухания tablist.
* Можно показывать статусы и быстро дублировать.

---

### B2) Right Panel (текущий магазин)

Состоит из:

1. Shop Header (над tabs)
2. Tabs (внутри магазина)
3. Контент вкладки

---

## C) Shop Header (в правой панели)

Компоненты:

* `Card` header (или просто `div` с `Separator`)
* Слева:

  * Название магазина (h2)
  * `Badge`: Saved/Unsaved
  * маленький текст: “Last synced: 12:43” (если есть)
* Справа (важно):

  * `Button` (outline): **Open Player View**
  * `Button` (default): **Save changes** (или **Apply**, см. ниже)
  * `DropdownMenu` (danger actions): Delete, Reset, Duplicate

**Критично:** “Delete shop” НЕ рядом с “Player view”.

---

# Tabs внутри магазина

## Tab 1: Rules (главный рабочий)

Это **двухпанельный редактор** внутри одной вкладки.

### Layout Rules tab: 2 колонки (примерно 55/45 или 60/40)

---

## Rules.Left — Editor

Разбит на логические секции (каждая — `Card`):

### 1) Template / Preset (ускоритель)

`Card`

* Title: “Template”
* `Select`: Choose template (Gun store / Pharmacy / Laundromat / Custom)
* `Button` (sm): **Apply template**
* `Alert` (destructive/neutral) при применении: “This will overwrite current rules” + confirm (`Dialog`)

### 2) Inventory filters

`Card`

* Title: “Inventory rules”
* Subsection: Categories

  * `Label`
  * `Popover` + `Command` (multi-select) **Add categories**
  * выбранные — `Badge` chips (с X)
* Subsection: Tags

  * две колонки:

    * Include tags (`Popover`+`Command`)
    * Exclude tags (`Popover`+`Command`)
  * под ними: selected chips + конфликт-алерт
* Subsection: Legality

  * `Switch` “Enable legality filter”
  * если ON → `Popover`+`Command` multi-select legal statuses
  * если OFF → disabled state + helper text

### 3) Pricing

`Card`

* Title: “Pricing”
* `Input` number: Markup %
* `Select`: Pricing profile
* Helper text: “Final price = base × profile × (1 + markup) …” (коротко)
* (опционально) `Slider` для markup (если хочешь быстро)

### 4) Exceptions

`Card`

* Title: “Exceptions”
* `Tabs` внутри карточки или просто две секции:

  * Pinned
  * Banned
  * (лучше добавить 3-й тип) Overrides
* `Button`: **Add exception** → `Dialog`

  * Step 1: type (Pin / Ban / Override price)
  * Step 2: search item (`Command`)
  * Step 3 (если override): input final price / delta
* Списки pinned/banned:

  * `ScrollArea`
  * каждый item: name + base + final + remove (`Button` icon)

### 5) Unsaved control (если не хочешь автоапплай)

Если ты боишься лагов/пересчёта:

* Внизу левой панели `Sticky` bar:

  * `Button` primary: **Apply**
  * `Button` ghost: Discard
  * текст: “Unsaved changes”

---

## Rules.Right — Live Result (встроенный preview)

Это то, о чём я говорил “живой результат сразу”.

Компоненты:

* `Card` “Matched items”
* сверху:

  * `Badge`: “12 items”
  * `Input` search within results
  * `DropdownMenu` “Columns / Export CSV / Copy list” (опционально)
* Body:

  * `Table` / `DataTable` (если у тебя уже есть)
  * колонки минимум:

    * Item
    * Category / Tags (в коротком виде)
    * Base
    * Final
    * Legal status (если есть)
    * (optional) Weight
* Footer:

  * “Total weight: …”
  * “Avg delta: …”
  * `Button` outline: **Open full player view**

**И это обновляется:**

* либо live при изменениях (дебаунс 300–500мс),
* либо после Apply (если ты выберешь explicit apply).

---

## Tab 2: Share

Цель: быстро дать ссылку игрокам.

`Card` “Player link”

* `Input` read-only: `http://192.168.../shop/downtown-guns`
* `Button` icon: Copy
* `Button` outline: Open
* Мета:

  * `Badge`: Read-only
  * “Last synced to LAN: …”
* (опционально) QR код блок

`Card` “Access”

* toggle: “Hide illegal items” (если это отдельная политика)
* примечание: “Player view is read-only.”

---

## Tab 3: Advanced (опционально)

Сюда выносишь то, что мешает в основном потоке:

* JSON import/export (bulk)
* raw rules JSON
* debug: matched query, etc.

**Важно:** ты хотел “не показывать import JSON на странице магазинов” — сюда идеально.
Или в глобальное меню “Import/Export” через `Dialog`.

---

# 3) Микро-решения, которые сделают “как в админке”

## 3.1 Статусы и сохранение

* У каждого shop item в sidebar `Badge`: Saved/Unsaved
* В Shop Header крупно: Unsaved changes
* При уходе со страницы — `Dialog` confirm

## 3.2 Опасные действия

* Delete shop только через `DropdownMenu` + `Dialog` confirm
* Желательно require typing shop name (если прям критично)

## 3.3 Пустые состояния (empty states)

* Если нет магазинов: большая `Card` с CTA “Create first shop”
* Если нет matched items: `Alert` “No items matched. Check categories/tags/legal filter.”

---

## 4) Как это выглядит как макет (ASCII wireframe)

Чтобы совсем наглядно:

```
[Header: Shop Manager]                           [Sync All to LAN] [⋮]

┌────────────── Sidebar (Shops) ──────────────┐  ┌────────── Current Shop Panel ────────────┐
│ [New shop]                                  │  │ Downtown Guns   [Unsaved]  [Save] [⋮]    │
│ [Search shops…]                             │  │ [Open Player View]                          │
│ ──────────────────────────────────────────  │  │ Tabs:  Rules | Share | Advanced             │
│ ▸ Downtown Guns   [Unsaved] [12]             │  │ ─────────────────────────────────────────  │
│   The Strip Arms  [Saved]   [34]             │  │ Rules tab:                                  │
│   Chinatown Pharma [Draft]  [7]              │  │ ┌──────── Editor (Left) ────────┐ ┌───────┐ │
│                                              │  │ │ Template (Select+Apply)        │ │ Live  │ │
│                                              │  │ │ Inventory filters (cats/tags)  │ │ Result│ │
│                                              │  │ │ Pricing (markup/profile)       │ │ Table │ │
│                                              │  │ │ Exceptions (pin/ban/override)  │ │ +sum  │ │
│                                              │  │ └────────────────────────────────┘ └───────┘ │
└──────────────────────────────────────────────┘  └─────────────────────────────────────────────┘
```

---

## 5) Ответ “что именно делать у тебя сейчас”

Ты уже начал двигаться к этому: у тебя появились Tabs, Card, разделение. Дальше:

1. **Убрать tabs по магазинам** → заменить на sidebar list.
2. В **Rules** сделать **2 колонки** и справа встроить live table.
3. “Preview” таб либо убрать, либо оставить как “Full player view”.
4. “Save to LAN Server” переименовать в явную семантику: Sync All / Sync Current.
5. “Toggle” заменить на нормальный “Add category” + chips.

---