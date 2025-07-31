#!/bin/bash

# Script to update contextual resources for new actions
# This can be run as a cron job or manually

echo "🔄 Starting contextual resource update..."

# Navigate to scripts directory
cd "$(dirname "$0")"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run contextual scraping for recent actions (last 10)
echo "🔍 Scraping contextual resources for recent actions..."
npm run scrape:recent 10

echo "✅ Contextual resource update completed!"
echo "📊 Check the data/contextual/ directory for updated resources." 