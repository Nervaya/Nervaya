---
name: api-tags-modularity
description: Uses centralized ApiTags constants for Swagger documentation following Tapza Pharmacy patterns. Use when creating controllers or organizing API documentation.
---

# API Tags Modularity

## Centralized ApiTags Constants

All API tags are defined in `src/shared/constants/swagger.constants.ts`:

```typescript
export const ApiTagsConstants = {
  // --- Pharmacy Modules ---
  PHARMACY_SALES: 'Pharmacy - Sales & Invoicing',
  PHARMACY_PURCHASES: 'Pharmacy - Purchases & Refunds',
  PHARMACY_MEDICINES: 'Pharmacy - Medicines Catalog',
  PHARMACY_BATCHES: 'Pharmacy - Medicine Batches & Stock',
  PHARMACY_CUSTOMERS: 'Pharmacy - Customer Management',
  PHARMACY_SUPPLIERS: 'Pharmacy - Supplier Management',
  PHARMACY_OCR: 'Pharmacy - OCR Services',
  
  // --- Tapza Admin Modules ---
  TAPZA_ADMIN_USERS: 'Admin - User Management',
  TAPZA_ADMIN_AUTH: 'Admin - Authentication',
  
  // --- System Modules ---
  HEALTH: 'System - Health Check',
};
```

## Controller Usage

Always import and use constants from `swagger.constants.ts`:

```typescript
import { ApiTags } from '@nestjs/swagger';
import { ApiTagsConstants } from 'src/shared/constants/swagger.constants';

@ApiTags(ApiTagsConstants.PHARMACY_SUPPLIERS)
@Controller('v1/pharmacy/suppliers')
export class SuppliersController {
  // ...
}
```

## ApiDoc Decorator

Use the custom `@ApiDoc` decorator for consistent API documentation:

```typescript
import { ApiDoc } from 'src/shared/decorators/api-doc.decorator';

@Post()
@ApiDoc('Create a new supplier')
async create(@Body() dto: CreateDto, @CurrentUserV2() user: JwtPayload) {
  // ...
}
```

The `@ApiDoc` decorator automatically adds:
- `@ApiOperation` with summary
- `@ApiOkResponse`
- `@ApiBadRequestResponse`
- `@ApiUnauthorizedResponse`
- `@ApiInternalServerErrorResponse`

## Adding New ApiTags

When creating a new feature:

1. **Add constant** to `swagger.constants.ts`:
```typescript
export const ApiTagsConstants = {
  // ... existing tags
  PHARMACY_NEW_FEATURE: 'Pharmacy - New Feature Description',
};
```

2. **Use in controller**:
```typescript
@ApiTags(ApiTagsConstants.PHARMACY_NEW_FEATURE)
@Controller('v1/pharmacy/new-feature')
export class NewFeatureController {
  // ...
}
```

## Tag Naming Convention

- **Format**: `{Category} - {Description}`
- **Pharmacy modules**: `Pharmacy - {Feature Name}`
- **Admin modules**: `Admin - {Feature Name}`
- **System modules**: `System - {Feature Name}`
- **V2 APIs**: `{Feature} V2` (e.g., `Orgs V2`, `Auth V2`)

## Best Practices

1. **Never hardcode tags**: Always use constants from `ApiTagsConstants`
2. **Consistent naming**: Follow the `{Category} - {Description}` pattern
3. **Group related endpoints**: Use same tag for related controllers
4. **Use ApiDoc decorator**: For consistent endpoint documentation
5. **Update constants**: Add new tags to centralized file before using
