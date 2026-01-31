-- Allow admins to update orders
DROP POLICY IF EXISTS "Admins update orders" ON online_orders;

CREATE POLICY "Admins update orders"
  ON online_orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
