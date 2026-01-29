# Cursor Skills for Tapza Pharmacy

This directory contains Cursor skills tailored specifically for the Tapza Pharmacy monorepo. These skills help maintain consistency, enforce conventions, and guide development across backend, frontend, and mobile codebases.

## Available Skills

### Backend Skills

#### 1. **api-development**
Develops REST APIs following NestJS conventions, multi-tenancy patterns, and Tapza Pharmacy standards.

**Use when:** Creating endpoints, DTOs, validation, error handling, or API documentation.

**Key Patterns:**
- REST endpoint naming conventions
- HTTP status codes
- Multi-tenant API patterns (tenant_id filtering)
- DTO validation with class-validator
- Custom exceptions
- Swagger documentation

#### 2. **modular-service-architecture**
Creates modular, decoupled service architecture following Tapza Pharmacy patterns.

**Use when:** Creating new features, breaking down services, or organizing service layers.

**Key Patterns:**
- Main orchestrator service delegates to sub-services
- Sub-services: CRUD, Query, Validation
- Complex features organized in folders (core, analytics, draft, refund)
- Services can depend on other sub-services

#### 3. **api-tags-modularity**
Uses centralized ApiTags constants for Swagger documentation.

**Use when:** Creating controllers or organizing API documentation.

**Key Patterns:**
- Centralized constants in `swagger.constants.ts`
- Use `ApiTagsConstants` in controllers
- Custom `@ApiDoc` decorator for consistent documentation
- Tag naming: `{Category} - {Description}`

### Frontend Skills

#### 4. **frontend-best-practices**
Frontend development guidelines including Airbnb/Google style patterns, modular component breakdown, SCSS styling, and React hooks best practices.

**Use when:** Writing React components, styling, or implementing UI features.

**Key Patterns:**
- Component structure (imports → types → hooks → render)
- Airbnb JavaScript/React style guide patterns
- SCSS modules with nested media queries
- React hooks best practices
- Next.js App Router patterns
- Accessibility (a11y) guidelines

#### 5. **nextjs-frontend**
Develops Next.js 16 frontend with React 19, Tailwind CSS 4, and SCSS modules.

**Use when:** Creating pages, components, API clients, React Query hooks, or styling.

**Key Patterns:**
- App Router page structure
- Server vs Client Components
- React Query hooks
- SCSS modules + Tailwind CSS

### Code Quality Skills

#### 6. **typescript-standards**
TypeScript coding standards based on Google TypeScript Style Guide.

**Use when:** Writing TypeScript code, defining types, working with imports/exports, or ensuring type safety.

**Key Patterns:**
- Import organization and types
- Interface vs type alias usage
- Type inference guidelines
- Null safety patterns
- Class structure and readonly properties
- Error handling patterns

#### 7. **code-quality-tooling**
Code quality tools configuration including ESLint, Prettier, Husky, and lint-staged.

**Use when:** Setting up linting, formatting, git hooks, or code quality automation.

**Key Patterns:**
- ESLint configuration (backend & frontend)
- Prettier configuration
- Husky git hooks setup
- lint-staged configuration
- VS Code integration

#### 8. **git-conventions**
Git best practices including Conventional Commits, branch naming, and commit message guidelines.

**Use when:** Committing code, creating branches, or reviewing git history.

**Key Patterns:**
- Conventional Commits format (`feat`, `fix`, `docs`, etc.)
- Scope naming for Tapza Pharmacy
- Branch naming conventions
- PR guidelines

### Architecture Skills

#### 9. **feature-modularity**
Breaks down features into modular, decoupled files following Tapza Pharmacy architecture.

**Use when:** Creating new features or refactoring existing ones.

**Key Patterns:**
- Identify features by domain boundaries
- Break into CRUD, Query, Validation services
- Complex features organized in folders
- Barrel exports for clean imports

#### 10. **file-size-management**
Ensures all source files stay under 200 lines by extracting utilities, splitting services, and breaking down components.

**Use when:** Files exceed 200 lines or when creating new files that might grow large.

**Extraction Strategies:**
- Extract utility functions to `utils/`
- Split large services into sub-services
- Break down large components
- Extract types and constants

### Testing Skills

#### 11. **testing-practices**
Writes unit tests, integration tests, and E2E tests following Tapza Pharmacy testing conventions.

**Use when:** Creating test files, mocking dependencies, or ensuring test coverage.

**Key Policies:**
- NEVER modify test files unless explicitly asked
- Unit tests alongside source files
- E2E tests in `test/e2e/`
- Minimum 80% coverage
- Mocking patterns for MongoDB and API calls

## Skill Categories

| Category | Skills |
|----------|--------|
| Backend | api-development, modular-service-architecture, api-tags-modularity |
| Frontend | frontend-best-practices, nextjs-frontend |
| Code Quality | typescript-standards, code-quality-tooling, git-conventions |
| Architecture | feature-modularity, file-size-management |
| Testing | testing-practices |

## Usage

These skills are automatically discovered by Cursor when working in this repository. They provide context-aware guidance based on:

- File location (backend vs frontend)
- File type (component, service, controller, etc.)
- Task context (creating new files, refactoring, etc.)

## Quick Reference

### Key Conventions

| Area | Convention |
|------|------------|
| File size | Maximum 200 lines per source file |
| Naming | kebab-case for files, PascalCase for classes/components |
| Multi-tenancy | All queries must include `tenant_id` filter |
| Testing | Don't modify test files unless explicitly asked |
| Code style | Single quotes, 2 spaces, trailing commas, 100 char line width |
| Commits | Conventional Commits format |
| Imports | Named exports preferred, barrel exports for modules |

### Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | NestJS + TypeScript + MongoDB + Redis + BullMQ |
| Frontend | Next.js 16 + React 19 + Tailwind CSS 4 + SCSS Modules + React Query |
| Mobile | Android (Kotlin) |
| Architecture | Multi-tenant SaaS with shared database/shared schema model |

### Commands

```bash
# Backend
cd backend/pharmacy-backend
npm run lint              # Check linting
npm run lint:fix          # Fix linting errors
npm run format            # Format code
npm test                  # Run tests

# Frontend
cd pharma-frontend
npm run lint              # Check linting
npm run lint:fix          # Fix linting errors
npm run format            # Format code
npm run dev               # Start dev server
```

## Related Documentation

- See `CLAUDE.md` in repository root for project overview
- See `backend/pharmacy-backend/docs/architecture.md` for backend architecture
- See `backend/pharmacy-backend/README.md` for OCR pipeline details
- See `COMPREHENSIVE_BEST_PRACTICES.md` for detailed best practices guide
