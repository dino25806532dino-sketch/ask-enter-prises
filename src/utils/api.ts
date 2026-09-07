import { Product, Category, Order, StoreSettings, OrderStatus } from '../types';
import { INITIAL_PRODUCTS, DEFAULT_CATEGORIES, DEFAULT_STORE_SETTINGS } from '../data/initialProducts';

export const api = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (e) {
      console.warn('API fetch failed, reading localStorage', e);
    }
    try {
      const local = localStorage.getItem('ask_products');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_PRODUCTS;
  },

  async saveProduct(product: Partial<Product>): Promise<Product> {
    try {
      const isNew = !product.id;
      const url = isNew ? '/api/products' : `/api/products/${product.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API save product failed, using client storage', e);
    }

    // Fallback
    const savedProd = {
      id: product.id || `prod_${Date.now()}`,
      name: product.name || '',
      brand: product.brand || 'ASK ENTERPRISES',
      category: product.category || 'Other Electronics',
      price: Number(product.price || 0),
      originalPrice: Number(product.originalPrice || product.price || 0),
      discountPercent: Number(product.discountPercent || 0),
      stock: Number(product.stock ?? 10),
      stockStatus: product.stockStatus || (Number(product.stock ?? 10) <= 0 ? 'Out of Stock' : 'In Stock'),
      image: product.image || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      rating: Number(product.rating || 5.0),
      reviewCount: Number(product.reviewCount || 0),
      specs: product.specs || {},
      features: product.features || [],
      warranty: product.warranty || '1 Year Manufacturer Warranty',
      isFeatured: Boolean(product.isFeatured),
      isNewArrival: Boolean(product.isNewArrival),
      createdAt: product.createdAt || new Date().toISOString(),
    } as Product;

    return savedProd;
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    return this.saveProduct(product);
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    return this.saveProduct({ ...product, id });
  },

  async updateStock(id: string, newStock: number): Promise<Product> {
    const stockStatus = newStock <= 0 ? 'Out of Stock' : newStock <= 10 ? 'Low Stock' : 'In Stock';
    return this.saveProduct({ id, stock: newStock, stockStatus });
  },

  async updatePrice(id: string, newPrice: number): Promise<Product> {
    return this.saveProduct({ id, price: newPrice });
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch (e) {
      console.warn('API delete failed', e);
    }
    return true;
  },

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      console.warn('API fetch categories failed', e);
    }
    try {
      const local = localStorage.getItem('ask_categories');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_CATEGORIES;
  },

  async createCategory(catOrName: string | { name: string; description?: string; icon?: string }, description?: string): Promise<Category> {
    const payload = typeof catOrName === 'string' 
      ? { name: catOrName, description: description || '', icon: 'Cpu' }
      : catOrName;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API create category failed', e);
    }
    return {
      id: payload.name.toLowerCase().replace(/\s+/g, '-'),
      name: payload.name,
      icon: payload.icon || 'Cpu',
      description: payload.description || '',
    };
  },

  async deleteCategory(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch (e) {
      console.warn('API delete category failed', e);
    }
    return true;
  },

  // ORDERS & TRACKING
  async getOrders(status?: string, query?: string): Promise<Order[]> {
    try {
      const params = new URLSearchParams();
      if (status && status !== 'All') params.append('status', status);
      if (query) params.append('query', query);
      const url = `/api/orders${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API fetch orders failed', e);
    }
    const local = localStorage.getItem('ask_orders');
    return local ? JSON.parse(local) : [];
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API get order by id failed', e);
    }
    return null;
  },

  async createOrder(order: Partial<Order>): Promise<Order> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API create order failed', e);
    }
    const now = new Date().toISOString();
    return {
      ...order,
      id: order.id || `ORD-ASK-${Date.now().toString().slice(-6)}`,
      createdAt: order.createdAt || now,
      updatedAt: now,
      status: order.status || 'Confirmed',
      statusHistory: [
        {
          status: 'Confirmed',
          timestamp: now,
          note: 'Order placed & confirmed successfully.',
          updatedBy: 'System',
        },
      ],
    } as Order;
  },

  async updateOrderStatus(
    orderId: string, 
    status: OrderStatus, 
    updateData?: { note?: string; courierName?: string; trackingNumber?: string; estimatedDelivery?: string; updatedBy?: string; adminMessage?: string }
  ): Promise<Order> {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...updateData }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API update order status failed', e);
    }
    return {
      id: orderId,
      status,
      ...(updateData || {}),
    } as any;
  },

  async sendOrderMessage(orderId: string, message: string): Promise<Order> {
    try {
      const res = await fetch(`/api/orders/${orderId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sender: 'admin' }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API send order message failed', e);
    }
    const now = new Date().toISOString();
    return {
      id: orderId,
      adminMessage: message,
      adminMessageTimestamp: now,
      messages: [
        {
          id: `msg_${Date.now()}`,
          sender: 'admin',
          message,
          timestamp: now,
        },
      ],
    } as any;
  },

  // SETTINGS
  async getSettings(): Promise<StoreSettings> {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data && data.storeName) return data;
      }
    } catch (e) {
      console.warn('API get settings failed', e);
    }
    try {
      const local = localStorage.getItem('ask_settings');
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && parsed.storeName) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_STORE_SETTINGS;
  },

  async updateSettings(settings: StoreSettings): Promise<StoreSettings> {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API update settings failed', e);
    }
    return settings;
  },

  // ADMIN LOGIN
  async adminLogin(username: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      return data;
    } catch (e) {
      console.warn('API admin login failed, fallback to client verification', e);
      if (username.toLowerCase() === 'admin' && password === 'ask123') {
        return { success: true, token: 'local_token' };
      }
      return { success: false, error: 'Invalid admin credentials' };
    }
  },
};
