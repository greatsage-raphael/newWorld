
-- Add distance_travelled column to loading_charge table
ALTER TABLE loading_charge 
ADD COLUMN distance_travelled NUMERIC(10,2);

-- Add comment to explain the column
COMMENT ON COLUMN loading_charge.distance_travelled IS 'Distance travelled between loading and offloading locations in kilometers';
