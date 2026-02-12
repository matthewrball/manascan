-- Community approved products
CREATE TABLE IF NOT EXISTS community_approved (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  scan_count INTEGER NOT NULL DEFAULT 0,
  upvote_count INTEGER NOT NULL DEFAULT 0,
  first_scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_scanned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_product ON community_approved (product_id);
CREATE INDEX IF NOT EXISTS idx_community_votes ON community_approved (upvote_count DESC);

-- Community votes
CREATE TABLE IF NOT EXISTS community_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_product_id UUID NOT NULL REFERENCES community_approved(id) ON DELETE CASCADE,
  device_id VARCHAR(255) NOT NULL,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(community_product_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_community ON community_votes (community_product_id);
CREATE INDEX IF NOT EXISTS idx_votes_device ON community_votes (device_id);

-- RLS for community_approved
ALTER TABLE community_approved ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community products viewable by everyone"
  ON community_approved FOR SELECT
  USING (true);

CREATE POLICY "Community products can be inserted"
  ON community_approved FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Community products can be updated"
  ON community_approved FOR UPDATE
  USING (true);

-- RLS for community_votes
ALTER TABLE community_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes are viewable by everyone"
  ON community_votes FOR SELECT
  USING (true);

CREATE POLICY "Votes can be inserted by anyone"
  ON community_votes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Votes can be updated by owner"
  ON community_votes FOR UPDATE
  USING (true);
