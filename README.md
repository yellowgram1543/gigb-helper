# gigb-helper

Frontend web app for GigB helpers to discover local gigs, accept work, track active tasks, chat in real time, and manage payout status.

## Tech Stack

- React 19 + Vite
- React Router
- Zustand (auth/session state)
- Supabase Auth + Storage
- Axios + Socket.IO client
- Tailwind CSS

## Prerequisites

- Node.js 18+ (Node.js 20 recommended)
- npm 9+
- A running GigB backend API
- Supabase project credentials

## Installation

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root with:

```env
VITE_API_URL=<your-backend-api-url>
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

> Replace placeholder values with your own environment-specific settings.

## Local Development

Start the development server:

```bash
npm run dev
```

The app runs on Vite's default local URL (typically `http://localhost:5173`).

## Production Build & Preview

Build the production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Linting / Quality Checks

Run ESLint:

```bash
npm run lint
```

## Notes for Contributors and Deployers

- This repository is the frontend only; API routes are provided by a separate backend service.
- The app expects valid Supabase credentials for authentication and file uploads.
- `vercel.json` includes SPA rewrite rules so client-side routes resolve to `index.html` in deployment.
