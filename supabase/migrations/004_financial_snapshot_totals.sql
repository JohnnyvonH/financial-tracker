-- Preserve spreadsheet-entered snapshot totals alongside calculated values.

ALTER TABLE net_worth_snapshots
  ADD COLUMN IF NOT EXISTS total DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS total_value_available_assets DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS total_value_all_assets DECIMAL(12, 2);

ALTER TABLE net_worth_snapshots
  ALTER COLUMN total DROP DEFAULT,
  ALTER COLUMN total_value_available_assets DROP DEFAULT,
  ALTER COLUMN total_value_all_assets DROP DEFAULT;

COMMENT ON COLUMN net_worth_snapshots.total IS 'Spreadsheet-entered Total value. If blank in the app, the UI calculates a fallback total.';
COMMENT ON COLUMN net_worth_snapshots.total_value_available_assets IS 'Spreadsheet-entered Total Value of Available Assets.';
COMMENT ON COLUMN net_worth_snapshots.total_value_all_assets IS 'Spreadsheet-entered Total Value of all Assets.';
