-- Add material column to loading_charge table
ALTER TABLE public.loading_charge 
ADD COLUMN material TEXT;