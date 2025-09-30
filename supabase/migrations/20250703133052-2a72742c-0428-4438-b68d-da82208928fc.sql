
-- Add INSERT policy for users table to allow user profile creation
CREATE POLICY "Allow users to create their own profile" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (true);

-- Update existing SELECT policies to be more permissive for Clerk authentication
-- Drop the restrictive policies that don't work with Clerk
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Create more permissive policies for an open app
CREATE POLICY "Allow authenticated users to view user profiles" 
  ON public.users 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow authenticated users to update user profiles" 
  ON public.users 
  FOR UPDATE 
  USING (true);
