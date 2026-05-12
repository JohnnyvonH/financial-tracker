-- Optimize finance planning RLS policies so auth.uid() is evaluated once per statement.

DROP POLICY IF EXISTS "Users can view own planning items" ON planning_items;
DROP POLICY IF EXISTS "Users can insert own planning items" ON planning_items;
DROP POLICY IF EXISTS "Users can update own planning items" ON planning_items;
DROP POLICY IF EXISTS "Users can delete own planning items" ON planning_items;

CREATE POLICY "Users can view own planning items"
  ON planning_items FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own planning items"
  ON planning_items FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own planning items"
  ON planning_items FOR UPDATE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own planning items"
  ON planning_items FOR DELETE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own net worth snapshots" ON net_worth_snapshots;
DROP POLICY IF EXISTS "Users can insert own net worth snapshots" ON net_worth_snapshots;
DROP POLICY IF EXISTS "Users can update own net worth snapshots" ON net_worth_snapshots;
DROP POLICY IF EXISTS "Users can delete own net worth snapshots" ON net_worth_snapshots;

CREATE POLICY "Users can view own net worth snapshots"
  ON net_worth_snapshots FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own net worth snapshots"
  ON net_worth_snapshots FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own net worth snapshots"
  ON net_worth_snapshots FOR UPDATE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own net worth snapshots"
  ON net_worth_snapshots FOR DELETE
  USING ((select auth.uid()) = user_id);
