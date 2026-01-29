---
name: code-quality-tooling
description: Code quality tools configuration including ESLint, Prettier, Husky, and lint-staged. Use when setting up linting, formatting, git hooks, or code quality automation.
---

# Code Quality Tooling

## Overview

This project uses the following tools for code quality:
- **ESLint**: Static code analysis and linting
- **Prettier**: Code formatting
- **Husky**: Git hooks management
- **lint-staged**: Run linters on staged files only

## ESLint Configuration

### Backend ESLint (`.eslintrc.js`)

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'unused-imports'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'test/**', '**/*.spec.ts', '**/*.e2e-spec.ts'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    'unused-imports/no-unused-imports': 'error',
  },
};
```

### Frontend ESLint (`eslint.config.mjs`)

```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";

const eslintConfig = defineConfig([
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '**/*.test.*',
    '**/*.spec.*',
    '**/__tests__/**',
    '**/tests/**',
    '**/test/**',
  ]),
  ...nextVitals,
  ...nextTs,
  eslintPluginPrettier, // MUST be last to override formatting rules
]);

export default eslintConfig;
```

### Key ESLint Rules

| Rule | Purpose |
|------|---------|
| `@typescript-eslint/no-unused-vars` | Catches unused variables (prefix with `_` to ignore) |
| `unused-imports/no-unused-imports` | Removes unused imports automatically |
| `@typescript-eslint/no-explicit-any` | Discourages use of `any` type |
| `prettier/prettier` | Enforces Prettier formatting |

## Prettier Configuration

### Project Prettier (`.prettierrc`)

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100,
  "endOfLine": "lf",
  "arrowParens": "avoid",
  "bracketSpacing": true
}
```

### Prettier Ignore (`.prettierignore`)

```
node_modules
dist
build
.next
coverage
*.min.js
*.min.css
package-lock.json
pnpm-lock.yaml
```

### Prettier Rules Explained

| Option | Value | Purpose |
|--------|-------|---------|
| `singleQuote` | `true` | Use single quotes for strings |
| `trailingComma` | `"all"` | Add trailing commas everywhere |
| `tabWidth` | `2` | 2 spaces for indentation |
| `semi` | `true` | Always add semicolons |
| `printWidth` | `100` | Line width limit (100 chars) |
| `endOfLine` | `"lf"` | Unix line endings |
| `arrowParens` | `"avoid"` | Omit parens for single-arg arrow functions |
| `bracketSpacing` | `true` | Spaces inside object braces |

## Husky & Git Hooks

### Setup Husky

```bash
# Install husky
npm install husky --save-dev

# Initialize husky
npx husky install

# Add to package.json
"scripts": {
  "prepare": "husky install"
}
```

### Pre-commit Hook (`.husky/pre-commit`)

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint-staged
```

### Pre-push Hook (`.husky/pre-push`)

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run test
```

## lint-staged Configuration

### Backend (`package.json`)

```json
{
  "lint-staged": {
    "src/**/*.ts": [
      "prettier --write",
      "eslint --fix --max-warnings=0"
    ],
    "test/**/*.ts": [
      "prettier --write"
    ]
  }
}
```

### Frontend (`package.json`)

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "prettier --write",
      "eslint --fix --max-warnings=0"
    ],
    "*.{json,md,scss,css}": [
      "prettier --write"
    ]
  }
}
```

## NPM Scripts

### Backend Scripts

```json
{
  "scripts": {
    "lint": "eslint \"{src,apps,libs}/**/*.ts\"",
    "lint:fix": "eslint \"{src,apps,libs}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\" \"test/**/*.ts\""
  }
}
```

### Frontend Scripts

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx}\""
  }
}
```

## Running Linters

### Check Code

```bash
# Backend
cd backend/pharmacy-backend
npm run lint              # Check for linting errors
npm run format:check      # Check formatting

# Frontend
cd pharma-frontend
npm run lint              # Check for linting errors
npm run format:check      # Check formatting
```

### Auto-fix Code

```bash
# Backend
npm run lint:fix          # Fix linting errors
npm run format            # Format code

# Frontend
npm run lint:fix          # Fix linting errors
npm run format            # Format code
```

## VS Code Integration

### Settings (`.vscode/settings.json`)

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Recommended Extensions

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

## Common Issues & Solutions

### Issue: ESLint and Prettier Conflict

**Solution**: Ensure `eslint-plugin-prettier` is last in extends:

```javascript
extends: [
  'plugin:@typescript-eslint/recommended',
  'plugin:prettier/recommended',  // MUST be last
],
```

### Issue: Unused Imports Not Auto-removed

**Solution**: Add `unused-imports` plugin:

```javascript
plugins: ['unused-imports'],
rules: {
  'unused-imports/no-unused-imports': 'error',
},
```

### Issue: Line Endings Mismatch

**Solution**: Configure Git and Prettier:

```bash
# .gitattributes
* text=auto eol=lf
*.{cmd,[cC][mM][dD]} text eol=crlf
*.{bat,[bB][aA][tT]} text eol=crlf
```

```json
// .prettierrc
{
  "endOfLine": "lf"
}
```

### Issue: TypeScript Errors Not Caught

**Solution**: Ensure `parserOptions.project` points to correct tsconfig:

```javascript
parserOptions: {
  project: 'tsconfig.json',
  tsconfigRootDir: __dirname,
},
```

## Best Practices

1. **Format on save**: Enable auto-formatting in your editor
2. **Pre-commit hooks**: Always run linters before committing
3. **Zero warnings**: Use `--max-warnings=0` to fail on warnings
4. **Consistent config**: Keep ESLint and Prettier configs in sync
5. **Update regularly**: Keep linting packages updated
6. **Team alignment**: Ensure all team members use same config
7. **CI integration**: Run linters in CI pipeline
8. **Ignore files**: Use `.eslintignore` and `.prettierignore` for generated files

## CI/CD Integration

### GitHub Actions Lint Job

```yaml
name: Lint

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
```

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run lint` | Check for linting errors |
| `npm run lint:fix` | Auto-fix linting errors |
| `npm run format` | Format all files |
| `npm run format:check` | Check formatting without changing |
| `npx eslint --fix src/file.ts` | Lint specific file |
| `npx prettier --write src/` | Format specific directory |
