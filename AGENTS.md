# AGENTS.md — AI Coding Agent Instructions

This document defines the architecture, conventions, and rules for any AI agent (OpenCode, Cursor, Copilot, etc.) working on this codebase.

---

## Monorepo Structure

```
ai-boilerplate/
├── packages/shared/       # Shared types, utils, errors across apps
├── packages/utils/        # Pure utility functions (string, array, object)
├── apps/backend/          # Express + TypeScript REST API
├── apps/frontend/         # React + Vite SPA
├── tsconfig.base.json     # Base TypeScript config inherited by all packages
├── package.json           # Root workspace config (npm workspaces)
├── docker-compose.yml     # PostgreSQL 16 for local dev
└── AGENTS.md              # This file
```

### Workspace Management
- Uses **npm workspaces** (`packages/*`, `apps/*`)
- Install deps from root: `npm install`
- Run workspace scripts with `-w`: `npm run dev -w apps/backend`
- Shared package imported as `@ai-boilerplate/shared`
- Utils package imported as `@ai-boilerplate/utils`

---

## Architecture: Domain-Driven Design (DDD)

### Backend (apps/backend)

Every domain module lives under `src/modules/<name>/` and contains:

```
src/
├── db/
│   ├── pool.ts             # Singleton PostgreSQL connection pool
│   ├── migrate.ts           # Runs SQL migrations in order on startup
│   └── migrations/          # Ordered .sql files (001_xxx, 002_xxx)
├── index.ts                 # Express app, registers all routes, runs migrations
└── modules/<name>/
    ├── models/<name>.model.ts        # Domain entity (plain class, no ORM)
    ├── repositories/<name>.repository.ts  # Data access via PostgreSQL
    ├── services/<name>.service.ts    # Business logic, returns Result<T, AppError>
    │   └── <name>.service.test.ts    # Co-located service tests
    └── routes/<name>.routes.ts       # Express router, wires DI + handler functions inline
```

**Rules:**
- Models are domain entities with private constructors and static `create()` / `reconstitute()` factories.
- Services NEVER throw. They return `Result<T, AppError>` from `@ai-boilerplate/shared`.
- Routes call services directly — there are NO controller classes. Each route handler unwraps `Result`, responds with the error's status code and JSON on failure.
- Repositories are injected into services. DI happens in `*.routes.ts` (manual, no framework needed).
- New domains follow this exact structure. Do not deviate.

#### Domain Model Pattern

```typescript
export class Example implements BaseEntity {
  id: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Private constructor — cannot instantiate directly
  private constructor(props: ExampleProps) { /* assign fields */ }

  // Factory: creates a brand-new entity (generates id, sets timestamps)
  static create(props: Omit<ExampleProps, "id" | "createdAt" | "updatedAt">): Example { ... }

  // Factory: reconstructs an entity from persistence (accepts all fields)
  static reconstitute(props: ExampleProps): Example { ... }

  // Serializes entity to plain object for API responses / DB writes
  toJSON(): ExampleProps { ... }
}
```

#### Repository Pattern

```typescript
export class ExampleRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<Nullable<Example>> {
    const { rows } = await this.pool.query("SELECT * FROM examples WHERE id = $1", [id]);
    if (rows.length === 0) return null;
    return Example.reconstitute({ ...rows[0] }); // Maps snake_case DB row → domain object
  }
}
```

- Repositories receive `Pool` via constructor.
- Execute raw SQL via `this.pool.query(...)`.
- **Always return domain objects** — call `Model.reconstitute(row)` to map snake_case DB columns to domain entity.
- Never expose raw DB rows (`pg.Result`, `RowType`) to the service layer.
- Use `ON CONFLICT ... DO UPDATE` for upserts.

#### Route Pattern (No Controllers)

```typescript
import { getPool } from "../../../db/pool";
import { ExampleService } from "../services/example.service";
import { ExampleRepository } from "../repositories/example.repository";

const repository = new ExampleRepository(getPool());
const service = new ExampleService(repository);

export const exampleRoutes = Router();

exampleRoutes.post("/", async (req, res, next) => {
  try {
    const result = await service.create(req.body);
    if (result.isFailure) {
      return res.status(result.error.statusCode).json(result.error.toJSON());
    }
    res.status(201).json({ data: result.value.toJSON() });
  } catch (err) {
    next(err);
  }
});
```

#### Database: PostgreSQL + Drizzle ORM

- **ORM:** Drizzle ORM (`drizzle-orm`) for schema definitions and migrations. Schema is defined in `src/db/schema.ts`.
- **Driver:** `pg` (node-postgres) with a connection pool (`src/db/pool.ts`).
- **Pool:** Singleton via `getPool()`. Uses `DATABASE_URL` from `.env`. Max 10 connections.
- **Migrations:** Run on startup via `src/db/migrate.ts` using Drizzle's `migrate()`. SQL migrations are auto-generated in `drizzle/` folder. The migration runner also bootstraps the database if it does not exist.
- **Generating migrations:** Run `npm run db:generate -w apps/backend` after editing `src/db/schema.ts`. Commit the generated SQL files.
- **Environment:** Copy `apps/backend/.env.example` to `.env` and set `DATABASE_URL`. Use `docker-compose.yml` (root) to spin up Postgres: `docker compose up -d`.
- **Local setup:** `docker compose up -d` → `npm run dev:backend` (migrations run automatically on startup).
- **Repositories still use raw SQL** via `this.pool.query()`. Drizzle is used for schema/migrations only — not for query building in repositories.

### Frontend (apps/frontend)

```
src/
├── components/
│   ├── ui/                   # shadcn/ui primitives (installed via npx shadcn-ui add)
│   └── common/               # App-wide components built on shadcn (SubmitButton, etc.)
├── lib/utils.ts              # cn() utility (clsx + tailwind-merge)
├── globals.css               # Tailwind directives + shadcn HSL CSS variables
├── main.tsx                  # Entry point, imports globals.css
├── App.tsx                   # react-router-dom v6 routes
└── modules/<name>/
    ├── components/<Name>View.tsx  # UI components
    ├── hooks/use<Name>.ts         # Data fetching + state hooks
    └── services/<name>Api.ts      # API client class for the domain
```

**Rules:**
- API layer is a class (e.g., `ExampleApi`) making `fetch` calls to `/api/<resource>`.
- Hooks encapsulate loading/error/data state. No direct `fetch` in components.
- Components are presentational — they receive data and callbacks from hooks.
- Use the shared types from `@ai-boilerplate/shared` for DTOs.
- Route definitions live in `App.tsx`. Use `react-router-dom` v6 `<Routes>/<Route>`.

#### Styling: Tailwind CSS + shadcn/ui

- **Tailwind CSS v3** is configured with `tailwind.config.js` using shadcn-compatible CSS variables (HSL colors in `src/globals.css`).
- **shadcn/ui primitives** live in `src/components/ui/`. These are the foundational components (Button, Card, Input, Dialog, etc.). Run `npx shadcn-ui add <component>` to add new ones — this CLI downloads them into `src/components/ui/`.
- **Custom components** go in `src/components/common/` (app-wide reusable components like `SubmitButton`) or inside domain modules (e.g., `src/modules/example/components/ExampleView.tsx`).
- **Our own components MUST extend/shim shadcn primitives**, never duplicate their logic. Example: `SubmitButton` wraps `<Button>` with loading state.
- Dark mode uses the `class` strategy — add `dark` class to `<html>` to enable.
- Use the `cn()` utility from `@/lib/utils` to merge Tailwind classes.
- Component pattern: `src/components/ui/` (shadcn primitives) → `src/components/common/` (project-level components) → `src/modules/<name>/components/` (domain-level components).

#### shadcn/ui Configuration

- `components.json` defines aliases: `@/components` for components, `@/lib/utils` for the `cn` utility.
- `tsconfig.json` has path alias `@/*` mapped to `./src/*`.
- `vite.config.ts` resolves `@` alias.
- The `Button` component serves as the reference shadcn primitive. All other primitives follow the same pattern: `React.forwardRef`, `cva` variants, `cn()` class merging.

### Packages

#### Shared (`packages/shared` / `@ai-boilerplate/shared`)

Contains code used by both backend and frontend:

- `types/` — `BaseEntity`, `Nullable`, `Optional`, `PaginationParams`, `PaginatedResult`, `SortParams`, `Repository<T>` interface
- `utils/` — `Result<T, E>` monad for railway-oriented error handling
- `errors/` — `AppError`, `NotFoundError`, `ValidationError`, `UnauthorizedError`

#### Utils (`packages/utils` / `@ai-boilerplate/utils`)

Pure utility functions with no domain dependencies:

- `string.ts` — `capitalize`, `truncate`, `slugify`, `toTitleCase`, `isEmpty`, `isNotEmpty`
- `array.ts` — `chunk`, `unique`, `shuffle`, `groupBy`, `range`, `first`, `last`
- `object.ts` — `pick`, `omit`, `deepClone`, `isEmptyObject`, `mergeObjects`, `isPlainObject`

**Rules:**
- Everything is exported from `src/index.ts`.
- Packages MUST NOT import from `apps/backend` or `apps/frontend`.
- Types defined in shared are the single source of truth.

---

## Key Patterns

### Result Monad (Railway-Oriented)

```typescript
// Service returns Result, never throws
const result = await service.create(data);
if (result.isFailure) {
  // result.error is the AppError with statusCode
  res.status(result.error.statusCode).json(result.error.toJSON());
  return;
}
// result.value is the domain entity
res.status(201).json({ data: result.value.toJSON() });
```

- `Result.success(value)` creates a success variant.
- `Result.failure(error)` creates a failure variant.
- `.map(fn)` transforms the value on success, passes through failure.
- `.match(onSuccess, onFailure)` pattern-matches both cases.
- `.unwrap()` extracts value (throws on failure).
- `.unwrapOr(default)` extracts value or returns default on failure.

### Error Handling
- All app errors extend `AppError` (statusCode, code, message).
- `NotFoundError` (404), `ValidationError` (400), `UnauthorizedError` (401) are provided in shared.
- Backend global error handler catches thrown errors (non-AppError → 500).
- Routes wrap handler bodies in try/catch and call `next(err)`.
- Services use `Result<T, AppError>` to propagate errors without throwing.

### Dependency Injection (Manual)
- No DI framework. Wiring happens in `*.routes.ts`.
- Repository receives `Pool` from `getPool()`.
- Service receives Repository via constructor.
- Routes use the service instance directly in inline handlers.

### Module Creation Checklist
When adding a new domain module (e.g., "products"), create these files:
1. `apps/backend/src/modules/products/models/products.model.ts`
2. `apps/backend/src/modules/products/repositories/products.repository.ts`
3. `apps/backend/src/modules/products/services/products.service.ts`
4. `apps/backend/src/modules/products/routes/products.routes.ts`
5. Register routes in `apps/backend/src/index.ts` → `app.use("/api/products", productsRoutes)`
6. Add migration: `apps/backend/src/db/migrations/003_products.sql`
7. `apps/frontend/src/modules/products/services/productsApi.ts`
8. `apps/frontend/src/modules/products/hooks/useProducts.ts`
9. `apps/frontend/src/modules/products/components/ProductsView.tsx`
10. Add route in `apps/frontend/src/App.tsx`

---

## Testing

- **Vitest** is the test runner across all workspaces (`packages/*`, `apps/*`).
- **Tests are co-located** with source files: `example.service.ts` → `example.service.test.ts`. Do NOT create separate `__tests__/` directories.
- **tsconfigs** exclude `**/*.test.ts` and `src/db/truncate.ts` from production builds so tests are not compiled into `dist/`.
- Each workspace has its own `vitest.config.ts`.

### Running Tests

| Workspace | Command | Environment |
|-----------|---------|-------------|
| All | `npm run test` | — |
| Backend | `npm run test:backend` | Node (needs PostgreSQL running) |
| Frontend | `npm run test:frontend` | jsdom |
| Shared | `npm run test:shared` | Node |
| Utils | `npm run test:utils` | Node |
| Watch mode | `npm run test:watch` (inside any workspace) | — |

### Backend Test Setup
- Backend tests connect to a **real PostgreSQL database** (specified via `DATABASE_URL` in vitest config or `.env.test`).
- `vitest.config.ts` sets `DATABASE_URL=postgresql://localhost:5432/ai_boilerplate_test` and loads `src/db/truncate.ts` as a setup file.
- `truncate.ts` creates tables (same DDL as migrations) in `beforeAll`, truncates all tables in `beforeEach`, closes pool in `afterAll`.
- To run backend tests: `docker compose up -d` → `npm run test:backend`.
- Service tests instantiate `new ExampleService(new ExampleRepository(getPool()))` — same DI pattern as production.

---

## Commands

| Action | Command |
|--------|---------|
| Install all deps | `npm install` (at root) |
| Start Postgres | `docker compose up -d` |
| Build all | `npm run build` |
| Build shared | `npm run build:shared` |
| Build utils | `npm run build:utils` |
| Dev backend | `npm run dev:backend` |
| Dev frontend | `npm run dev:frontend` |
| Run all tests | `npm run test` |
| Run backend tests | `npm run test:backend` |
| Run frontend tests | `npm run test:frontend` |
| Run shared tests | `npm run test:shared` |
| Run utils tests | `npm run test:utils` |
| Typecheck all | `npm run typecheck` |
| Lint all | `npm run lint` (Biome) |
| Format all | `npm run format` (Biome) |
| Generate migration | `npm run db:generate` |
| Start production | `npm run start` |

---

## Conventions

### TypeScript
- Strict mode is ON. No `any` unless absolutely necessary.
- Prefer `interface` for object shapes, `type` for unions/primitives.
- Prefer explicit return types on public functions/methods.
- File names use kebab-case: `example.service.ts`, `app-error.ts`.

### Imports
- Sorted: external libs → shared/utils packages → relative imports.
- Example: `import { Router } from "express";` → `import { Result } from "@ai-boilerplate/shared";` → `import { Example } from "../models/example.model";`

### Exports
- No default exports (except React components in their own files).
- Each module has a barrel `index.ts` exporting everything.

### Naming
- Backend entities: PascalCase for model names (`Example`), kebab-case for files.
- Backend services: `XService` class with `XRepository` injected.
- Frontend API: `XApi` class with `fetch` calls.
- Frontend hooks: `useX` returning `{ data, loading, error, ...actions }`.
- Test files: `<filename>.test.ts` placed next to the source file they test.

### Ports & Proxying
- Backend port: 3001. Frontend port: 5173.
- Frontend Vite config proxies `/api` → `http://localhost:3001`.

---

## Constraints

- Do NOT introduce new top-level workspaces without discussion.
- Do NOT add ORMs beyond Drizzle — repositories use raw SQL via `pg`.
- Do NOT change the module file structure (models/repositories/services/routes).
- Do NOT create controller classes — routes call services directly.
- Do NOT expose database rows outside repositories — always map to domain objects via `reconstitute()`.
- Do NOT use classes for React state — use hooks + functional components.
- Do NOT import backend code into frontend or vice versa (only via `@ai-boilerplate/shared`).
- Do NOT duplicate shadcn component logic in custom components — always wrap/extend primitives from `src/components/ui/`.
- Do NOT write raw inline styles — use Tailwind utility classes.
- Do NOT create new components directly in `src/components/ui/` — that directory is reserved for shadcn primitives installed via `npx shadcn-ui add`.
- Do NOT create separate `__tests__/` directories — co-locate tests next to source files.
- Do NOT commit `.env` files or secrets.
