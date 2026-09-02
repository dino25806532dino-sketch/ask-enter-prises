"""
Database connector and schema initialization for SQLite.
"""

import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'ecommerce.db')
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), 'schema.sql')

def get_db_connection():
    """Returns a SQLite connection with Row factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    """Initializes SQLite database tables and default admin user if not exists."""
    conn = get_db_connection()
    with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
        conn.executescript(f.read())
    
    cursor = conn.cursor()
    # Insert default admin user if not exists
    cursor.execute("SELECT id FROM admin_users WHERE username = ?", ('admin',))
    if not cursor.fetchone():
        cursor.execute(
            "INSERT INTO admin_users (username, password_hash) VALUES (?, ?)",
            ('admin', 'ask123')
        )
    
    # Insert default store settings
    default_settings = {
        'storeName': 'ASK ENTERPRISES',
        'whatsappNumber': '919347548525',
        'displayPhone': '9347 54 85 25',
        'address': 'Electronics Market Complex, Hyderabad & Nationwide Shipping',
        'supportEmail': 'sales@askenterprises.in',
        'announcementText': '⚡ ASK ENTERPRISES ELECTRONICS STORE • Order Online & via WhatsApp: 9347 54 85 25',
        'freeShippingThreshold': '999',
        'shippingCharge': '79',
        'upiId': '9347548525@upi',
        'upiName': 'ASK ENTERPRISES',
        'themeColor': 'monochrome'
    }
    
    for key, val in default_settings.items():
        cursor.execute("INSERT OR IGNORE INTO store_settings (key, value) VALUES (?, ?)", (key, str(val)))
        
    conn.commit()
    conn.close()
    print("SQLite database initialized successfully at:", DB_PATH)

if __name__ == '__main__':
    init_db()
