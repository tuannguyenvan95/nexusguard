-- Allow teams to record their own treasury ledger entries.
-- (Initial migration only defined SELECT policies; deposits/writes require INSERT.)
CREATE POLICY "Members can insert treasury transactions"
  ON treasury_transactions FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
      UNION
      SELECT id FROM teams WHERE owner_id = auth.uid()
    )
  );
