# Python Flask + SQLite E-Commerce Backend & Order Tracking System

This folder contains the complete, production-ready Python Flask backend with an SQLite database for the E-Commerce store, featuring a real-time **Order Tracking Engine** and an **Admin Lifecycle Status Updater**.

---

## 🛠️ Tech Stack & Architecture

- **Web Framework**: Python 3.9+ with [Flask](https://flask.palletsprojects.com/)
- **CORS**: `flask-cors`
- **Database**: SQLite3 with foreign key enforcement and indexed lookups
- **Authentication**: Admin session credentials verification

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Seed Database (Optional / Recommended)
Populates initial sample categories, products, and test tracked orders with complete timestamp histories:
```bash
python seed.py
```

### 3. Run the Flask Server
```bash
python app.py
```
*Server will start on `http://127.0.0.1:5000`.*

---

## 📡 REST API Reference

### 📦 Order Tracking & Management

#### 1. Track Order by Order ID or Customer Phone
`GET /api/orders/track/<query>`
- **Example**: `GET /api/orders/track/ORD-ASK-948102` or `GET /api/orders/track/9876543210`
- **Response**:
```json
{
  "order": {
    "id": "ORD-ASK-948102",
    "customerName": "Rajesh Sharma",
    "customerPhone": "9876543210",
    "status": "Dispatched",
    "courierName": "BlueDart Express",
    "trackingNumber": "BD982741920IN",
    "estimatedDelivery": "Tomorrow by 6:00 PM",
    "items": [...],
    "statusHistory": [
      {
        "status": "Confirmed",
        "timestamp": "2026-08-30T10:30:00.000Z",
        "note": "Order placed & verified via UPI.",
        "updatedBy": "System"
      },
      {
        "status": "Packed",
        "timestamp": "2026-08-31T09:15:00.000Z",
        "note": "Product quality-inspected and securely packaged.",
        "updatedBy": "Warehouse Team"
      },
      {
        "status": "Dispatched",
        "timestamp": "2026-08-31T18:00:00.000Z",
        "note": "Handed over to BlueDart Express (AWB: BD982741920IN).",
        "updatedBy": "Admin"
      }
    ]
  }
}
```

#### 2. Admin: Update Order Status & Add Tracking Log
`PUT /api/orders/<order_id>/status`
- **Body**:
```json
{
  "status": "Dispatched",
  "note": "Package handed over to BlueDart courier at Hyderabad hub.",
  "courierName": "BlueDart Express",
  "trackingNumber": "BD982741920IN",
  "estimatedDelivery": "Tomorrow by 6:00 PM",
  "updatedBy": "Store Admin"
}
```
- **Allowed Statuses**: `Confirmed`, `Packed`, `Dispatched`, `Delivered`, `Cancelled`

#### 3. Place New Order
`POST /api/orders`

#### 4. List All Orders (Admin with Status Filter)
`GET /api/orders?status=Dispatched&query=Rajesh`

---

## 🗄️ SQLite Database Tables
- `orders`: Core order information, customer delivery address, total amount, courier, and current status.
- `order_items`: Line items with product name, price, quantity, and thumbnail.
- `order_status_logs`: Append-only audit log tracking every lifecycle change (`Confirmed` ➔ `Packed` ➔ `Dispatched` ➔ `Delivered`) with exact timestamps and notes.
- `products`: Product catalog with pricing, stock status, specs, and warranties.
- `categories`: Product category definitions.
- `store_settings`: Business name, contact, UPI configuration, and shipping policies.
- `admin_users`: Admin credentials.
