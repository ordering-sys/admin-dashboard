-- Complete admin dashboard user and role setup for Supabase SQL Editor.
-- Safe to run for a new database or an existing admin_users table.
-- Existing users without a role become admins. Legacy kitchen users become chefs.
-- The application uses the service role only on the server for this table.

BEGIN;

CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) NOT NULL UNIQUE,
  password_hash varchar(255) NOT NULL,
  name varchar(255) NOT NULL,
  role varchar(20) NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS role varchar(20) NOT NULL DEFAULT 'admin';

-- Remove the previous two-role constraint before converting legacy values.
ALTER TABLE public.admin_users
  DROP CONSTRAINT IF EXISTS admin_users_role_check;

UPDATE public.admin_users
SET role = 'chef'
WHERE role = 'kitchen';

ALTER TABLE public.admin_users
  ADD CONSTRAINT admin_users_role_check
  CHECK (role IN ('admin', 'cashier', 'chef'));

CREATE INDEX IF NOT EXISTS idx_admin_users_email
  ON public.admin_users (email);

CREATE OR REPLACE FUNCTION public.set_admin_users_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_admin_users_updated_at();

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Browser clients must not read password hashes or write staff accounts.
REVOKE ALL ON public.admin_users FROM anon, authenticated;
GRANT ALL ON public.admin_users TO service_role;

DROP POLICY IF EXISTS "Service role can manage admin users" ON public.admin_users;
CREATE POLICY "Service role can manage admin users"
  ON public.admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMIT;

-- First admin account: insert a bcrypt hash generated outside SQL, then sign in.
-- Do not put a plaintext password in a migration file.
-- INSERT INTO public.admin_users (email, password_hash, name, role)
-- VALUES ('admin@example.com', '<bcrypt-hash>', 'Initial Admin', 'admin');
-- After signing in, create cashier and chef accounts on the Users page.
