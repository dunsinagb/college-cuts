#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ITERATIONS = 100;
const SLOW_THRESHOLD_MS = 300;

// Test data for submit-tip
const submitTipData = {
  institution: 'Test University',
  program: 'Test Program',
  cutType: 'Program Suspension',
  description: 'Performance test submission',
  source: 'Test',
  email: 'test@example.com'
};

// Helper function to make HTTP request
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Performance-Test/1.0'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const protocol = urlObj.protocol === 'https:' ? https : http;
    const req = protocol.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const latency = endTime - startTime;
        
        resolve({
          statusCode: res.statusCode,
          latency,
          responseSize: responseData.length,
          headers: res.headers
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Calculate statistics
function calculateStats(latencies) {
  const sorted = latencies.sort((a, b) => a - b);
  const count = sorted.length;
  
  return {
    count,
    min: sorted[0],
    max: sorted[count - 1],
    mean: latencies.reduce((sum, val) => sum + val, 0) / count,
    p50: sorted[Math.floor(count * 0.5)],
    p90: sorted[Math.floor(count * 0.9)],
    p95: sorted[Math.floor(count * 0.95)],
    p99: sorted[Math.floor(count * 0.99)]
  };
}

// Test function
async function testEndpoint(endpoint, method = 'GET', data = null) {
  console.log(`\n🧪 Testing ${method} ${endpoint}...`);
  console.log(`📊 Running ${ITERATIONS} iterations...`);
  
  const latencies = [];
  const errors = [];
  const slowRequests = [];
  
  for (let i = 0; i < ITERATIONS; i++) {
    try {
      const url = `${BASE_URL}${endpoint}`;
      const result = await makeRequest(url, method, data);
      
      latencies.push(result.latency);
      
      if (result.latency > SLOW_THRESHOLD_MS) {
        slowRequests.push({
          iteration: i + 1,
          latency: result.latency,
          statusCode: result.statusCode
        });
      }
      
      // Progress indicator
      if ((i + 1) % 10 === 0) {
        process.stdout.write(`\r   Progress: ${i + 1}/${ITERATIONS}`);
      }
      
    } catch (error) {
      errors.push({
        iteration: i + 1,
        error: error.message
      });
    }
  }
  
  console.log('\n'); // Clear progress line
  
  if (latencies.length === 0) {
    console.log('❌ No successful requests recorded');
    return;
  }
  
  const stats = calculateStats(latencies);
  
  console.log('📈 Results:');
  console.log(`   Count: ${stats.count} successful requests`);
  console.log(`   Min: ${stats.min}ms`);
  console.log(`   Max: ${stats.max}ms`);
  console.log(`   Mean: ${stats.mean.toFixed(2)}ms`);
  console.log(`   P50: ${stats.p50}ms`);
  console.log(`   P90: ${stats.p90}ms`);
  console.log(`   P95: ${stats.p95}ms`);
  console.log(`   P99: ${stats.p99}ms`);
  
  if (slowRequests.length > 0) {
    console.log(`\n⚠️  ${slowRequests.length} requests exceeded ${SLOW_THRESHOLD_MS}ms threshold:`);
    slowRequests.slice(0, 5).forEach(req => {
      console.log(`   Iteration ${req.iteration}: ${req.latency}ms (${req.statusCode})`);
    });
    if (slowRequests.length > 5) {
      console.log(`   ... and ${slowRequests.length - 5} more`);
    }
  }
  
  if (errors.length > 0) {
    console.log(`\n❌ ${errors.length} errors occurred:`);
    errors.slice(0, 3).forEach(err => {
      console.log(`   Iteration ${err.iteration}: ${err.error}`);
    });
    if (errors.length > 3) {
      console.log(`   ... and ${errors.length - 3} more errors`);
    }
  }
  
  return {
    stats,
    slowRequests,
    errors
  };
}

// Performance recommendations
function generateRecommendations(endpoint, stats) {
  const recommendations = [];
  
  if (stats.p95 > SLOW_THRESHOLD_MS) {
    recommendations.push(`🚨 P95 latency (${stats.p95}ms) exceeds ${SLOW_THRESHOLD_MS}ms threshold`);
  }
  
  if (stats.mean > 200) {
    recommendations.push(`🐌 Average latency (${stats.mean.toFixed(2)}ms) is high`);
  }
  
  if (endpoint === '/api/cuts') {
    recommendations.push('💡 Consider adding database indexes on:');
    recommendations.push('   - institution, program, cut_type columns');
    recommendations.push('   - created_at for time-based queries');
    recommendations.push('   - state for geographic filtering');
    recommendations.push('💡 Consider implementing server-side caching with Redis');
    recommendations.push('💡 Use Supabase connection pooling for better performance');
  }
  
  if (endpoint === '/api/submit-tip') {
    recommendations.push('💡 Consider implementing:');
    recommendations.push('   - Rate limiting to prevent abuse');
    recommendations.push('   - Email validation caching');
    recommendations.push('   - Async email processing with queues');
  }
  
  return recommendations;
}

// Main execution
async function main() {
  console.log('🚀 Performance Test Suite');
  console.log('========================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Iterations: ${ITERATIONS}`);
  console.log(`Slow threshold: ${SLOW_THRESHOLD_MS}ms`);
  
  try {
    // Test /api/cuts
    const cutsResults = await testEndpoint('/api/cuts', 'GET');
    if (cutsResults) {
      const cutsRecommendations = generateRecommendations('/api/cuts', cutsResults.stats);
      if (cutsRecommendations.length > 0) {
        console.log('\n🔧 Recommendations for /api/cuts:');
        cutsRecommendations.forEach(rec => console.log(rec));
      }
    }
    
    // Test /api/submit-tip
    const submitResults = await testEndpoint('/api/submit-tip', 'POST', submitTipData);
    if (submitResults) {
      const submitRecommendations = generateRecommendations('/api/submit-tip', submitResults.stats);
      if (submitRecommendations.length > 0) {
        console.log('\n🔧 Recommendations for /api/submit-tip:');
        submitRecommendations.forEach(rec => console.log(rec));
      }
    }
    
    console.log('\n✅ Performance test completed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { testEndpoint, calculateStats, generateRecommendations }; 