---
name: file-size-management
description: Ensures all source files stay under 200 lines by extracting utilities, splitting services, and breaking down components. Use when files exceed 200 lines or when creating new files that might grow large.
---

# File Size Management

## Rule: Maximum 200 Lines Per File

**CRITICAL**: All source files (`.ts`, `.tsx`, `.js`, `.jsx`) must be under 200 lines. This improves:
- Readability and maintainability
- Code review efficiency
- Testability
- Reusability

## When a File Exceeds 200 Lines

### 1. Extract Utility Functions

**Before** (250 lines):
```typescript
// feature.service.ts - TOO LARGE
export class FeatureService {
  // 200+ lines of methods
  private complexCalculation() { /* 50 lines */ }
  private dataTransformation() { /* 50 lines */ }
  private validationLogic() { /* 50 lines */ }
}
```

**After** (Split into utilities):
```typescript
// feature.service.ts - 80 lines
import { calculateFeature } from './utils/feature-calculator.utils';
import { transformFeatureData } from './utils/feature-transformer.utils';
import { validateFeature } from './utils/feature-validator.utils';

export class FeatureService {
  // Uses extracted utilities
}

// utils/feature-calculator.utils.ts - 50 lines
export function calculateFeature() { /* ... */ }

// utils/feature-transformer.utils.ts - 50 lines
export function transformFeatureData() { /* ... */ }

// utils/feature-validator.utils.ts - 50 lines
export function validateFeature() { /* ... */ }
```

### 2. Split Large Services

**Backend Pattern**:
```typescript
// feature.service.ts - Main service (100 lines)
export class FeatureService {
  constructor(
    private readonly crudService: FeatureCrudService,
    private readonly queryService: FeatureQueryService,
  ) {}
}

// services/feature-crud.service.ts - CRUD operations (150 lines)
export class FeatureCrudService {
  async create() { /* ... */ }
  async update() { /* ... */ }
  async delete() { /* ... */ }
}

// services/feature-query.service.ts - Query operations (150 lines)
export class FeatureQueryService {
  async findAll() { /* ... */ }
  async findByFilters() { /* ... */ }
}
```

### 3. Break Down Large Components

**Frontend Pattern**:
```typescript
// FeaturePage.tsx - Main page (80 lines)
import { FeatureHeader } from './components/FeatureHeader';
import { FeatureList } from './components/FeatureList';
import { FeatureForm } from './components/FeatureForm';

export default function FeaturePage() {
  return (
    <div>
      <FeatureHeader />
      <FeatureList />
      <FeatureForm />
    </div>
  );
}

// components/FeatureHeader.tsx - 50 lines
export const FeatureHeader = () => { /* ... */ };

// components/FeatureList.tsx - 80 lines
export const FeatureList = () => { /* ... */ };

// components/FeatureForm.tsx - 120 lines
export const FeatureForm = () => { /* ... */ };
```

### 4. Extract Types and Interfaces

**Before**:
```typescript
// feature.ts - 250 lines (includes 50 lines of types)
export interface ComplexType1 { /* ... */ }
export interface ComplexType2 { /* ... */ }
export interface ComplexType3 { /* ... */ }
// ... 200 lines of implementation
```

**After**:
```typescript
// feature.ts - 180 lines
import { ComplexType1, ComplexType2, ComplexType3 } from './types';

// types.ts - 50 lines
export interface ComplexType1 { /* ... */ }
export interface ComplexType2 { /* ... */ }
export interface ComplexType3 { /* ... */ }
```

### 5. Extract Constants and Configuration

```typescript
// Before: feature.service.ts (220 lines)
export class FeatureService {
  private readonly MAX_RETRIES = 3;
  private readonly TIMEOUT = 5000;
  private readonly API_ENDPOINTS = { /* ... */ };
  // ... 200 lines
}

// After: feature.service.ts (180 lines)
import { FEATURE_CONFIG } from './feature.config';
import { API_ENDPOINTS } from './feature.constants';

// feature.config.ts - 20 lines
export const FEATURE_CONFIG = {
  MAX_RETRIES: 3,
  TIMEOUT: 5000,
};

// feature.constants.ts - 30 lines
export const API_ENDPOINTS = { /* ... */ };
```

## Extraction Guidelines

### When to Extract

1. Utility functions: Pure functions with no class state dependencies
2. Complex calculations: Mathematical or data transformation logic
3. Validation logic: Input validation, business rule checks
4. Query builders: Complex database query construction
5. Sub-components: Reusable UI pieces within a page
6. Type definitions: Complex interfaces or type unions
7. Constants: Configuration values, enums, mappings

### Where to Place Extracted Code

Pure utilities → `utils/`, Service helpers → `services/`, Component parts → `components/`, Types → `types.ts` or `dtos/`, Constants → `constants.ts`, Config → `config.ts`

## File Organization

After extraction: Main service/controller → `services/` (sub-services) → `utils/` (utilities) → `types.ts` (types) → `constants.ts` (constants).

## Checking File Size

```bash
find . -name "*.ts" -o -name "*.tsx" | xargs wc -l | awk '$1 > 200'
```

## Refactoring Checklist

- [ ] Identify extractable functions/logic
- [ ] Create new utility/service files
- [ ] Update imports and verify functionality
- [ ] Check all files are under 200 lines
- [ ] Update barrel exports (`index.ts`)

## Anti-Patterns

❌ Don't split arbitrarily; ✅ Do split by logical responsibility
❌ Don't create micro-files (5-10 lines); ✅ Do group utilities (30-100 lines)
❌ Don't break up tightly coupled code; ✅ Do keep related code together
