-- SQLite Schema for E-Commerce Order Tracking & Store Management

PRAGMA foreign_keys = ON;

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT 'Cpu',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT DEFAULT 'ASK ENTERPRISES',
    category TEXT NOT NULL,
    price REAL NOT NULL,
    original_price REAL,
    discount_percent REAL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 10,
    stock_status TEXT DEFAULT 'In Stock',
    image TEXT,
    short_description TEXT,
    description TEXT,
    rating REAL DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    specs_json TEXT DEFAULT '{}',
    features_json TEXT DEFAULT '[]',
    warranty TEXT DEFAULT '1 Year Manufacturer Warranty',
    is_featured INTEGER DEFAULT 0,
    is_new_arrival INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category) REFERENCES categories(name) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    customer_city TEXT NOT NULL,
    customer_pincode TEXT NOT NULL,
    subtotal REAL NOT NULL,
    discount REAL DEFAULT 0,
    shipping REAL DEFAULT 0,
    total REAL NOT NULL,
    payment_method TEXT NOT NULL CHECK(payment_method IN ('COD', 'UPI')),
    upi_ref_number TEXT,
    status TEXT NOT NULL DEFAULT 'Confirmed' CHECK(status IN ('Pending', 'Confirmed', 'Packed', 'Dispatched', 'Delivered', 'Cancelled')),
    courier_name TEXT,
    tracking_number TEXT,
    estimated_delivery TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 5. Order Status History / Tracking Logs Table
-- Records every status transition (Confirmed -> Packed -> Dispatched -> Delivered) with precise timestamp & notes
CREATE TABLE IF NOT EXISTS order_status_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    status TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    updated_by TEXT DEFAULT 'System',
    location TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 6. Store Settings Table
CREATE TABLE IF NOT EXISTS store_settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- 7. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning-fast queries and real-time tracking lookups
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_logs_order_id ON order_status_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
