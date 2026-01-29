---
name: nextjs-frontend
description: Develops Next.js 16 frontend with React 19, Tailwind CSS 4, and SCSS modules following Tapza Pharmacy conventions. Use when creating pages, components, API clients, React Query hooks, or styling.
---

# Next.js Frontend Development

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: React 19
- **Styling**: SCSS modules + Tailwind CSS 4
- **UI Components**: Radix UI (via shadcn/ui)
- **Data Fetching**: React Query (TanStack Query)
- **State Management**: React Context + React Query
- **Icons**: Lucide React

## File Structure

```
app/
├── {feature}/                    # Feature route
│   ├── page.tsx                 # Page component
│   ├── {feature}.module.scss    # Feature styles
│   └── components/             # Feature components
├── components/                   # Shared components
│   └── {Component}/
│       ├── {Component}.tsx
│       ├── {Component}.module.scss
│       └── types.ts
├── api/                         # API client functions
│   └── {feature}/
│       ├── {feature}.ts
│       └── types.ts
├── queries/                     # React Query hooks
│   └── {feature}/
│       └── use{Feature}.ts
├── hooks/                       # Custom React hooks
└── layouts/                     # Layout components
```

## Page Component Pattern

```typescript
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFeature } from '@/app/queries/feature/useFeature';
import styles from './Feature.module.scss';

export default function FeaturePage() {
  const { data, isLoading, error } = useFeature();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className={styles.container}>
      {/* Page content */}
    </div>
  );
}
```

## Component Pattern

```typescript
'use client';

import styles from './Component.module.scss';

export interface ComponentProps {
  title: string;
  description?: string;
  onAction?: () => void;
}

export const Component = ({ title, description, onAction }: ComponentProps) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
      {onAction && (
        <button onClick={onAction} className={styles.button}>
          Action
        </button>
      )}
    </div>
  );
};

export default Component;
```

## API Client Pattern

```typescript
// app/api/feature/feature.ts
import axios from 'axios';
import { Feature, CreateFeatureDto } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const featureApi = {
  getAll: async (): Promise<Feature[]> => {
    const { data } = await axios.get(`${API_BASE_URL}/api/feature`);
    return data;
  },

  getById: async (id: string): Promise<Feature> => {
    const { data } = await axios.get(`${API_BASE_URL}/api/feature/${id}`);
    return data;
  },

  create: async (dto: CreateFeatureDto): Promise<Feature> => {
    const { data } = await axios.post(`${API_BASE_URL}/api/feature`, dto);
    return data;
  },
};
```

## React Query Hook Pattern

```typescript
// app/queries/feature/useFeature.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { featureApi } from '@/app/api/feature/feature';
import { CreateFeatureDto } from '@/app/api/feature/types';

export const useFeature = () => {
  return useQuery({
    queryKey: ['feature'],
    queryFn: () => featureApi.getAll(),
  });
};

export const useCreateFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateFeatureDto) => featureApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature'] });
    },
  });
};
```

## Styling with SCSS Modules

Use SCSS modules for component-scoped styles. Import: `import styles from './Component.module.scss'`. Use CSS variables for theming.

## Tailwind CSS Usage

Use Tailwind for utility classes (`className="flex items-center gap-2"`), SCSS modules for component-scoped styles (`className={styles.card}`).

## Type Definitions

Define types in `app/api/{feature}/types.ts`. Export interfaces for API request/response types.

## Client vs Server Components

- Client Components: Use `'use client'` for interactive components
- Server Components: Default in App Router, use for data fetching
- Pattern: Fetch in Server Components, pass to Client Components

## Routing

File-based: `app/{route}/page.tsx` → `/route`. Dynamic: `app/{route}/[id]/page.tsx` → `/route/:id`. Layouts: `app/layout.tsx` (root), `app/{route}/layout.tsx` (nested).

## File Size Management

If component exceeds 200 lines: Extract sub-components, move hooks, extract types, split pages.

## Best Practices

1. Co-location: Keep component, styles, types together
2. Barrel exports: Use `index.ts` for clean imports
3. Error boundaries: Wrap routes appropriately
4. Loading states: Handle loading and error states
5. Accessibility: Use semantic HTML and ARIA attributes
6. Performance: Use React.memo, useMemo, useCallback appropriately
