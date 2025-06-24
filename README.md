# ViRA - Vercel Edition

Welcome to the Vercel-native edition of ViRA, a vendor recommendation web application. This project leverages the power of Next.js, Vercel's serverless platform, and Google's Gemini AI to provide intelligent vendor matching.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Vercel Postgres](https://vercel.com/storage/postgres) (Serverless, based on Neon)
- **AI**: [Google Gemini API](https://ai.google.dev/)
- **Deployment**: [Vercel](https://vercel.com/)
- **Package Manager**: [Yarn](https://yarnpkg.com/)

## Getting Started

Follow these steps to get the project running locally.

### 1. Prerequisites

- [Node.js](https://nodejs.org/en) (v18 or later)
- [Yarn](https://yarnpkg.com/getting-started/install)
- [Vercel CLI](https://vercel.com/docs/cli)

### 2. Clone the Repository

```bash
git clone <repository-url>
cd vira-vercel-app
```

### 3. Install Dependencies

```bash
yarn install
```

### 4. Set Up Environment Variables

This project requires a Vercel account for database hosting and a Google AI API key.

1. **Link to Vercel Project**:

   ```bash
   vercel link
   ```

2. **Pull Environment Variables**:
   This will create a `.env.local` file with the `POSTGRES_URL` from your Vercel project.

   ```bash
   vercel env pull .env.local
   ```

3. **Add Gemini API Key**:
   Open the newly created `.env.local` file and add your Google Gemini API key.

   ```env
   POSTGRES_URL="..."
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```

### 5. Set Up the Database

Run the following scripts to create the necessary tables and seed them with initial data.

```bash
# Create the 'vendors' table
yarn ts-node src/scripts/schema.ts

# Seed the database with sample vendors
yarn ts-node src/scripts/seed.ts
```

### 6. Run the Development Server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `yarn dev`: Starts the development server.
- `yarn build`: Creates a production-ready build.
- `yarn start`: Starts the production server.
- `yarn lint`: Lints the codebase.

## Deployment

This application is optimized for deployment on the [Vercel Platform](https://vercel.com/).

1. **Add Environment Variables to Vercel**:
   Make sure to add your `GEMINI_API_KEY` to the environment variables in your Vercel project settings.

2. **Push to Deploy**:
   Connect your Git repository to your Vercel project. Pushing to the main branch will automatically trigger a new deployment.
