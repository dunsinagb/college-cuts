const ContextualResourceScraper = require('./contextual-resource-scraper');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

class ContextualScrapingRunner {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    this.scraper = new ContextualResourceScraper();
  }

  async getAllActions() {
    try {
      const { data, error } = await this.supabase
        .from('v_latest_cuts')
        .select('*')
        .order('announcement_date', { ascending: false });

      if (error) {
        console.error('Error fetching actions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error connecting to database:', error);
      return [];
    }
  }

  async getRecentActions(limit = 10) {
    try {
      const { data, error } = await this.supabase
        .from('v_latest_cuts')
        .select('*')
        .gte('announcement_date', '2025-07-01') // Only actions from July 2025 onwards
        .order('announcement_date', { ascending: false });

      if (error) {
        console.error('Error fetching recent actions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error connecting to database:', error);
      return [];
    }
  }

  async runForAllActions() {
    console.log('🚀 Starting contextual resource scraping for all actions...');
    
    const actions = await this.getAllActions();
    console.log(`📊 Found ${actions.length} actions to process`);
    
    let processed = 0;
    let successful = 0;
    let failed = 0;
    
    for (const action of actions) {
      try {
        console.log(`\n🔍 Processing action ${processed + 1}/${actions.length}: ${action.institution}`);
        console.log(`   Action Type: ${action.cut_type}`);
        console.log(`   State: ${action.state}`);
        console.log(`   Primary Reason: ${this.scraper.categorizePrimaryReason(action.notes)}`);
        
        await this.scraper.runForAction(action);
        successful++;
        
        console.log(`✅ Successfully processed action: ${action.institution}`);
      } catch (error) {
        console.error(`❌ Failed to process action ${action.institution}:`, error.message);
        failed++;
      }
      
      processed++;
      
      // Add delay between actions to be respectful
      if (processed < actions.length) {
        console.log('⏳ Waiting 5 seconds before next action...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    console.log(`\n🎉 Contextual scraping completed!`);
    console.log(`📊 Results:`);
    console.log(`   Total actions: ${actions.length}`);
    console.log(`   Successfully processed: ${successful}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Success rate: ${((successful / actions.length) * 100).toFixed(1)}%`);
  }

  async runForRecentActions(limit = 10) {
    console.log(`🚀 Starting contextual resource scraping for actions from July 2025 onwards...`);
    
    const actions = await this.getRecentActions(limit);
    console.log(`📊 Found ${actions.length} actions from July 2025 onwards`);
    
    if (actions.length === 0) {
      console.log('ℹ️ No actions found from July 2025 onwards. The system will generate contextual resources for new actions going forward.');
      return;
    }
    
    let processed = 0;
    let successful = 0;
    let failed = 0;
    
    for (const action of actions) {
      try {
        console.log(`\n🔍 Processing action ${processed + 1}/${actions.length}: ${action.institution}`);
        console.log(`   Action Type: ${action.cut_type}`);
        console.log(`   State: ${action.state}`);
        console.log(`   Date: ${action.announcement_date}`);
        console.log(`   Primary Reason: ${this.scraper.categorizePrimaryReason(action.notes)}`);
        
        await this.scraper.runForAction(action);
        successful++;
        
        console.log(`✅ Successfully processed action: ${action.institution}`);
      } catch (error) {
        console.error(`❌ Failed to process action ${action.institution}:`, error.message);
        failed++;
      }
      
      processed++;
      
      // Add delay between actions
      if (processed < actions.length) {
        console.log('⏳ Waiting 3 seconds before next action...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    console.log(`\n🎉 Contextual scraping completed for July 2025+ actions!`);
    console.log(`📊 Results:`);
    console.log(`   Total actions: ${actions.length}`);
    console.log(`   Successfully processed: ${successful}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Success rate: ${((successful / actions.length) * 100).toFixed(1)}%`);
    console.log(`\n💡 Going forward, all new actions will automatically get contextual resources!`);
  }

  async runForSpecificAction(actionId) {
    console.log(`🚀 Starting contextual resource scraping for specific action: ${actionId}`);
    
    try {
      const { data, error } = await this.supabase
        .from('v_latest_cuts')
        .select('*')
        .eq('id', actionId)
        .single();

      if (error || !data) {
        console.error('Error fetching specific action:', error);
        return;
      }

      console.log(`📊 Processing action: ${data.institution}`);
      console.log(`   Action Type: ${data.cut_type}`);
      console.log(`   State: ${data.state}`);
      console.log(`   Primary Reason: ${this.scraper.categorizePrimaryReason(data.notes)}`);
      
      await this.scraper.runForAction(data);
      console.log(`✅ Successfully processed action: ${data.institution}`);
      
    } catch (error) {
      console.error(`❌ Failed to process action ${actionId}:`, error.message);
    }
  }
}

// Command line interface
if (require.main === module) {
  const runner = new ContextualScrapingRunner();
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'all':
      runner.runForAllActions();
      break;
    case 'recent':
      const limit = parseInt(args[1]) || 10;
      runner.runForRecentActions(limit);
      break;
    case 'specific':
      const actionId = args[1];
      if (!actionId) {
        console.error('Please provide an action ID');
        process.exit(1);
      }
      runner.runForSpecificAction(actionId);
      break;
    default:
      console.log('Usage:');
      console.log('  node run-contextual-scraping.js all                    # Process all actions');
      console.log('  node run-contextual-scraping.js recent [limit]        # Process recent actions (default: 10)');
      console.log('  node run-contextual-scraping.js specific <actionId>   # Process specific action');
      break;
  }
}

module.exports = ContextualScrapingRunner; 