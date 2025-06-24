# Vendor Recommendation App Plan

## Notes

- The main page (`page.tsx`) is a form for submitting project details to get vendor recommendations.
- The backend API route (`api/match-vendors/route.ts`) is currently a placeholder and needs implementation.
- The only available data file (`projects.csv`) contains client project info, not vendor info.
- Project will use Vercel Postgres as the database; vendor, client, project, and rating entities will be modeled in schema.

## Task List

- [x] Review main page UI and form logic
- [x] Review backend API route placeholder
- [x] Review available data files
- [x] Initialize new Next.js (TypeScript, App Router) project on Vercel
- [x] Set up Vercel Postgres database via Vercel dashboard
- [x] Review CSV data (vendors, vendor ratings, projects) and plan import/migration to Vercel Postgres
- [x] Finalize and document DB schema for all entities (vendors, clients, projects, ratings)
- [x] Write SQL statements to create schema in Vercel Postgres
- [x] Create tables in Neon/Postgres (schema creation)
- [ ] Seed vendor data (script or admin endpoint)
- [ ] Implement vendor matching logic in the API route
- [ ] Connect frontend to backend for recommendations
- [ ] Build/display recommendations page

## Current Goal

Seed vendor data in database
