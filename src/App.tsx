/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  HeroBanner 
} from './components/HeroBanner';
import { 
  CategoryNav 
} from './components/CategoryNav';
import { 
  ProductCard 
} from './components/ProductCard';
import { 
  ProductDetailsModal 
} from './components/ProductDetailsModal';
import { 
  CartDrawer 
} from './components/CartDrawer';
import { 
  CheckoutModal 
} from './components/CheckoutModal';
import { 
  OrderSuccessModal 
} from './components/OrderSuccessModal';
import { 
  AdminLoginModal 
} from './components/AdminLoginModal';
import { 
  AdminDashboard 
} from './components/AdminDashboard';
import { 
  ProductFormModal 
} from './components/ProductFormModal';
import { 
  CategoriesView 
} from './components/CategoriesView';
import { 
  Footer 
} from './components/Footer';
import { 
  UpiQrModal 
} from './components/UpiQrModal';
import { 
  OrderTrackingModal 
} from './components/OrderTrackingModal';

import { 
  Product, 
  CartItem, 
  Order, 
  OrderStatus, 
  Category, 
  StoreSettings 
} from './types';
import { 
  DEFAULT_STORE_SETTINGS, 
  CATEGORIES as DEFAULT_CATEGORIES 
} from './data/initialProducts';
import { api } from './utils/api';
import { 
  SlidersHorizontal, 
  ShoppingBag, 
  MessageCircle, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Search, 
  X, 
  PackageX,
  Phone,
  Plus,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function App() {
  // 1. Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Cart state from local storage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ask_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Admin Auth state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('ask_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  // Navigation & UI state
  const [activeView, setActiveView] = useState<'store' | 'categories' | 'admin'>('store');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'newest'>('featured');

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | undefined>(undefined);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Helper for toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Load all initial dynamic data from backend API
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const [fetchedProducts, fetchedCategories, fetchedOrders, fetchedSettings] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getOrders(),
        api.getSettings(),
      ]);

      setProducts(fetchedProducts || []);
      if (fetchedCategories && fetchedCategories.length > 0) {
        setCategories(fetchedCategories);
      }
      setOrders(fetchedOrders || []);
      if (fetchedSettings) {
        setStoreSettings(fetchedSettings);
      }
    } catch (err: any) {
      console.warn('Backend API connection notice:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem('ask_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Cart Calculations
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [cart]);

  // Product Counts per Category
  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach((c) => {
      counts[c.name.toLowerCase()] = products.filter(
        (p) => p.category.toLowerCase() === c.name.toLowerCase()
      ).length;
    });
    return counts;
  }, [products, categories]);

  // Filtered & Sorted Products for Customer View
  const displayedProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCat = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesQuery =
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.shortDescription && p.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCat && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, selectedCategory, searchTerm, sortBy]);

  // Cart Actions
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.product.id === product.id);
      if (existing) {
        return prevCart.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prevCart, { product, quantity }];
    });
    showToast(`Added "${product.name}" to cart!`);
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.product.id === product.id);
      if (existing) {
        return prevCart.map((i) =>
          i.product.id === product.id ? { ...i, quantity } : i
        );
      }
      return [{ product, quantity }];
    });
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Order Placement
  const handleOrderCreated = async (newOrder: Order) => {
    try {
      const savedOrder = await api.createOrder(newOrder);
      setOrders((prev) => [savedOrder, ...prev]);
    } catch (e) {
      setOrders((prev) => [newOrder, ...prev]);
    }

    // Deduct stock locally & via API
    setProducts((prev) =>
      prev.map((p) => {
        const orderedItem = newOrder.items.find((i) => i.productId === p.id);
        if (orderedItem) {
          const newStock = Math.max(0, p.stock - orderedItem.quantity);
          api.updateStock(p.id, newStock).catch(() => {});
          return { ...p, stock: newStock };
        }
        return p;
      })
    );

    setCart([]);
    setIsCheckoutOpen(false);
    setLastPlacedOrder(newOrder);
    showToast(`Order placed successfully! Order ID: ${newOrder.id}`);
  };

  // Admin Actions
  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    sessionStorage.setItem('ask_admin_auth', 'true');
    setActiveView('admin');
    showToast('Admin access granted.');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('ask_admin_auth');
    setActiveView('store');
    showToast('Logged out of Admin Portal.');
  };

  // Product Save (Create or Update)
  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (productData.id) {
        // Update existing product
        const updated = await api.updateProduct(productData.id, productData);
        setProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        showToast(`Product "${updated.name}" updated successfully!`);
      } else {
        // Create new product
        const created = await api.createProduct(productData);
        setProducts((prev) => [created, ...prev]);
        showToast(`Product "${created.name}" created and published!`);
      }
    } catch (err: any) {
      showToast('Error saving product: ' + (err.message || 'Unknown error'));
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId: string) => {
    try {
      await api.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast('Product deleted from database and store.');
    } catch (err: any) {
      showToast('Error deleting product.');
    }
  };

  // Update Stock
  const handleUpdateStock = async (productId: string, newStock: number) => {
    try {
      const updated = await api.updateStock(productId, newStock);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? updated : p))
      );
      showToast('Stock updated.');
    } catch (err) {
      showToast('Failed to update stock.');
    }
  };

  // Update Price
  const handleUpdatePrice = async (productId: string, newPrice: number) => {
    try {
      const updated = await api.updatePrice(productId, newPrice);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? updated : p))
      );
      showToast('Price updated.');
    } catch (err) {
      showToast('Failed to update price.');
    }
  };

  // Add Category
  const handleAddCategory = async (categoryName: string, description?: string) => {
    try {
      const newCat = await api.createCategory(categoryName, description);
      setCategories((prev) => [...prev, newCat]);
      showToast(`Category "${categoryName}" added!`);
    } catch (err) {
      showToast('Failed to create category.');
    }
  };

  // Delete Category
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await api.deleteCategory(categoryId);
      setCategories((prev) => prev.filter((c) => c.id !== categoryId && c.name !== categoryId));
      showToast('Category removed.');
    } catch (err) {
      showToast('Failed to delete category.');
    }
  };

  // Update Order Status with audit info and tracking payload
  const handleUpdateOrderStatus = async (
    orderId: string, 
    status: OrderStatus, 
    updateData?: { note?: string; courierName?: string; trackingNumber?: string; estimatedDelivery?: string }
  ) => {
    try {
      const updated = await api.updateOrderStatus(orderId, status, updateData);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o))
      );
      showToast(`Order status updated to ${status}.`);
    } catch (err) {
      showToast('Failed to update order status.');
    }
  };

  // Update Store Settings
  const handleUpdateSettings = async (settings: StoreSettings) => {
    try {
      const updated = await api.updateSettings(settings);
      setStoreSettings(updated);
      showToast('Store settings saved successfully!');
    } catch (err) {
      showToast('Failed to save store settings.');
    }
  };

  const handleScrollToProducts = () => {
    setActiveView('store');
    const el = document.getElementById('products-grid-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cleanPhone = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');
  const floatingWhatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello ASK ENTERPRISES! I am looking for electronics products and have an inquiry.')}`;

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans selection:bg-black selection:text-white">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-zinc-900 border border-zinc-700 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-zinc-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Header */}
      <Header
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (activeView !== 'store') setActiveView('store');
        }}
        activeView={activeView}
        onNavigate={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={() => {
          if (isAdminLoggedIn) {
            setActiveView('admin');
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        storeSettings={storeSettings}
        onOpenUpiModal={() => setIsUpiModalOpen(true)}
        onOpenTrackingModal={() => setIsTrackingModalOpen(true)}
      />

      {/* ADMIN VIEW */}
      {activeView === 'admin' ? (
        <AdminDashboard
          products={products}
          categories={categories}
          orders={orders}
          onAddProduct={() => {
            setProductToEdit(null);
            setIsProductFormOpen(true);
          }}
          onEditProduct={(p) => {
            setProductToEdit(p);
            setIsProductFormOpen(true);
          }}
          onDeleteProduct={handleDeleteProduct}
          onUpdateStock={handleUpdateStock}
          onUpdatePrice={handleUpdatePrice}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onLogout={handleAdminLogout}
          onBackToStore={() => setActiveView('store')}
          storeSettings={storeSettings}
          onUpdateSettings={handleUpdateSettings}
        />
      ) : activeView === 'categories' ? (
        /* CATEGORIES SHOWCASE VIEW */
        <div className="flex-1 bg-zinc-50/50">
          <CategoryNav
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setActiveView('store');
            }}
            productCounts={productCounts}
            storeSettings={storeSettings}
          />
          <CategoriesView
            categories={categories}
            products={products}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setActiveView('store');
            }}
          />
        </div>
      ) : (
        /* CUSTOMER STORE VIEW */
        <div className="flex-1 flex flex-col bg-white">
          
          {/* Category Navigation Pills */}
          <CategoryNav
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            productCounts={productCounts}
            storeSettings={storeSettings}
          />

          {/* Hero Banner (Only if no specific search query is active) */}
          {!searchTerm && selectedCategory === 'All' && (
            <HeroBanner
              storeSettings={storeSettings}
              onExploreCategory={(cat) => {
                setSelectedCategory(cat);
                handleScrollToProducts();
              }}
              onScrollToProducts={handleScrollToProducts}
              onUpdateThemeColor={(col) => {
                handleUpdateSettings({ ...storeSettings, themeColor: col });
              }}
            />
          )}

          {/* Product Listing Main Section */}
          <main id="products-grid-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
            
            {/* Filter and Category Status Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900">
                    {selectedCategory === 'All' ? 'All Electronic Equipment' : selectedCategory}
                  </h2>
                  <span className="bg-zinc-100 text-zinc-900 border border-zinc-200 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
                    {displayedProducts.length} items
                  </span>
                </div>
                <p className="text-xs text-zinc-600">
                  {selectedCategory === 'All'
                    ? 'Explore genuine fans, biometric lockers, LED lights, switches, and GaN chargers.'
                    : `Certified models for ${selectedCategory}. 100% Brand Guarantee.`}
                </p>
              </div>

              {/* Sorting & Filter Controls */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="flex items-center gap-1.5 bg-white border border-zinc-200 shadow-sm rounded-xl px-3 py-1.5 text-xs text-zinc-700">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-900" />
                  <span className="font-semibold text-zinc-500">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-zinc-900 font-bold outline-none cursor-pointer text-xs"
                    id="sort-select"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Customer Rating</option>
                    <option value="newest">New Arrivals</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Empty States or Products Grid */}
            {isLoading ? (
              <div className="py-20 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-zinc-900 animate-spin mx-auto" />
                <p className="text-sm font-bold text-zinc-700">Loading electronic catalog...</p>
              </div>
            ) : products.length === 0 ? (
              /* CLEAN ZERO PRODUCTS STATE */
              <div className="bg-zinc-50 rounded-3xl border border-zinc-200 p-12 text-center space-y-4 max-w-lg mx-auto my-8 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center mx-auto text-zinc-900 shadow-sm">
                  <PackageX className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-zinc-900">No products available yet.</h3>
                  <p className="text-xs text-zinc-600">
                    No products have been added to the store catalog yet. Authorized administrators can add new products via the Admin Panel.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (isAdminLoggedIn) {
                        setActiveView('admin');
                      } else {
                        setIsAdminLoginOpen(true);
                      }
                    }}
                    id="empty-state-open-admin-btn"
                    className="inline-flex items-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Open Admin Panel & Add Product</span>
                  </button>
                </div>
              </div>
            ) : displayedProducts.length === 0 ? (
              /* Search/Filter No Match state */
              <div className="bg-zinc-50 rounded-3xl border border-zinc-200 p-12 text-center space-y-4 max-w-lg mx-auto my-8 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center mx-auto text-zinc-900 shadow-sm">
                  <PackageX className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-zinc-900">No Electronic Items Found</h3>
                  <p className="text-xs text-zinc-600">
                    We could not find any products matching "{searchTerm}". Please try searching with a different term.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                  }}
                  className="bg-black hover:bg-zinc-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  Clear Filters & Show All
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={(p) => setSelectedProduct(p)}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onBuyNow={(p) => handleBuyNow(p, 1)}
                    storeSettings={storeSettings}
                    isInCart={cart.some((i) => i.product.id === product.id)}
                  />
                ))}
              </div>
            )}

          </main>

        </div>
      )}

      {/* Floating WhatsApp Quick Action Button (High-contrast Black & White) */}
      <a
        href={floatingWhatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        id="floating-whatsapp-btn"
        className="fixed bottom-6 right-6 z-40 bg-zinc-900 hover:bg-black text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl border border-zinc-700 flex items-center gap-2.5 transition-all hover:scale-105 group"
        title="WhatsApp Support & Orders: 9347 54 85 25"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageCircle className="w-5 h-5 text-white" />
        <span className="hidden sm:inline font-bold text-xs text-white">
          WhatsApp: {storeSettings.displayPhone}
        </span>
      </a>

      {/* Footer */}
      <Footer
        storeSettings={storeSettings}
        categories={categories}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setActiveView('store');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdminLogin={() => {
          if (isAdminLoggedIn) {
            setActiveView('admin');
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenUpiModal={() => setIsUpiModalOpen(true)}
        onOpenTrackingModal={() => setIsTrackingModalOpen(true)}
      />

      {/* MODALS */}
      
      {/* 1. Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, qty) => {
          handleAddToCart(p, qty);
          setSelectedProduct(null);
        }}
        onBuyNow={(p, qty) => {
          handleBuyNow(p, qty);
        }}
        storeSettings={storeSettings}
        isInCart={selectedProduct ? cart.some((i) => i.product.id === selectedProduct.id) : false}
      />

      {/* 2. Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        storeSettings={storeSettings}
      />

      {/* 3. Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onOrderCreated={handleOrderCreated}
        storeSettings={storeSettings}
      />

      {/* 4. Order Success / Receipt Modal */}
      <OrderSuccessModal
        order={lastPlacedOrder}
        onClose={() => setLastPlacedOrder(null)}
        storeSettings={storeSettings}
        onTrackOrder={(orderId) => {
          setLastPlacedOrder(null);
          setTrackingOrderId(orderId);
          setIsTrackingModalOpen(true);
        }}
      />

      {/* 5. Customer Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => {
          setIsTrackingModalOpen(false);
          setTrackingOrderId(undefined);
        }}
        initialOrderId={trackingOrderId}
        storeSettings={storeSettings}
      />

      {/* 6. Direct UPI QR Code Scanner Modal */}
      <UpiQrModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        storeSettings={storeSettings}
      />

      {/* 7. Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* 8. Admin Product Add/Edit Form Modal */}
      <ProductFormModal
        isOpen={isProductFormOpen}
        onClose={() => {
          setIsProductFormOpen(false);
          setProductToEdit(null);
        }}
        onSave={handleSaveProduct}
        initialProduct={productToEdit}
        categories={categories}
        onAddCategory={handleAddCategory}
      />

    </div>
  );
}
