
-- Create UPDATE policy for loading_charge table
CREATE POLICY "Users can update their own loading charges" 
  ON loading_charge 
  FOR UPDATE 
  USING (user_id = COALESCE(auth.uid()::text, 'anonymous'));

-- Create DELETE policy for loading_charge table
CREATE POLICY "Users can delete their own loading charges" 
  ON loading_charge 
  FOR DELETE 
  USING (user_id = COALESCE(auth.uid()::text, 'anonymous'));
