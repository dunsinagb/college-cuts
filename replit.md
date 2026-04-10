# CollegeCuts Tracker

## Overview

A civic data tracker that monitors college program cuts, university closures, department suspensions, and faculty layoffs across the United States.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/college-cuts) with wouter routing
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Charts**: Recharts
- **UI**: shadcn/ui + Tailwind CSS + lucide-react
- **Build**: esbuild (CJS bundle for API)

## Pages

- `/` — Dashboard with hero stats, monthly trend chart, recent activity feed, state breakdown
- `/cuts` — Searchable, filterable full database table with pagination (subscription gated)
- `/cuts/:id` — Individual cut detail page (subscription gated)
- `/analytics` — Professional analytics dashboard with 6 charts (subscription gated)
- `/job-outlook` — Job market outlook by major using BLS + Supabase CIP/SOC data (subscription gated)
- `/subscribe` — Email subscription gate (localStorage: cc_subscribed)
- `/submit-tip` — Form for users to submit new tips about cuts (sends Resend confirmation)
- `/about` — Mission, methodology, FAQ

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/college-cuts run dev` — run frontend locally

## API Endpoints

- `GET /api/cuts` — paginated list with filters (state, cutType, status, control, search)
- `GET /api/cuts/:id` — single cut detail
- `GET /api/stats/summary` — top-level aggregate stats
- `GET /api/stats/by-state` — cuts grouped by state (all states)
- `GET /api/stats/by-type` — cuts grouped by cut type (severity color coded)
- `GET /api/stats/by-control` — cuts grouped by control type (Public / Private non-profit)
- `GET /api/stats/by-status` — cuts grouped by status (confirmed/ongoing/reversed)
- `GET /api/stats/by-reason` — primary reasons extracted from notes field (7 categories)
- `GET /api/stats/monthly-trend` — monthly counts (all time)
- `GET /api/stats/yearly-by-month` — YoY grouped by month (2023/2024/2025)
- `GET /api/stats/yearly-by-state` — YoY top 10 states breakdown
- `GET /api/stats/recent` — 10 most recent cuts
- `POST /api/tips` — submit a new tip (sends Resend confirmation email)
- `POST /api/subscribe` — email subscription (saves to local DB, sends Resend welcome email)
- `GET /api/job-outlook?major=X` — BLS wage/employment data via Supabase CIP/SOC crosswalk

## Environment Variables

- `DATABASE_URL` — local PostgreSQL (Replit managed)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (for CIP/SOC crosswalk in Job Outlook)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (preferred for server-side)
- `RESEND_API_KEY` — Resend email API key
- `BLS_API_KEY` — BLS API key (analytics/job data)
- `SESSION_SECRET` — Express session secret

## Database Schema

- `cuts` table — all program actions (40 seed records)
- `tips` table — user-submitted tips pending review
- `subscribers` table — email subscribers

## Supabase Tables (external)

- `v_all_majors` — CIP code to major title lookup
- `cip_soc_xwalk` — CIP to SOC crosswalk for Job Outlook

## Subscription Gate

- Gate: `localStorage.getItem("cc_subscribed") === "1"`
- Set when user successfully POSTs to `/api/subscribe`
- Gated pages: /cuts, /cuts/:id, /analytics, /job-outlook

## Data

40 real cases seeded including institution closures (Antioch, College of Saint Rose, etc.), department closures, program suspensions, and staff layoffs across 27 states.

## Analytics Dashboard Breakdown

6 charts:
1. Actions Over Time (area chart, 2023 vs 2024 vs 2025)
2. Top 10 States by Program Actions (horizontal bar, YoY)
3. Actions by Control Type (interactive donut pie)
4. Actions by Type (horizontal bar, severity-colored)
5. Primary Reasons for Actions (horizontal bar, keyword-extracted from notes)
6. Actions by State — all states (horizontal bar, actions + students)
