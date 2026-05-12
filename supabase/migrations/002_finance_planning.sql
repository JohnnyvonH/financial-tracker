-- Finance planning and spreadsheet-style net worth tracking

CREATE TABLE IF NOT EXISTS planning_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  item_type VARCHAR(30) NOT NULL CHECK (item_type IN ('expense', 'saving', 'asset-sale')),
  target_amount DECIMAL(12, 2) DEFAULT 0 CHECK (target_amount >= 0),
  saved_amount DECIMAL(12, 2) DEFAULT 0 CHECK (saved_amount >= 0),
  expected_value DECIMAL(12, 2) DEFAULT 0 CHECK (expected_value >= 0),
  due_date DATE,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'saving', 'ready', 'complete')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_planning_items_user_id ON planning_items(user_id);
CREATE INDEX IF NOT EXISTS idx_planning_items_due_date ON planning_items(due_date);
CREATE INDEX IF NOT EXISTS idx_planning_items_status ON planning_items(status);

ALTER TABLE planning_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own planning items"
  ON planning_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own planning items"
  ON planning_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own planning items"
  ON planning_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own planning items"
  ON planning_items FOR DELETE
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS net_worth_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  santander DECIMAL(12, 2) DEFAULT 0,
  tesco DECIMAL(12, 2) DEFAULT 0,
  amex_cashback DECIMAL(12, 2) DEFAULT 0,
  moneybox DECIMAL(12, 2) DEFAULT 0,
  moneybox_stocks_shares_isa DECIMAL(12, 2) DEFAULT 0,
  moneybox_lifetime_isa DECIMAL(12, 2) DEFAULT 0,
  moneybox_simple_saver DECIMAL(12, 2) DEFAULT 0,
  moneybox_cash_isa DECIMAL(12, 2) DEFAULT 0,
  moneybox_monthly DECIMAL(12, 2) DEFAULT 0,
  notes TEXT,
  paycheck DECIMAL(12, 2) DEFAULT 0,
  estimated_bank_next_paycheck DECIMAL(12, 2) DEFAULT 0,
  pension DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_net_worth_snapshots_user_id ON net_worth_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_net_worth_snapshots_date ON net_worth_snapshots(snapshot_date DESC);

ALTER TABLE net_worth_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own net worth snapshots"
  ON net_worth_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own net worth snapshots"
  ON net_worth_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own net worth snapshots"
  ON net_worth_snapshots FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own net worth snapshots"
  ON net_worth_snapshots FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_planning_items_updated_at BEFORE UPDATE ON planning_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_net_worth_snapshots_updated_at BEFORE UPDATE ON net_worth_snapshots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE planning_items IS 'Upcoming finance commitments, asset sales, and savings-plan items';
COMMENT ON TABLE net_worth_snapshots IS 'Spreadsheet-style account, paycheck, MoneyBox, and pension snapshots';
