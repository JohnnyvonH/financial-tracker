# Feature Inventory

Last updated: 2026-05-12

## Implemented

- Dashboard KPIs for balance, monthly income, monthly expenses, and upcoming activity.
- Budgets by category with warning states.
- Savings goals with progress controls.
- Recurring transactions with generated entries.
- Reports and spending charts.
- Data export, import, clear-all, and duplicate cleanup.
- Supabase auth, user settings, data migration, and cloud sync for core tables.
- Currency and theme settings.
- Finance Plan page for upcoming commitments, asset sales, and spreadsheet-style net worth snapshots.

## Product Screenshots

The current desktop screenshots are generated from demo data and are stored in `docs/screenshots/`.

| Feature Area | Screenshot |
| --- | --- |
| Dashboard overview and insights | ![Dashboard](screenshots/dashboard.png) |
| Current-finance snapshot | ![Current finances](screenshots/current-finances.png) |
| Budgets and monthly outgoings | ![Budgets](screenshots/budgets.png) |
| Savings goals | ![Goals](screenshots/goals.png) |
| Planning commitments and asset sales | ![Plan](screenshots/plan.png) |
| Reports | ![Reports](screenshots/reports.png) |
| Settings and sync controls | ![Settings](screenshots/settings.png) |

## Finance Plan Scope

The Plan page supports:

- Upcoming services or purchases such as wheel refurbishment.
- Asset sales such as selling a car.
- Savings targets such as a house deposit.
- Target amount, saved amount, expected sale value, due date, priority, status, and notes.
- Net worth snapshots based on the existing spreadsheet columns:
  Date, Santander, Tesco, Amex - Cashback, MoneyBox, MoneyBox - S&S ISA, MoneyBox - Lifetime ISA, MoneyBox - Simple Saver, MoneyBox - Cash ISA, MoneyBox Monthly, Notes, Paycheck, Estimated Bank Next Paycheck, Pension.
- Derived totals for total, available assets, and all assets.

## Partial Or Needs Hardening

- Supabase planning sync requires `002_finance_planning.sql` to be applied.
- Plan items can be added and deleted, but inline editing is not implemented yet.
- Snapshot records can be added and deleted, but import from CSV/XLSX is not implemented yet.
- Reports do not yet include planning items or net worth trend charts.
- There is no Vercel project configuration checked in yet because deployment ownership should be connected in Vercel.

## Recommended Next Features

- Net worth trend chart from snapshots.
- Monthly contribution forecast for house deposit goals.
- Asset sale scenario planner.
- CSV/XLSX import for the existing workbook.
- Rule-based insights that combine budgets, upcoming commitments, and paycheck timing.
- Tests for storage migration, snapshot totals, and Supabase transforms.
