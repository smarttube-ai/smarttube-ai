-- Add the exact policy needed to fix the RLS issue
CREATE POLICY "Allow all inserts to profiles"
ON profiles FOR INSERT
WITH CHECK (true); 