---
name: api-development
description: Develops REST APIs following NestJS conventions, multi-tenancy patterns, and Tapza Pharmacy standards. Use when creating endpoints, DTOs, validation, error handling, or API documentation.
---

# API Development Standards

## REST API Conventions

### Endpoint Naming

- **Resources**: Use plural nouns (`/api/suppliers`, `/api/medicines`)
- **Actions**: Use HTTP verbs, not action words in URL
- **Nested resources**: `/api/purchases/{id}/batches`
- **Query params**: For filtering, pagination, sorting

```typescript
// ✅ Good
GET    /api/suppliers
GET    /api/suppliers/:id
POST   /api/suppliers
PUT    /api/suppliers/:id
DELETE /api/suppliers/:id

// ❌ Bad
GET    /api/getSuppliers
POST   /api/suppliers/create
GET    /api/supplier/:id
```

### HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success (GET, PUT) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request (validation errors) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 500 | Internal Server Error |

## Controller Pattern

```typescript
import { ApiTagsConstants } from 'src/shared/constants/swagger.constants';

@ApiTags(ApiTagsConstants.PHARMACY_SUPPLIERS)
@Controller('v1/pharmacy/suppliers')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class SuppliersController {
  constructor(private readonly supplierService: SuppliersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiOkResponse({ type: [Supplier] })
  @Permissions('supplier:read')
  async findAll(
    @Query() queryDto: QuerySupplierDto,
    @CurrentUserV2() user: JwtPayload,
  ): Promise<Supplier[]> {
    return this.supplierService.findAll(queryDto, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create supplier' })
  @ApiCreatedResponse({ type: Supplier })
  @Permissions('supplier:create')
  async create(
    @Body() createDto: CreateSupplierDto,
    @CurrentUserV2() user: JwtPayload,
  ): Promise<Supplier> {
    return this.supplierService.create(createDto, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update supplier' })
  @Permissions('supplier:update')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSupplierDto,
    @CurrentUserV2() user: JwtPayload,
  ): Promise<Supplier> {
    return this.supplierService.update(id, updateDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete supplier' })
  @Permissions('supplier:delete')
  async delete(
    @Param('id') id: string,
    @CurrentUserV2() user: JwtPayload,
  ): Promise<void> {
    return this.supplierService.delete(id, user);
  }
}
```

## DTO Validation

### Create DTO

```typescript
import { IsString, IsNotEmpty, IsOptional, IsEmail, Matches, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateSupplierDto {
  @ApiProperty({ description: 'Supplier name', example: 'ABC Pharma' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ description: 'GSTIN number', example: '29ABCDE1234F1Z5' })
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
    message: 'Invalid GSTIN format',
  })
  gstin: string;

  @ApiPropertyOptional({ description: 'Contact email' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsString()
  @IsOptional()
  @Matches(/^[6-9]\d{9}$/, { message: 'Invalid phone number' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Credit limit', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  creditLimit?: number;
}
```

### Query DTO with Pagination

```typescript
export class QuerySupplierDto {
  @ApiPropertyOptional({ description: 'Search term' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'] })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
```

## Multi-Tenant API Pattern

**CRITICAL**: All endpoints must filter by `tenant_id`:

```typescript
@Injectable()
export class SuppliersService {
  constructor(
    private readonly crudService: SupplierCrudService,
    private readonly queryService: SupplierQueryService,
  ) {}

  // Helper to extract tenant context
  private getTenantContext(user: JwtPayload) {
    return {
      tenantId: user.tenant_id,
      subOrgId: user.sub_org_id,
    };
  }

  async findAll(queryDto: QuerySupplierDto, user: JwtPayload) {
    const { tenantId, subOrgId } = this.getTenantContext(user);
    // ✅ Always include tenant_id in queries
    return this.queryService.findAll(queryDto, tenantId, subOrgId);
  }

  async create(createDto: CreateSupplierDto, user: JwtPayload) {
    const { tenantId, subOrgId } = this.getTenantContext(user);
    // ✅ Include tenant_id on creation
    return this.crudService.create(createDto, tenantId, subOrgId, user.userId);
  }
}
```

## Error Handling

### Custom Exceptions

```typescript
// Create custom exceptions for common errors
export class SupplierNotFoundException extends HttpException {
  constructor(id: string) {
    super(`Supplier with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class DuplicateSupplierException extends HttpException {
  constructor(gstin: string) {
    super(`Supplier with GSTIN ${gstin} already exists`, HttpStatus.CONFLICT);
  }
}

export class InsufficientStockException extends HttpException {
  constructor(medicineId: string) {
    super(`Insufficient stock for medicine ${medicineId}`, HttpStatus.BAD_REQUEST);
  }
}
```

### Using Exceptions in Services

```typescript
@Injectable()
export class SupplierCrudService {
  async findById(id: string, tenantId: string): Promise<Supplier> {
    const supplier = await this.model.findOne({ _id: id, tenant_id: tenantId });
    if (!supplier) {
      throw new SupplierNotFoundException(id);
    }
    return supplier;
  }

  async create(dto: CreateSupplierDto, tenantId: string): Promise<Supplier> {
    // Check for duplicates
    const existing = await this.model.findOne({
      gstin: dto.gstin,
      tenant_id: tenantId,
    });
    if (existing) {
      throw new DuplicateSupplierException(dto.gstin);
    }
    return this.model.create({ ...dto, tenant_id: tenantId });
  }
}
```

### Global Exception Filter

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.getResponse();
      return response.status(status).json(
        typeof message === 'string'
          ? { statusCode: status, message }
          : message,
      );
    }

    // Log unexpected errors
    console.error('Unexpected error:', exception);
    return response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
}
```

## Response Format

### Success Responses

```typescript
// Single item
{ data: Supplier }

// List with pagination
{
  data: Supplier[],
  meta: {
    total: number,
    page: number,
    limit: number,
    totalPages: number,
  }
}

// Action result
{ success: true, message: 'Supplier created successfully' }
```

### Error Responses

```typescript
// Validation error
{
  statusCode: 400,
  message: 'Validation failed',
  errors: [
    { field: 'gstin', message: 'Invalid GSTIN format' },
    { field: 'email', message: 'Invalid email address' },
  ]
}

// Not found
{
  statusCode: 404,
  message: 'Supplier not found'
}

// Conflict
{
  statusCode: 409,
  message: 'Supplier with this GSTIN already exists'
}
```

## API Documentation (Swagger)

```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ApiTagsConstants } from 'src/shared/constants/swagger.constants';

@ApiTags(ApiTagsConstants.PHARMACY_SUPPLIERS)
@Controller('v1/pharmacy/suppliers')
export class SuppliersController {
  @Get()
  @ApiOperation({ 
    summary: 'Get all suppliers',
    description: 'Retrieves a paginated list of suppliers for the current tenant',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or GSTIN' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ 
    description: 'List of suppliers',
    type: [Supplier],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findAll() { }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier by ID' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiOkResponse({ type: Supplier })
  @ApiNotFoundResponse({ description: 'Supplier not found' })
  async findById() { }
}
```

## File Organization

```
feature/
├── feature.module.ts              # Module definition
├── feature.controller.ts          # HTTP endpoints (thin, max 200 lines)
├── feature.service.ts             # Main orchestrator (thin, delegates)
├── services/                      # Sub-services
│   ├── feature-crud.service.ts   # CRUD operations
│   ├── feature-query.service.ts  # Query operations
│   ├── feature-validation.service.ts
│   └── index.ts                  # Barrel export
├── dtos/                         # Data Transfer Objects
│   ├── create-feature.dto.ts
│   ├── update-feature.dto.ts
│   ├── query-feature.dto.ts
│   └── index.ts
└── exceptions/                   # Custom exceptions
    └── feature.exceptions.ts
```

## Best Practices

1. **Validate input**: Always use DTOs with class-validator decorators
2. **Tenant isolation**: Every query MUST filter by tenant_id
3. **Proper HTTP verbs**: GET (read), POST (create), PUT (update), DELETE (remove)
4. **Consistent responses**: Standardize success and error response formats
5. **Document APIs**: Use Swagger decorators on all endpoints
6. **Custom exceptions**: Create domain-specific exceptions for clarity
7. **Thin controllers**: Controllers only handle HTTP, delegate to services
8. **Pagination**: All list endpoints must support pagination
9. **Input sanitization**: Trim strings, validate formats
10. **Logging**: Log errors with context for debugging
