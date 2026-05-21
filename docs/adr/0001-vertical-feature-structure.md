# ADR-0001: Vertical Feature Structure

## Status

Accepted — 2026-05-22

## Context

`apps/web/src/` was split horizontally: `components/` (UI), `lib/` (utils),
`server/<domain>/` (RPC + handlers + queries), `routes/` (TanStack file-based).
Domain logic for one feature (e.g. expenses) was spread across 4 directories,
with file ownership unclear. Route files grew large (632 lines for expense detail)
because there was no adjacent place to extract UI components.

## Decision

Restructure to vertical features. Each user-facing capability gets a flat directory
under `apps/web/src/`:

- `src/expenses/` — expense list, detail, create, settle
- `src/groups/` — group selection and membership
- `src/notifications/` — in-app notifications, push subscriptions
- `src/dashboard/` — home screen balance summary
- `src/admin/` — admin panel
- `src/auth/` — login, signup, social sign-in
- `src/settings/` — user settings, push toggle

No `src/features/` wrapper. No `src/server/` subdir at any level.
TanStack `src/routes/` stays — route files are thin shells that import a single
page component from the matching feature.

### Internal layout per feature

```
src/<feature>/
  components/       created when 3+ component files
  functions.ts      all RPC entry points (createServerFn GET + POST merged)
  handlers.ts       pure domain logic, testable in isolation
  schemas.ts        zod input schemas extracted from inline validators
  queries.ts        client-side React Query queryOptions / infiniteQueryOptions
  events.ts         only when feature exposes cross-feature server emitters
  middleware.ts     only when feature provides server-fn middleware
  *.ts / *.test.ts  feature-local utils and colocated tests
```

### Shared code

Truly cross-feature code stays flat at `src/`:

- `src/components/` — UI used by 2+ features without a natural home
  (`user-avatar`, `theme-toggle`, `default-catch-boundary`, `default-not-found`)
- `src/lib/` — shared utilities (`register-sw`)

### Route shells

Route files contain only: `createFileRoute`, `validateSearch`, `loader`,
`errorComponent`, and route guards. The `component` prop renders a single page
component imported from the feature. All UI logic, hooks, and sub-components
live in the feature.

### Cross-feature imports — DAG

Features import only from lower layers. No cycles.

```
layer 0:  auth    shared (components/, lib/)
layer 1:  notifications    groups
layer 2:  expenses    dashboard    admin
layer 3:  settings
```

### No barrel files

No `index.ts` re-exports. Direct file-path imports preserve TanStack Start
env-shaking — server-only and client code stay distinguishable without a
`.server.ts` suffix convention.

## Consequences

**Positive**

- Feature ownership obvious from `ls src/<feature>/`.
- Route files shrink to shells; large pages get extracted UI with a natural home.
- Adding a feature = adding one directory.
- Server/client boundary visible by file content + DAG.

**Negative**

- One-time large migration touching every import path.
- Convention is project-local — newcomers must read this ADR.
- `groups` feature name diverges from Better Auth `organization` terminology
  (deliberate — see CONTEXT.md for why).
