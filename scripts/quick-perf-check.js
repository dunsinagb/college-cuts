#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Configuration for quick check
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const QUICK_ITERATIONS = 10;
const SLOW_THRESHOLD_MS = 300;

// Test data for submit-tip
const submitTipData = {
  institution: 'Quick Test',
  program: 'Test Program',
  cutType: 'Program Suspension',
  description: 'Quick performance test',
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
        'User-Agent': 'Quick-Perf-Test/1.0'
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
          responseSize: responseData.length
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

// Quick test function
async function quickTest(endpoint, method = 'GET', data = null) {
  const latencies = [];
  const errors = [];
  
  for (let i = 0; i < QUICK_ITERATIONS; i++) {
    try {
      const url = `${BASE_URL}${endpoint}`;
      const result = await makeRequest(url, method, data);
      latencies.push(result.latency);
    } catch (error) {
      errors.push(error.message);
    }
  }
  
  if (latencies.length === 0) {
    return null;
  }
  
  return calculateStats(latencies);
}

async function quickCheck() {
  console.log('⚡ Quick Performance Check');
  console.log('==========================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Iterations: ${QUICK_ITERATIONS}`);
  console.log(`Slow threshold: ${SLOW_THRESHOLD_MS}ms\n`);

  try {
    // Quick test for /api/cuts
    console.log('🔍 Testing /api/cuts...');
    const cutsStats = await quickTest('/api/cuts', 'GET');
    
    if (cutsStats) {
      console.log(`   P95: ${cutsStats.p95}ms`);
      if (cutsStats.p95 > SLOW_THRESHOLD_MS) {
        console.log(`⚠️  P95 latency is above threshold`);
      } else {
        console.log(`✅ P95 latency is acceptable`);
      }
    } else {
      console.log('❌ No successful requests');
    }

    // Quick test for /api/submit-tip
    console.log('\n🔍 Testing /api/submit-tip...');
    const submitStats = await quickTest('/api/submit-tip', 'POST', submitTipData);
    
    if (submitStats) {
      console.log(`   P95: ${submitStats.p95}ms`);
      if (submitStats.p95 > SLOW_THRESHOLD_MS) {
        console.log(`⚠️  P95 latency is above threshold`);
      } else {
        console.log(`✅ P95 latency is acceptable`);
      }
    } else {
      console.log('❌ No successful requests');
    }

    console.log('\n✅ Quick check completed!');
    
  } catch (error) {
    console.error('❌ Quick check failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  quickCheck();
}

module.exports = { quickCheck, quickTest }; 