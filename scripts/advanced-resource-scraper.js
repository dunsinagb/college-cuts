const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class AdvancedResourceScraper {
  constructor() {
    this.resources = {
      transferAssistance: [],
      careerCounseling: [],
      legalAid: [],
      mentalHealth: [],
      financialAid: [],
      academicSupport: []
    };
    
    this.keywords = {
      transferAssistance: ['transfer', 'articulation', 'credit transfer', 'transfer agreement'],
      careerCounseling: ['career', 'counseling', 'job placement', 'employment', 'vocational'],
      legalAid: ['legal', 'rights', 'advocacy', 'student rights', 'legal assistance'],
      mentalHealth: ['mental health', 'counseling', 'therapy', 'support', 'wellness'],
      financialAid: ['financial aid', 'scholarship', 'grant', 'loan', 'tuition'],
      academicSupport: ['academic', 'tutoring', 'study', 'learning', 'academic support']
    };
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async scrapeHigherEducationResources() {
    console.log('🔍 Scraping higher education specific resources...');
    
    const sources = [
      {
        url: 'https://www.aacrao.org/',
        category: 'transferAssistance',
        selectors: ['a[href*="transfer"]', 'a[href*="articulation"]']
      },
      {
        url: 'https://www.naceweb.org/',
        category: 'careerCounseling',
        selectors: ['a[href*="career"]', 'a[href*="employment"]']
      },
      {
        url: 'https://www.studentloanborrowerassistance.org/',
        category: 'legalAid',
        selectors: ['a[href*="legal"]', 'a[href*="rights"]']
      },
      {
        url: 'https://www.mentalhealth.gov/',
        category: 'mentalHealth',
        selectors: ['a[href*="mental"]', 'a[href*="support"]']
      }
    ];

    for (const source of sources) {
      try {
        const page = await this.browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        await page.goto(source.url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        const data = await page.evaluate((selectors) => {
          const results = [];
          selectors.forEach(selector => {
            const links = Array.from(document.querySelectorAll(selector));
            links.forEach(link => {
              results.push({
                title: link.textContent?.trim(),
                url: link.href,
                description: link.closest('p')?.textContent?.trim() || 
                           link.closest('div')?.textContent?.trim() || '',
                source: window.location.hostname
              });
            });
          });
          return results;
        }, source.selectors);

        this.resources[source.category].push(...data.filter(item => item.title && item.url));
        await page.close();
        
        // Be respectful to servers
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error scraping ${source.url}:`, error.message);
      }
    }
  }

  async scrapeStateSpecificResources() {
    console.log('🔍 Scraping state-specific resources...');
    
    const states = [
      { code: 'CA', name: 'California' },
      { code: 'TX', name: 'Texas' },
      { code: 'NY', name: 'New York' },
      { code: 'FL', name: 'Florida' },
      { code: 'IL', name: 'Illinois' },
      { code: 'PA', name: 'Pennsylvania' },
      { code: 'OH', name: 'Ohio' },
      { code: 'GA', name: 'Georgia' },
      { code: 'NC', name: 'North Carolina' },
      { code: 'MI', name: 'Michigan' }
    ];

    for (const state of states) {
      try {
        const page = await this.browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        
        // Search for state-specific resources
        const searchQueries = [
          `${state.name} college transfer assistance`,
          `${state.name} student legal aid`,
          `${state.name} mental health support students`,
          `${state.name} career counseling higher education`
        ];

        for (const query of searchQueries) {
          await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, { 
            waitUntil: 'networkidle2', 
            timeout: 30000 
          });
          
          const data = await page.evaluate((stateInfo, searchQuery) => {
            const results = Array.from(document.querySelectorAll('.g'));
            return results.slice(0, 3).map(result => {
              const titleElement = result.querySelector('h3');
              const linkElement = result.querySelector('a');
              const snippetElement = result.querySelector('.VwiC3b');
              
              return {
                state: stateInfo.code,
                stateName: stateInfo.name,
                title: titleElement?.textContent?.trim(),
                url: linkElement?.href,
                description: snippetElement?.textContent?.trim() || '',
                searchQuery: searchQuery,
                source: 'Google Search'
              };
            }).filter(item => item.title && item.url);
          }, state, query);

          // Categorize results
          data.forEach(item => {
            const titleLower = item.title.toLowerCase();
            const descLower = item.description.toLowerCase();
            
            if (this.keywords.transferAssistance.some(keyword => 
              titleLower.includes(keyword) || descLower.includes(keyword))) {
              this.resources.transferAssistance.push(item);
            }
            if (this.keywords.careerCounseling.some(keyword => 
              titleLower.includes(keyword) || descLower.includes(keyword))) {
              this.resources.careerCounseling.push(item);
            }
            if (this.keywords.legalAid.some(keyword => 
              titleLower.includes(keyword) || descLower.includes(keyword))) {
              this.resources.legalAid.push(item);
            }
            if (this.keywords.mentalHealth.some(keyword => 
              titleLower.includes(keyword) || descLower.includes(keyword))) {
              this.resources.mentalHealth.push(item);
            }
            if (this.keywords.financialAid.some(keyword => 
              titleLower.includes(keyword) || descLower.includes(keyword))) {
              this.resources.financialAid.push(item);
            }
            if (this.keywords.academicSupport.some(keyword => 
              titleLower.includes(keyword) || descLower.includes(keyword))) {
              this.resources.academicSupport.push(item);
            }
          });

          // Be respectful to Google
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

        await page.close();
      } catch (error) {
        console.error(`Error scraping state ${state.code}:`, error.message);
      }
    }
  }

  async scrapeInstitutionSpecificResources() {
    console.log('🔍 Scraping institution-specific resources...');
    
    // Sample institutions from the database
    const institutions = [
      'University of California',
      'Texas A&M University',
      'New York University',
      'University of Florida',
      'University of Illinois'
    ];

    for (const institution of institutions) {
      try {
        const page = await this.browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        
        const searchQuery = `${institution} student resources transfer career counseling mental health`;
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, { 
          waitUntil: 'networkidle2', 
          timeout: 30000 
        });
        
        const data = await page.evaluate((instName) => {
          const results = Array.from(document.querySelectorAll('.g'));
          return results.slice(0, 5).map(result => {
            const titleElement = result.querySelector('h3');
            const linkElement = result.querySelector('a');
            const snippetElement = result.querySelector('.VwiC3b');
            
            return {
              institution: instName,
              title: titleElement?.textContent?.trim(),
              url: linkElement?.href,
              description: snippetElement?.textContent?.trim() || '',
              source: 'Google Search'
            };
          }).filter(item => item.title && item.url);
        }, institution);

        // Categorize institution-specific resources
        data.forEach(item => {
          const titleLower = item.title.toLowerCase();
          const descLower = item.description.toLowerCase();
          
          if (this.keywords.transferAssistance.some(keyword => 
            titleLower.includes(keyword) || descLower.includes(keyword))) {
            this.resources.transferAssistance.push(item);
          }
          if (this.keywords.careerCounseling.some(keyword => 
            titleLower.includes(keyword) || descLower.includes(keyword))) {
            this.resources.careerCounseling.push(item);
          }
          if (this.keywords.mentalHealth.some(keyword => 
            titleLower.includes(keyword) || descLower.includes(keyword))) {
            this.resources.mentalHealth.push(item);
          }
        });

        await page.close();
        
        // Be respectful to servers
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error scraping institution ${institution}:`, error.message);
      }
    }
  }

  async deduplicateResources() {
    console.log('🧹 Deduplicating resources...');
    
    for (const category in this.resources) {
      const seen = new Set();
      this.resources[category] = this.resources[category].filter(item => {
        const key = `${item.title}-${item.url}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
    }
  }

  async saveResources() {
    const outputDir = path.join(__dirname, '../data');
    await fs.mkdir(outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Save all resources
    const allResourcesFile = path.join(outputDir, `all-resources-${timestamp}.json`);
    await fs.writeFile(allResourcesFile, JSON.stringify(this.resources, null, 2));
    console.log(`✅ All resources saved to ${allResourcesFile}`);
    
    // Save individual category files
    for (const [category, data] of Object.entries(this.resources)) {
      const categoryFile = path.join(outputDir, `${category}-${timestamp}.json`);
      await fs.writeFile(categoryFile, JSON.stringify(data, null, 2));
      console.log(`✅ ${category} (${data.length} items) saved to ${categoryFile}`);
    }
    
    // Save summary
    const summary = {
      timestamp: new Date().toISOString(),
      totalResources: Object.values(this.resources).reduce((sum, arr) => sum + arr.length, 0),
      byCategory: Object.fromEntries(
        Object.entries(this.resources).map(([category, data]) => [category, data.length])
      )
    };
    
    const summaryFile = path.join(outputDir, `summary-${timestamp}.json`);
    await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2));
    console.log(`✅ Summary saved to ${summaryFile}`);
  }

  async run() {
    try {
      console.log('🚀 Starting advanced resource scraping...');
      await this.init();
      
      await Promise.all([
        this.scrapeHigherEducationResources(),
        this.scrapeStateSpecificResources(),
        this.scrapeInstitutionSpecificResources()
      ]);
      
      await this.deduplicateResources();
      await this.saveResources();
      
      console.log('✅ Advanced resource scraping completed!');
      console.log(`📊 Final Results:`);
      for (const [category, data] of Object.entries(this.resources)) {
        console.log(`   ${category}: ${data.length} resources`);
      }
      
    } catch (error) {
      console.error('❌ Error during scraping:', error);
    } finally {
      await this.close();
    }
  }
}

// Run the scraper
if (require.main === module) {
  const scraper = new AdvancedResourceScraper();
  scraper.run();
}

module.exports = AdvancedResourceScraper; 