
-- Create users table with the specified schema
CREATE TABLE public.users (
  user_id TEXT PRIMARY KEY,
  username TEXT,
  firstName TEXT,
  lastName TEXT,
  imageUrl TEXT,
  phoneNumbers JSONB DEFAULT '[]'::jsonb,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile" 
  ON public.users 
  FOR SELECT 
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own profile" 
  ON public.users 
  FOR UPDATE 
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Admin can view all users" 
  ON public.users 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admin can update all users" 
  ON public.users 
  FOR UPDATE 
  USING (true);

-- Insert existing users from loading_charge table into users table
INSERT INTO public.users (user_id, username, firstName, lastName)
SELECT DISTINCT 
  user_id,
  user_id as username,
  driver_name as firstName,
  '' as lastName
FROM public.loading_charge
ON CONFLICT (user_id) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
