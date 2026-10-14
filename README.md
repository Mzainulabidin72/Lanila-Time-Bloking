# Lanila Time Blocking (v0.1 core)
React + Vite + TypeScript + Tailwind 3 + Zustand (IndexedDB persistence via idb-keyval).
## Status - read first
This archive was generated in an environment WITHOUT network access: `npm install`, type check, tests and build were NOT run. No lockfile is included. Run `npm install` first and fix any type errors that appear.
## Commands
npm install, npm run dev, npm run typecheck, npm test, npm run build, npm run preview
## Implemented
Overview (metrics derived from state), Jadwal Saya (day view, validation, conflict warning without overwriting), Tugas, Mode Fokus (timestamp-based), Integrasi (honest status), product switcher from src/registry/products.ts + env URLs, dark mode, IndexedDB persistence, unit tests for validation/overlap/timer math, Supabase migration with RLS (time_blocks, tasks).
## Not yet implemented
Week/month/agenda views, drag/resize, recurrence, projects, routines, analytics, category CRUD, settings page, Supabase repository adapter, integration event layer, remaining tables, English localization, seed/demo data, favicon/app-icon set beyond a cropped logo mark.
## Env
Copy .env.example to .env. Empty product URLs show "perlu konfigurasi". Never put a service-role key in client code.
