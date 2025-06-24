# ViRA Supabase Integration - Complete Setup Guide

## Overview

This guide will help you migrate from Vercel Postgres to Supabase and connect your 4 database tables:
1. **Vendors** - Your vendor database with skills, rates, contact info
2. **Projects** - Client projects with timelines and assignments  
3. **Clients** - Client information extracted from projects
4. **Vendor Ratings** - Performance ratings and feedback

## Prerequisites

- Supabase account (free tier is fine for development)
- Your CSV files: `vendors.csv`, `projects.csv`, `vendor ratings.csv`

## Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js
```

## Step 2: Set Up Supabase Project

1. **Create Supabase Project:**
   - Go to [https://supabase.com](https://supabase.com)
   - Sign in/Create account
   - Click "New Project"
   - Choose organization and name your project "vira-database"
   - Set a strong database password
   - Select your region (us-east-1 recommended)
   - Click "Create new project"

2. **Get API Keys:**
   - Once project is created, go to Settings > API
   - Copy these values:
     - **Project URL** (looks like: `https://your-project.supabase.co`)
     - **Project API Key - anon public** (starts with `eyJ...`)
     - **Project API Key - service_role** (starts with `eyJ...`)

## Step 3: Update Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Replace the placeholder values with your actual Supabase credentials.**

## Step 4: Create Database Tables

1. **Go to Supabase SQL Editor:**
   - In your Supabase dashboard, click "SQL Editor"
   - Click "New query"

2. **Run the Schema Creation:**
   - Copy the entire content from `supabase-schema.sql`
   - Paste into the SQL editor
   - Click "Run" to create all tables and indexes

This will create:
- `vendors` table with all vendor information
- `projects` table with project details
- `clients` table for client management
- `vendor_ratings` table for performance tracking
- Proper indexes for performance
- Row Level Security enabled

## Step 5: Migrate Your Data

1. **Install Dependencies:** (if not already done)
   ```bash
   npm install @supabase/supabase-js csv-parse
   ```

2. **Ensure CSV Files Are in Root:**
   - `vendors.csv`
   - `projects.csv` 
   - `vendor ratings.csv`

3. **Run Migration Script:**
   ```bash
   npm run migrate
   ```

   The script will:
   - ✅ Parse your CSV files
   - ✅ Clean and format the data
   - ✅ Insert vendors first
   - ✅ Extract and create unique clients
   - ✅ Insert projects with client relationships
   - ✅ Map and insert vendor ratings

## Step 6: Verify Data Migration

1. **Check Tables in Supabase:**
   - Go to "Table Editor" in Supabase dashboard
   - Verify each table has data:
     - `vendors`: Should show ~40+ vendors
     - `clients`: Unique client names from projects
     - `projects`: All your projects with due dates
     - `vendor_ratings`: Ratings linked to vendors

2. **Test API Endpoints:**
   ```bash
   npm run dev
   ```
   
   Visit these URLs to test:
   - `http://localhost:3000/api/vendors` - Should return vendor list
   - `http://localhost:3000/api/projects` - Should return projects
   - `http://localhost:3000/api/clients` - Should return clients
   - `http://localhost:3000/api/ratings` - Should return ratings

## Step 7: Update Frontend Pages

The frontend pages will now automatically use the new Supabase data:

- **Vendors Page** (`/vendors`): Displays vendors from Supabase with filtering
- **Projects Page** (`/projects`): Shows projects with vendor assignments
- **Dashboard** (`/`): AI vendor matching uses Supabase data

## Step 8: Test AI Vendor Matching

1. **Go to the homepage** (`http://localhost:3000`)
2. **Fill out the project form:**
   - Project Scope: "Build an e-commerce website"
   - Budget: $25000
   - Location: "Remote"
   - Preferred Attributes: "Strong design portfolio"
3. **Click "Get Recommendations"**
4. **Verify AI returns relevant vendors** from your Supabase database

## API Endpoints Available

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/vendors` | GET | List all vendors with filtering |
| `/api/vendors` | POST | Create new vendor |
| `/api/projects` | GET | List projects with vendor relationships |
| `/api/projects` | POST | Create new project |
| `/api/clients` | GET | List all clients |
| `/api/clients` | POST | Create new client |
| `/api/ratings` | GET | List vendor ratings |
| `/api/ratings` | POST | Create new rating |
| `/api/match-vendors` | POST | AI-powered vendor matching |

## Database Schema Summary

### Vendors Table
- Complete vendor profiles with contact info
- Skills, pricing, availability tracking
- Industry specializations
- Portfolio and sample work URLs

### Projects Table  
- Client project management
- Due date tracking
- Vendor assignment capability
- Status management

### Clients Table
- Client contact information
- Industry categorization
- Relationship tracking

### Vendor Ratings Table
- Performance metrics (1-5 scale)
- Qualitative feedback
- Project-specific ratings
- Strengths/weaknesses tracking

## Troubleshooting

### Migration Issues:
- **CSV not found**: Ensure CSV files are in project root
- **Date parsing errors**: Check date formats in CSV
- **Vendor mapping errors**: Verify vendor names match between files

### API Issues:
- **500 errors**: Check Supabase credentials in `.env.local`
- **No data returned**: Verify tables have data in Supabase dashboard
- **CORS errors**: Ensure using correct Supabase URL

### Authentication Issues:
- **Unauthorized**: Check Row Level Security policies
- **Invalid API key**: Verify keys in Supabase dashboard

## Next Steps

1. **Test all functionality** with your real data
2. **Customize filtering** on vendor/project pages
3. **Add vendor performance analytics** using ratings data
4. **Implement advanced search** across all tables
5. **Set up automated backups** in Supabase

## Success Criteria

✅ All CSV data migrated to Supabase  
✅ API endpoints returning data correctly  
✅ Frontend pages displaying Supabase data  
✅ AI vendor matching working with real data  
✅ No errors in browser console  
✅ Professional UI with your brand colors  

**You now have a fully connected, professional vendor management system powered by Supabase!**
