# CollegeCuts Resource Scraper

This directory contains web scraping scripts for gathering contextual resources for students and faculty affected by institutional actions.

## 🎯 Contextual Resource System

The system now provides **contextual resources** that are specifically tailored to each action's unique situation:

- **Institution-specific resources** from the actual university websites
- **State-specific resources** relevant to the geographic location
- **Action type-specific resources** (program suspension, department closure, etc.)
- **Primary reason-specific resources** (budget deficit, enrollment decline, etc.)

## 📁 Files

### Core Scrapers

- `contextual-resource-scraper.js` - Main contextual resource scraper
- `advanced-resource-scraper.js` - General resource scraper (fallback)
- `run-contextual-scraping.js` - Bulk processing script

### Utilities

- `update-contextual-resources.sh` - Automated update script
- `package.json` - Dependencies and scripts

## 🚀 Usage

### Install Dependencies

```bash
cd scripts
npm install
```

### Scrape Contextual Resources

**For July 2025+ actions:**

```bash
npm run scrape:recent
```

**For a specific action:**

```bash
npm run scrape:specific action-id-here
```

**Automated updates:**

```bash
npm run auto:once                    # Run once
npm run auto:monitor                 # Start monitoring (checks every 60 minutes)
```

**Manual updates:**

```bash
./update-contextual-resources.sh
```

## 📊 Contextual Intelligence

### Action Type Matching

- `program_suspension` → Transfer assistance, alternative programs
- `department_closure` → Career counseling, transfer resources
- `campus_closure` → Relocation assistance, transfer networks
- `institution_closure` → Emergency transfer, legal rights
- `staff_layoff` → Career services, employment assistance
- `teach_out` → Completion resources, graduation planning

### Primary Reason Matching

- `Budget Deficit` → Financial aid, emergency funds
- `Federal Funding Cuts` → Legal resources, alternative funding
- `State Mandates` → Legal resources, policy information
- `Enrollment Decline` → Transfer assistance, alternative programs
- `Accreditation Issues` → Legal support, transfer to accredited institutions

### Geographic Intelligence

- **Texas**: UT System resources, Texas Transfer Network, Texas Workforce Commission
- **Illinois**: Illinois Articulation Initiative, Illinois Department of Employment Security
- **New York**: NYS Transfer Association, NY Department of Labor
- **Other States**: State-specific resources and legal aid

## 🔄 Data Flow

1. **Scraper** → Generates contextual resources based on action details
2. **API Route** (`/api/resources`) → Serves contextual resources with relevance filtering
3. **ResourceSection Component** → Displays contextual resources on action detail pages
4. **Fallback System** → Provides general resources if no contextual data exists

## 📈 Example Contextual Resources

### University of Texas at Dallas (Department Closure)

- **Transfer Assistance**: Texas Transfer Network, UT System Transfer Services
- **Career Counseling**: Department Closure Career Support, Texas Workforce Commission
- **Legal Aid**: Texas Legal Services Center
- **Financial Aid**: Emergency Financial Aid for budget cuts

### Northwestern University (Staff Layoff)

- **Career Counseling**: Northwestern Career Services, Faculty Layoff Career Support
- **Mental Health**: Northwestern Counseling Services, Faculty Mental Health Support
- **Legal Aid**: Federal Funding Rights, Legal Aid Chicago
- **Financial Aid**: Alternative Funding Sources for federal cuts

### The King's College (Institution Closure)

- **Transfer Assistance**: NYS Transfer Association, Emergency Transfer Resources
- **Legal Aid**: Accreditation Legal Support, Institution Closure Legal Rights
- **Career Counseling**: Emergency Career Support

## 🎯 Benefits

1. **Highly Relevant**: Each action gets resources specifically tailored to its situation
2. **Geographic Accuracy**: Resources match the actual state and institution
3. **Action-Specific Support**: Different types of actions get different types of resources
4. **Primary Reason Context**: Resources address the underlying cause of the action
5. **Real-Time Updates**: Resources are generated fresh for each action

## 🔧 Configuration

The scraper uses environment variables from `../.env`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## �� Output

Contextual resources are saved to `../data/contextual/` with filenames like:
`action-{id}-resources-{date}.json`

Each file contains categorized resources with relevance scores and metadata.
