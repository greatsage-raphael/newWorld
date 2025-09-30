-- Add time_taken column to loading_charge table to store transit time in minutes
ALTER TABLE public.loading_charge 
ADD COLUMN time_taken NUMERIC;