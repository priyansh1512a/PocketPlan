# PocketPlan — Day-to-Day Money Management

A friendly, single-page money manager: keep track of accounts, savings goals, monthly budgets, spending, and recurring bills.

## Features

- **Overview** — total balance, spending vs. income this month, budget usage, goal progress, recent activity
- **Accounts** — add checking, savings, cash, or card accounts with balances
- **Goals** — savings goals with progress bars and target dates
- **Budget** — monthly limits per category with live "left to spend" tracking
- **Spending** — log expenses and income, see a per-category breakdown for the month
- **Bills** — recurring bills with due days; mark them paid (optionally deducting from an account and logging a transaction)

Built with React, TypeScript, Tailwind CSS, and Supabase.

## Run locally

1. Install dependencies: `npm install`
2. Provide your Supabase URL and anon key as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (in a `.env` file)
3. Start the dev server: `npm run dev`

## Deploy to GitHub Pages / any static host

The app is a static build — `npm run build` produces a `dist/` folder you can host anywhere.

To deploy on GitHub Pages:

1. Push this repository to GitHub.
2. In the repository settings, enable GitHub Pages from GitHub Actions and use a standard Vite deploy workflow.
3. Add your Supabase URL and anon key as repository secrets/variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) so the build step can include them.

## Database

The Supabase project has five tables: `accounts`, `goals`, `budgets`, `transactions`, and `bills`, all with row level security enabled and open permissive policies (this is a single-user, personal app with no sign-in).
