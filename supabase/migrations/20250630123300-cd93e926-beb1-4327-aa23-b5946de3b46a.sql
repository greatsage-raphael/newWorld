
-- Create a storage bucket for vehicle photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vehicle-photos', 'vehicle-photos', true);

-- Create storage policies for the vehicle-photos bucket
-- Allow public read access to vehicle photos
CREATE POLICY "Public read access for vehicle photos" ON storage.objects
FOR SELECT USING (bucket_id = 'vehicle-photos');

-- Allow public insert access for vehicle photos
CREATE POLICY "Public insert access for vehicle photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'vehicle-photos');

-- Allow public update access for vehicle photos
CREATE POLICY "Public update access for vehicle photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'vehicle-photos');

-- Allow public delete access for vehicle photos
CREATE POLICY "Public delete access for vehicle photos" ON storage.objects
FOR DELETE USING (bucket_id = 'vehicle-photos');

-- Add vehicle_photo column to loading_charge table
ALTER TABLE loading_charge 
ADD COLUMN vehicle_photo TEXT;
