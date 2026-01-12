-- Admin RLS Policies for user_programs table
-- Allows specific admin emails to insert and delete user program access

-- Enable RLS on user_programs if not already enabled
ALTER TABLE user_programs ENABLE ROW LEVEL SECURITY;

-- Policy to allow admins to insert into user_programs
CREATE POLICY "Admins can grant program access"
ON user_programs
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'email' IN (
    'felipe@ai-thinking.io',
    'felipe@neuroboost.ai',
    'contacto@neuroboost.ai',
    'facatalan@gmail.com'
  )
);

-- Policy to allow admins to delete from user_programs
CREATE POLICY "Admins can revoke program access"
ON user_programs
FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'email' IN (
    'felipe@ai-thinking.io',
    'felipe@neuroboost.ai',
    'contacto@neuroboost.ai',
    'facatalan@gmail.com'
  )
);

-- Policy to allow users to view their own program access
CREATE POLICY "Users can view their own program access"
ON user_programs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy to allow admins to view all program access
CREATE POLICY "Admins can view all program access"
ON user_programs
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' IN (
    'felipe@ai-thinking.io',
    'felipe@neuroboost.ai',
    'contacto@neuroboost.ai',
    'facatalan@gmail.com'
  )
);
