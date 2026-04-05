# Odoo POS Cafe — Setup Guide

## Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Database Setup
1. Create database: `createdb odoo_pos`
2. Run schema: `psql odoo_pos < db/schema.sql`
3. Run seed:
   ```bash
   cd server
   npm install
   node db/seed.js
   ```

## Environment Setup
```bash
cp server/.env.example server/.env
```
Edit `server/.env`:
  ```env
  DATABASE_URL=postgresql://postgres:password@localhost:5432/odoo_pos
  JWT_SECRET=any_random_secret_32_chars
  CLIENT_URL=http://localhost:5173
  PORT=5000
  ```

## Run the App
**Terminal 1 — Backend:**
  ```bash
  cd server && npm run dev
  ```

**Terminal 2 — Frontend:**
  ```bash
  cd client && npm install && npm run dev
  ```

## Default Login Credentials
- **Admin**: `admin@pos.com` / `admin123`
- **Cashier**: `cashier@pos.com` / `cashier123`
- **Kitchen**: `kitchen@pos.com` / `kitchen123`

## Open the App
- **Main App**: `http://localhost:5173`
- **Kitchen Screen**: `http://localhost:5173/kitchen` (open in separate tab/screen)
- **Customer Display**: `http://localhost:5173/customer-display` (open in separate tab/screen)

## First-Time POS Flow
1. Login as admin
2. Go to **Settings** → click "Open Session" on "Odoo Cafe"
3. You land on the Floor View — click any table
4. Add products to cart, click **Send** (sends to kitchen)
5. Click **Payment** → choose method → Validate
6. Open `/kitchen` in another tab to see live kitchen orders
