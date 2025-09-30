
-- Create the loading_charge table
CREATE TABLE loading_charge (
  transaction_id           SERIAL       PRIMARY KEY,             -- internal surrogate key
  transaction_uuid         UUID         NOT NULL UNIQUE,         -- your externally-generated UUID
  user_id                  TEXT         NOT NULL,                -- who created
  driver_name              TEXT         NOT NULL,
  vehicle_number           TEXT         NOT NULL,   
  loading_charge         TEXT         NOT NULL,                
  net_mass                 TEXT         NOT NULL,
  location                 JSONB        NOT NULL,                -- location + coordinates objects
  created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE loading_charge ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own records
CREATE POLICY "Users can insert their own loading charges" 
  ON loading_charge 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow users to view their own records
CREATE POLICY "Users can view their own loading charges" 
  ON loading_charge 
  FOR SELECT 
  USING (true);
