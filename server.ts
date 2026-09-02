import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure DB directory and initial structure exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

interface DatabaseSchema {
  products: any[];
  categories: any[];
  orders: any[];
  settings: any;
  adminUsers: { username: string; passwordHash: string }[];
}

const DEFAULT_CATEGORIES = [
  { id: 'Air Conditioners', name: 'Air Conditioners', icon: 'Wind', description: 'Split, Inverter & 5-Star Energy Saver ACs from Daikin & Voltas' },
  { id: 'Fans', name: 'Fans', icon: 'Fan', description: 'Ceiling, BLDC Remote, Exhaust & Ventilation Fans from Usha & Luker' },
  { id: 'Home Appliances', name: 'Home Appliances', icon: 'UtensilsCrossed', description: 'Geysers, Instant Water Heaters, Mixer Grinders & Gas Stoves' },
  { id: 'Digital Lockers', name: 'Digital Lockers', icon: 'ShieldCheck', description: 'Biometric Fingerprint & Electronic Digital Safes from Ozone' },
  { id: 'Iron Box', name: 'Iron Box', icon: 'Sparkles', description: 'Dry Irons, Non-stick Teflon Soleplates & Spray Tech Irons' },
  { id: 'Lighting', name: 'Lighting', icon: 'Lightbulb', description: 'Inverter Emergency Bulbs, LED Panels & Smart Lighting' },
];

const DEFAULT_SETTINGS = {
  storeName: 'ASK ENTERPRISES',
  whatsappNumber: '919100115604',
  displayPhone: '9100115604',
  address: 'PLOT NO.338, MALLAREDDY NAGAR COLONY, GAJULARAMARAM, HYDERABAD- 500055',
  supportEmail: 'askenterprises0917@gmail.com',
  announcementText: '⚡ ASK ENTERPRISES • One Stop Solution for all Plumbing, Electricals, Home Appliances & Air Conditioners',
  freeShippingThreshold: 999,
  shippingCharge: 79,
  upiId: '9100115604ask@axisbank',
  upiName: 'ASK ENTERPRISES',
  themeColor: 'monochrome',
};

function readDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return {
        products: Array.isArray(data.products) ? data.products : [],
        categories: Array.isArray(data.categories) && data.categories.length > 0 ? data.categories : DEFAULT_CATEGORIES,
        orders: Array.isArray(data.orders) ? data.orders : [],
        settings: data.settings || DEFAULT_SETTINGS,
        adminUsers: data.adminUsers || [{ username: 'admin', passwordHash: 'ask123' }],
      };
    }
  } catch (err) {
    console.error('Error reading database file, using defaults:', err);
  }

  const initialData: DatabaseSchema = {
    products: [], // Starts strictly with 0 products
    categories: DEFAULT_CATEGORIES,
    orders: [],
    settings: DEFAULT_SETTINGS,
    adminUsers: [{ username: 'admin', passwordHash: 'ask123' }],
  };
  writeDatabase(initialData);
  return initialData;
}

function writeDatabase(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

async function startServer() {
  const app = express();

  // Support JSON bodies up to 50MB (to allow uploaded image data URLs from computer files)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // --- REST API ENDPOINTS ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 1. PRODUCTS API
  app.get('/api/products', (req, res) => {
    const db = readDatabase();
    res.json(db.products);
  });

  app.post('/api/products', (req, res) => {
    const db = readDatabase();
    const newProduct = req.body;

    if (!newProduct.name || !newProduct.price) {
      return res.status(400).json({ error: 'Product name and price are required.' });
    }

    const product = {
      id: newProduct.id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: String(newProduct.name).trim(),
      brand: String(newProduct.brand || 'ASK ENTERPRISES').trim(),
      category: String(newProduct.category || 'Other Electronics').trim(),
      price: Number(newProduct.price),
      originalPrice: newProduct.originalPrice ? Number(newProduct.originalPrice) : Number(newProduct.price),
      discountPercent: newProduct.discountPercent ? Number(newProduct.discountPercent) : 0,
      stock: Number(newProduct.stock ?? 10),
      stockStatus: newProduct.stockStatus || (Number(newProduct.stock) <= 0 ? 'Out of Stock' : Number(newProduct.stock) <= 10 ? 'Low Stock' : 'In Stock'),
      image: newProduct.image || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80',
      shortDescription: String(newProduct.shortDescription || '').trim(),
      description: String(newProduct.description || '').trim(),
      rating: Number(newProduct.rating || 5.0),
      reviewCount: Number(newProduct.reviewCount || 0),
      specs: newProduct.specs || {},
      features: Array.isArray(newProduct.features) ? newProduct.features : [],
      warranty: String(newProduct.warranty || '1 Year Manufacturer Warranty').trim(),
      isFeatured: Boolean(newProduct.isFeatured),
      isNewArrival: Boolean(newProduct.isNewArrival),
      createdAt: newProduct.createdAt || new Date().toISOString(),
    };

    db.products.unshift(product);
    writeDatabase(db);
    res.status(201).json(product);
  });

  app.put('/api/products/:id', (req, res) => {
    const db = readDatabase();
    const productId = req.params.id;
    const index = db.products.findIndex((p) => p.id === productId);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updated = {
      ...db.products[index],
      ...req.body,
      id: productId, // preserve ID
      price: Number(req.body.price ?? db.products[index].price),
      stock: Number(req.body.stock ?? db.products[index].stock),
      updatedAt: new Date().toISOString(),
    };

    // calculate stock status
    if (!req.body.stockStatus) {
      updated.stockStatus = updated.stock <= 0 ? 'Out of Stock' : updated.stock <= 10 ? 'Low Stock' : 'In Stock';
    }

    db.products[index] = updated;
    writeDatabase(db);
    res.json(updated);
  });

  app.delete('/api/products/:id', (req, res) => {
    const db = readDatabase();
    const productId = req.params.id;
    const initialLen = db.products.length;
    db.products = db.products.filter((p) => p.id !== productId);

    if (db.products.length === initialLen) {
      return res.status(404).json({ error: 'Product not found' });
    }

    writeDatabase(db);
    res.json({ success: true, message: 'Product deleted from database' });
  });

  // 2. CATEGORIES API
  app.get('/api/categories', (req, res) => {
    const db = readDatabase();
    res.json(db.categories);
  });

  app.post('/api/categories', (req, res) => {
    const db = readDatabase();
    const { name, description, icon } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const cleanName = name.trim();
    const exists = db.categories.find((c) => c.name.toLowerCase() === cleanName.toLowerCase());
    if (exists) {
      return res.status(409).json({ error: 'Category already exists' });
    }

    const newCategory = {
      id: cleanName,
      name: cleanName,
      icon: icon || 'Cpu',
      description: description || `Certified electronic equipment for ${cleanName}`,
    };

    db.categories.push(newCategory);
    writeDatabase(db);
    res.status(201).json(newCategory);
  });

  app.delete('/api/categories/:id', (req, res) => {
    const db = readDatabase();
    const catId = req.params.id;
    db.categories = db.categories.filter((c) => c.id !== catId && c.name !== catId);
    writeDatabase(db);
    res.json({ success: true, message: 'Category removed' });
  });

  // 3. ORDERS & TRACKING API
  app.get('/api/orders', (req, res) => {
    const db = readDatabase();
    const { status, query } = req.query;
    let results = db.orders;

    if (status && typeof status === 'string' && status !== 'All') {
      results = results.filter((o) => o.status?.toLowerCase() === status.toLowerCase());
    }

    if (query && typeof query === 'string') {
      const q = query.trim().toLowerCase();
      results = results.filter(
        (o) =>
          o.id?.toLowerCase().includes(q) ||
          o.customerPhone?.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
          o.customerName?.toLowerCase().includes(q)
      );
    }

    res.json(results);
  });

  // Track single order by Order ID or Phone Number
  app.get('/api/orders/track/:query', (req, res) => {
    const db = readDatabase();
    const query = decodeURIComponent(req.params.query || '').trim();
    const cleanPhone = query.replace(/\D/g, '');

    const matchingOrders = db.orders.filter((o) => {
      const matchId = o.id && o.id.toLowerCase() === query.toLowerCase();
      const matchPartialId = o.id && o.id.toLowerCase().includes(query.toLowerCase());
      const matchPhone = cleanPhone.length >= 5 && o.customerPhone && o.customerPhone.replace(/\D/g, '').includes(cleanPhone);
      return matchId || matchPartialId || matchPhone;
    });

    if (!matchingOrders.length) {
      return res.status(404).json({ error: 'No order found matching the provided Order ID or Phone number.' });
    }

    // Return the latest matching order or array
    res.json({
      order: matchingOrders[0],
      allMatching: matchingOrders,
    });
  });

  // Get single order with timeline
  app.get('/api/orders/:id', (req, res) => {
    const db = readDatabase();
    const order = db.orders.find((o) => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  });

  app.post('/api/orders', (req, res) => {
    const db = readDatabase();
    const orderData = req.body;

    if (!orderData.items || !orderData.items.length) {
      return res.status(400).json({ error: 'Order must contain items' });
    }

    const now = new Date().toISOString();
    const initialStatus = orderData.status || 'Confirmed';

    const newOrder = {
      ...orderData,
      id: orderData.id || `ORD-ASK-${Date.now().toString().slice(-6)}`,
      createdAt: orderData.createdAt || now,
      updatedAt: now,
      status: initialStatus,
      statusHistory: orderData.statusHistory || [
        {
          status: 'Confirmed',
          timestamp: now,
          note: 'Order received and confirmed successfully.',
          updatedBy: 'System',
        },
      ],
      courierName: orderData.courierName || '',
      trackingNumber: orderData.trackingNumber || '',
      estimatedDelivery: orderData.estimatedDelivery || '',
    };

    // Deduct inventory stock
    newOrder.items.forEach((item: any) => {
      const prodIndex = db.products.findIndex((p) => p.id === item.productId);
      if (prodIndex >= 0) {
        db.products[prodIndex].stock = Math.max(0, db.products[prodIndex].stock - item.quantity);
        if (db.products[prodIndex].stock <= 0) {
          db.products[prodIndex].stockStatus = 'Out of Stock';
        } else if (db.products[prodIndex].stock <= 10) {
          db.products[prodIndex].stockStatus = 'Low Stock';
        }
      }
    });

    db.orders.unshift(newOrder);
    writeDatabase(db);
    res.status(201).json(newOrder);
  });

  app.put('/api/orders/:id/status', (req, res) => {
    const db = readDatabase();
    const orderId = req.params.id;
    const { status, note, courierName, trackingNumber, estimatedDelivery, updatedBy } = req.body;

    const index = db.orders.findIndex((o) => o.id === orderId);
    if (index === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const now = new Date().toISOString();
    const currentOrder = db.orders[index];
    const history = Array.isArray(currentOrder.statusHistory) ? [...currentOrder.statusHistory] : [];

    const defaultNotes: Record<string, string> = {
      Pending: 'Order is awaiting initial review.',
      Confirmed: 'Order verified and confirmed for processing.',
      Packed: 'Products inspected, packed, and packaged in secure parcel box.',
      Dispatched: courierName
        ? `Handed over to carrier ${courierName}${trackingNumber ? ` (AWB: ${trackingNumber})` : ''}. In transit.`
        : 'Dispatched and on the way to destination.',
      Delivered: 'Package successfully delivered to customer address.',
      Cancelled: 'Order cancelled.',
    };

    const newHistoryItem = {
      status: status || currentOrder.status,
      timestamp: now,
      note: note || defaultNotes[status] || `Status updated to ${status}.`,
      updatedBy: updatedBy || 'Store Admin',
      location: req.body.location || '',
    };

    history.push(newHistoryItem);

    const updatedOrder = {
      ...currentOrder,
      status: status || currentOrder.status,
      statusHistory: history,
      courierName: courierName !== undefined ? courierName : currentOrder.courierName,
      trackingNumber: trackingNumber !== undefined ? trackingNumber : currentOrder.trackingNumber,
      estimatedDelivery: estimatedDelivery !== undefined ? estimatedDelivery : currentOrder.estimatedDelivery,
      updatedAt: now,
    };

    db.orders[index] = updatedOrder;
    writeDatabase(db);
    res.json(updatedOrder);
  });

  // 4. STORE SETTINGS API
  app.get('/api/settings', (req, res) => {
    const db = readDatabase();
    res.json(db.settings);
  });

  app.put('/api/settings', (req, res) => {
    const db = readDatabase();
    db.settings = { ...db.settings, ...req.body };
    writeDatabase(db);
    res.json(db.settings);
  });

  // 5. ADMIN AUTHENTICATION API
  app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const db = readDatabase();

    const user = db.adminUsers.find(
      (u) => u.username.toLowerCase() === (username || '').toLowerCase() && u.passwordHash === password
    );

    if (user || (username === 'admin' && password === 'ask123')) {
      res.json({
        success: true,
        token: `ask_token_${Date.now()}`,
        username: user?.username || 'admin',
      });
    } else {
      res.status(401).json({ success: false, error: 'Invalid admin username or password.' });
    }
  });

  // --- VITE / STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ASK ENTERPRISES Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
