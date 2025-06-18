-- =================================================================
-- RLS (Row Level Security) Policies for CodeSharing Platform
-- This script is idempotent (safe to run multiple times).
-- =================================================================

-- -----------------------------------------------------------------
-- Table: categories
-- -----------------------------------------------------------------

-- 1. Allow read access for all users
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
CREATE POLICY "Enable read access for all users"
ON public.categories FOR SELECT USING (true);

-- 2. Allow insert access for all users
DROP POLICY IF EXISTS "Enable insert for all users" ON public.categories;
CREATE POLICY "Enable insert for all users"
ON public.categories FOR INSERT WITH CHECK (true);

-- 3. Allow update access for all users
DROP POLICY IF EXISTS "Enable update for all users" ON public.categories;
CREATE POLICY "Enable update for all users"
ON public.categories FOR UPDATE USING (true);

-- 4. Allow delete access for all users
DROP POLICY IF EXISTS "Enable delete for all users" ON public.categories;
CREATE POLICY "Enable delete for all users"
ON public.categories FOR DELETE USING (true);


-- -----------------------------------------------------------------
-- Table: invite_codes
-- -----------------------------------------------------------------

-- 1. Allow read access for all users
DROP POLICY IF EXISTS "Enable read access for all users" ON public.invite_codes;
CREATE POLICY "Enable read access for all users"
ON public.invite_codes FOR SELECT USING (true);

-- 2. Allow insert access for all users
DROP POLICY IF EXISTS "Enable insert for all users" ON public.invite_codes;
CREATE POLICY "Enable insert for all users"
ON public.invite_codes FOR INSERT WITH CHECK (true);

-- 3. Allow update access for all users
DROP POLICY IF EXISTS "Enable update for all users" ON public.invite_codes;
CREATE POLICY "Enable update for all users"
ON public.invite_codes FOR UPDATE USING (true);

-- 4. Allow delete access for all users
DROP POLICY IF EXISTS "Enable delete for all users" ON public.invite_codes;
CREATE POLICY "Enable delete for all users"
ON public.invite_codes FOR DELETE USING (true);

-- 查询 'categories' 表的 RLS 策略
SELECT
  p.polname AS policy_name,
  CASE
    WHEN p.polcmd = 'r' THEN 'SELECT'
    WHEN p.polcmd = 'a' THEN 'INSERT'
    WHEN p.polcmd = 'w' THEN 'UPDATE'
    WHEN p.polcmd = 'd' THEN 'DELETE'
    ELSE 'UNKNOWN'
  END AS command,
  pg_get_expr(p.polqual, p.polrelid) AS using_expression,
  pg_get_expr(p.polwithcheck, p.polrelid) AS check_expression,
  s.nspname AS schema_name,
  c.relname AS table_name
FROM
  pg_policy p
JOIN
  pg_class c ON p.polrelid = c.oid
JOIN
  pg_namespace s ON c.relnamespace = s.oid
WHERE
  c.relname = 'categories';

-- 查询 'invite_codes' 表的 RLS 策略
SELECT
  p.polname AS policy_name,
  CASE
    WHEN p.polcmd = 'r' THEN 'SELECT'
    WHEN p.polcmd = 'a' THEN 'INSERT'
    WHEN p.polcmd = 'w' THEN 'UPDATE'
    WHEN p.polcmd = 'd' THEN 'DELETE'
    ELSE 'UNKNOWN'
  END AS command,
  pg_get_expr(p.polqual, p.polrelid) AS using_expression,
  pg_get_expr(p.polwithcheck, p.polrelid) AS check_expression,
  s.nspname AS schema_name,
  c.relname AS table_name
FROM
  pg_policy p
JOIN
  pg_class c ON p.polrelid = c.oid
JOIN
  pg_namespace s ON c.relnamespace = s.oid
WHERE
  c.relname = 'invite_codes'; 