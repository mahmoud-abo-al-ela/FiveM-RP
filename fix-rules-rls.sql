-- Drop existing policies for rule_categories and rules
DROP POLICY IF EXISTS "Rule categories are publicly readable" ON rule_categories;
DROP POLICY IF EXISTS "Authenticated users can manage rule categories" ON rule_categories;
DROP POLICY IF EXISTS "Rules are publicly readable" ON rules;
DROP POLICY IF EXISTS "Authenticated users can manage rules" ON rules;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rule categories: Public read, admin write
CREATE POLICY "Rule categories are publicly readable" ON rule_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert rule categories" ON rule_categories
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update rule categories" ON rule_categories
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete rule categories" ON rule_categories
  FOR DELETE USING (is_admin());

-- Rules: Public read, admin write
CREATE POLICY "Rules are publicly readable" ON rules
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert rules" ON rules
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update rules" ON rules
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete rules" ON rules
  FOR DELETE USING (is_admin());
