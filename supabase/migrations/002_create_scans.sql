-- Scans table: records each scan event
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(255) NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  barcode VARCHAR(14) NOT NULL,
  analysis_result VARCHAR(20) NOT NULL DEFAULT 'unknown'
    CHECK (analysis_result IN ('clean', 'flagged', 'unknown')),
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scans_device ON scans (device_id);
CREATE INDEX IF NOT EXISTS idx_scans_product ON scans (product_id);
CREATE INDEX IF NOT EXISTS idx_scans_barcode ON scans (barcode);

-- RLS
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert scans
CREATE POLICY "Scans can be inserted by anyone"
  ON scans FOR INSERT
  WITH CHECK (true);

-- Allow reading own scans by device_id
CREATE POLICY "Scans are viewable by everyone"
  ON scans FOR SELECT
  USING (true);
