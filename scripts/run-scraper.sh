#!/bin/bash

# Resource Scraper Runner for CollegeCuts Tracker
# This script runs the web scraper to gather resources for affected students and faculty

echo "🚀 Starting CollegeCuts Resource Scraper..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Navigate to scripts directory
cd "$(dirname "$0")"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create data directory if it doesn't exist
mkdir -p ../data

# Run the advanced scraper
echo "🔍 Running advanced resource scraper..."
node advanced-resource-scraper.js

# Check if scraping was successful
if [ $? -eq 0 ]; then
    echo "✅ Resource scraping completed successfully!"
    echo "📁 Check the ../data/ directory for results"
    
    # Show summary of results
    if [ -f "../data/summary-$(date +%Y-%m-%d).json" ]; then
        echo "📊 Summary of scraped resources:"
        cat "../data/summary-$(date +%Y-%m-%d).json" | jq '.' 2>/dev/null || echo "Install jq for better JSON formatting"
    fi
else
    echo "❌ Resource scraping failed. Check the logs above for errors."
    exit 1
fi

echo "🎉 All done! Resources are now available in the web app." 