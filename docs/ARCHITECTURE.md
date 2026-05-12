# System Architecture

Last updated: 2026-05-12

## Current Stack

- Runtime: React 18 single-page app built with Vite.
- Hosting: GitHub Pages today, with Vercel documented as the target overhaul host.
- Authentication: Supabase Auth with optional Google OAuth.
- Data: Supabase PostgreSQL when configured, with localStorage as the offline and unauthenticated fallback.
- Charts and icons: Recharts and lucide-react.
- Styling: Custom CSS in `src/styles`, using CSS variables for the fintech dark theme.

## Runtime Flow

1. `src/main.jsx` mounts `App` inside `AuthProvider`.
2. `src/App.jsx` owns the application view state and the finance data object.
3. On load, the app checks Supabase configuration and auth state.
4. Authenticated users load data through `src/services/supabaseSync.js`.
5. Unauthenticated users, failed cloud loads, or unconfigured environments use `src/services/storage.js`.
6. Writes update React state, localStorage backup, and Supabase tables when available.

## Data Domains

- Transactions: income and expense entries that drive balance.
- Budgets: category-level monthly limits.
- Goals: savings targets with current progress.
- Recurring transactions: scheduled income and expenses.
- Planning items: upcoming costs, asset sales, and savings targets.
- Net worth snapshots: spreadsheet-style account balances, MoneyBox values, paycheck, pension, and notes.
- User settings: currency, theme, and balance.

## Supabase Schema

The base schema lives in `supabase/migrations/001_initial_schema.sql`.
The finance planning extension lives in `supabase/migrations/002_finance_planning.sql`.

All user-owned tables use Row Level Security with `auth.uid() = user_id` policies. The app is designed to continue working locally if a new Supabase table has not been migrated yet, but those records will only sync after the migration is applied.

## Deployment

Current production deployment is GitHub Pages through `.github/workflows/deploy.yml`.

Recommended target deployment is Vercel:

- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Supabase redirect URLs should include the Vercel production and preview domains.

## Risks

- `App.jsx` is large and owns most orchestration, which makes feature work harder to isolate.
- Supabase failures are intentionally soft, so missing migrations can hide behind local fallback behavior.
- There is no automated unit test suite yet.
- Some older docs contain mojibake characters from prior encoding issues.
- Design tokens are split across several CSS files and should be consolidated during the overhaul.
