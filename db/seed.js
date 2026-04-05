// C:/Users/pruthilpatel/Desktop/odoo hacathon/db/seed.js
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/odoo_pos'
});

async function seed() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const cashierPassword = await bcrypt.hash('cashier123', 10);
  const kitchenPassword = await bcrypt.hash('kitchen123', 10);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Users (using parameterized queries for securely hashed passwords)
    const insertUsers = `
      INSERT INTO users (id, name, email, password_hash, role) VALUES 
      ('11111111-1111-1111-1111-111111111111', 'Admin', 'admin@pos.com', $1, 'ADMIN'),
      ('22222222-2222-2222-2222-222222222222', 'Cashier', 'cashier@pos.com', $2, 'CASHIER'),
      ('33333333-3333-3333-3333-333333333333', 'Kitchen', 'kitchen@pos.com', $3, 'KITCHEN')
      ON CONFLICT (email) DO NOTHING;
    `;
    await client.query(insertUsers, [adminPassword, cashierPassword, kitchenPassword]);

    // 2. Categories
    const insertCategories = `
      INSERT INTO categories (id, name, color) VALUES 
      ('10000000-0000-0000-0000-000000000001', 'Quick Bites', '#F59E0B'),
      ('10000000-0000-0000-0000-000000000002', 'Drinks', '#3B82F6'),
      ('10000000-0000-0000-0000-000000000003', 'Dessert', '#EC4899')
      ON CONFLICT DO NOTHING;
    `;
    await client.query(insertCategories);

    // 3. Products
    const insertProducts = `
      INSERT INTO products (id, name, description, price, category_id) VALUES 
      ('20000000-0000-0000-0000-000000000001', 'Burger', 'Classic beef burger', 8.99, '10000000-0000-0000-0000-000000000001'),
      ('20000000-0000-0000-0000-000000000002', 'Fries', 'Crispy french fries', 3.99, '10000000-0000-0000-0000-000000000001'),
      ('20000000-0000-0000-0000-000000000003', 'Sandwich', 'Club sandwich', 7.50, '10000000-0000-0000-0000-000000000001'),
      ('20000000-0000-0000-0000-000000000004', 'Wraps', 'Chicken wrap', 6.99, '10000000-0000-0000-0000-000000000001'),
      ('20000000-0000-0000-0000-000000000005', 'Pizza Slice', 'Cheese pizza slice', 4.50, '10000000-0000-0000-0000-000000000001'),
      ('20000000-0000-0000-0000-000000000006', 'Hot Dog', 'Classic hot dog', 4.00, '10000000-0000-0000-0000-000000000001'),
      ('20000000-0000-0000-0000-000000000007', 'Cola', 'Chilled cola', 1.99, '10000000-0000-0000-0000-000000000002'),
      ('20000000-0000-0000-0000-000000000008', 'Lemonade', 'Fresh lemonade', 2.50, '10000000-0000-0000-0000-000000000002'),
      ('20000000-0000-0000-0000-000000000009', 'Iced Tea', 'Peach iced tea', 2.99, '10000000-0000-0000-0000-000000000002'),
      ('20000000-0000-0000-0000-000000000010', 'Coffee', 'Hot brewed coffee', 2.50, '10000000-0000-0000-0000-000000000002'),
      ('20000000-0000-0000-0000-000000000011', 'Espresso', 'Strong espresso', 3.00, '10000000-0000-0000-0000-000000000002'),
      ('20000000-0000-0000-0000-000000000012', 'Smoothie', 'Berry smoothie', 4.99, '10000000-0000-0000-0000-000000000002'),
      ('20000000-0000-0000-0000-000000000013', 'Cheesecake', 'New York cheesecake', 5.99, '10000000-0000-0000-0000-000000000003'),
      ('20000000-0000-0000-0000-000000000014', 'Brownie', 'Chocolate fudge brownie', 3.50, '10000000-0000-0000-0000-000000000003')
      ON CONFLICT DO NOTHING;
    `;
    await client.query(insertProducts);

    // 4. Product Variant (Coffee - Pack/6/Unit/+$20)
    const insertVariants = `
      INSERT INTO product_variants (id, product_id, attribute, value, unit, extra_price) VALUES
      ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000010', 'Pack', '6', 'Unit', 20.00)
      ON CONFLICT DO NOTHING;
    `;
    await client.query(insertVariants);

    // 5. Payment Methods
    const insertPaymentMethods = `
      INSERT INTO payment_methods (id, name, type, upi_id) VALUES 
      ('50000000-0000-0000-0000-000000000001', 'Cash', 'CASH', NULL),
      ('50000000-0000-0000-0000-000000000002', 'Digital (Bank, Card)', 'DIGITAL', NULL),
      ('50000000-0000-0000-0000-000000000003', 'UPI', 'UPI', 'demo@ybl')
      ON CONFLICT DO NOTHING;
    `;
    await client.query(insertPaymentMethods);

    // 6. POS Configs
    const insertPosConfigs = `
      INSERT INTO pos_configs (id, name, cash_enabled, digital_enabled, upi_enabled, upi_id, floor_enabled) VALUES 
      ('60000000-0000-0000-0000-000000000001', 'Odoo Cafe', true, true, true, 'demo@ybl', true)
      ON CONFLICT DO NOTHING;
    `;
    await client.query(insertPosConfigs);

    // 7. Floors
    const insertFloors = `
      INSERT INTO floors (id, name, pos_id) VALUES 
      ('70000000-0000-0000-0000-000000000001', 'Ground Floor', '60000000-0000-0000-0000-000000000001')
      ON CONFLICT DO NOTHING;
    `;
    await client.query(insertFloors);

    // 8. Tables
    const insertTables = `
      INSERT INTO tables (id, table_number, seats, floor_id, position_x, position_y) VALUES 
      ('80000000-0000-0000-0000-000000000001', 1, 4, '70000000-0000-0000-0000-000000000001', 10, 10),
      ('80000000-0000-0000-0000-000000000002', 2, 6, '70000000-0000-0000-0000-000000000001', 10, 30),
      ('80000000-0000-0000-0000-000000000003', 3, 4, '70000000-0000-0000-0000-000000000001', 10, 50),
      ('80000000-0000-0000-0000-000000000004', 4, 6, '70000000-0000-0000-0000-000000000001', 10, 70),
      ('80000000-0000-0000-0000-000000000005', 5, 4, '70000000-0000-0000-0000-000000000001', 30, 20),
      ('80000000-0000-0000-0000-000000000006', 6, 6, '70000000-0000-0000-0000-000000000001', 30, 40),
      ('80000000-0000-0000-0000-000000000007', 7, 4, '70000000-0000-0000-0000-000000000001', 30, 60)
      ON CONFLICT DO NOTHING;
    `;
    await client.query(insertTables);

    // 9. OPEN Session linked to pos_config and admin user
    const insertSessions = `
      INSERT INTO sessions (id, pos_id, user_id, status, opening_cash, total_sales) VALUES 
      ('90000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'OPEN', 1000.00, 5000.00)
      ON CONFLICT DO NOTHING;
    `;
    await client.query(insertSessions);

    await client.query('COMMIT');
    console.log('Successfully seeded database!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
