# Architecture

## Overview

Zornik is a Next.js 16 App Router application using React Server Components (RSC) as the primary rendering strategy. The app follows a server-first approach: no client-side state management libraries (no Zustand/Redux/Jotai). State flows through Server Components and URL search params.

## Data Flow

```
Fixture files (src/data/*.ts)
        |
        v
dashboard-data.ts (aggregation + filtering)
        |
        v
Server Component pages (src/app/(dashboard)/*)
        |
        v
Presentational components (src/components/dashboard/*)
```

### Fixture Layer
TypeScript files in `src/data/` export typed arrays of domain objects (applications, deployments, incidents, test runs, etc.). These serve as the MVP data source. Each file computes derived values (e.g., `computeOverallUptime()`, `computeDoraMetrics()`).

### Aggregation Layer
`src/lib/dashboard-data.ts` imports all fixtures and provides `overviewData(envSlug?)` which filters and aggregates data for the overview dashboard. Environment filtering happens here via the `envSlug` parameter from URL search params.

### Page Layer
Server Components in `src/app/(dashboard)/` call the aggregation layer, resolve session/auth, and pass data down as props to client components.

## Provider / Adapter Pattern

The integration system uses a registry pattern to support multiple external services:

```
ProviderDefinition (types.ts)
    - key, kind, sdlcStage, label
    - credentialsSchema (Zod)
    - capabilities list
    - create(config) factory

ProviderCapability (interface)
    - fetchDeployments?()
    - fetchHealth?()
    - fetchErrors?()
    - fetchPipelineRuns?()
    - fetchFlags?()
    - fetchTestRuns?()
    - fetchIncidents?()
    - testConnection()
```

### Registry
`src/lib/integrations/registry.ts` holds all registered providers. Each provider declares:
- **kind** -- one of 15 categories (vcs, ci, paas, k8s, apm, errors, logs, incidents, tickets, flags, analytics, tests, security, uptime, db, comm)
- **sdlcStage** -- one of 9 SDLC phases (plan, code, build, test, release, operate, observe, feedback, security)
- **capabilities** -- which data-fetching methods it implements

### Real vs Mock
- Real adapters: `github.ts` (GitHub API via Octokit pattern)
- Mock adapters: `mock.ts` (18 providers returning fixture data)
- Admin UI at `/admin/integrations` manages instances with credentials

## Auth Flow

```
Login form --> POST /api/auth/login
    |
    v
findUserByEmail() --> verifyPassword(bcrypt)
    |
    v
Create session: { userId, issuedAt }
    |
    v
Encode: Base64URL(JSON) + "." + HMAC-SHA256(payload, SESSION_SECRET)
    |
    v
Set cookie: qa_session (httpOnly, sameSite=lax, 7 days)
```

### Session Verification
Every authenticated request:
1. Read `qa_session` cookie
2. Split at last `.` into payload + signature
3. Recompute HMAC and compare with `timingSafeEqual`
4. Decode payload, check `issuedAt` for expiry
5. Look up user by `userId`

### RBAC
Three system roles with 16 granular permissions:

| Role | Permissions |
|---|---|
| Admin | All 16 permissions |
| Operator | Read + incidents:manage + integrations:manage + audit:view |
| Viewer | Read-only (9 view permissions) |

Permissions are checked via `hasPermission(userPermissions, required)` in `src/lib/rbac.ts`.

## Branding / Theming System

### Brand Settings
`BrandSettings` in `src/lib/branding/types.ts`:
- `productName`, `tenantName` -- white-label names
- `primary`, `secondary`, `tertiary` -- hex colors
- `style` -- one of 10 visual themes

### CSS Custom Properties
Brand colors are injected as CSS variables in `src/app/globals.css`:
- `--brand-primary`, `--brand-secondary`, `--brand-tertiary`
- `--status-ok`, `--status-warn`, `--status-down`

### 10 Visual Themes
Each theme (`StyleKey`) maps to a CSS class (`theme-vercel`, `theme-linear`, etc.) applied to `<html>`. The `ThemeSwitcher` component toggles themes client-side by swapping CSS classes. Dark themes also toggle the `dark` class.

Themes: Vercel, Linear, Grafana, Datadog, Stripe, GitHub, Notion, Supabase, PlanetScale, Railway.

### Persistence
Brand settings are stored via `src/lib/storage.ts`:
- **Vercel (prod):** `@vercel/blob` (detects `BLOB_READ_WRITE_TOKEN`)
- **Local (dev):** JSON files in `.data/` directory

## i18n Architecture

```
src/lib/i18n/
├── index.ts          # getLocale(), setLocale(), t()
├── translations.ts   # cs + en translation objects
└── server.ts         # getT() for Server Components
```

- Locale stored in cookie `zornik-locale` (cs | en)
- Server Components use `getT()` which reads the cookie
- Client Components receive translations via props from server
- Default locale: Czech (cs)

## Persistence Layers

### Current (MVP)
1. **Vercel Blob** -- brand settings, integration instances, users (prod)
2. **Local JSON** -- `.data/*.json` files (dev, via `src/lib/storage.ts`)
3. **TypeScript fixtures** -- `src/data/*.ts` (read-only demo data)

### Migration Path
1. Vercel Blob (current) -- simple key-value JSON storage
2. Vercel Edge Config -- for read-heavy / rare-write data
3. Postgres via Neon -- for relational data (planned Wave 1, step 3)

### Read-Only Filesystem Constraint
Vercel Functions have a read-only filesystem outside `/tmp`. The `storage.ts` module detects Vercel via `BLOB_READ_WRITE_TOKEN` and routes writes to Blob instead of the local filesystem.

## RBAC Model

```
Permission = "resource:action"

Resources: dashboard, environments, applications, releases,
           tests, incidents, quality, product, status,
           integrations, branding, users, audit

Actions: view, manage

Examples:
  "dashboard:view"      -- can see the dashboard
  "incidents:manage"    -- can update incident status
  "integrations:manage" -- can add/edit/remove integrations
  "branding:manage"     -- can change brand settings
  "users:manage"        -- can CRUD users
```

Role-to-permission mapping is defined in `src/lib/rbac.ts` via the `SYSTEM_ROLES` array. The `getPermissionsForRole(roleId)` function returns the permission set for a given role.
