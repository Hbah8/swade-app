# Refactoring Catalog

Quick reference for common refactoring techniques.

## Core Techniques

### Extract Method
**When:** Code block can be grouped under a clear name.
```typescript
// Before
function process(input: Input): Result {
	if (!input.userId) throw new Error("Missing userId");
	if (!input.token) throw new Error("Missing token");
	return runWorkflow(input);
}

// After
function process(input: Input): Result {
	validateInput(input);
	return runWorkflow(input);
}

function validateInput(input: Input): void {
	if (!input.userId) throw new Error("Missing userId");
	if (!input.token) throw new Error("Missing token");
}
```

### Extract Class
**When:** Class has multiple responsibilities.
```typescript
// Before
class OrderManager {
	calculateTotal() {}
	formatInvoice() {}
	sendEmail() {}
}

// After
class OrderManager {
	calculateTotal() {}
}

class InvoiceFormatter {
	format() {}
}

class OrderNotifier {
	sendEmail() {}
}
```

### Replace Conditional with Polymorphism
**When:** Type-based branching changes often.
```typescript
// Before
function calculatePay(employee: Employee): number {
	if (employee.type === "hourly") return employee.hours * employee.rate;
	if (employee.type === "salary") return employee.annual / 12;
	throw new Error("Unknown type");
}

// After
interface PayrollPolicy {
	calculatePay(): number;
}
```

### Introduce Parameter Object
**When:** Same parameters appear together.
```typescript
// Before
function search(startDate: Date, endDate: Date, minPrice: number, maxPrice: number) {}

// After
type SearchCriteria = {
	startDate: Date;
	endDate: Date;
	minPrice: number;
	maxPrice: number;
};

function search(criteria: SearchCriteria) {}
```

### Replace Magic Number with Constant
**When:** Literal has domain meaning.
```typescript
// Before
if (velocity > 343) return "supersonic";

// After
const SPEED_OF_SOUND_MPS = 343;
if (velocity > SPEED_OF_SOUND_MPS) return "supersonic";
```

### Guard Clauses (Replace Nested Conditionals)
**When:** Deep nesting obscures intent.
```typescript
// Before
function process(item?: Item): Result | null {
	if (item) {
		if (item.valid) {
			if (item.ready) {
				return run(item);
			}
		}
	}
	return null;
}

// After
function process(item?: Item): Result | null {
	if (!item) return null;
	if (!item.valid) return null;
	if (!item.ready) return null;
	return run(item);
}
```

---

## TypeScript-Specific Techniques

### Replace `any` with Discriminated Union
**When:** Type checks branch on a shared `kind` field.
```typescript
// Before
function handle(result: any) {
	if (result.kind === "ok") return result.data;
	return result.error;
}

// After
type Result =
	| { kind: "ok"; data: string }
	| { kind: "error"; error: string };

function handle(result: Result) {
	return result.kind === "ok" ? result.data : result.error;
}
```

### Replace Optional Chaining Pyramids with Local Narrowing
**When:** Repeated `?.` and fallback logic reduces readability.
```typescript
// Before
const city = user?.profile?.address?.city ?? "Unknown";

// After
const address = user?.profile?.address;
const city = address ? address.city : "Unknown";
```

### Replace String Literals with `as const` Maps
**When:** Repeated status/action literals spread across files.
```typescript
const Status = {
	Idle: "idle",
	Loading: "loading",
	Error: "error",
} as const;

type Status = (typeof Status)[keyof typeof Status];
```

---

## React / UI Framework Techniques

### Extract Hook
**When:** Component mixes rendering with side effects and orchestration.
```typescript
// Before: data fetch + render in one component
// After: move async/state logic to useProducts(), keep component presentational
```

### Split Container and Presentational Components
**When:** Component owns API/state logic and complex UI markup.
```typescript
// Container: fetches, transforms, handles actions
// Presentational: receives props and renders UI only
```

### Replace Prop Drilling with Context (Scoped)
**When:** Same props pass through 3+ levels without direct usage.
```typescript
// Create feature-scoped context/provider instead of passing repeated props
```

### Stabilize Derived Data with Memoization
**When:** Expensive filtering/sorting recomputes on unrelated renders.
```typescript
// Use useMemo for expensive derived arrays keyed by real dependencies
```

---

## Backend / Node Framework Techniques

### Extract Service from Controller/Route Handler
**When:** Endpoint contains business rules, validation, and persistence logic.
```typescript
// Controller handles transport concerns only
// Service handles business workflow and domain rules
```

### Replace Inline Validation with Schema Validation
**When:** Repeated manual checks in multiple handlers.
```typescript
// Move checks into shared schema validators (e.g., Zod/Joi/class-validator)
```

### Introduce Repository Interface
**When:** Persistence details leak into business logic.
```typescript
// Depend on UserRepository interface, keep DB implementation in infrastructure
```

---

## Selection Guide

| Symptom | Preferred Refactoring |
|---------|------------------------|
| Long function, mixed concerns | Extract Method |
| Multi-purpose class | Extract Class |
| Frequent `if/else` by type | Replace Conditional with Polymorphism |
| Repeated parameter groups | Introduce Parameter Object |
| Nested guards and branching | Guard Clauses |
| `any`-driven control flow | Discriminated Union |
| Fat components | Extract Hook + Container/Presentational Split |
| Route handlers with business logic | Extract Service |

Apply the smallest change that improves clarity, testability, and coupling.
