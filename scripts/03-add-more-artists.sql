-- Add more artists for larger dataset testing
-- Run this after 02-seed-demo-data.sql if you want more test data

-- Add more Rock artists
INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'David Bowie', id, 5, true FROM categories WHERE name = 'Rock'
ON CONFLICT DO NOTHING;

INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'Pink Floyd', id, 6, true FROM categories WHERE name = 'Rock'
ON CONFLICT DO NOTHING;

INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'The Who', id, 7, true FROM categories WHERE name = 'Rock'
ON CONFLICT DO NOTHING;

-- Add more Jazz artists
INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'Charlie Parker', id, 4, true FROM categories WHERE name = 'Jazz'
ON CONFLICT DO NOTHING;

INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'Chet Baker', id, 5, true FROM categories WHERE name = 'Jazz'
ON CONFLICT DO NOTHING;

INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'Thelonious Monk', id, 6, true FROM categories WHERE name = 'Jazz'
ON CONFLICT DO NOTHING;

-- Add more Pop artists
INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'David Bowie', id, 4, true FROM categories WHERE name = 'Pop'
ON CONFLICT DO NOTHING;

INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'Freddie Mercury', id, 5, true FROM categories WHERE name = 'Pop'
ON CONFLICT DO NOTHING;

INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'Whitney Houston', id, 6, true FROM categories WHERE name = 'Pop'
ON CONFLICT DO NOTHING;

-- Add artists to Électronique category
INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'Daft Punk', id, 1, true FROM categories WHERE name = 'Électronique'
ON CONFLICT DO NOTHING;

INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'Aphex Twin', id, 2, true FROM categories WHERE name = 'Électronique'
ON CONFLICT DO NOTHING;

INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'Chemical Brothers', id, 3, true FROM categories WHERE name = 'Électronique'
ON CONFLICT DO NOTHING;

INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'The Prodigy', id, 4, true FROM categories WHERE name = 'Électronique'
ON CONFLICT DO NOTHING;

-- Add artists to Hip-Hop category
INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'Tupac', id, 1, true FROM categories WHERE name = 'Hip-Hop'
ON CONFLICT DO NOTHING;

INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'Notorious B.I.G.', id, 2, true FROM categories WHERE name = 'Hip-Hop'
ON CONFLICT DO NOTHING;

INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'Nas', id, 3, true FROM categories WHERE name = 'Hip-Hop'
ON CONFLICT DO NOTHING;

INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'Jay-Z', id, 4, true FROM categories WHERE name = 'Hip-Hop'
ON CONFLICT DO NOTHING;

-- Add artists to Classique category
INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'Ludwig van Beethoven', id, 1, true FROM categories WHERE name = 'Classique'
ON CONFLICT DO NOTHING;

INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'Wolfgang Amadeus Mozart', id, 2, true FROM categories WHERE name = 'Classique'
ON CONFLICT DO NOTHING;

INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'Johann Sebastian Bach', id, 3, true FROM categories WHERE name = 'Classique'
ON CONFLICT DO NOTHING;

-- Add artists to World category
INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'Ravi Shankar', id, 1, true FROM categories WHERE name = 'World'
ON CONFLICT DO NOTHING;

INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'Oumou Sangaré', id, 2, true FROM categories WHERE name = 'World'
ON CONFLICT DO NOTHING;

INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'Buika', id, 3, true FROM categories WHERE name = 'World'
ON CONFLICT DO NOTHING;

-- Add artists to Reggae category
INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'Bob Marley', id, 1, true FROM categories WHERE name = 'Reggae'
ON CONFLICT DO NOTHING;

INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'Peter Tosh', id, 2, true FROM categories WHERE name = 'Reggae'
ON CONFLICT DO NOTHING;

INSERT INTO artists (name, category_id, performance_order, is_visible)
SELECT 'Burning Spear', id, 3, true FROM categories WHERE name = 'Reggae'
ON CONFLICT DO NOTHING;
