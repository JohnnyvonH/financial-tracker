-- Current finances no longer collects estimated next-paycheck or manual spreadsheet totals.
-- Columns are retained for backward compatibility with older rows and deployments.

COMMENT ON COLUMN net_worth_snapshots.estimated_bank_next_paycheck IS 'Deprecated: current finances no longer collects estimated next-paycheck values.';
COMMENT ON COLUMN net_worth_snapshots.total IS 'Deprecated: totals are now calculated by the app from cash, cards, MoneyBox, and pension values.';
COMMENT ON COLUMN net_worth_snapshots.total_value_available_assets IS 'Deprecated: available assets are now calculated by the app.';
COMMENT ON COLUMN net_worth_snapshots.total_value_all_assets IS 'Deprecated: all wealth is now calculated by the app.';
