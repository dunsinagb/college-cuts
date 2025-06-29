#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const PROFILE_INSERTS = 20;
const SIZE_THRESHOLD_KB = 2;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Message size tracking
const messageSizes = [];
const messageDetails = [];
let insertCount = 0;
let subscription = null;

// Helper function to calculate message size
function calculateMessageSize(message) {
  const messageStr = JSON.stringify(message);
  return Buffer.byteLength(messageStr, 'utf8');
}

// Helper function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to generate test data
function generateTestData(index) {
  return {
    institution: `Test University ${index}`,
    program: `Test Program ${index}`,
    cut_type: 'Program Suspension',
    description: `This is a test description for performance profiling. It contains some sample text to simulate real data. Index: ${index}`,
    state: 'CA',
    control: 'Public',
    source: 'Performance Test',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// Set up realtime subscription
async function setupRealtimeSubscription() {
  console.log('🔌 Setting up realtime subscription...');
  
  subscription = supabase
    .channel('realtime-profile')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'cuts'
      },
      (payload) => {
        const messageSize = calculateMessageSize(payload);
        messageSizes.push(messageSize);
        messageDetails.push({
          index: insertCount + 1,
          size: messageSize,
          sizeFormatted: formatBytes(messageSize),
          payload: payload
        });
        
        console.log(`📨 Message ${insertCount + 1}: ${formatBytes(messageSize)}`);
        
        insertCount++;
        
        if (insertCount >= PROFILE_INSERTS) {
          analyzeResults();
          cleanup();
        }
      }
    )
    .subscribe();
    
  console.log('✅ Realtime subscription active');
}

// Insert test data
async function insertTestData() {
  console.log(`\n📝 Inserting ${PROFILE_INSERTS} test records...`);
  
  for (let i = 0; i < PROFILE_INSERTS; i++) {
    try {
      const testData = generateTestData(i + 1);
      const { error } = await supabase
        .from('cuts')
        .insert(testData);
        
      if (error) {
        console.error(`❌ Insert ${i + 1} failed:`, error.message);
      } else {
        console.log(`✅ Insert ${i + 1} completed`);
      }
      
      // Small delay to ensure proper sequencing
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Insert ${i + 1} error:`, error.message);
    }
  }
}

// Analyze results
function analyzeResults() {
  console.log('\n📊 Realtime Message Size Analysis');
  console.log('==================================');
  
  if (messageSizes.length === 0) {
    console.log('❌ No messages received');
    return;
  }
  
  const totalSize = messageSizes.reduce((sum, size) => sum + size, 0);
  const avgSize = totalSize / messageSizes.length;
  const minSize = Math.min(...messageSizes);
  const maxSize = Math.max(...messageSizes);
  
  console.log(`📈 Statistics:`);
  console.log(`   Messages received: ${messageSizes.length}`);
  console.log(`   Total size: ${formatBytes(totalSize)}`);
  console.log(`   Average size: ${formatBytes(avgSize)}`);
  console.log(`   Min size: ${formatBytes(minSize)}`);
  console.log(`   Max size: ${formatBytes(maxSize)}`);
  
  const avgSizeKB = avgSize / 1024;
  console.log(`\n🎯 Threshold Analysis:`);
  console.log(`   Average: ${avgSizeKB.toFixed(2)} KB`);
  console.log(`   Threshold: ${SIZE_THRESHOLD_KB} KB`);
  
  if (avgSizeKB > SIZE_THRESHOLD_KB) {
    console.log(`⚠️  Average message size exceeds ${SIZE_THRESHOLD_KB} KB threshold`);
    generateOptimizationRecommendations();
  } else {
    console.log(`✅ Average message size is within acceptable range`);
  }
  
  // Show largest messages
  console.log(`\n📋 Largest Messages:`);
  const sortedMessages = messageDetails
    .sort((a, b) => b.size - a.size)
    .slice(0, 5);
    
  sortedMessages.forEach(msg => {
    console.log(`   Message ${msg.index}: ${msg.sizeFormatted}`);
  });
  
  // Analyze payload structure
  if (messageDetails.length > 0) {
    analyzePayloadStructure(messageDetails[0].payload);
  }
}

// Analyze payload structure
function analyzePayloadStructure(payload) {
  console.log(`\n🔍 Payload Structure Analysis:`);
  
  const payloadStr = JSON.stringify(payload);
  const payloadSize = Buffer.byteLength(payloadStr, 'utf8');
  
  console.log(`   Total payload size: ${formatBytes(payloadSize)}`);
  
  if (payload.new) {
    console.log(`   Data size: ${formatBytes(Buffer.byteLength(JSON.stringify(payload.new), 'utf8'))}`);
    
    // Analyze individual columns
    const columns = Object.keys(payload.new);
    console.log(`   Columns (${columns.length}): ${columns.join(', ')}`);
    
    // Show column sizes
    console.log(`\n📏 Column Sizes:`);
    columns.forEach(column => {
      const columnValue = payload.new[column];
      const columnSize = Buffer.byteLength(JSON.stringify(columnValue), 'utf8');
      console.log(`   ${column}: ${formatBytes(columnSize)}`);
    });
  }
}

// Generate optimization recommendations
function generateOptimizationRecommendations() {
  console.log(`\n💡 Optimization Recommendations:`);
  
  console.log(`1. 📋 Minimal Column Selection:`);
  console.log(`   - Only subscribe to essential columns: id, institution, program, cut_type, state`);
  console.log(`   - Exclude large text fields like description from realtime updates`);
  console.log(`   - Use separate API calls for detailed data when needed`);
  
  console.log(`\n2. ⏱️  Throttling Strategies:`);
  console.log(`   - Implement debouncing for rapid updates`);
  console.log(`   - Use batch updates instead of individual inserts`);
  console.log(`   - Consider polling for less critical updates`);
  
  console.log(`\n3. 🗂️  Data Structure Optimization:`);
  console.log(`   - Truncate long text fields in realtime payloads`);
  console.log(`   - Use abbreviated field names`);
  console.log(`   - Implement delta updates (only changed fields)`);
  
  console.log(`\n4. 🔧 Technical Optimizations:`);
  console.log(`   - Use Supabase's built-in filtering to reduce payload size`);
  console.log(`   - Implement client-side caching to reduce redundant data`);
  console.log(`   - Consider using WebSocket compression if available`);
  
  console.log(`\n5. 📊 Monitoring:`);
  console.log(`   - Set up alerts for message size spikes`);
  console.log(`   - Monitor realtime subscription performance`);
  console.log(`   - Track bandwidth usage over time`);
}

// Cleanup function
async function cleanup() {
  console.log('\n🧹 Cleaning up...');
  
  if (subscription) {
    await supabase.removeChannel(subscription);
    console.log('✅ Realtime subscription removed');
  }
  
  // Clean up test data
  console.log('🗑️  Cleaning up test data...');
  try {
    const { error } = await supabase
      .from('cuts')
      .delete()
      .like('institution', 'Test University%');
      
    if (error) {
      console.error('❌ Cleanup error:', error.message);
    } else {
      console.log('✅ Test data cleaned up');
    }
  } catch (error) {
    console.error('❌ Cleanup error:', error.message);
  }
  
  process.exit(0);
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, cleaning up...');
  await cleanup();
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, cleaning up...');
  await cleanup();
});

// Main execution
async function main() {
  console.log('🚀 Supabase Realtime Message Size Profiler');
  console.log('==========================================');
  console.log(`Target inserts: ${PROFILE_INSERTS}`);
  console.log(`Size threshold: ${SIZE_THRESHOLD_KB} KB`);
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  
  try {
    await setupRealtimeSubscription();
    await insertTestData();
    
    // Wait for all messages to be processed
    console.log('\n⏳ Waiting for all messages to be processed...');
    const maxWaitTime = 30000; // 30 seconds
    const startTime = Date.now();
    
    while (insertCount < PROFILE_INSERTS && (Date.now() - startTime) < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (insertCount < PROFILE_INSERTS) {
      console.log(`⚠️  Only received ${insertCount}/${PROFILE_INSERTS} messages`);
    }
    
    analyzeResults();
    await cleanup();
    
  } catch (error) {
    console.error('❌ Profiling failed:', error.message);
    await cleanup();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { 
  setupRealtimeSubscription, 
  analyzeResults, 
  generateOptimizationRecommendations 
}; 