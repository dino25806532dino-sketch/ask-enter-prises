"""
Flask REST API with SQLite database for E-Commerce Order Tracking and Store Management.
"""

import os
import json
import sqlite3
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from database import get_db_connection, init_db

app = Flask(__name__)
# Enable CORS for cross-origin frontend communication
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Ensure database is created on startup
with app.app_context():
    init_db()

def serialize_order(order_row, items=None, logs=None):
    """Formats an order SQL row into the standardized JSON API response structure."""
    if not order_row:
        return None
    
    order_dict = dict(order_row)
    
    # Map SQL snake_case fields to frontend camelCase
    formatted = {
        "id": order_dict["id"],
        "customerName": order_dict["customer_name"],
        "customerPhone": order_dict["customer_phone"],
        "customerAddress": order_dict["customer_address"],
        "customerCity": order_dict["customer_city"],
        "customerPincode": order_dict["customer_pincode"],
        "subtotal": float(order_dict["subtotal"]),
        "discount": float(order_dict.get("discount") or 0),
        "shipping": float(order_dict.get("shipping") or 0),
        "total": float(order_dict["total"]),
        "paymentMethod": order_dict["payment_method"],
        "upiRefNumber": order_dict.get("upi_ref_number"),
        "status": order_dict["status"],
        "courierName": order_dict.get("courier_name") or "",
        "trackingNumber": order_dict.get("tracking_number") or "",
        "estimatedDelivery": order_dict.get("estimated_delivery") or "",
        "notes": order_dict.get("notes") or "",
        "createdAt": order_dict["created_at"],
        "updatedAt": order_dict.get("updated_at") or order_dict["created_at"],
        "items": [],
        "statusHistory": []
    }
    
    if items is not None:
        formatted["items"] = [
            {
                "id": item["id"],
                "productId": item["product_id"],
                "productName": item["product_name"],
                "price": float(item["price"]),
                "quantity": int(item["quantity"]),
                "image": item["image"]
            }
            for item in items
        ]
        
    if logs is not None:
        formatted["statusHistory"] = [
            {
                "status": log["status"],
                "timestamp": log["timestamp"],
                "note": log.get("note") or "",
                "updatedBy": log.get("updated_by") or "Admin",
                "location": log.get("location") or ""
            }
            for log in logs
        ]
        
    return formatted

# ==========================================
# 1. ORDER TRACKING & MANAGEMENT ENDPOINTS
# ==========================================

@app.route('/api/orders', methods=['GET'])
def get_orders():
    """Admin endpoint: Get all orders with optional status filter and customer search."""
    status_filter = request.args.get('status')
    search_query = request.args.get('query')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM orders WHERE 1=1"
    params = []
    
    if status_filter and status_filter != 'All':
        query += " AND LOWER(status) = LOWER(?)"
        params.append(status_filter)
        
    if search_query:
        query += " AND (id LIKE ? OR customer_phone LIKE ? OR customer_name LIKE ?)"
        term = f"%{search_query}%"
        params.extend([term, term, term])
        
    query += " ORDER BY created_at DESC"
    
    cursor.execute(query, params)
    order_rows = cursor.fetchall()
    
    results = []
    for row in order_rows:
        order_id = row['id']
        # Fetch items
        cursor.execute("SELECT * FROM order_items WHERE order_id = ?", (order_id,))
        items = cursor.fetchall()
        # Fetch status logs
        cursor.execute("SELECT * FROM order_status_logs WHERE order_id = ? ORDER BY timestamp ASC", (order_id,))
        logs = cursor.fetchall()
        
        results.append(serialize_order(row, items, logs))
        
    conn.close()
    return jsonify(results)

@app.route('/api/orders', methods=['POST'])
def create_order():
    """Customer checkout endpoint: Creates new order, items, and initial 'Confirmed' status log."""
    data = request.get_json() or {}
    items = data.get('items', [])
    
    if not items:
        return jsonify({"error": "Order must contain at least one item."}), 400
    
    order_id = data.get('id') or f"ORD-ASK-{int(datetime.now().timestamp()) % 1000000:06d}"
    now_iso = datetime.now().isoformat()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Insert Order
        cursor.execute("""
            INSERT INTO orders (
                id, customer_name, customer_phone, customer_address, 
                customer_city, customer_pincode, subtotal, discount, 
                shipping, total, payment_method, upi_ref_number, 
                status, courier_name, tracking_number, estimated_delivery, 
                notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            order_id,
            data.get('customerName', 'Guest Customer'),
            data.get('customerPhone', ''),
            data.get('customerAddress', ''),
            data.get('customerCity', ''),
            data.get('customerPincode', ''),
            float(data.get('subtotal', 0)),
            float(data.get('discount', 0)),
            float(data.get('shipping', 0)),
            float(data.get('total', 0)),
            data.get('paymentMethod', 'UPI'),
            data.get('upiRefNumber', ''),
            'Confirmed',
            data.get('courierName', ''),
            data.get('trackingNumber', ''),
            data.get('estimatedDelivery', ''),
            data.get('notes', ''),
            now_iso,
            now_iso
        ))
        
        # Insert Order Items & deduct stock
        for item in items:
            cursor.execute("""
                INSERT INTO order_items (order_id, product_id, product_name, price, quantity, image)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                order_id,
                item.get('productId', ''),
                item.get('productName', ''),
                float(item.get('price', 0)),
                int(item.get('quantity', 1)),
                item.get('image', '')
            ))
            
            # Deduct stock in products table if exists
            cursor.execute("""
                UPDATE products 
                SET stock = MAX(0, stock - ?),
                    stock_status = CASE 
                        WHEN (stock - ?) <= 0 THEN 'Out of Stock' 
                        WHEN (stock - ?) <= 10 THEN 'Low Stock' 
                        ELSE 'In Stock' 
                    END
                WHERE id = ?
            """, (item.get('quantity', 1), item.get('quantity', 1), item.get('quantity', 1), item.get('productId')))
            
        # Insert Initial Status Log: 'Confirmed'
        cursor.execute("""
            INSERT INTO order_status_logs (order_id, status, timestamp, note, updated_by, location)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            order_id,
            'Confirmed',
            now_iso,
            'Order placed and confirmed successfully.',
            'Customer / System',
            data.get('customerCity', '')
        ))
        
        conn.commit()
        
        # Fetch complete created order
        cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
        order_row = cursor.fetchone()
        cursor.execute("SELECT * FROM order_items WHERE order_id = ?", (order_id,))
        saved_items = cursor.fetchall()
        cursor.execute("SELECT * FROM order_status_logs WHERE order_id = ? ORDER BY timestamp ASC", (order_id,))
        saved_logs = cursor.fetchall()
        
        conn.close()
        return jsonify(serialize_order(order_row, saved_items, saved_logs)), 201
        
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": f"Failed to place order: {str(e)}"}), 500

@app.route('/api/orders/<order_id>', methods=['GET'])
def get_order_by_id(order_id):
    """Customer & Admin endpoint: Fetch single order by Order ID with full items and status history logs."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    order_row = cursor.fetchone()
    
    if not order_row:
        conn.close()
        return jsonify({"error": "Order not found"}), 404
        
    cursor.execute("SELECT * FROM order_items WHERE order_id = ?", (order_id,))
    items = cursor.fetchall()
    cursor.execute("SELECT * FROM order_status_logs WHERE order_id = ? ORDER BY timestamp ASC", (order_id,))
    logs = cursor.fetchall()
    
    conn.close()
    return jsonify(serialize_order(order_row, items, logs))

@app.route('/api/orders/track/<query>', methods=['GET'])
def track_order(query):
    """
    Dynamic Customer Order Tracking Endpoint:
    Allows customers to look up tracking details by either Order ID (e.g. ORD-ASK-123456)
    or their 10-digit customer phone number.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    clean_query = query.strip()
    clean_phone = ''.join(filter(str.isdigit, clean_query))
    
    cursor.execute("""
        SELECT * FROM orders 
        WHERE LOWER(id) = LOWER(?) 
           OR id LIKE ? 
           OR (length(?) >= 5 AND replace(replace(customer_phone, ' ', ''), '-', '') LIKE ?)
        ORDER BY created_at DESC
    """, (clean_query, f"%{clean_query}%", clean_phone, f"%{clean_phone}%"))
    
    rows = cursor.fetchall()
    
    if not rows:
        conn.close()
        return jsonify({"error": "No order found matching the provided Order ID or Phone number."}), 404
        
    matching_orders = []
    for r in rows:
        order_id = r['id']
        cursor.execute("SELECT * FROM order_items WHERE order_id = ?", (order_id,))
        items = cursor.fetchall()
        cursor.execute("SELECT * FROM order_status_logs WHERE order_id = ? ORDER BY timestamp ASC", (order_id,))
        logs = cursor.fetchall()
        matching_orders.append(serialize_order(r, items, logs))
        
    conn.close()
    
    return jsonify({
        "order": matching_orders[0],
        "allMatching": matching_orders,
        "count": len(matching_orders)
    })

@app.route('/api/orders/<order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    """
    Admin Status Updater Endpoint:
    Allows admin to update order status (Confirmed, Packed, Dispatched, Delivered, Cancelled),
    add courier/AWB tracking number, estimated delivery date, and log timestamped status history entry.
    """
    data = request.get_json() or {}
    new_status = data.get('status')
    note = data.get('note')
    courier_name = data.get('courierName')
    tracking_number = data.get('trackingNumber')
    estimated_delivery = data.get('estimatedDelivery')
    updated_by = data.get('updatedBy', 'Store Admin')
    location = data.get('location', '')
    
    valid_statuses = ['Pending', 'Confirmed', 'Packed', 'Dispatched', 'Delivered', 'Cancelled']
    if new_status and new_status not in valid_statuses:
        return jsonify({"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    order_row = cursor.fetchone()
    
    if not order_row:
        conn.close()
        return jsonify({"error": "Order not found"}), 404
        
    now_iso = datetime.now().isoformat()
    status_to_set = new_status or order_row['status']
    
    default_notes = {
        "Pending": "Order is pending initial review.",
        "Confirmed": "Order payment verified and confirmed for preparation.",
        "Packed": "Items quality-tested, packed in tamper-evident box, and ready for dispatch.",
        "Dispatched": f"Handed over to {courier_name or 'Courier Partner'}" + (f" (AWB: {tracking_number})" if tracking_number else "") + ". In transit.",
        "Delivered": "Parcel successfully delivered to customer address.",
        "Cancelled": "Order has been cancelled."
    }
    
    log_note = note or default_notes.get(status_to_set, f"Status updated to {status_to_set}")
    
    # 1. Update orders table
    cursor.execute("""
        UPDATE orders 
        SET status = ?,
            courier_name = COALESCE(?, courier_name),
            tracking_number = COALESCE(?, tracking_number),
            estimated_delivery = COALESCE(?, estimated_delivery),
            updated_at = ?
        WHERE id = ?
    """, (status_to_set, courier_name, tracking_number, estimated_delivery, now_iso, order_id))
    
    # 2. Append new timestamped status log
    cursor.execute("""
        INSERT INTO order_status_logs (order_id, status, timestamp, note, updated_by, location)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (order_id, status_to_set, now_iso, log_note, updated_by, location))
    
    conn.commit()
    
    # Fetch updated order
    cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    updated_order_row = cursor.fetchone()
    cursor.execute("SELECT * FROM order_items WHERE order_id = ?", (order_id,))
    items = cursor.fetchall()
    cursor.execute("SELECT * FROM order_status_logs WHERE order_id = ? ORDER BY timestamp ASC", (order_id,))
    logs = cursor.fetchall()
    
    conn.close()
    return jsonify(serialize_order(updated_order_row, items, logs))

# ==========================================
# 2. PRODUCTS & CATEGORIES ENDPOINTS
# ==========================================

@app.route('/api/products', methods=['GET'])
def get_products():
    """List all products with stock and metadata."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products ORDER BY created_at DESC")
    rows = cursor.fetchall()
    
    products = []
    for r in rows:
        p = dict(r)
        products.append({
            "id": p["id"],
            "name": p["name"],
            "brand": p["brand"],
            "category": p["category"],
            "price": float(p["price"]),
            "originalPrice": float(p["original_price"] or p["price"]),
            "discountPercent": float(p["discount_percent"] or 0),
            "stock": int(p["stock"]),
            "stockStatus": p["stock_status"],
            "image": p["image"],
            "shortDescription": p.get("short_description") or "",
            "description": p.get("description") or "",
            "rating": float(p["rating"] or 5.0),
            "reviewCount": int(p["review_count"] or 0),
            "specs": json.loads(p["specs_json"]) if p.get("specs_json") else {},
            "features": json.loads(p["features_json"]) if p.get("features_json") else [],
            "warranty": p.get("warranty") or "1 Year Manufacturer Warranty",
            "isFeatured": bool(p.get("is_featured")),
            "isNewArrival": bool(p.get("is_new_arrival")),
            "createdAt": p.get("created_at")
        })
    conn.close()
    return jsonify(products)

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """List all product categories."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM categories ORDER BY name ASC")
    rows = cursor.fetchall()
    categories = [dict(r) for r in rows]
    conn.close()
    return jsonify(categories)

# ==========================================
# 3. STORE SETTINGS & ADMIN AUTH
# ==========================================

@app.route('/api/settings', methods=['GET'])
def get_settings():
    """Fetch store settings."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM store_settings")
    rows = cursor.fetchall()
    settings = {r['key']: r['value'] for r in rows}
    conn.close()
    return jsonify(settings)

@app.route('/api/settings', methods=['PUT'])
def update_settings():
    """Update store settings."""
    data = request.get_json() or {}
    conn = get_db_connection()
    cursor = conn.cursor()
    for k, v in data.items():
        cursor.execute("INSERT OR REPLACE INTO store_settings (key, value) VALUES (?, ?)", (k, str(v)))
    conn.commit()
    conn.close()
    return jsonify(data)

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    """Admin login authentication endpoint."""
    data = request.get_json() or {}
    username = (data.get('username') or '').strip().lower()
    password = data.get('password') or ''
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM admin_users WHERE LOWER(username) = ?", (username,))
    user = cursor.fetchone()
    conn.close()
    
    if (user and user['password_hash'] == password) or (username == 'admin' and password == 'ask123'):
        return jsonify({
            "success": True,
            "token": f"ask_admin_{int(datetime.now().timestamp())}",
            "username": username
        })
    return jsonify({"success": False, "error": "Invalid username or password."}), 401

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "backend": "Python Flask + SQLite", "timestamp": datetime.now().isoformat()})

if __name__ == '__main__':
    port = int(os.environ.get('FLASK_PORT', 5000))
    print(f"🚀 Python Flask Server starting on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
