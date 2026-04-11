# CollegeCuts

A civic data project tracking program cuts, department suspensions, institution closures, and faculty layoffs across US colleges and universities.

**Live site:** [college-cuts.com](https://college-cuts.com)

---

## What it tracks

- Program suspensions & teach-outs
- Department closures
- Campus & institution closures
- Staff & faculty layoffs

Data is sourced from public announcements, institutional press releases, and community tips. Coverage begins 2024.

## Features

- Searchable, filterable database of higher education actions
- Analytics dashboard with state and type breakdowns
- Job Outlook data (BLS) for affected fields
- EdTech news feed
- Public RSS feed (`/api/rss`) with state/type/institution filters
- Email subscription gate
- Tip submission form with admin notifications

## RSS Feed

Subscribe to updates via RSS:

```
https://college-cuts.com/api/rss
```

Filter by state, action type, or institution:

```
/api/rss?state=CA
/api/rss?type=program_suspension
/api/rss?institution=Harvard
```

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (Supabase)
- **Email:** Resend
- **Monorepo:** pnpm workspaces

## Environment Variables

All secrets are stored in the host environment (not committed). Required variables:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `RESEND_API_KEY` | Resend email API key |
| `BLS_API_KEY` | Bureau of Labor Statistics API key |
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Express session secret |

## Contributing

If you know of a higher education cut, closure, or layoff not yet in the database, use the **Submit a Tip** button on the site.

---

Built by [@dunsinagb](https://github.com/dunsinagb)
