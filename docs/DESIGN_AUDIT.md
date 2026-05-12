# Design Audit

Last updated: 2026-05-12

## Current Direction

The app uses a dark fintech interface with emerald, teal, cyan, red, and amber accents. This fits the financial-tracker theme better than a generic SaaS landing-page style because it keeps attention on balances, progress, and warnings.

## Strengths

- Dense dashboard layout supports repeated financial review.
- Navigation is direct: dashboard, transactions, budget, plan, reports, settings.
- Color semantics are understandable: green for positive, red for spending or deletion, amber for warnings.
- Cards and tables make financial data scannable.
- Mobile rules already collapse key grids.

## Issues

- Several CSS files overlap and should be consolidated into one design-token approach.
- Some cards use large border radii and hover movement that can feel decorative for a finance tool.
- README and some existing docs show encoding corruption.
- The app has several advanced components that are not surfaced evenly in navigation.
- Empty states and forms need more consistent spacing.

## Overhaul Direction

- Keep the dark professional financial theme, but make it calmer and more ledger-like.
- Use compact tables for transactions, snapshots, and recurring obligations.
- Promote planning insights into the dashboard once Plan data exists.
- Prefer segmented controls, icon buttons, and compact forms over large decorative panels.
- Add a Vercel deployment path with preview environments for design review.
- Add accessibility checks for focus states, table labels, and mobile nav overflow.
