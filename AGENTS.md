# AGENTS.md

## Cursor Cloud specific instructions

### Overview

CollegeCuts is a Next.js 14 web application (single service, not a monorepo) that tracks college program cuts, university closures, and faculty layoffs across the US. It uses pnpm as its package manager.

### Running the application

- **Dev server:** `pnpm dev` (starts on port 3000)
- **Lint:** `pnpm lint` (runs `next lint`; note: there are pre-existing lint errors in the codebase)
- **Unit tests:** `pnpm test` (runs Jest with jsdom environment; Supabase/SWR/Resend are mocked in `jest.setup.js`)
- **E2E tests:** `pnpm test:e2e` (runs Playwright against `localhost:3000`; requires the dev server to be running)
- **Build:** `pnpm build` (runs `next build`)

### Key caveats

- **Build requires Supabase env vars:** `pnpm build` will fail if `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set, because `app/api/cuts/route.ts` calls `createClient()` with a non-null assertion at module top level. The dev server (`pnpm dev`) works fine without these vars since it compiles on demand.
- **External service dependencies:** The app depends on a hosted Supabase instance (no local database or migrations). Without Supabase credentials, the homepage renders with fallback/sample data, and protected pages (Analytics, Submit Tip) show a subscribe-gate modal. Optional services include Resend (email), BLS API (job data), and College Scorecard API (trends).
- **Required env vars for full functionality:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Optional: `RESEND_API_KEY`, `BLS_API_KEY`, `NEXT_PUBLIC_SITE_URL`.
- **`pnpm install` build script warnings:** pnpm may warn about ignored build scripts for `chromedriver` and `unrs-resolver`. This is normal and does not affect functionality.
- **No `.nvmrc` or `.node-version`:** The project has no pinned Node version. Node 22 works fine.
