---
name: testing-practices
description: Writes unit tests, integration tests, and E2E tests following Tapza Pharmacy testing conventions. Use when creating test files, mocking dependencies, or ensuring test coverage.
---

# Testing Practices

## Test File Policy

**CRITICAL**: NEVER modify test files when working on code changes unless explicitly asked. This ensures existing tests validate that code changes are correct.

## Test File Organization

### Backend Tests

```
src/
├── feature/
│   ├── feature.service.ts
│   ├── feature.service.spec.ts      # Unit tests (alongside source)
│   └── feature.controller.spec.ts
└── test/
    └── e2e/                          # E2E tests
        └── feature.e2e-spec.ts
```

### Frontend Tests

```
app/
├── components/
│   └── Component/
│       ├── Component.tsx
│       └── Component.test.tsx        # Component tests
└── __tests__/                        # Integration tests
    └── feature.test.tsx
```

## Unit Test Pattern (Backend)

```typescript
// feature.service.spec.ts
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { FeatureService } from './feature.service';

describe('FeatureService', () => {
  let service: FeatureService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FeatureService,
        { provide: getModelToken('FeatureV2'), useValue: { create: jest.fn() } },
      ],
    }).compile();
    service = module.get<FeatureService>(FeatureService);
  });

  it('should create with tenant_id', async () => {
    const dto = { name: 'Test' };
    const user = { tenant_id: 't1', userId: 'u1' };
    const result = await service.create(dto, user);
    expect(result.tenant_id).toBe(user.tenant_id);
  });
});
```

## Component Test Pattern (Frontend)

```typescript
// Component.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('renders title correctly', () => {
    render(<Component title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onAction when button is clicked', () => {
    const mockAction = jest.fn();
    render(<Component title="Test" onAction={mockAction} />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockAction).toHaveBeenCalledTimes(1);
  });
});
```

## Mocking Patterns

### Backend: MongoDB Models

```typescript
const mockModel = {
  find: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([{ id: '1', name: 'Test' }]),
  }),
  findOne: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
  }),
  create: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
  findByIdAndUpdate: jest.fn().mockResolvedValue({ id: '1', name: 'Updated' }),
};
```

### Frontend: API Calls

```typescript
jest.mock('@/app/api/feature/feature', () => ({
  featureApi: {
    getAll: jest.fn().mockResolvedValue([{ id: '1', name: 'Test' }]),
    create: jest.fn().mockResolvedValue({ id: '1', name: 'New' }),
  },
}));
```

### Frontend: React Query

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithQuery = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>,
  );
};
```

## Test Coverage Requirements

- **Minimum coverage**: 80%
- **Critical paths**: 100% coverage (auth, payments, stock calculations)
- **Focus areas**: Business logic, services, utilities
- **Skip coverage**: DTOs (validation only), simple getters/setters

## Testing Multi-Tenancy

Always test tenant isolation: Create data for multiple tenants, verify queries only return data for the requesting tenant.

## Testing Error Cases

Test error scenarios: NotFoundException, ConflictException, ValidationException. Use `rejects.toThrow()` for async errors.

## E2E Test Pattern

```typescript
// test/e2e/feature.e2e-spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('FeatureController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    await app.init();
    const res = await request(app.getHttpServer()).post('/api/auth/login').send({ email: 'test@example.com', password: 'password' });
    authToken = res.body.token;
  });

  it('/api/feature (GET)', () => {
    return request(app.getHttpServer()).get('/api/feature').set('Authorization', `Bearer ${authToken}`).expect(200);
  });
});
```

## Running Tests

Backend: `npm test | npm run test:e2e | npm run test:cov`
Frontend: `npm test | npm run test:watch | npm run test:coverage`

## Best Practices

1. Test behavior, not implementation
2. Use descriptive test names
3. Arrange-Act-Assert structure
4. Mock external dependencies
5. Test edge cases: null, empty, invalid inputs
6. Keep tests fast (milliseconds)
7. One assertion per test when possible
8. Don't modify existing tests unless explicitly asked
