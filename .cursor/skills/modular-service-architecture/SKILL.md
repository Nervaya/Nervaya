---
name: modular-service-architecture
description: Creates modular, decoupled service architecture following Tapza Pharmacy patterns. Use when creating new features, breaking down services, or organizing service layers with orchestrator and sub-services pattern.
---

# Modular Service Architecture

## Service Structure Pattern

Every feature follows this modular structure:

```
feature/
├── feature.module.ts              # Module definition
├── feature.controller.ts           # Thin HTTP layer
├── feature.service.ts              # Main orchestrator (delegates to sub-services)
├── services/                       # Sub-services directory
│   ├── feature-crud.service.ts    # CRUD operations
│   ├── feature-query.service.ts   # Query operations
│   ├── feature-validation.service.ts # Validation logic
│   └── index.ts                   # Barrel export
├── dtos/                          # Data Transfer Objects
└── specialized-service.service.ts # Specialized services (fuzzy matching, etc.)
```

## Main Orchestrator Service

The main service (`feature.service.ts`) is a thin orchestrator that delegates to sub-services:

```typescript
@Injectable()
export class FeatureService {
  private readonly logger = new Logger(FeatureService.name);

  constructor(
    private readonly crudService: FeatureCrudService,
    private readonly queryService: FeatureQueryService,
    private readonly validationService: FeatureValidationService,
  ) {}

  // ==================== CRUD Operations ====================
  async create(dto: CreateDto, user: JwtPayload) {
    return this.crudService.create(dto, user);
  }

  async update(id: string, dto: UpdateDto, user: JwtPayload) {
    return this.crudService.update(id, dto, user);
  }

  // ==================== Query Operations ====================
  async findAll(user: JwtPayload) {
    return this.queryService.findAll(user);
  }

  async findOne(id: string, user: JwtPayload) {
    return this.queryService.findOne(id, user);
  }

  // ==================== Validation Operations ====================
  async checkDuplicate(dto: CreateDto, user: JwtPayload) {
    return this.validationService.checkDuplicate(dto, user);
  }
}
```

## Sub-Service Patterns

### CRUD Service (`*-crud.service.ts`)

Handles create, update, delete operations. Extract tenant context, use validation service, create/update models.

```typescript
@Injectable()
export class FeatureCrudService {
  constructor(
    @InjectModel(FeatureV2.name) private readonly model: Model<FeatureV2Document>,
    private readonly validationService: FeatureValidationService,
  ) {}

  private getTenantContext(user: JwtPayload) {
    return { tenantId: user.tenant_id, subOrgId: user.sub_org_id };
  }

  async create(dto: CreateDto, user: JwtPayload) {
    const { tenantId, subOrgId } = this.getTenantContext(user);
    await this.validationService.validateCreate(dto, user);
    return this.model.create({ ...dto, tenant_id: tenantId, sub_org_id: subOrgId });
  }
}
```

### Query Service (`*-query.service.ts`)

Handles all read/query operations. Extract tenant context, build queries with tenant filter, return results.

```typescript
@Injectable()
export class FeatureQueryService {
  constructor(@InjectModel(FeatureV2.name) private readonly model: Model<FeatureV2Document>) {}

  private getTenantContext(user: JwtPayload) {
    return { tenantId: user.tenant_id, subOrgId: user.sub_org_id };
  }

  async findAll(user: JwtPayload) {
    const { tenantId, subOrgId } = this.getTenantContext(user);
    return this.model.find({ tenant_id: tenantId, sub_org_id: subOrgId });
  }
}
```

### Validation Service (`*-validation.service.ts`)

Handles validation logic: duplicate checks, business rules, input validation. Extract tenant context, query models, return validation results.

```typescript
@Injectable()
export class FeatureValidationService {
  constructor(@InjectModel(FeatureV2.name) private readonly model: Model<FeatureV2Document>) {}

  async checkDuplicate(dto: CreateDto, user: JwtPayload) {
    const { tenantId, subOrgId } = this.getTenantContext(user);
    const existing = await this.model.findOne({ uniqueField: dto.uniqueField, tenant_id: tenantId, sub_org_id: subOrgId });
    return { isDuplicate: !!existing };
  }
}
```

## Complex Feature Organization

For complex features (like Sales), organize sub-services into folders:

```
sales-details/
├── sales-details.service.ts       # Main orchestrator
└── services/
    ├── core/                      # Core business logic
    │   ├── sales-core.service.ts
    │   ├── sales-invoice.service.ts
    │   ├── sales-validation.service.ts
    │   └── index.ts
    ├── analytics/                 # Analytics
    │   ├── sales-analytics.service.ts
    │   └── index.ts
    ├── draft/                     # Draft management
    │   ├── sales-draft.service.ts
    │   └── index.ts
    └── refund/                    # Refund operations
        ├── sales-refund.service.ts
        └── index.ts
```

## Module Registration

Register all services in the module:

```typescript
@Module({
  imports: [MongooseModule.forFeature([...]), V2Module],
  controllers: [FeatureController],
  providers: [
    FeatureService,              // Main orchestrator
    FeatureCrudService,           // CRUD operations
    FeatureQueryService,          // Query operations
    FeatureValidationService,     // Validation
    SpecializedService,           // Specialized services
  ],
  exports: [
    FeatureService,
    FeatureCrudService,
    FeatureQueryService,
    FeatureValidationService,
  ],
})
export class FeatureModule {}
```

## Decoupling Principles

1. Single Responsibility: Each sub-service handles one concern (CRUD, queries, validation)
2. Dependency Injection: Sub-services can depend on other sub-services
3. Tenant Context: Always extract tenant context in sub-services
4. Error Handling: Use `handleError` utility from `@tapza/utils`
5. Logging: Each service has its own logger instance

## Best Practices

1. Keep main orchestrator service thin (delegation only)
2. Extract tenant context in each sub-service
3. Use barrel exports (`index.ts`) for clean imports
4. Group related sub-services in folders for complex features
5. Export sub-services that other modules might need
6. Keep files under 200 lines - split if needed
