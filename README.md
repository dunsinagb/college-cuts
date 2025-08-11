# college-cuts

_Automatically synced with your [v0.dev](https://v0.dev) deployments_

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/dunsinagbs-projects/v0-college-cuts-nx)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/h7JDb0FxGJM)

## Overview

CollegeCuts is a comprehensive database tracking college program cuts, university closures, department suspensions, and faculty layoffs across the United States. This platform provides real-time data on higher education budget cuts, enrollment declines, and institutional changes affecting students and faculty.

## Status Methodology

### Status Categories

The platform uses a standardized status system to track the lifecycle of higher education actions:

- **confirmed** (Blue) - Verified actions that have been officially announced by institutions
- **ongoing** (Orange) - Actions currently in progress or being implemented
- **reversed** (Teal) - Actions that were announced but later cancelled or reversed
- **rumor** (Yellow) - Unverified reports that need confirmation

### Color System

All status colors are consistent across the entire application and are defined in `lib/constants.ts`:

```typescript
export const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  ongoing: "bg-orange-50 text-orange-700 border-orange-200",
  reversed: "bg-teal-50 text-teal-700 border-teal-200",
  rumor: "bg-yellow-50 text-yellow-700 border-yellow-200",
  // ... additional statuses
};
```

### Filtering Approach

- Status filters show all 4 main categories regardless of current database content
- NULL values are excluded from filtering but handled gracefully in display
- Colors are semantic and provide immediate visual identification
- Both lowercase (database) and uppercase (display) versions are supported

## Analytics Methodology

### Data Filtering for Analytics

- **Confirmed Cases Only**: The analytics dashboard only displays data from cases with "confirmed" status
- **Real-time Updates**: Analytics data refreshes automatically every 10 seconds
- **Comprehensive Coverage**: All charts, graphs, and visualizations filter for confirmed cases only
- **Data Integrity**: This ensures analytics represent verified, factual institutional actions

### Analytics Components

- **Trend Analysis**: Monthly/yearly trends of confirmed actions
- **Geographic Distribution**: State-by-state breakdown of confirmed cases
- **Institution Types**: Analysis by public/private/for-profit control
- **Action Types**: Distribution of confirmed program cuts, closures, etc.
- **Regional Impact**: Choropleth map showing confirmed actions by state

### Why Only Confirmed Cases?

- **Accuracy**: Analytics should reflect verified, factual data
- **Reliability**: Prevents speculation from affecting trend analysis
- **Decision Making**: Stakeholders need reliable data for policy decisions
- **Transparency**: Clear distinction between confirmed and unconfirmed information

## Deployment

Your project is live at:

**[https://vercel.com/dunsinagbs-projects/v0-college-cuts-nx](https://vercel.com/dunsinagbs-projects/v0-college-cuts-nx)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/h7JDb0FxGJM](https://v0.dev/chat/projects/h7JDb0FxGJM)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Technical Implementation

### Status Filtering

The status filtering system is implemented in `components/CutsDataGrid.tsx` with the following approach:

1. **Hardcoded Options**: Status filter shows all 4 main categories regardless of database content
2. **NULL Handling**: NULL values are excluded from dropdown but displayed as "—" in tables
3. **Color Consistency**: All status badges use shared constants from `lib/constants.ts`
4. **Filter Behavior**: "All Statuses" shows records with any status, individual filters show specific statuses only

### Database Integration

Status values are stored in lowercase in the database and mapped to appropriate colors and display text throughout the application. The system supports both current database values and future status additions through the extensible constants system.
