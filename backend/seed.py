"""
Database seeder for Python Flask + SQLite E-Commerce platform.
Populates realistic initial categories, sample electronics, and demo tracked orders with timestamped history logs.
"""

import json
from datetime import datetime, timedelta
from database import get_db_connection, init_db

def seed_demo_data():
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Seed Categories
    categories = [
        ('Fans', 'Fans', 'Fan', 'Ceiling, Table, BLDC & Exhaust Fans'),
        ('Lights', 'Lights', 'LampCeiling', 'LED Panels, Strip Lights & Track Lights'),
        ('Bulbs', 'Bulbs', 'Lightbulb', 'Smart WiFi, Inverter & Heavy-Lumen Bulbs'),
        ('Digital Locks', 'Digital Locks', 'ShieldCheck', 'Smart Biometric & Keypad Security Safes'),
        ('Switches', 'Switches', 'ToggleRight', 'Modular Touch & Smart Home Automation'),
        ('Wires', 'Wires', 'Cable', 'FR Multi-strand Copper Wires & Cables'),
        ('Electrical Accessories', 'Electrical Accessories', 'Zap', 'Adapters, Sockets, Extensions & Protectors'),
        ('Other Electronics', 'Other Electronics', 'Cpu', 'Stabilizers, Chargers, Smart Hubs & Plugs'),
    ]
    
    for c_id, name, icon, desc in categories:
        cursor.execute(
            "INSERT OR IGNORE INTO categories (id, name, icon, description) VALUES (?, ?, ?, ?)",
            (c_id, name, icon, desc)
        )
        
    # 2. Seed Sample Products
    sample_products = [
        (
            'prod_bldc_fan_01',
            'BLDC 1200mm High Speed Energy Saver Ceiling Fan with Remote',
            'ASK ENTERPRISES',
            'Fans',
            3299.0,
            4999.0,
            34.0,
            18,
            'In Stock',
            'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
            'Super quiet BLDC motor, saves up to 65% electricity with smart speed remote.',
            'High-efficiency brushless DC motor ceiling fan engineered for long run times, zero humming noise, and instant speed presets.',
            4.9,
            42,
            json.dumps({"Blade Span": "1200 mm", "Power Consumption": "28W", "Speed": "370 RPM", "Control": "RF Smart Remote"}),
            json.dumps(["65% Energy Saver", "Copper Winding", "Timer Sleep Mode"]),
            '2 Years On-Site Warranty',
            1,
            1
        ),
        (
            'prod_smart_lock_01',
            'Biometric Smart Door Digital Lock with Keyless RFID & PIN Access',
            'ASK ENTERPRISES',
            'Digital Locks',
            6499.0,
            9999.0,
            35.0,
            12,
            'In Stock',
            'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80',
            'Heavy-duty alloy frame with 0.3s fast biometric recognition and anti-tamper alert.',
            'Modern 5-in-1 digital security lock featuring fingerprint, RFID card, PIN code, manual emergency key, and mobile app unlocking.',
            4.8,
            29,
            json.dumps({"Unlocking Methods": "Fingerprint, PIN, RFID, Key", "Material": "Zinc Alloy", "Battery Life": "12 Months"}),
            json.dumps(["Anti-Theft Alarm", "Emergency USB Charging", "Up to 100 Fingerprints"]),
            '3 Years Replacement Warranty',
            1,
            0
        ),
        (
            'prod_led_panel_01',
            '15W Rimless Round Concealed LED Panel Light (Daylight White)',
            'ASK ENTERPRISES',
            'Lights',
            349.0,
            599.0,
            41.0,
            55,
            'In Stock',
            'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=800&auto=format&fit=crop&q=80',
            'Ultra-slim rimless edge-to-edge illumination with surge protector.',
            'Glare-free optic diffuser panel light for false ceilings and modern home interiors.',
            4.7,
            88,
            json.dumps({"Wattage": "15W", "Color Temp": "6500K Cool Day", "Voltage": "180-265V AC"}),
            json.dumps(["Surge Protection 4kV", "Die-Cast Housing", "Zero Flickering"]),
            '2 Years Warranty',
            0,
            1
        )
    ]
    
    for p in sample_products:
        cursor.execute("""
            INSERT OR REPLACE INTO products (
                id, name, brand, category, price, original_price, discount_percent,
                stock, stock_status, image, short_description, description, rating,
                review_count, specs_json, features_json, warranty, is_featured, is_new_arrival
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, p)
        
    # 3. Seed Demo Tracked Orders with Lifecycle Timestamps
    now = datetime.now()
    demo_orders = [
        {
            "id": "ORD-ASK-948102",
            "name": "Rajesh Sharma",
            "phone": "9876543210",
            "address": "Flat 402, Green Valley Apartments, Banjara Hills",
            "city": "Hyderabad",
            "pincode": "500034",
            "subtotal": 3299.0,
            "total": 3299.0,
            "payment": "UPI",
            "upi_ref": "UPI-7392819042",
            "status": "Dispatched",
            "courier": "BlueDart Express",
            "awb": "BD982741920IN",
            "delivery": "Tomorrow by 6:00 PM",
            "created_at": (now - timedelta(days=2)).isoformat(),
            "items": [
                ("prod_bldc_fan_01", "BLDC 1200mm High Speed Energy Saver Ceiling Fan with Remote", 3299.0, 1, "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80")
            ],
            "logs": [
                ("Confirmed", (now - timedelta(days=2)).isoformat(), "Order placed & verified via UPI.", "System"),
                ("Packed", (now - timedelta(days=1, hours=8)).isoformat(), "Product checked for quality and securely bubble wrapped.", "Warehouse Team"),
                ("Dispatched", (now - timedelta(hours=14)).isoformat(), "Handed over to BlueDart Express (AWB: BD982741920IN). In transit to Hyderabad hub.", "Admin")
            ]
        },
        {
            "id": "ORD-ASK-882194",
            "name": "Priya Varma",
            "phone": "9123456789",
            "address": "Villa 12, Palm Meadows, Whitefield",
            "city": "Bengaluru",
            "pincode": "560066",
            "subtotal": 6499.0,
            "total": 6499.0,
            "payment": "COD",
            "upi_ref": "",
            "status": "Delivered",
            "courier": "Delhivery Logistics",
            "awb": "DEL992817265",
            "delivery": "Delivered",
            "created_at": (now - timedelta(days=4)).isoformat(),
            "items": [
                ("prod_smart_lock_01", "Biometric Smart Door Digital Lock with Keyless RFID & PIN Access", 6499.0, 1, "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80")
            ],
            "logs": [
                ("Confirmed", (now - timedelta(days=4)).isoformat(), "Cash on Delivery order confirmed.", "System"),
                ("Packed", (now - timedelta(days=3, hours=12)).isoformat(), "Items packed in tamper-proof package.", "Warehouse"),
                ("Dispatched", (now - timedelta(days=2)).isoformat(), "Dispatched via Delhivery Logistics (AWB: DEL992817265).", "Admin"),
                ("Delivered", (now - timedelta(hours=6)).isoformat(), "Delivered to Priya Varma at Bengaluru address. Cash received.", "Delivery Executive")
            ]
        },
        {
            "id": "ORD-ASK-773918",
            "name": "Amit Patel",
            "phone": "9988776655",
            "address": "Shop 14, Electronic Market, Station Road",
            "city": "Ahmedabad",
            "pincode": "380001",
            "subtotal": 698.0,
            "total": 777.0,
            "payment": "UPI",
            "upi_ref": "UPI-8849201944",
            "status": "Packed",
            "courier": "DTDC Express",
            "awb": "",
            "delivery": "Within 3-4 business days",
            "created_at": (now - timedelta(hours=18)).isoformat(),
            "items": [
                ("prod_led_panel_01", "15W Rimless Round Concealed LED Panel Light (Daylight White)", 349.0, 2, "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=800&auto=format&fit=crop&q=80")
            ],
            "logs": [
                ("Confirmed", (now - timedelta(hours=18)).isoformat(), "Order confirmed via UPI.", "System"),
                ("Packed", (now - timedelta(hours=4)).isoformat(), "Tested 2x LED panels, packaged in heavy cardboard container.", "Warehouse")
            ]
        }
    ]
    
    for ord_data in demo_orders:
        cursor.execute("""
            INSERT OR REPLACE INTO orders (
                id, customer_name, customer_phone, customer_address, 
                customer_city, customer_pincode, subtotal, discount, 
                shipping, total, payment_method, upi_ref_number, 
                status, courier_name, tracking_number, estimated_delivery, 
                notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            ord_data["id"],
            ord_data["name"],
            ord_data["phone"],
            ord_data["address"],
            ord_data["city"],
            ord_data["pincode"],
            ord_data["subtotal"],
            0,
            0,
            ord_data["total"],
            ord_data["payment"],
            ord_data["upi_ref"],
            ord_data["status"],
            ord_data["courier"],
            ord_data["awb"],
            ord_data["delivery"],
            "",
            ord_data["created_at"],
            ord_data["created_at"]
        ))
        
        # Insert Items
        for item in ord_data["items"]:
            cursor.execute("""
                INSERT OR IGNORE INTO order_items (order_id, product_id, product_name, price, quantity, image)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (ord_data["id"], item[0], item[1], item[2], item[3], item[4]))
            
        # Insert Logs
        for log in ord_data["logs"]:
            cursor.execute("""
                INSERT INTO order_status_logs (order_id, status, timestamp, note, updated_by, location)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (ord_data["id"], log[0], log[1], log[2], log[3], ord_data["city"]))
            
    conn.commit()
    conn.close()
    print("✅ Seeded SQLite database with categories, products, and 3 demo orders with timeline logs!")

if __name__ == '__main__':
    seed_demo_data()
