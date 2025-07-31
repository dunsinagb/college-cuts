const ContextualScrapingRunner = require('./run-contextual-scraping');
const fs = require('fs').promises;
const path = require('path');

class AutoContextualUpdater {
  constructor() {
    this.runner = new ContextualScrapingRunner();
    this.lastCheckFile = path.join(__dirname, '../data/last-contextual-check.json');
  }

  async getLastCheckDate() {
    try {
      const data = await fs.readFile(this.lastCheckFile, 'utf-8');
      const lastCheck = JSON.parse(data);
      return new Date(lastCheck.lastCheck);
    } catch (error) {
      // If no last check file exists, use July 1, 2025 as default
      return new Date('2025-07-01');
    }
  }

  async updateLastCheckDate() {
    const lastCheck = {
      lastCheck: new Date().toISOString(),
      totalActionsProcessed: await this.getTotalProcessedActions()
    };
    
    await fs.writeFile(this.lastCheckFile, JSON.stringify(lastCheck, null, 2));
  }

  async getTotalProcessedActions() {
    try {
      const contextualDir = path.join(__dirname, '../data/contextual');
      const files = await fs.readdir(contextualDir);
      return files.filter(file => file.endsWith('.json')).length;
    } catch (error) {
      return 0;
    }
  }

  async getNewActions() {
    const lastCheck = await this.getLastCheckDate();
    const lastCheckDate = lastCheck.toISOString().split('T')[0];
    
    try {
      const { data, error } = await this.runner.supabase
        .from('v_latest_cuts')
        .select('*')
        .gte('announcement_date', lastCheckDate)
        .order('announcement_date', { ascending: false });

      if (error) {
        console.error('Error fetching new actions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error connecting to database:', error);
      return [];
    }
  }

  async run() {
    console.log('🤖 Starting automated contextual resource update...');
    
    const newActions = await this.getNewActions();
    
    if (newActions.length === 0) {
      console.log('ℹ️ No new actions found since last check.');
      await this.updateLastCheckDate();
      return;
    }
    
    console.log(`📊 Found ${newActions.length} new actions to process`);
    
    let processed = 0;
    let successful = 0;
    let failed = 0;
    
    for (const action of newActions) {
      try {
        console.log(`\n🔍 Processing new action ${processed + 1}/${newActions.length}: ${action.institution}`);
        console.log(`   Action Type: ${action.cut_type}`);
        console.log(`   State: ${action.state}`);
        console.log(`   Date: ${action.announcement_date}`);
        
        await this.runner.scraper.runForAction(action);
        successful++;
        
        console.log(`✅ Successfully processed: ${action.institution}`);
      } catch (error) {
        console.error(`❌ Failed to process ${action.institution}:`, error.message);
        failed++;
      }
      
      processed++;
      
      // Add delay between actions
      if (processed < newActions.length) {
        console.log('⏳ Waiting 2 seconds before next action...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`\n🎉 Automated update completed!`);
    console.log(`📊 Results:`);
    console.log(`   New actions found: ${newActions.length}`);
    console.log(`   Successfully processed: ${successful}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Success rate: ${((successful / newActions.length) * 100).toFixed(1)}%`);
    
    await this.updateLastCheckDate();
    
    const totalProcessed = await this.getTotalProcessedActions();
    console.log(`📈 Total actions with contextual resources: ${totalProcessed}`);
  }

  async runOnce() {
    console.log('🚀 Running one-time contextual update...');
    await this.run();
  }

  async startMonitoring(intervalMinutes = 60) {
    console.log(`🤖 Starting automated monitoring (checking every ${intervalMinutes} minutes)...`);
    
    // Run immediately
    await this.run();
    
    // Then run on interval
    setInterval(async () => {
      await this.run();
    }, intervalMinutes * 60 * 1000);
  }
}

// Command line interface
if (require.main === module) {
  const updater = new AutoContextualUpdater();
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'once':
      updater.runOnce();
      break;
    case 'monitor':
      const interval = parseInt(args[1]) || 60;
      updater.startMonitoring(interval);
      break;
    default:
      console.log('Usage:');
      console.log('  node auto-contextual-updater.js once                    # Run once');
      console.log('  node auto-contextual-updater.js monitor [interval]     # Start monitoring (default: 60 minutes)');
      break;
  }
}

module.exports = AutoContextualUpdater; 