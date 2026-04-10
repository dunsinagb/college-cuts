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
- `/cuts` — Searchable, filterable full database table with pagination
- `/cuts/:id` — Individual cut detail page
- `/analytics` — Charts and trend analysis (monthly line chart, type breakdown bar chart, state breakdown)
- `/submit-tip` — Form for users to submit new tips about cuts
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
- `GET /api/stats/by-state` — cuts grouped by state
- `GET /api/stats/by-type` — cuts grouped by cut type
- `GET /api/stats/monthly-trend` — monthly counts
- `GET /api/stats/recent` — 10 most recent cuts
- `POST /api/tips` — submit a new tip

## Database Schema

- `cuts` table — all program actions (40 seed records)
- `tips` table — user-submitted tips pending review

## Data

40 real cases seeded including institution closures (Antioch, College of Saint Rose, etc.), department closures, program suspensions, and staff layoffs across 27 states.
