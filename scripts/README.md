# Performance Testing Scripts

## Overview

This directory contains performance testing utilities for the CollegeCuts application.

## Performance Test (`performance-test.js`)

A comprehensive performance testing script that measures latency for API endpoints.

### Features

- **100 iterations** per endpoint for statistical significance
- **P50, P90, P95, P99 latency** measurements
- **Slow request detection** (>300ms threshold)
- **Error tracking** and reporting
- **Performance recommendations** based on results
- **Progress indicators** during long test runs

### Usage

```bash
# Test against localhost:3000 (default)
npm run perf-test

# Test against specific URL
BASE_URL=http://localhost:3001 npm run perf-test

# Test against production
BASE_URL=https://your-domain.com npm run perf-test
```

## Quick Performance Check (`quick-perf-check.js`)

A lightweight performance check for development and CI/CD pipelines.

### Features

- **10 iterations** per endpoint for fast feedback
- **P95 latency** measurement only
- **Quick pass/fail** assessment
- **Minimal output** for automation

### Usage

```bash
# Quick check against localhost:3000 (default)
npm run perf-quick

# Quick check against specific URL
BASE_URL=http://localhost:3001 npm run perf-quick
```

## Realtime Message Profiler (`realtime-profile.js`)

A specialized script to profile Supabase realtime subscription message sizes and optimize data transmission.

### Features

- **20 test inserts** to measure realtime message sizes
- **Message size analysis** with min/max/average statistics
- **Payload structure breakdown** by column
- **Optimization recommendations** for large messages
- **Automatic cleanup** of test data
- **Threshold-based alerts** (>2KB average)

### Usage

```bash
# Profile realtime messages (requires Supabase env vars)
npm run realtime-profile
```

### Output Example

```
🚀 Supabase Realtime Message Size Profiler
==========================================
Target inserts: 20
Size threshold: 2 KB
Supabase URL: https://your-project.supabase.co

🔌 Setting up realtime subscription...
✅ Realtime subscription active

📝 Inserting 20 test records...
✅ Insert 1 completed
✅ Insert 2 completed
...

📨 Message 1: 1.2 KB
📨 Message 2: 1.3 KB
...

📊 Realtime Message Size Analysis
==================================
📈 Statistics:
   Messages received: 20
   Total size: 25.6 KB
   Average size: 1.28 KB
   Min size: 1.2 KB
   Max size: 1.4 KB

🎯 Threshold Analysis:
   Average: 1.28 KB
   Threshold: 2 KB
✅ Average message size is within acceptable range

📋 Largest Messages:
   Message 15: 1.4 KB
   Message 8: 1.35 KB
   Message 12: 1.33 KB

🔍 Payload Structure Analysis:
   Total payload size: 1.28 KB
   Data size: 1.1 KB
   Columns (9): id, institution, program, cut_type, description, state, control, source, created_at, updated_at

📏 Column Sizes:
   id: 0.05 KB
   institution: 0.15 KB
   program: 0.12 KB
   cut_type: 0.08 KB
   description: 0.45 KB
   state: 0.02 KB
   control: 0.03 KB
   source: 0.08 KB
   created_at: 0.12 KB
   updated_at: 0.12 KB
```

### What it tests

1. **GET /api/cuts** - Database query performance
2. **POST /api/submit-tip** - Form submission and email processing

### Output Example

```
🚀 Performance Test Suite
========================
Base URL: http://localhost:3000
Iterations: 100
Slow threshold: 300ms

🧪 Testing GET /api/cuts...
📊 Running 100 iterations...
   Progress: 100/100

📈 Results:
   Count: 100 successful requests
   Min: 45ms
   Max: 289ms
   Mean: 156.23ms
   P50: 142ms
   P90: 198ms
   P95: 245ms
   P99: 289ms

🔧 Recommendations for /api/cuts:
💡 Consider adding database indexes on:
   - institution, program, cut_type columns
   - created_at for time-based queries
   - state for geographic filtering
💡 Consider implementing server-side caching with Redis
💡 Use Supabase connection pooling for better performance
```

### Performance Thresholds

- **Good**: P95 < 200ms
- **Acceptable**: P95 < 300ms
- **Needs optimization**: P95 > 300ms

### Realtime Optimization Recommendations

When message sizes exceed 2KB average, the script suggests:

#### 1. 📋 Minimal Column Selection

- Only subscribe to essential columns: `id`, `institution`, `program`, `cut_type`, `state`
- Exclude large text fields like `description` from realtime updates
- Use separate API calls for detailed data when needed

#### 2. ⏱️ Throttling Strategies

- Implement debouncing for rapid updates
- Use batch updates instead of individual inserts
- Consider polling for less critical updates

#### 3. 🗂️ Data Structure Optimization

- Truncate long text fields in realtime payloads
- Use abbreviated field names
- Implement delta updates (only changed fields)

#### 4. 🔧 Technical Optimizations

- Use Supabase's built-in filtering to reduce payload size
- Implement client-side caching to reduce redundant data
- Consider using WebSocket compression if available

#### 5. 📊 Monitoring

- Set up alerts for message size spikes
- Monitor realtime subscription performance
- Track bandwidth usage over time

### Recommendations

The script provides specific recommendations based on performance results:

#### For `/api/cuts`:

- Database indexing strategies
- Caching implementations
- Connection pooling
- Query optimization

#### For `/api/submit-tip`:

- Rate limiting
- Email validation caching
- Async processing
- Queue systems

### Environment Variables

- `BASE_URL`: Target server URL (default: http://localhost:3000)
- `ITERATIONS`: Number of test iterations (default: 100 for full test, 10 for quick check)
- `SLOW_THRESHOLD_MS`: Latency threshold for slow requests (default: 300)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL (required for realtime profiling)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key (required for realtime profiling)

### Integration

These scripts can be integrated into:

- CI/CD pipelines for performance regression testing
- Pre-deployment validation
- Load testing scenarios
- Performance monitoring dashboards
- Development workflow for quick feedback
- Realtime optimization analysis
