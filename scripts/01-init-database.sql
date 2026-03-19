-- Fimu Voting System Database Schema
-- Initialize all tables and RLS policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Admin Users Table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Jury Members Table
CREATE TABLE jury_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_name TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Artists Table
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  artist_number INTEGER,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category_id, artist_number)
);

-- 5. Voting Sessions Table
CREATE TABLE voting_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'paused', 'closed')),
  category_id UUID REFERENCES categories(id),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Votes Table (Core voting data)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jury_member_id UUID NOT NULL REFERENCES jury_members(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES voting_sessions(id) ON DELETE CASCADE,
  rank_position INTEGER NOT NULL,
  points INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN rank_position = 1 THEN 10
      WHEN rank_position = 2 THEN 8
      WHEN rank_position = 3 THEN 6
      WHEN rank_position = 4 THEN 4
      WHEN rank_position = 5 THEN 2
      ELSE 0
    END
  ) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(jury_member_id, session_id, rank_position)
);

-- 7. Rankings Table (Aggregated results)
CREATE TABLE rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES voting_sessions(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  vote_count INTEGER DEFAULT 0,
  average_rank DECIMAL(10, 2),
  final_rank INTEGER,
  is_finalist BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(artist_id, session_id)
);

-- 8. Excel Sync Logs Table
CREATE TABLE excel_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sync_type TEXT NOT NULL CHECK (sync_type IN ('import', 'export', 'bidirectional')),
  file_name TEXT,
  imported_count INTEGER,
  exported_count INTEGER,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'in_progress')),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  admin_id UUID REFERENCES admin_users(id)
);

-- Create Indexes for performance
CREATE INDEX idx_artists_category_id ON artists(category_id);
CREATE INDEX idx_votes_jury_member_id ON votes(jury_member_id);
CREATE INDEX idx_votes_artist_id ON votes(artist_id);
CREATE INDEX idx_votes_session_id ON votes(session_id);
CREATE INDEX idx_rankings_artist_id ON rankings(artist_id);
CREATE INDEX idx_rankings_session_id ON rankings(session_id);
CREATE INDEX idx_rankings_final_rank ON rankings(final_rank);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jury_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE excel_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Public Access (Jury Voting)
-- Jury members can only see active artists
CREATE POLICY "jury_can_view_active_artists" ON artists
  FOR SELECT
  USING (is_active = true);

-- Jury members can see active categories
CREATE POLICY "jury_can_view_active_categories" ON categories
  FOR SELECT
  USING (is_active = true);

-- Jury members can view their own votes
CREATE POLICY "jury_can_view_own_votes" ON votes
  FOR SELECT
  USING (
    jury_member_id IN (
      SELECT id FROM jury_members WHERE is_active = true
    )
  );

-- Jury members can insert their votes
CREATE POLICY "jury_can_insert_votes" ON votes
  FOR INSERT
  WITH CHECK (
    jury_member_id IN (
      SELECT id FROM jury_members WHERE is_active = true
    )
  );

-- Jury members can update their own votes
CREATE POLICY "jury_can_update_own_votes" ON votes
  FOR UPDATE
  USING (
    jury_member_id IN (
      SELECT id FROM jury_members WHERE is_active = true
    )
  )
  WITH CHECK (
    jury_member_id IN (
      SELECT id FROM jury_members WHERE is_active = true
    )
  );

-- RLS Policies for Admin Access
-- Admin users can manage everything (you'll need to check admin auth token)
CREATE POLICY "admin_can_manage_all" ON categories
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "admin_can_manage_artists" ON artists
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "admin_can_view_rankings" ON rankings
  FOR SELECT
  USING (true);

CREATE POLICY "admin_can_manage_rankings" ON rankings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "admin_can_manage_sessions" ON voting_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to update rankings when votes are inserted/updated
CREATE OR REPLACE FUNCTION update_rankings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO rankings (artist_id, session_id, total_points, vote_count, average_rank)
  VALUES (NEW.artist_id, NEW.session_id, NEW.points, 1, NEW.rank_position)
  ON CONFLICT (artist_id, session_id) DO UPDATE
  SET 
    total_points = total_points + EXCLUDED.points,
    vote_count = vote_count + 1,
    average_rank = (SELECT AVG(rank_position) FROM votes WHERE artist_id = NEW.artist_id AND session_id = NEW.session_id),
    updated_at = CURRENT_TIMESTAMP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rankings
CREATE TRIGGER trigger_update_rankings
AFTER INSERT OR UPDATE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_rankings();

-- Function to calculate final rankings
CREATE OR REPLACE FUNCTION calculate_final_rankings(session_id UUID)
RETURNS void AS $$
BEGIN
  WITH ranked AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY total_points DESC, average_rank ASC) as final_position
    FROM rankings
    WHERE session_id = $1
  )
  UPDATE rankings
  SET final_rank = ranked.final_position
  FROM ranked
  WHERE rankings.id = ranked.id;
END;
$$ LANGUAGE plpgsql;
