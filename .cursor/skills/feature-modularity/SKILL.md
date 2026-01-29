---
name: feature-modularity
description: Breaks down features into modular, decoupled files following Tapza Pharmacy architecture. Use when creating new features or refactoring existing ones to ensure proper separation of concerns.
---

# Feature Modularity

## Feature Identification

Identify features by domain boundaries:
- **Suppliers**: Supplier management, CRUD, queries, validation
- **Sales**: Sales operations, invoices, drafts, refunds, analytics
- **Purchases**: Purchase operations, batches, inventory
- **Medicines**: Medicine catalog, search, management
- **Customers**: Customer management, ledger, credit notes

## Feature Structure

Each feature follows this modular structure:

```
feature/
├── feature.module.ts              # Module definition
├── feature.controller.ts           # HTTP endpoints (thin layer)
├── feature.service.ts              # Main orchestrator
├── services/                       # Sub-services
│   ├── feature-crud.service.ts
│   ├── feature-query.service.ts
│   ├── feature-validation.service.ts
│   └── index.ts                   # Barrel export
├── dtos/                          # Data Transfer Objects
│   ├── create-feature.dto.ts
│   ├── update-feature.dto.ts
│   ├── query-feature.dto.ts
│   └── index.ts
└── specialized-service.service.ts # Specialized services (optional)
```

## Breaking Down Features

### Step 1: Identify Responsibilities

Analyze the feature and identify:
- **CRUD operations**: Create, read, update, delete
- **Query operations**: Search, filter, pagination, complex queries
- **Validation logic**: Input validation, business rules, duplicate checks
- **Specialized logic**: Fuzzy matching, analytics, drafts, refunds

### Step 2: Create Sub-Services

Extract each responsibility into a dedicated service:

```typescript
// services/feature-crud.service.ts - CRUD only
@Injectable()
export class FeatureCrudService {
  async create(dto: CreateDto, user: JwtPayload) { /* ... */ }
  async update(id: string, dto: UpdateDto, user: JwtPayload) { /* ... */ }
  async delete(id: string, user: JwtPayload) { /* ... */ }
}

// services/feature-query.service.ts - Queries only
@Injectable()
export class FeatureQueryService {
  async findAll(user: JwtPayload) { /* ... */ }
  async search(filters: SearchDto, user: JwtPayload) { /* ... */ }
}

// services/feature-validation.service.ts - Validation only
@Injectable()
export class FeatureValidationService {
  async checkDuplicate(dto: CreateDto, user: JwtPayload) { /* ... */ }
}
```

### Step 3: Create Main Orchestrator

The main service delegates to sub-services:

```typescript
@Injectable()
export class FeatureService {
  constructor(
    private readonly crudService: FeatureCrudService,
    private readonly queryService: FeatureQueryService,
    private readonly validationService: FeatureValidationService,
  ) {}

  // Delegate CRUD
  async create(dto: CreateDto, user: JwtPayload) {
    return this.crudService.create(dto, user);
  }

  // Delegate queries
  async findAll(user: JwtPayload) {
    return this.queryService.findAll(user);
  }

  // Delegate validation
  async checkDuplicate(dto: CreateDto, user: JwtPayload) {
    return this.validationService.checkDuplicate(dto, user);
  }
}
```

## Complex Feature Organization

For complex features, organize sub-services into folders:

```
sales-details/
├── sales-details.service.ts
└── services/
    ├── core/                      # Core business logic
    │   ├── sales-core.service.ts
    │   ├── sales-invoice.service.ts
    │   ├── sales-validation.service.ts
    │   └── index.ts
    ├── analytics/                 # Analytics services
    │   ├── sales-analytics.service.ts
    │   └── index.ts
    ├── draft/                     # Draft management
    │   ├── sales-draft.service.ts
    │   └── index.ts
    └── refund/                    # Refund operations
        ├── sales-refund.service.ts
        ├── sales-refund-draft.service.ts
        └── index.ts
```

## Decoupling Strategies

### 1. Service Dependencies

Sub-services can depend on other sub-services:

```typescript
@Injectable()
export class FeatureCrudService {
  constructor(
    private readonly validationService: FeatureValidationService, // Depends on validation
    @InjectModel(FeatureV2.name)
    private readonly model: Model<FeatureV2Document>,
  ) {}

  async create(dto: CreateDto, user: JwtPayload) {
    // Use validation service
    await this.validationService.validateCreate(dto, user);
    return this.model.create({ ...dto, tenant_id: user.tenant_id });
  }
}
```

### 2. Specialized Services

Keep specialized services separate:

```typescript
// supplier-fuzzy-matching.service.ts (at feature root)
@Injectable()
export class SupplierFuzzyMatchingService {
  // Specialized fuzzy matching logic
}
```

### 3. Barrel Exports

Use `index.ts` for clean imports:

```typescript
// services/index.ts
export * from './feature-crud.service';
export * from './feature-query.service';
export * from './feature-validation.service';
```

## Module Registration

```typescript
@Module({
  imports: [MongooseModule.forFeature([...]), V2Module],
  controllers: [FeatureController],
  providers: [
    FeatureService, FeatureCrudService, FeatureQueryService,
    FeatureValidationService, SpecializedService,
  ],
  exports: [FeatureService, FeatureCrudService, FeatureQueryService],
})
export class FeatureModule {}
```

## Best Practices

1. Single Responsibility: Each service handles one concern
2. Thin Controllers: Controllers only handle HTTP, delegate to services
3. Thin Orchestrator: Main service delegates, doesn't contain business logic
4. Tenant Context: Always extract tenant context in sub-services
5. File Size: Keep files under 200 lines, split if needed
6. Barrel Exports: Use `index.ts` for clean imports
7. Export Strategy: Export services that other modules might need
