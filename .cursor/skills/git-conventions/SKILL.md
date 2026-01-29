---
name: git-conventions
description: Git best practices including Conventional Commits, branch naming, and commit message guidelines. Use when committing code, creating branches, or reviewing git history.
---

# Git Conventions

## Conventional Commits

**CRITICAL**: All commits must follow the Conventional Commits specification.

### Commit Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

| Type | Description | Version Bump |
|------|-------------|--------------|
| `feat` | New feature | MINOR |
| `fix` | Bug fix | PATCH |
| `docs` | Documentation only | - |
| `style` | Code style (formatting, semicolons) | - |
| `refactor` | Code refactoring | - |
| `perf` | Performance improvement | - |
| `test` | Adding/updating tests | - |
| `build` | Build system or dependencies | - |
| `ci` | CI/CD configuration | - |
| `chore` | Other changes (not src/test) | - |
| `revert` | Reverts a previous commit | - |

### Scope Examples (Tapza Pharmacy)

```bash
# Backend scopes
feat(auth): add Google OAuth login
fix(purchase): correct stock calculation
refactor(ocr): extract fuzzy matching service
perf(medicines): optimize search query

# Frontend scopes
feat(sales-ui): add refund modal
fix(invoice): correct total calculation
style(dashboard): update card spacing

# Module-specific
feat(pharmacy/suppliers): add bulk import
fix(v2/auth): handle token expiry
```

### Breaking Changes

Indicate breaking changes with `!` after type/scope:

```bash
feat(api)!: change response format for purchases

BREAKING CHANGE: Response format changed from array to paginated object.
Migration required for all API consumers.
```

### Good Commit Examples

```bash
# Feature with scope
feat(purchase): add refund functionality

Implement refund service with atomicity checks:
- Add validation for refund amounts
- Update purchase status after refund
- Create ledger entries

Closes #123

# Bug fix
fix(stock): correct quantity calculation for partial units

The stock calculation was not accounting for unitPackingQuantity
when calculating base units from packs.

# Refactoring
refactor(suppliers): extract validation to separate service

Move validation logic from SuppliersService to
SupplierValidationService following modular architecture.

# Documentation
docs(api): update Swagger descriptions for purchase endpoints
```

### Bad Commit Examples

```bash
# ❌ No type
updated code

# ❌ Vague description
fix: bug fix

# ❌ Not imperative mood
feat: added new feature

# ❌ Too long subject
fix(purchase): this is a very long commit message that exceeds the recommended 72 character limit for subject lines

# ❌ Past tense
fix: fixed the bug in purchase calculation
```

## Commit Message Rules

1. **Subject line**:
   - Use imperative mood ("add" not "added" or "adds")
   - Keep under 72 characters
   - Capitalize first letter
   - Don't end with period
   - Separate from body with blank line

2. **Body** (optional):
   - Explain "what" and "why", not "how"
   - Wrap at 72 characters
   - Use bullet points for multiple items

3. **Footer** (optional):
   - Reference issues: `Closes #123`, `Fixes #456`
   - Breaking changes: `BREAKING CHANGE: description`

## Branch Naming

### Format

```
<type>/<description>
```

### Types

| Prefix | Purpose |
|--------|---------|
| `feature/` | New features |
| `fix/` | Bug fixes |
| `hotfix/` | Critical production fixes |
| `refactor/` | Code refactoring |
| `docs/` | Documentation updates |
| `test/` | Test additions/updates |
| `chore/` | Maintenance tasks |

### Examples

```bash
# Good branch names
feature/add-purchase-return
fix/stock-calculation-error
hotfix/auth-token-expiry
refactor/ocr-service-structure
feature/TAPZA-123-add-supplier-import

# Bad branch names
my-branch
update
fix
feature-1
```

### Branch Rules

1. Use lowercase and hyphens (kebab-case)
2. Be descriptive but concise
3. Include ticket number if applicable
4. Never commit directly to `main` or `master`

## Git Workflow

### Feature Development

```bash
# 1. Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/add-purchase-return

# 2. Make commits (following conventional commits)
git add .
git commit -m "feat(purchase): add refund validation service"

# 3. Push and create PR
git push -u origin feature/add-purchase-return
```

### Commit Before Push Checklist

- [ ] Commits follow Conventional Commits format
- [ ] Each commit is atomic (one logical change)
- [ ] Tests pass locally
- [ ] No debug code or console.logs
- [ ] Code is linted and formatted

## Pull Request Guidelines

### PR Title

Follow Conventional Commits format:
```
feat(purchase): add refund functionality
```

### PR Description Template

```markdown
## Summary
- Brief description of changes

## Changes
- List of specific changes made

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Related Issues
Closes #123
```

## Best Practices

1. **Atomic commits**: Each commit should represent one logical change
2. **Commit often**: Small, frequent commits are easier to review
3. **Review before commit**: Use `git diff --staged` to review changes
4. **Never force push to shared branches**: Use `--force-with-lease` if needed
5. **Keep history clean**: Squash commits before merging if needed
6. **Write meaningful messages**: Future you will thank present you
