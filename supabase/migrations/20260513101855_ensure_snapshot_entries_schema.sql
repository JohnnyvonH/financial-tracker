-- Ensure configurable Current Finances data can be persisted in Supabase.

ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS snapshot_template JSONB;

ALTER TABLE public.net_worth_snapshots
  ADD COLUMN IF NOT EXISTS snapshot_entries JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.user_settings.snapshot_template IS 'User-editable Current Finances sections and account template.';
COMMENT ON COLUMN public.net_worth_snapshots.snapshot_entries IS 'Dynamic Current Finances entry values captured for this dated snapshot.';
