-- Store configurable Current Finances templates and dynamic snapshot entries.

ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS snapshot_template JSONB;

ALTER TABLE net_worth_snapshots
  ADD COLUMN IF NOT EXISTS snapshot_entries JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN user_settings.snapshot_template IS 'User-editable Current Finances sections and account template.';
COMMENT ON COLUMN net_worth_snapshots.snapshot_entries IS 'Dynamic Current Finances entry values captured for this dated snapshot.';
