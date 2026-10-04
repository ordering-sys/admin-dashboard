-- Row Level Security Policies for Admin Dashboard
-- Run this in your Supabase SQL Editor

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Tables: Allow all operations for anon users (public access for admin)
-- NOTE: In production, you should add authentication and restrict this
CREATE POLICY "Allow all access to tables" ON tables
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Menu Items: Allow all operations
CREATE POLICY "Allow all access to menu_items" ON menu_items
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Orders: Allow all operations
CREATE POLICY "Allow all access to orders" ON orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Alternative: If you want to restrict to authenticated users only:
-- DROP POLICY "Allow all access to tables" ON tables;
-- CREATE POLICY "Authenticated users can manage tables" ON tables
--   FOR ALL
--   TO authenticated
--   USING (true)
--   WITH CHECK (true);
