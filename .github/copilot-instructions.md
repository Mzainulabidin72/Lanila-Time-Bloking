# Copilot instructions for Lanila Time Blocking

## Commands

Use the repo's existing scripts from `package.json`:

- Install dependencies: `npm install`
- Start the app: `npm run dev`
- Type-check the app: `npm run typecheck`
- Run the test suite: `npm test`
- Build for production: `npm run build`
- Preview the production build: `npm run preview`

For a single test file:

- `npx vitest run tests/time.test.ts`
- `npx vitest run tests/focus.test.ts`
- `npx vitest run tests/tasks.test.ts`

For one test name within a file:

- `npx vitest run tests/focus.test.ts --testNamePattern="starts a focus session"`

There is no dedicated lint script in this repo; type-checking and Vitest are the primary validation commands.

## High-level architecture

This is a Vite + React + TypeScript + Tailwind app centered around a single Zustand store and a browser-first local data model.

- App shell and route layout live in `src/App.tsx`.
- The global state is managed in `src/stores/useStore.ts`; it holds blocks, tasks, focus state, settings, projects, and routines, and persists to IndexedDB via `idb-keyval`.
- Page-level UI screens live under `src/pages/*` (for example `Overview`, `Schedule`, `Tasks`, `Focus`, `Settings`). These are mostly route-oriented containers that pull state from the store and render shared components.
- Reusable UI lives in `src/components/*`.
- Core domain logic lives under `src/lib/*`; this is where the project-specific rules live, such as schedule math, task validation, focus-session timing, theme behavior, and auth helpers.
- Cloud sync is handled by `src/repositories/remote.ts` and the Supabase client in `src/lib/supabase.ts`. The app supports a local mode and a Supabase-backed cloud mode; the UI should gracefully handle either mode.
- Auth flows are managed in `src/lib/auth.tsx`, with protected routes and login/register/reset flows in `src/pages/AuthPages.tsx` and related pages.
- Theme handling is split between `src/lib/theme.tsx` and `src/lib/themeCore.ts`, with CSS variables in `src/index.css` and a small bootstrapping script in `index.html`.

Important repo-specific behavior:

- The app runs as a browser app with local persistence first; cloud sync is optional and tied to Supabase env vars.
- Focus timing is intentionally centralized. `src/lib/focusTimer.ts` contains the pure logic, and `src/lib/useFocusEngine.ts` is mounted once in the shell so session state is tracked globally across pages.
- Schedule and task features are not just UI; they have explicit rules in the library layer (for example overlap detection, time validation, task-block relationship policy, and focus-session completion rules).
- `supabase/migrations/*.sql` matters for cloud features; relevant migration files must be applied before using a given table or feature.

## Key conventions

- Prefer library-layer logic over component-local business logic. If it is a rule about time, overlap, task behavior, validation, or focus timing, it usually belongs in `src/lib/*` and should be tested in `tests/*`.
- Treat `src/stores/useStore.ts` as the source of truth for app-wide state. Prefer updates through the store rather than duplicating local state for core domain objects.
- Keep `remote.ts` and Supabase-specific logic separate from UI code; do not add direct database calls inside page components.
- Preserve the app's domain language and product conventions. The UI is Indonesian-first; keep existing labels, route names, and wording consistent with the current codebase unless a task explicitly asks for a broader translation.
- For task and block operations, follow the repo's existing semantics:
  - deleting a task keeps its related time blocks and only clears the task linkage (`taskId` becomes unset)
  - focus-session completion is idempotent by session ID
  - repeating or retrying a block creation with the same ID must not duplicate data
- Keep changes testable. The repo already has unit tests for time math, theme logic, focus behavior, and schedule/task rules; add or update tests when changing the behavior of core libraries.
- Do not put a service-role key or other privileged Supabase secrets in client code. The README explicitly notes that only the anon key should be used in the frontend environment.
- Keep browser-time and date logic consistent with the existing app conventions; the repository is currently built around browser-local time behavior rather than timezone configuration.

## Working style for this repo

- Use the existing module boundaries: `pages` for screens, `components` for reusable UI, `lib` for logic, `stores` for app data, `repositories` for remote sync.
- When adding new functionality, check whether the domain logic should be in a reusable library module and whether a test should live alongside it under `tests/`.
- Respect the project’s current state: this app already supports local persistence, React Router, theme selection, focus sessions, tasks, and schedule blocks; prefer extending existing patterns rather than introducing a new architecture.

## Relevant notes from project docs

- The app was originally described as a "time blocking" tool with local persistence and optional Supabase cloud sync.
- Cloud mode is not a replacement for the local model; it is a synchronized extension of the same data model.
- The README mentions that the archive was generated without internet access, so do not assume lockfiles or fresh dependency installs are present until `npm install` completes successfully.
