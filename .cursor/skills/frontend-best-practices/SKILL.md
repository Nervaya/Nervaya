---
name: frontend-best-practices
description: Frontend development guidelines including Airbnb/Google style patterns, modular component breakdown, SCSS styling, React hooks best practices, and Next.js App Router patterns.
---

# Frontend Best Practices

## 1. Component Structure (Airbnb + Google Style)

### Component File Organization

```typescript
// 1. Imports (grouped and ordered)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

// External libraries
import { format } from 'date-fns';

// Internal imports - components
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';

// Internal imports - hooks/utils
import { usePurchaseData } from '@/app/queries/purchase/usePurchase';
import { formatCurrency } from '@/lib/financial/number-utils';

// Styles (always last)
import styles from './PurchaseList.module.scss';

// 2. Types/Interfaces
interface PurchaseListProps {
  pharmacyId: string;
  onSelect?: (id: string) => void;
}

// 3. Component
export function PurchaseList({ pharmacyId, onSelect }: PurchaseListProps) {
  // 4. State hooks
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // 5. Query hooks
  const { data, isLoading, error } = usePurchaseData(pharmacyId);
  
  // 6. Effects
  useEffect(() => {
    // Side effects here
  }, [pharmacyId]);
  
  // 7. Memoized values
  const totalAmount = useMemo(() => {
    return data?.reduce((sum, p) => sum + p.amount, 0) ?? 0;
  }, [data]);
  
  // 8. Callbacks
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    onSelect?.(id);
  }, [onSelect]);
  
  // 9. Early returns (loading, error states)
  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  // 10. Main render
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Purchases</h2>
      <DataTable data={data} onRowClick={handleSelect} />
      <div className={styles.total}>
        Total: {formatCurrency(totalAmount)}
      </div>
    </div>
  );
}

export default PurchaseList;
```

## 2. JavaScript/TypeScript Best Practices (Airbnb Style)

### Variables

```typescript
// ✅ Use const for all references that won't be reassigned
const purchase = await getPurchase(id);
const items = [];

// ✅ Use let only when reassignment is needed
let total = 0;
for (const item of items) {
  total += item.price;
}

// ❌ Never use var
var badVariable = 'dont do this';
```

### Objects

```typescript
// ✅ Use object literal syntax
const purchase = {
  id: '123',
  amount: 100,
};

// ✅ Use object shorthand
const name = 'Medicine';
const price = 50;
const medicine = { name, price }; // Instead of { name: name, price: price }

// ✅ Use spread for shallow copy
const updated = { ...purchase, status: 'completed' };

// ✅ Use destructuring
const { id, amount, status } = purchase;

// ✅ Group shorthand properties at the beginning
const obj = {
  name,  // shorthand first
  price,
  category: 'tablets',
  quantity: 100,
};
```

### Arrays

```typescript
// ✅ Use array literal syntax
const items = [];

// ✅ Use spread to copy
const itemsCopy = [...items];

// ✅ Use array methods instead of loops
const prices = items.map(item => item.price);
const total = items.reduce((sum, item) => sum + item.price, 0);
const expensive = items.filter(item => item.price > 100);

// ✅ Use destructuring
const [first, second, ...rest] = items;
```

### Functions

```typescript
// ✅ Prefer function declarations for named functions
function calculateTotal(items: PurchaseItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Use arrow functions for callbacks
items.map(item => item.price);
items.filter(item => item.price > 100);

// ✅ Use default parameters
function createPurchase(items: Item[], discount = 0): Purchase {
  // ...
}

// ❌ Don't mutate parameters
function bad(obj: Obj) {
  obj.key = 1; // Don't do this
}

// ✅ Create new objects instead
function good(obj: Obj): Obj {
  return { ...obj, key: 1 };
}
```

### Arrow Functions

```typescript
// ✅ Use concise body for simple returns
const double = x => x * 2;
const getName = user => user.name;

// ✅ Use block body for multiple statements
const processItem = item => {
  const processed = transform(item);
  return validate(processed);
};

// ✅ Wrap object literals in parentheses
const createItem = id => ({ id, created: Date.now() });
```

## 3. Styling (SCSS/CSS Modules)

### File Naming
- Use `ComponentName.module.scss` or `styles.module.css` (as per project convention)
- **Never** use inline `style={{ ... }}` attributes

### Media Query Placement (Required)

**Every media query must be placed directly under its related CSS rule.** Do not group multiple unrelated selectors in one `@media` block.

```css
/* ✅ Correct: media query under its related rule */
.container {
  padding: 2rem;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
}

.title {
  font-size: 2rem;
}

@media (max-width: 768px) {
  .title {
    font-size: 1.5rem;
  }
}

/* ❌ Wrong: grouped media at end with multiple selectors */
.container { padding: 2rem; }
.title { font-size: 2rem; }

@media (max-width: 768px) {
  .container { padding: 1rem; }
  .title { font-size: 1.5rem; }
}
```

Comma-separated selectors that share the same responsive styles (e.g. `.primaryButton, .secondaryButton { ... }`) may stay grouped.

### Nested Media Queries (SCSS)

```scss
.container {
  display: flex;
  padding: 20px;
  gap: 16px;

  // ✅ Media query nested directly inside the class
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 10px;
    gap: 8px;
  }
}

.title {
  font-size: 24px;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 18px;
  }
}

.card {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 16px;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 12px;
  }
}
```

### CSS Variables for Theming

```scss
// Use CSS variables for consistent theming
.container {
  background: var(--background);
  color: var(--foreground);
  border: 1px solid var(--border);
}
```

## 4. React Hooks Best Practices

### useState

```typescript
// ✅ Initialize with proper types
const [items, setItems] = useState<PurchaseItem[]>([]);
const [selected, setSelected] = useState<string | null>(null);

// ✅ Use functional updates for state based on previous state
setCount(prev => prev + 1);
setItems(prev => [...prev, newItem]);
```

### useEffect

```typescript
// ✅ Include all dependencies
useEffect(() => {
  fetchData(id);
}, [id]); // id is a dependency

// ✅ Cleanup subscriptions
useEffect(() => {
  const subscription = subscribe(id);
  return () => subscription.unsubscribe();
}, [id]);

// ❌ Don't lie about dependencies
useEffect(() => {
  fetchData(id);
}, []); // Missing 'id' dependency - BAD
```

### useMemo & useCallback

```typescript
// ✅ Memoize expensive calculations
const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// ✅ Memoize callbacks passed to child components
const handleClick = useCallback((id: string) => {
  onSelect(id);
}, [onSelect]);

// ❌ Don't over-memoize simple values
const name = useMemo(() => user.name, [user.name]); // Unnecessary
```

## 5. Next.js App Router Patterns

### Server vs Client Components

```typescript
// Server Component (default) - for data fetching
// app/purchases/page.tsx
export default async function PurchasesPage() {
  const purchases = await db.purchases.findMany();
  return <PurchaseList purchases={purchases} />;
}

// Client Component - for interactivity
// components/PurchaseList.tsx
'use client';

import { useState } from 'react';

export function PurchaseList({ purchases }: Props) {
  const [selected, setSelected] = useState(null);
  // Interactive logic...
}
```

### Data Fetching Patterns

```typescript
// ✅ Fetch data on the server when possible
// app/medicines/page.tsx
export default async function MedicinesPage() {
  const medicines = await fetchMedicines();
  return <MedicineList medicines={medicines} />;
}

// ✅ Use React Query for client-side data
// components/MedicineSearch.tsx
'use client';

export function MedicineSearch() {
  const { data, isLoading } = useQuery({
    queryKey: ['medicines', searchTerm],
    queryFn: () => searchMedicines(searchTerm),
  });
}
```

### Streaming with Suspense

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<SalesLoading />}>
        <SalesOverview />
      </Suspense>
      <Suspense fallback={<StockLoading />}>
        <StockAlerts />
      </Suspense>
    </div>
  );
}
```

## 6. Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `PurchaseList.tsx` |
| Hooks | camelCase with "use" | `usePurchaseData.ts` |
| Utilities | camelCase | `formatCurrency.ts` |
| SCSS Modules | PascalCase.module | `PurchaseList.module.scss` |
| Constants (exported) | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Variables | camelCase | `purchaseTotal` |
| Interfaces | PascalCase | `PurchaseListProps` |

## 7. Performance Best Practices

### Code Splitting

```typescript
import dynamic from 'next/dynamic';

// Dynamic import for heavy components
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});
```

### Image Optimization

```typescript
import Image from 'next/image';

<Image
  src="/medicine.jpg"
  alt="Medicine"
  width={500}
  height={300}
  priority // For above-the-fold images
  placeholder="blur"
/>
```

## 8. Accessibility (a11y)

```typescript
// ✅ Use semantic HTML
<button onClick={handleClick}>Submit</button>
<nav aria-label="Main navigation">...</nav>

// ✅ Add labels to form elements
<label htmlFor="medicine-name">Medicine Name</label>
<input id="medicine-name" type="text" />

// ✅ Add alt text to images
<Image src={src} alt="Description of image" />

// ✅ Use ARIA attributes when needed
<div role="alert" aria-live="polite">{errorMessage}</div>
```

## 9. File Size Management

If a component exceeds 200 lines:
1. Extract sub-components to `./components/`
2. Move hooks to `./hooks/`
3. Extract types to `./types.ts`
4. Move utilities to `@/lib/`

## Best Practices Summary

1. **Componentize**: Break features into small, reusable components
2. **No inline styles**: Always use SCSS modules
3. **Type everything**: Use TypeScript interfaces for props
4. **Memoize wisely**: Use useMemo/useCallback for expensive operations
5. **Handle states**: Always handle loading, error, and empty states
6. **Keep it accessible**: Use semantic HTML and ARIA attributes
7. **Optimize images**: Use Next.js Image component
8. **File limits**: Keep files under 200 lines
