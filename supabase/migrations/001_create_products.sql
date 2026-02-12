-- Products table: stores product data and analysis results
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode VARCHAR(14) UNIQUE NOT NULL,
  product_name VARCHAR(500) NOT NULL,
  brand VARCHAR(255),
  image_url TEXT,
  ingredients_text TEXT,
  ingredients_parsed JSONB,
  analysis_result VARCHAR(20) NOT NULL DEFAULT 'unknown'
    CHECK (analysis_result IN ('clean', 'flagged', 'unknown')),
  flagged_ingredients JSONB,
  source VARCHAR(50) NOT NULL DEFAULT 'openfoodfacts'
    CHECK (source IN ('openfoodfacts', 'manual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for barcode lookups
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products (barcode);
CREATE INDEX IF NOT EXISTS idx_products_analysis ON products (analysis_result);

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read products
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

-- Allow inserts and updates from authenticated and anon users (API routes)
CREATE POLICY "Products can be inserted by anyone"
  ON products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Products can be updated by anyone"
  ON products FOR UPDATE
  USING (true);
