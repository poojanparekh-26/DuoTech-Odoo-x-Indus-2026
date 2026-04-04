
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

DROP TABLE IF EXISTS customer_display_state CASCADE;
DROP TABLE IF EXISTS qr_tokens              CASCADE;
DROP TABLE IF EXISTS payments               CASCADE;
DROP TABLE IF EXISTS kitchen_orders         CASCADE;
DROP TABLE IF EXISTS order_items            CASCADE;
DROP TABLE IF EXISTS orders                 CASCADE;
DROP TABLE IF EXISTS pos_sessions           CASCADE;
DROP TABLE IF EXISTS product_variants       CASCADE;
DROP TABLE IF EXISTS products               CASCADE;
DROP TABLE IF EXISTS categories             CASCADE;
DROP TABLE IF EXISTS tables                 CASCADE;
DROP TABLE IF EXISTS floors                 CASCADE;
DROP TABLE IF EXISTS users                  CASCADE;

DROP TYPE IF EXISTS user_role     CASCADE;
DROP TYPE IF EXISTS order_status  CASCADE;

CREATE TYPE user_role    AS ENUM ('admin', 'cashier', 'waiter', 'kitchen');
CREATE TYPE order_status AS ENUM ('draft', 'confirmed', 'preparing', 'ready', 'completed', 'paid');

CREATE TABLE users (
    id            SERIAL        PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    role          user_role     NOT NULL DEFAULT 'cashier',
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE floors (
    id         SERIAL       PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    sort_order SMALLINT     NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE tables (
    id         SERIAL       PRIMARY KEY,
    floor_id   INT          NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
    table_no   VARCHAR(20)  NOT NULL,
    capacity   SMALLINT     NOT NULL DEFAULT 4 CHECK (capacity > 0),
    is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (floor_id, table_no)
);

CREATE TABLE categories (
    id          SERIAL       PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    sort_order  SMALLINT     NOT NULL DEFAULT 0,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
    id           SERIAL          PRIMARY KEY,
    category_id  INT             NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name         VARCHAR(150)    NOT NULL,
    description  TEXT,
    base_price   NUMERIC(10, 2)  NOT NULL CHECK (base_price >= 0),
    image_url    VARCHAR(500),
    is_available BOOLEAN         NOT NULL DEFAULT TRUE,
    is_active    BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE product_variants (
    id            SERIAL         PRIMARY KEY,
    product_id    INT            NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name          VARCHAR(100)   NOT NULL,          -- e.g. "Large", "Extra Spicy"
    price_delta   NUMERIC(10, 2) NOT NULL DEFAULT 0, -- added to base_price
    is_available  BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, name)
);

CREATE TABLE pos_sessions (
    id            SERIAL         PRIMARY KEY,
    opened_by     INT            NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    closed_by     INT            REFERENCES users(id) ON DELETE SET NULL,
    opening_cash  NUMERIC(10, 2) NOT NULL DEFAULT 0,
    closing_cash  NUMERIC(10, 2),
    opened_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    closed_at     TIMESTAMPTZ,
    is_open       BOOLEAN        NOT NULL DEFAULT TRUE
);

CREATE TABLE orders (
    id           SERIAL          PRIMARY KEY,
    session_id   INT             NOT NULL REFERENCES pos_sessions(id) ON DELETE RESTRICT,
    table_id     INT             REFERENCES tables(id) ON DELETE SET NULL,
    status       order_status    NOT NULL DEFAULT 'draft',
    total_amount NUMERIC(10, 2)  NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    source       VARCHAR(10)     NOT NULL DEFAULT 'pos'
                                     CHECK (source IN ('pos', 'qr', 'online')),
    note         TEXT,
    created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id          SERIAL         PRIMARY KEY,
    order_id    INT            NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  INT            NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id  INT            REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity    INT            NOT NULL CHECK (quantity > 0),
    unit_price  NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal    NUMERIC(10, 2) NOT NULL GENERATED ALWAYS AS (quantity * unit_price) STORED,
    note        TEXT,
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE kitchen_orders (
    id         SERIAL      PRIMARY KEY,
    order_id   INT         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status     VARCHAR(20) NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'accepted', 'preparing', 'done', 'cancelled')),
    note       TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
    id         SERIAL         PRIMARY KEY,
    order_id   INT            NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    method     VARCHAR(10)    NOT NULL CHECK (method IN ('cash', 'card', 'upi')),
    amount     NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    reference  VARCHAR(255),                      -- card/upi transaction reference
    created_at TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE qr_tokens (
    id         SERIAL       PRIMARY KEY,
    table_id   INT          NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    token      VARCHAR(255) NOT NULL UNIQUE,
    is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE customer_display_state (
    id         SERIAL      PRIMARY KEY,
    table_id   INT         NOT NULL REFERENCES tables(id) ON DELETE CASCADE UNIQUE,
    order_id   INT         REFERENCES orders(id) ON DELETE SET NULL,
    payload    JSONB       NOT NULL DEFAULT '{}',  -- flexible display data
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_session        ON orders(session_id);
CREATE INDEX idx_orders_table          ON orders(table_id);
CREATE INDEX idx_orders_status         ON orders(status);
CREATE INDEX idx_order_items_order     ON order_items(order_id);
CREATE INDEX idx_order_items_product   ON order_items(product_id);
CREATE INDEX idx_kitchen_orders_order  ON kitchen_orders(order_id);
CREATE INDEX idx_payments_order        ON payments(order_id);
CREATE INDEX idx_qr_tokens_table       ON qr_tokens(table_id);
CREATE INDEX idx_products_category     ON products(category_id);
CREATE INDEX idx_tables_floor          ON tables(floor_id);

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_users
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_products
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_orders
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_kitchen_orders
    BEFORE UPDATE ON kitchen_orders
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_customer_display
    BEFORE UPDATE ON customer_display_state
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();