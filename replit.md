# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

---

## InsuraBridge — Application Overview

**InsuraBridge** is an insurance middleware platform connecting hospitals, customers, TPAs, and insurers.

### Frontend (`artifacts/insurabridge`)

React + Vite SPA with full role-based authentication:

- **Auth**: `src/lib/auth.tsx` — AuthContext, login/logout, `useAuth`, `ROLE_COLORS`, `ROLE_LABELS`
- **Login page**: `src/pages/login.tsx` — dark theme, 4 demo account quick-fill buttons
- **Routes (App.tsx)**: Auth-guarded; 15 routes total
- **Layout**: `src/components/layout.tsx` — sidebar with role-based nav groups, notification bell, user menu

**Role-based navigation:**
- TPA Tools (TPA/admin/insurer only): E-Cards, Network Providers, Scrutiny
- Policy group (all roles): Portability, Renewals, Members
- Users (admin/TPA/insurer only)

**Pages:**
| Page | Path | Notes |
|------|------|-------|
| Dashboard | `/dashboard` | 8 stat cards including notifications, members, settlements |
| Claims | `/claims` | Expandable rows with BillBreakdown component |
| Bills | `/bills` | Billing records |
| Feedback | `/feedback` | 4 tabs: Customer, TPA, Insurer, App Feedback |
| E-Cards | `/ecards` | TPA-only |
| Network Providers | `/network` | TPA/admin/insurer |
| Scrutiny | `/scrutiny` | TPA tools |
| Portability | `/portability` | Policy portability |
| Renewals | `/renewals` | Policy renewals |
| Members | `/members` | Policy members |
| Settlements | `/settlements` | Reimbursement settlements |
| Users | `/users` | Admin/TPA/insurer |

### Claims Payment Bifurcation

The `BillBreakdown` component (in `claims.tsx`) shows:
1. **Itemized Bill** — room rent, surgery, medicines, diagnostics, other
2. **Adjustments** — hospital discount (green), approved amount
3. **Payment Responsibility Cards** — Insurance Co. (blue), Patient (amber), Hospital Discount (green)
4. **Final Bill Summary** — full line-item table showing who pays what

DB columns on `claims` table:
- `hospitalDiscount` — amount waived by the hospital
- `paidByCustomer` — deductible + copay paid by patient
- `paidByInsurer` — net payable by insurance company

### Backend (`artifacts/api-server`)

Express 5 with pino logging, express-session, bcryptjs.

**Auth routes:** `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`

**Demo accounts** (password: `demo1234`):
- `rahul@example.com` — customer
- `admin@cityhospital.com` — hospital
- `ops@meditpa.com` — TPA
- `claims@nationallife.com` — insurer
- `admin@insurabridge.com` — admin (platform administrator; can access Data Retention purge)

**Key route files:**
- `src/routes/auth.ts` — session-based auth
- `src/routes/claims.ts` — `mapClaim()` converts Drizzle string numerics to floats; new fields: hospitalDiscount, paidByCustomer, paidByInsurer
- `src/routes/retention.ts` — `GET /api/retention` (stats per table), `DELETE /api/retention/purge` (delete expired records)
- `src/routes/notifications.ts`, `policies.ts`, `members.ts`, `settlements.ts`, `ecards.ts`, `network.ts`, `scrutiny.ts`

### DB Schema Key Points

- Numeric fields in PostgreSQL come back as strings from Drizzle → use `parseFloat()` in route handlers via `mapClaim` pattern
- `push-force`: `pnpm --filter @workspace/db run push-force`
- Seed: `pnpm --filter @workspace/scripts run seed`
- **Data Retention**: All 15 record tables have `expires_at = created_at + 1 year` (DB default). Drizzle schema uses `sql\`NOW() + INTERVAL '1 year'\`` default. Purge route deletes `WHERE expires_at < NOW()`.
- **Call Logs**: `summary` and `final_decision` columns added for call summaries and agreed decisions.
