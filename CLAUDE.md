# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build (webpack)
npm run lint         # Check ESLint
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Format with Prettier
```

Run one-off scripts with `npx tsx`:

```bash
npx tsx scripts/verify-auth.ts                         # Seed DB with test users
npx tsx scripts/backfill-therapists-profile-fields.ts  # One-time therapist data migration
```

There is no test suite. Husky + lint-staged runs Prettier and ESLint on pre-commit.

## Architecture

Nervaya is a **Next.js 16 (App Router) fullstack mental health platform**. The backend runs entirely as Next.js Route Handlers inside `src/app/api/`. Database is MongoDB via Mongoose. No separate backend server.

### Three-Layer API Pattern

Every API endpoint follows: **Route Handler → Service → Model**.

1. **Route Handler** (`src/app/api/**`) — thin wrapper that calls `requireAuth()`, parses the request, delegates to a service, and returns `successResponse()` or `errorResponse()`
2. **Service** (`src/lib/services/*.service.ts`) — all business logic lives here
3. **Model** (`src/lib/models/*.model.ts`) — Mongoose schemas

All API responses use `src/lib/utils/response.util.ts`: `{ success, message, data, statusCode }`.

### Authentication & RBAC

Three roles: `ADMIN`, `CUSTOMER`, `THERAPIST` (defined in `src/lib/constants/enums.ts`).

- **Edge middleware** (`src/proxy.ts`): reads `auth_token` httpOnly cookie, verifies JWT, enforces role-based redirects
- **API auth** (`src/lib/middleware/auth.middleware.ts`): `requireAuth(request, [ROLES.X])` on protected routes
- **Client auth** (`src/context/AuthContext.tsx`): hydrates from localStorage with 7-day expiry; custom `auth-state-changed` DOM event syncs state across contexts

### Route Groups

- `src/app/(admin)/admin/*` — Admin pages
- `src/app/(customer)/*` — Customer pages
- `src/app/(therapist)/therapist/*` — Therapist pages
- Public pages at `src/app/` root (`/login`, `/signup`, `/about-us`, `/blog`, etc.)

### Client-Side Data Fetching

No React Query. Custom hooks in `src/queries/` use `useState` + `useEffect` + API client modules from `src/lib/api/`. Axios instance (`src/lib/axios.ts`) sets `baseURL: /api` with `withCredentials: true`.

### Context Providers

Nested in `src/components/Providers.tsx` (outermost to innermost): `AuthProvider` → `AuthGuard` → `CartProvider` → `LoadingProvider` → `SidebarProvider`.

### Payments

Razorpay with two independent flows:

- Supplement orders: `src/app/api/payments/`
- Deep Rest program: `src/app/api/payments/deep-rest/`

Client-side checkout hook: `src/hooks/useRazorpayCheckout.ts`.

### "Deep Rest" / "Drift Off" Naming

The sleep therapy program was renamed from "Drift Off" to "Deep Rest". Code still uses `DriftOff` in models, services, and types. Permanent redirects from `/drift-off*` → `/deep-rest*` in `next.config.ts`.

### Zoho CRM Integration

Fire-and-forget lead tracking at signup, sleep assessment, Deep Rest completion, and contact forms. All calls wrapped in `.catch(() => undefined)` — Zoho outages never block users. Uses UPSERT with `duplicate_check_fields: ["Email"]`.

### OTP

Signup always requires email OTP. Login OTP is optional (`REQUIRE_OTP_FOR_LOGIN=true`). OTP store is in-memory (not persistent across restarts). Falls back to console logging if SMTP creds are missing.

## Code Conventions

- **Styling**: CSS Modules only (no Tailwind). Theme variables in `src/styles/colors.css` and `src/styles/spacing.css`. Media queries placed directly under the selector they modify.
- **Components**: `ComponentName/index.tsx` + `styles.module.css`. Named exports preferred.
- **TypeScript**: Strict mode, no `any` (use `unknown` + type guards), no `@ts-ignore`. Explicit return types preferred.
- **Files**: Keep under ~200 lines; extract when growing.
- **Git**: Conventional Commits `<type>(<scope>): <description>` (imperative, ≤72 chars). Branch prefixes: `feature/`, `fix/`, `hotfix/`, `refactor/`, `docs/`, `chore/`.
- **ESLint**: 120-char line width, 2-space indent, no unused vars, no console in production.

## Environment Variables

**Required:** `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLOUDINARY_CLOUD_NAME`/`API_KEY`/`API_SECRET`, `RAZORPAY_KEY_ID`/`KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `OTP_EMAIL_USER`/`OTP_EMAIL_APP_PASSWORD`/`OTP_EMAIL_FROM_NAME`

**Optional:** `REQUIRE_OTP_FOR_LOGIN`, `RAZORPAY_WEBHOOK_SECRET`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GTM_ID`, `ZOHO_CLIENT_ID`/`ZOHO_CLIENT_SECRET`/`ZOHO_REFRESH_TOKEN`
