# Demo Assets Guide

Last updated: 2026-05-12

This guide tracks the screenshots and demo data used to review Financial Tracker without exposing personal account data.

## Demo Account

Screenshots and end-to-end checks should use the dedicated demo account, not the personal account. The demo account is seeded with realistic recurring income and outgoings, goals, planning items, and current-finance snapshots.

The personal account can remain empty or contain live personal data without affecting these assets.

## Screenshot Set

The current generated screenshots live in `docs/screenshots/`.

| Page | File | Purpose |
| --- | --- | --- |
| Dashboard | `docs/screenshots/dashboard.png` | Main finance cockpit, KPIs, insights, commitments, and recent activity. |
| Current Finances | `docs/screenshots/current-finances.png` | Point-in-time account snapshot and available/unavailable asset breakdown. |
| Budgets | `docs/screenshots/budgets.png` | Monthly outgoings and category controls. |
| Goals | `docs/screenshots/goals.png` | Savings progress, target dates, and priority tracking. |
| Plan | `docs/screenshots/plan.png` | Commitments, asset sales, and forward-looking planning. |
| Reports | `docs/screenshots/reports.png` | Spending and financial trend views. |
| Settings | `docs/screenshots/settings.png` | Cloud sync, theme, currency, and data-management controls. |

## Visual Tour

### Dashboard

![Dashboard](screenshots/dashboard.png)

### Current Finances

![Current finances](screenshots/current-finances.png)

### Plan

![Plan](screenshots/plan.png)

### Goals

![Goals](screenshots/goals.png)

### Budgets

![Budgets](screenshots/budgets.png)

### Reports

![Reports](screenshots/reports.png)

### Settings

![Settings](screenshots/settings.png)

## Regenerating Screenshots

Run the screenshot workflow from the project root:

```bash
npm run screenshots
```

The script starts from the local demo fixture used by Playwright, captures the primary desktop routes, and writes the images back into `docs/screenshots/`.

## Quality Checklist

- [x] Screenshots use demo data only.
- [x] Personal cloud data is not required for documentation.
- [x] Dashboard, current finances, budgets, goals, plan, reports, recurring payments, and settings are covered.
- [x] Images are committed under `docs/screenshots/`.
- [x] README includes the key product screenshots.

## Future Assets

- Add mobile screenshots once mobile-specific navigation is polished.
- Add a short GIF or MP4 walkthrough for dashboard-to-plan workflows.
- Add Vercel preview screenshots when the app is moved from GitHub Pages to Vercel.
