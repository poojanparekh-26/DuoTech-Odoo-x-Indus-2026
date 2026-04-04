-- =============================================================
--  Restaurant POS System — Seed Data
--  Credentials  →  admin@duotech.com  /  Admin@1234
--  bcrypt hash generated with 12 rounds
-- =============================================================

BEGIN;

-- ── 1. Users (1 admin) ────────────────────────────────────────
-- Password: Admin@1234
INSERT INTO users (name, email, password_hash, role) VALUES
(
  'Admin User',
  'admin@duotech.com',
  '$2b$12$eImiTXuWVxfM37uY4JANjOe5XEJQkXkXMgqKzFzWdY6b71HnChAuq',
  'admin'
);

-- ── 2. Floors (2) ─────────────────────────────────────────────
INSERT INTO floors (name, sort_order) VALUES
  ('Ground Floor', 1),
  ('First Floor',  2);

-- ── 3. Tables (6 — 3 per floor) ──────────────────────────────
INSERT INTO tables (floor_id, table_no, capacity) VALUES
  (1, 'G-01', 2),
  (1, 'G-02', 4),
  (1, 'G-03', 6),
  (2, 'F-01', 4),
  (2, 'F-02', 4),
  (2, 'F-03', 8);

-- ── 4. Categories (3) ─────────────────────────────────────────
INSERT INTO categories (name, description, sort_order) VALUES
  ('Starters',   'Appetizers and finger food',         1),
  ('Main Course','Primary dishes and rice preparations', 2),
  ('Beverages',  'Hot and cold drinks',                3);

-- ── 5. Products (5) ───────────────────────────────────────────
INSERT INTO products (category_id, name, description, base_price) VALUES
  (1, 'Paneer Tikka',        'Marinated cottage cheese grilled in tandoor',    220.00),
  (1, 'Veg Spring Rolls',    'Crispy rolls stuffed with seasoned vegetables',  150.00),
  (2, 'Butter Chicken',      'Tender chicken in a rich tomato-butter sauce',   320.00),
  (2, 'Dal Tadka',           'Yellow lentils tempered with cumin and garlic',  180.00),
  (3, 'Fresh Lime Soda',     'Freshly squeezed lime with soda and mint',        80.00);

-- ── 6. Product Variants (10) ──────────────────────────────────
-- Paneer Tikka (product_id = 1)
INSERT INTO product_variants (product_id, name, price_delta) VALUES
  (1, 'Regular (250g)',  0.00),
  (1, 'Large (500g)',   100.00);

-- Veg Spring Rolls (product_id = 2)
INSERT INTO product_variants (product_id, name, price_delta) VALUES
  (2, '4 Pieces',   0.00),
  (2, '8 Pieces',  120.00);

-- Butter Chicken (product_id = 3)
INSERT INTO product_variants (product_id, name, price_delta) VALUES
  (3, 'Half',    0.00),
  (3, 'Full',  150.00);

-- Dal Tadka (product_id = 4)
INSERT INTO product_variants (product_id, name, price_delta) VALUES
  (4, 'Regular', 0.00),
  (4, 'Jain (no onion/garlic)', 20.00);

-- Fresh Lime Soda (product_id = 5)
INSERT INTO product_variants (product_id, name, price_delta) VALUES
  (5, 'Sweet',  0.00),
  (5, 'Salted', 0.00);

COMMIT;
