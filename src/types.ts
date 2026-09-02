export interface Category {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  count?: number;
}

export type ProductCategory = string;

export interface ProductSpec {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  stock: number;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  image: string;
  images?: string[];
  shortDescription?: string;
  description: string;
  rating: number;
  reviewCount?: number;
  specs: Record<string, string>;
  features?: string[];
  warranty?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Packed' | 'Dispatched' | 'Delivered' | 'Cancelled';

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
  location?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerPincode: string;
  customerCity: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: 'COD' | 'UPI';
  upiRefNumber?: string;
  status: OrderStatus;
  statusHistory?: OrderStatusHistoryItem[];
  courierName?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

export type ThemeColor = 'monochrome' | 'noir' | 'minimal' | string;

export interface StoreSettings {
  storeName: string;
  whatsappNumber: string;
  displayPhone: string;
  address: string;
  supportEmail: string;
  announcementText: string;
  freeShippingThreshold: number;
  shippingCharge: number;
  upiId?: string;
  upiName?: string;
  upiQrImage?: string;
  themeColor?: ThemeColor;
}
