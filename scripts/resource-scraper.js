const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class ResourceScraper {
  constructor() {
    this.resources = {
      transferAssistance: [],
      careerCounseling: [],
      legalAid: [],
      mentalHealth: []
    };
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async scrapeTransferAssistance() {
    console.log('🔍 Scraping transfer assistance programs...');
    
    const sources = [
      'https://www.collegetransfer.net/',
      'https://www.nationaltransfernetwork.org/',
      'https://www.chea.org/transfer-resources',
      'https://www.aacrao.org/transfer-resources'
    ];

    for (const source of sources) {
      try {
        const page = await this.browser.newPage();
        await page.goto(source, { waitUntil: 'networkidle2', timeout: 30000 });
        
        const data = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*="transfer"]'));
          return links.map(link => ({
            title: link.textContent?.trim(),
            url: link.href,
            description: link.closest('p')?.textContent?.trim() || ''
          })).filter(item => item.title && item.url);
        });

        this.resources.transferAssistance.push(...data);
        await page.close();
      } catch (error) {
        console.error(`Error scraping ${source}:`, error.message);
      }
    }
  }

  async scrapeCareerCounseling() {
    console.log('🔍 Scraping career counseling services...');
    
    const sources = [
      'https://www.naceweb.org/career-development/',
      'https://www.careerkey.org/',
      'https://www.onetonline.org/',
      'https://www.bls.gov/careeroutlook/'
    ];

    for (const source of sources) {
      try {
        const page = await this.browser.newPage();
        await page.goto(source, { waitUntil: 'networkidle2', timeout: 30000 });
        
        const data = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*="career"], a[href*="counseling"]'));
          return links.map(link => ({
            title: link.textContent?.trim(),
            url: link.href,
            description: link.closest('p')?.textContent?.trim() || ''
          })).filter(item => item.title && item.url);
        });

        this.resources.careerCounseling.push(...data);
        await page.close();
      } catch (error) {
        console.error(`Error scraping ${source}:`, error.message);
      }
    }
  }

  async scrapeLegalAid() {
    console.log('🔍 Scraping legal aid resources...');
    
    const sources = [
      'https://www.lsc.gov/',
      'https://www.americanbar.org/groups/legal_aid/',
      'https://www.nlsa.org/',
      'https://www.studentloanborrowerassistance.org/'
    ];

    for (const source of sources) {
      try {
        const page = await this.browser.newPage();
        await page.goto(source, { waitUntil: 'networkidle2', timeout: 30000 });
        
        const data = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*="legal"], a[href*="aid"], a[href*="rights"]'));
          return links.map(link => ({
            title: link.textContent?.trim(),
            url: link.href,
            description: link.closest('p')?.textContent?.trim() || ''
          })).filter(item => item.title && item.url);
        });

        this.resources.legalAid.push(...data);
        await page.close();
      } catch (error) {
        console.error(`Error scraping ${source}:`, error.message);
      }
    }
  }

  async scrapeMentalHealth() {
    console.log('🔍 Scraping mental health support resources...');
    
    const sources = [
      'https://www.mentalhealth.gov/',
      'https://www.nami.org/',
      'https://www.apa.org/helpcenter/',
      'https://www.samhsa.gov/'
    ];

    for (const source of sources) {
      try {
        const page = await this.browser.newPage();
        await page.goto(source, { waitUntil: 'networkidle2', timeout: 30000 });
        
        const data = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*="mental"], a[href*="health"], a[href*="support"]'));
          return links.map(link => ({
            title: link.textContent?.trim(),
            url: link.href,
            description: link.closest('p')?.textContent?.trim() || ''
          })).filter(item => item.title && item.url);
        });

        this.resources.mentalHealth.push(...data);
        await page.close();
      } catch (error) {
        console.error(`Error scraping ${source}:`, error.message);
      }
    }
  }

  async scrapeStateSpecificResources() {
    console.log('🔍 Scraping state-specific resources...');
    
    const states = [
      'CA', 'TX', 'NY', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI',
      'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'CO'
    ];

    for (const state of states) {
      try {
        const page = await this.browser.newPage();
        const searchQuery = `${state} higher education transfer assistance career counseling legal aid mental health`;
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, { 
          waitUntil: 'networkidle2', 
          timeout: 30000 
        });
        
        const data = await page.evaluate((stateCode) => {
          const results = Array.from(document.querySelectorAll('.g'));
          return results.slice(0, 5).map(result => {
            const titleElement = result.querySelector('h3');
            const linkElement = result.querySelector('a');
            const snippetElement = result.querySelector('.VwiC3b');
            
            return {
              state: stateCode,
              title: titleElement?.textContent?.trim(),
              url: linkElement?.href,
              description: snippetElement?.textContent?.trim() || ''
            };
          }).filter(item => item.title && item.url);
        }, state);

        // Categorize results based on keywords
        data.forEach(item => {
          if (item.title?.toLowerCase().includes('transfer')) {
            this.resources.transferAssistance.push(item);
          }
          if (item.title?.toLowerCase().includes('career') || item.title?.toLowerCase().includes('counseling')) {
            this.resources.careerCounseling.push(item);
          }
          if (item.title?.toLowerCase().includes('legal') || item.title?.toLowerCase().includes('rights')) {
            this.resources.legalAid.push(item);
          }
          if (item.title?.toLowerCase().includes('mental') || item.title?.toLowerCase().includes('health')) {
            this.resources.mentalHealth.push(item);
          }
        });

        await page.close();
        
        // Add delay to be respectful to servers
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error scraping state ${state}:`, error.message);
      }
    }
  }

  async saveResources() {
    const outputDir = path.join(__dirname, '../data');
    await fs.mkdir(outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `resources-${timestamp}.json`;
    const filepath = path.join(outputDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(this.resources, null, 2));
    console.log(`✅ Resources saved to ${filepath}`);
    
    // Also save individual category files
    for (const [category, data] of Object.entries(this.resources)) {
      const categoryFile = path.join(outputDir, `${category}-${timestamp}.json`);
      await fs.writeFile(categoryFile, JSON.stringify(data, null, 2));
      console.log(`✅ ${category} saved to ${categoryFile}`);
    }
  }

  async run() {
    try {
      console.log('🚀 Starting resource scraping...');
      await this.init();
      
      await Promise.all([
        this.scrapeTransferAssistance(),
        this.scrapeCareerCounseling(),
        this.scrapeLegalAid(),
        this.scrapeMentalHealth()
      ]);
      
      await this.scrapeStateSpecificResources();
      await this.saveResources();
      
      console.log('✅ Resource scraping completed!');
      console.log(`📊 Results:`);
      console.log(`   Transfer Assistance: ${this.resources.transferAssistance.length} resources`);
      console.log(`   Career Counseling: ${this.resources.careerCounseling.length} resources`);
      console.log(`   Legal Aid: ${this.resources.legalAid.length} resources`);
      console.log(`   Mental Health: ${this.resources.mentalHealth.length} resources`);
      
    } catch (error) {
      console.error('❌ Error during scraping:', error);
    } finally {
      await this.close();
    }
  }
}

// Run the scraper
if (require.main === module) {
  const scraper = new ResourceScraper();
  scraper.run();
}

module.exports = ResourceScraper; 