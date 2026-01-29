---
name: typescript-standards
description: TypeScript coding standards based on Google TypeScript Style Guide. Use when writing TypeScript code, defining types, working with imports/exports, or ensuring type safety.
---

# TypeScript Standards

## Source File Structure

Files must be organized in this order:
1. Copyright/license (if present)
2. `@fileoverview` JSDoc (if present)
3. Imports
4. Implementation

**Exactly one blank line** separates each section.

## Imports

### Import Types

```typescript
// ✅ Module imports - for many symbols from a module
import * as mongoose from 'mongoose';
import * as path from 'path';

// ✅ Named imports - for specific symbols
import { Injectable, Controller, Get } from '@nestjs/common';
import { PurchaseService, PurchaseQueryService } from './services';

// ✅ Default imports - only when required by external code
import Button from 'Button';

// ✅ Side-effect imports - only for libraries that need side effects
import 'reflect-metadata';
```

### Import Order

```typescript
// 1. Node built-ins
import * as path from 'path';
import * as fs from 'fs';

// 2. External packages
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// 3. Internal absolute imports
import { ApiTagsConstants } from 'src/shared/constants';
import { JwtPayload } from 'src/v2/auth/interfaces';

// 4. Relative imports
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dtos';
```

### Import Best Practices

```typescript
// ✅ Use relative imports for same project files
import { PurchaseService } from './purchase.service';
import { CreateDto } from '../dtos';

// ✅ Prefer named imports for common symbols
import { describe, it, expect } from '@jest/globals';

// ✅ Use namespace imports for many symbols
import * as purchaseUtils from './utils/purchase.utils';

// ❌ Don't use wildcard imports when only using few symbols
import * as nestCommon from '@nestjs/common'; // BAD if only using Injectable
```

## Exports

### Named Exports (Preferred)

```typescript
// ✅ Use named exports
export class PurchaseService { }
export function calculateTotal() { }
export const PURCHASE_CONFIG = { };

// ❌ Don't use default exports
export default class PurchaseService { } // BAD
```

### Barrel Exports

```typescript
// services/index.ts
export * from './purchase-crud.service';
export * from './purchase-query.service';
export * from './purchase-validation.service';

// Usage
import { PurchaseCrudService, PurchaseQueryService } from './services';
```

## Type Definitions

### Interfaces vs Type Aliases

```typescript
// ✅ Use interfaces for object shapes
interface Purchase {
  id: string;
  amount: number;
  status: PurchaseStatus;
  createdAt: Date;
}

// ✅ Use type aliases for unions, primitives, tuples
type PurchaseStatus = 'pending' | 'completed' | 'cancelled';
type PurchaseId = string;
type Coordinates = [number, number];

// ✅ Use type for complex types
type PurchaseWithTotal = Purchase & { total: number };
type AsyncPurchase = Promise<Purchase>;
```

### Interface Naming

```typescript
// ✅ Don't use I prefix
interface Purchase { }
interface PurchaseService { }

// ❌ Don't use I prefix (Hungarian notation)
interface IPurchase { }  // BAD
interface IPurchaseService { }  // BAD
```

## Type Inference

### Let TypeScript Infer When Obvious

```typescript
// ✅ Type is obvious from initialization
const count = 0;
const name = 'Medicine';
const isActive = true;
const items = new Set<string>();

// ❌ Unnecessary explicit type
const count: number = 0;  // BAD - obvious
const name: string = 'Medicine';  // BAD - obvious
```

### Explicit Types When Needed

```typescript
// ✅ Explicit type for empty collections
const items: Purchase[] = [];
const cache: Map<string, Purchase> = new Map();

// ✅ Explicit return types for public APIs
export function calculateTotal(items: PurchaseItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Explicit types for complex expressions
const value: PurchaseWithMeta = await rpc.getSomeValue().transform();
```

## Null and Undefined

### Optional vs Undefined

```typescript
// ✅ Use optional for optional properties
interface PurchaseQuery {
  status?: PurchaseStatus;  // Optional
  dateRange?: DateRange;
}

// ✅ Use | null when null is a valid value
interface ApiResponse {
  data: Purchase | null;  // Explicitly nullable
  error: string | null;
}

// ✅ Use optional chaining
const name = purchase?.customer?.name ?? 'Unknown';

// ✅ Use nullish coalescing
const quantity = purchase.quantity ?? 0;
```

## Avoiding `any`

### Use `unknown` Instead of `any`

```typescript
// ❌ Don't use any
function processData(data: any) {
  return data.value;  // Unsafe!
}

// ✅ Use unknown and narrow the type
function processData(data: unknown): number {
  if (isValidData(data)) {
    return data.value;
  }
  throw new Error('Invalid data');
}

function isValidData(data: unknown): data is { value: number } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'value' in data &&
    typeof (data as any).value === 'number'
  );
}
```

### When `any` is Necessary

```typescript
// If any is truly needed, document why
// This API returns dynamic JSON that varies by endpoint
// tslint:disable-next-line:no-any
const response = await externalApi.get() as any;
```

## Classes

### Class Structure

```typescript
@Injectable()
export class PurchaseService {
  // 1. Static members
  private static readonly MAX_RETRIES = 3;
  
  // 2. Instance fields
  private readonly logger = new Logger(PurchaseService.name);
  
  // 3. Constructor
  constructor(
    private readonly crudService: PurchaseCrudService,
    private readonly queryService: PurchaseQueryService,
  ) {}
  
  // 4. Public methods
  async create(dto: CreatePurchaseDto, user: JwtPayload): Promise<Purchase> {
    return this.crudService.create(dto, user);
  }
  
  // 5. Private methods
  private validateInput(dto: CreatePurchaseDto): void {
    // ...
  }
}
```

### Use `readonly` for Immutable Properties

```typescript
class PurchaseService {
  // ✅ Mark as readonly
  private readonly model: Model<PurchaseDocument>;
  private readonly logger: Logger;
  
  constructor(
    @InjectModel(Purchase.name)
    private readonly purchaseModel: Model<PurchaseDocument>,
  ) {
    this.model = purchaseModel;
    this.logger = new Logger(PurchaseService.name);
  }
}
```

### Parameter Properties

```typescript
// ✅ Use parameter properties for DI
class PurchaseService {
  constructor(
    private readonly crudService: PurchaseCrudService,
    private readonly queryService: PurchaseQueryService,
  ) {}
}

// Instead of:
class PurchaseService {
  private readonly crudService: PurchaseCrudService;
  private readonly queryService: PurchaseQueryService;
  
  constructor(crudService: PurchaseCrudService, queryService: PurchaseQueryService) {
    this.crudService = crudService;
    this.queryService = queryService;
  }
}
```

## Functions

### Arrow Functions vs Function Declarations

```typescript
// ✅ Function declarations for named functions
function calculateTotal(items: PurchaseItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Arrow functions for callbacks
items.map(item => item.price);
items.filter(item => item.price > 100);

// ✅ Arrow functions when type annotation needed
const processItem: (item: Item) => ProcessedItem = item => {
  // ...
};
```

### Default Parameters

```typescript
// ✅ Use default parameters
function createPurchase(
  items: PurchaseItem[],
  discount = 0,
  taxRate = 0.18,
): Purchase {
  // ...
}

// ✅ Put default parameters last
function query(filters: Filters, page = 1, limit = 10) {
  // ...
}
```

## Error Handling

### Throw Only Errors

```typescript
// ✅ Throw Error objects
throw new Error('Purchase not found');
throw new HttpException('Validation failed', HttpStatus.BAD_REQUEST);

// ❌ Don't throw strings or other values
throw 'Something went wrong';  // BAD
throw { error: 'failed' };  // BAD
```

### Catch Handling

```typescript
// ✅ Type catch as unknown
try {
  await purchaseService.create(dto);
} catch (error: unknown) {
  if (error instanceof HttpException) {
    // Handle HTTP error
  } else if (error instanceof Error) {
    // Handle generic error
    logger.error(error.message);
  }
  throw error;
}
```

## Array Types

```typescript
// ✅ Use T[] for simple types
const items: string[] = [];
const purchases: Purchase[] = [];

// ✅ Use Array<T> for complex types
const results: Array<{ id: string; value: number }> = [];
const callbacks: Array<(item: Item) => void> = [];

// ✅ Use readonly for immutable arrays
function process(items: readonly PurchaseItem[]): void {
  // items cannot be modified
}
```

## Control Flow

### Use === and !==

```typescript
// ✅ Always use strict equality
if (status === 'completed') { }
if (count !== 0) { }

// ❌ Don't use loose equality
if (status == 'completed') { }  // BAD
if (count != 0) { }  // BAD

// Exception: null checks for both null and undefined
if (value == null) {
  // value is null or undefined
}
```

### Prefer for...of

```typescript
// ✅ Use for...of for arrays
for (const item of items) {
  process(item);
}

// ✅ Use for...of with Object.entries for objects
for (const [key, value] of Object.entries(obj)) {
  process(key, value);
}

// ❌ Avoid for...in for arrays
for (const i in items) {  // BAD - gives string indices
  process(items[i]);
}
```

## Best Practices Summary

1. **Named exports**: Prefer named exports over default exports
2. **Interfaces**: Use interfaces for object shapes, types for unions
3. **Type inference**: Let TypeScript infer obvious types
4. **No any**: Use `unknown` and type guards instead
5. **Strict equality**: Always use `===` and `!==`
6. **Readonly**: Mark immutable properties as `readonly`
7. **Error types**: Only throw `Error` objects
8. **Optional chaining**: Use `?.` and `??` for null safety
