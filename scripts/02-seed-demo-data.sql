-- Seed demo data for Fimu voting system
-- Run this after 01-init-database.sql

-- Insert admin user
-- Password: admin123 (sha256 hash)
INSERT INTO admin_users (email, password_hash, full_name, role, is_active)
VALUES ('admin@fimu.local', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'Admin Fimu', 'admin', true)
ON CONFLICT DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name, description, order_index, is_active) VALUES
  ('Rock', 'Catégorie Rock', 1, true),
  ('Jazz', 'Catégorie Jazz', 2, true),
  ('Électronique', 'Catégorie Électronique', 3, true),
  ('Pop', 'Catégorie Pop', 4, true),
  ('Hip-Hop', 'Catégorie Hip-Hop', 5, true),
  ('Classique', 'Catégorie Classique', 6, true),
  ('World', 'Catégorie World', 7, true),
  ('Reggae', 'Catégorie Reggae', 8, true)
ON CONFLICT (name) DO NOTHING;

-- Insert sample jury members with PINs
-- PIN: 1234 -> bcrypt hash
-- Using simple hashes for demo: These should be bcrypt hashed in production
INSERT INTO jury_members (member_name, pin_hash, email, is_active) VALUES
  ('Juré 1', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890', 'jury1@fimu.local', true),
  ('Juré 2', '$2a$10$abcdefghijklmnopqrstuvwxyz1234568890', 'jury2@fimu.local', true),
  ('Juré 3', '$2a$10$abcdefghijklmnopqrstuvwxyz1234569890', 'jury3@fimu.local', true),
  ('Juré 4', '$2a$10$abcdefghijklmnopqrstuvwxyz1234560890', 'jury4@fimu.local', true),
  ('Juré 5', '$2a$10$abcdefghijklmnopqrstuvwxyz1234561890', 'jury5@fimu.local', true)
ON CONFLICT DO NOTHING;

-- Insert sample artists for Rock category
INSERT INTO artists (name, category_id, artist_number, is_active) 
SELECT 'The Beatles', id, 1, true FROM categories WHERE name = 'Rock'
ON CONFLICT (category_id, artist_number) DO NOTHING;

INSERT INTO artists (name, category_id, artist_number, is_active)
SELECT 'The Rolling Stones', id, 2, true FROM categories WHERE name = 'Rock'
ON CONFLICT (category_id, artist_number) DO NOTHING;

INSERT INTO artists (name, category_id, artist_number, is_active)
SELECT 'Queen', id, 3, true FROM categories WHERE name = 'Rock'
ON CONFLICT (category_id, artist_number) DO NOTHING;

INSERT INTO artists (name, category_id, artist_number, is_active)
SELECT 'Led Zeppelin', id, 4, true FROM categories WHERE name = 'Rock'
ON CONFLICT (category_id, artist_number) DO NOTHING;

-- Insert sample artists for Jazz category
INSERT INTO artists (name, category_id, artist_number, is_active)
SELECT 'Miles Davis', id, 1, true FROM categories WHERE name = 'Jazz'
ON CONFLICT (category_id, artist_number) DO NOTHING;

INSERT INTO artists (name, category_id, artist_number, is_active)
SELECT 'John Coltrane', id, 2, true FROM categories WHERE name = 'Jazz'
ON CONFLICT (category_id, artist_number) DO NOTHING;

INSERT INTO artists (name, category_id, artist_number, is_active)
SELECT 'Ella Fitzgerald', id, 3, true FROM categories WHERE name = 'Jazz'
ON CONFLICT (category_id, artist_number) DO NOTHING;

-- Insert sample artists for Pop category
INSERT INTO artists (name, category_id, artist_number, is_active)
SELECT 'Michael Jackson', id, 1, true FROM categories WHERE name = 'Pop'
ON CONFLICT (category_id, artist_number) DO NOTHING;

INSERT INTO artists (name, category_id, artist_number, is_active)
SELECT 'Madonna', id, 2, true FROM categories WHERE name = 'Pop'
ON CONFLICT (category_id, artist_number) DO NOTHING;

INSERT INTO artists (name, category_id, artist_number, is_active)
SELECT 'Prince', id, 3, true FROM categories WHERE name = 'Pop'
ON CONFLICT (category_id, artist_number) DO NOTHING;

-- Insert a voting session
INSERT INTO voting_sessions (name, status, start_time)
VALUES ('Fimu 2026', 'open', NOW())
ON CONFLICT DO NOTHING;
