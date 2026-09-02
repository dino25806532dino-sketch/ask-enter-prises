import React, { useState } from 'react';
import { 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  Trash2, 
  LogOut, 
  Search, 
  Check, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Settings, 
  ExternalLink, 
  MessageCircle, 
  Phone, 
  Save, 
  Zap, 
  Grid, 
  CheckSquare, 
  Sparkles, 
  FolderPlus,
  Box,
  Send
} from 'lucide-react';
import { Product, Order, OrderStatus, Category, StoreSettings } from '../types';
import { formatINR } from '../utils/helpers';

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
  orders: Order[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateStock: (productId: string, newStock: number) => void;
  onUpdatePrice: (productId: string, newPrice: number) => void;
  onAddCategory: (categoryName: string, description?: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onUpdateOrderStatus: (
    orderId: string, 
    status: OrderStatus, 
    updateData?: { note?: string; courierName?: string; trackingNumber?: string; estimatedDelivery?: string }
  ) => void;
  onLogout: () => void;
  onBackToStore: () => void;
  storeSettings: StoreSettings;
  onUpdateSettings: (settings: StoreSettings) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  categories,
  orders,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateStock,
  onUpdatePrice,
  onAddCategory,
  onDeleteCategory,
  onUpdateOrderStatus,
  onLogout,
  onBackToStore,
  storeSettings,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'orders' | 'settings'>('dashboard');
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [orderSearch, setOrderSearch] = useState<string>('');
  
  // Order Status Update Modal State
  const [statusModalOrder, setStatusModalOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('Confirmed');
  const [statusNote, setStatusNote] = useState<string>('');
  const [courierName, setCourierName] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>('');
  
  // Quick inline edits
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<number>(0);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPriceValue, setTempPriceValue] = useState<number>(0);

  // New Category creation form inside Categories tab
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Settings form state
  const [announcement, setAnnouncement] = useState(storeSettings.announcementText);
  const [phone, setPhone] = useState(storeSettings.displayPhone);
  const [whatsapp, setWhatsapp] = useState(storeSettings.whatsappNumber);
  const [address, setAddress] = useState(storeSettings.address);
  const [upiId, setUpiId] = useState(storeSettings.upiId || '9347548525@upi');
  const [upiName, setUpiName] = useState(storeSettings.upiName || 'ASK ENTERPRISES');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Stats Calculations
  const totalProducts = products.length;
  const totalCategories = categories.length;
  const inStockCount = products.filter((p) => p.stock > 0 && p.stockStatus !== 'Out of Stock').length;
  const outOfStockCount = products.filter((p) => p.stock <= 0 || p.stockStatus === 'Out of Stock').length;

  // Filtered Products for Management Table
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategoryFilter === 'All' || p.category.toLowerCase() === selectedCategoryFilter.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...storeSettings,
      announcementText: announcement,
      displayPhone: phone,
      whatsappNumber: whatsapp,
      address: address,
      upiId: upiId.trim(),
      upiName: upiName.trim(),
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim(), newCatDesc.trim());
    setNewCatName('');
    setNewCatDesc('');
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return <span className="bg-zinc-100 text-zinc-800 border border-zinc-300 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Clock className="w-3 h-3 text-zinc-800" /> Pending</span>;
      case 'Confirmed':
        return <span className="bg-black text-white border border-black text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Check className="w-3 h-3 text-white" /> Confirmed</span>;
      case 'Packed':
        return <span className="bg-amber-50 text-amber-800 border border-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Box className="w-3 h-3 text-amber-800" /> Packed</span>;
      case 'Dispatched':
        return <span className="bg-blue-50 text-blue-800 border border-blue-300 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Truck className="w-3 h-3 text-blue-800" /> Dispatched</span>;
      case 'Delivered':
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-800" /> Delivered</span>;
      case 'Cancelled':
        return <span className="bg-red-50 text-red-800 border border-red-300 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><XCircle className="w-3 h-3 text-red-800" /> Cancelled</span>;
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 pb-20">
      
      {/* Admin Top Header Navigation Bar */}
      <div className="bg-zinc-50 border-b border-zinc-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white shadow-sm">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-zinc-900">ASK ENTERPRISES</span>
                <span className="bg-zinc-200 text-zinc-800 border border-zinc-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                  Admin Panel
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Dynamic Product Catalog & Database Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onAddProduct}
              id="header-quick-add-product-btn"
              className="flex items-center gap-1.5 bg-black hover:bg-zinc-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>

            <button
              onClick={onBackToStore}
              id="back-to-store-btn"
              className="flex items-center gap-1.5 bg-white hover:bg-zinc-100 text-zinc-800 px-3 py-2 rounded-xl text-xs font-bold transition-colors border border-zinc-300 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </button>

            <button
              onClick={onLogout}
              id="admin-logout-btn"
              className="flex items-center gap-1.5 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300 px-3 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* DASHBOARD STATS SECTION */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* 1. Total Products */}
          <div 
            onClick={() => setActiveTab('products')}
            className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
              activeTab === 'products'
                ? 'bg-zinc-100 border-zinc-900 shadow-sm'
                : 'bg-zinc-50 border-zinc-200 hover:border-zinc-400'
            }`}
          >
            <div className="flex items-center justify-between text-zinc-900 mb-2">
              <Package className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total Products</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 font-mono">{totalProducts}</div>
            <p className="text-xs text-zinc-500 mt-1">Database products</p>
          </div>

          {/* 2. Total Categories */}
          <div 
            onClick={() => setActiveTab('categories')}
            className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
              activeTab === 'categories'
                ? 'bg-zinc-100 border-zinc-900 shadow-sm'
                : 'bg-zinc-50 border-zinc-200 hover:border-zinc-400'
            }`}
          >
            <div className="flex items-center justify-between text-zinc-900 mb-2">
              <Grid className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total Categories</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 font-mono">{totalCategories}</div>
            <p className="text-xs text-zinc-500 mt-1">Dynamic categories</p>
          </div>

          {/* 3. In Stock */}
          <div 
            onClick={() => setActiveTab('products')}
            className="p-4 sm:p-5 rounded-2xl border bg-zinc-50 border-zinc-200 hover:border-zinc-400 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-zinc-900 mb-2">
              <CheckSquare className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">In Stock</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 font-mono">
              {inStockCount}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Ready for fulfillment</p>
          </div>

          {/* 4. Out of Stock */}
          <div 
            onClick={() => setActiveTab('products')}
            className="p-4 sm:p-5 rounded-2xl border bg-zinc-50 border-zinc-200 hover:border-zinc-400 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-zinc-600 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Out of Stock</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-zinc-700 font-mono">
              {outOfStockCount}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Needs inventory replenishment</p>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-zinc-200 pb-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-black text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-700 hover:text-black border border-zinc-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'products'
                ? 'bg-black text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-700 hover:text-black border border-zinc-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Manage Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'categories'
                ? 'bg-black text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-700 hover:text-black border border-zinc-200'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-black text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-700 hover:text-black border border-zinc-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-black text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-700 hover:text-black border border-zinc-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Store Settings</span>
          </button>
        </div>

        {/* TAB: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Quick Actions Banner */}
            <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-zinc-900" />
                  <h3 className="text-lg font-black text-zinc-900">Dynamic Store Status</h3>
                </div>
                <p className="text-xs text-zinc-600 max-w-xl">
                  Products created here in the Admin Panel immediately synchronize to the customer storefront. Deleting or modifying a product updates the live website in real-time.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onAddProduct}
                  id="dashboard-cta-add-product-btn"
                  className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-sm transition-all hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Product Catalog Summary */}
              <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                    <Package className="w-4 h-4 text-zinc-900" />
                    <span>Product Catalog Status</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="text-xs text-zinc-700 hover:text-black underline font-semibold"
                  >
                    View All
                  </button>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-6 px-4 bg-white rounded-xl border border-zinc-200">
                    <Package className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-zinc-700">No products added yet.</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Click "Add Product" to add your first real product.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {products.slice(0, 5).map((p) => (
                      <div key={p.id} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-zinc-200 text-xs shadow-xs">
                        <div className="flex items-center gap-2.5 truncate">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-8 h-8 rounded-lg object-cover bg-zinc-100 shrink-0 border border-zinc-200"
                            referrerPolicy="no-referrer"
                          />
                          <div className="truncate">
                            <span className="font-bold text-zinc-900 block truncate">{p.name}</span>
                            <span className="text-[10px] text-zinc-500">{p.category} • {formatINR(p.price)}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold shrink-0 border ${
                          p.stock <= 0 ? 'bg-zinc-100 text-zinc-500 border-zinc-300' : 'bg-zinc-100 text-zinc-900 border-zinc-300'
                        }`}>
                          {p.stock} units
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Categories Overview */}
              <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                    <Grid className="w-4 h-4 text-zinc-900" />
                    <span>Dynamic Categories</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab('categories')}
                    className="text-xs text-zinc-700 hover:text-black underline font-semibold"
                  >
                    Manage Categories
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {categories.map((c) => {
                    const count = products.filter((p) => p.category.toLowerCase() === c.name.toLowerCase()).length;
                    return (
                      <div key={c.id || c.name} className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
                        <div className="font-bold text-zinc-900 text-xs truncate">{c.name}</div>
                        <div className="text-[11px] text-zinc-500 font-mono font-semibold mt-0.5">
                          {count} {count === 1 ? 'Product' : 'Products'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 1: MANAGE PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
              
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products by title, category, brand..."
                    className="w-full bg-white text-zinc-900 placeholder-zinc-400 text-xs rounded-xl pl-9 pr-3 py-2.5 border border-zinc-300 focus:border-zinc-800 outline-none"
                  />
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-white text-zinc-900 text-xs rounded-xl px-3 py-2.5 border border-zinc-300 outline-none"
                >
                  <option value="All">All Categories ({products.length})</option>
                  {categories.map((c) => (
                    <option key={c.id || c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={onAddProduct}
                id="admin-add-product-btn"
                className="flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>

            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 text-zinc-600 font-bold border-b border-zinc-200 uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Product Image & Title</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Price (₹)</th>
                      <th className="p-3.5">Stock Status & Quantity</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-10 text-center text-zinc-500 space-y-2">
                          <Package className="w-8 h-8 text-zinc-400 mx-auto mb-1" />
                          <p className="font-bold text-zinc-900 text-sm">No products found</p>
                          <p className="text-xs text-zinc-500">
                            {products.length === 0 
                              ? 'The product database is currently empty. Click "Add Product" to add the first item.'
                              : 'No products matched your search or category filter.'}
                          </p>
                          {products.length === 0 && (
                            <button
                              onClick={onAddProduct}
                              className="mt-2 inline-flex items-center gap-1.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Your First Product</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-zinc-50 transition-colors">
                          
                          {/* Product image & title */}
                          <td className="p-3.5 flex items-center gap-3 min-w-[260px]">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-xl object-cover bg-zinc-100 border border-zinc-200 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-zinc-900 truncate max-w-xs" title={product.name}>
                                {product.name}
                              </div>
                              <div className="text-[11px] text-zinc-500 font-medium truncate">
                                {product.brand} • {product.warranty}
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="bg-zinc-100 text-zinc-800 border border-zinc-300 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase">
                              {product.category}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="p-3.5 whitespace-nowrap font-mono font-bold text-zinc-900">
                            {editingPriceId === product.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={tempPriceValue}
                                  onChange={(e) => setTempPriceValue(Number(e.target.value))}
                                  className="w-20 bg-white text-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-xs outline-none"
                                />
                                <button
                                  onClick={() => {
                                    onUpdatePrice(product.id, tempPriceValue);
                                    setEditingPriceId(null);
                                  }}
                                  className="text-zinc-900 hover:bg-zinc-200 p-1 rounded"
                                  title="Save Price"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingPriceId(product.id);
                                  setTempPriceValue(product.price);
                                }}
                                className="text-zinc-900 hover:underline flex items-center gap-1 group"
                                title="Click to edit price"
                              >
                                <span>{formatINR(product.price)}</span>
                                <Edit3 className="w-3 h-3 text-zinc-400 group-hover:text-black" />
                              </button>
                            )}
                          </td>

                          {/* Stock status */}
                          <td className="p-3.5 whitespace-nowrap">
                            {editingStockId === product.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={tempStockValue}
                                  onChange={(e) => setTempStockValue(Number(e.target.value))}
                                  className="w-16 bg-white text-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-xs outline-none"
                                />
                                <button
                                  onClick={() => {
                                    onUpdateStock(product.id, tempStockValue);
                                    setEditingStockId(null);
                                  }}
                                  className="text-zinc-900 hover:bg-zinc-200 p-1 rounded"
                                  title="Save Stock"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingStockId(product.id);
                                  setTempStockValue(product.stock);
                                }}
                                className="flex items-center gap-1.5 group"
                                title="Click to edit quantity"
                              >
                                <span className={`px-2 py-0.5 rounded-full font-bold font-mono text-[11px] border ${
                                  product.stock <= 0 || product.stockStatus === 'Out of Stock'
                                    ? 'bg-zinc-100 text-zinc-500 border-zinc-300'
                                    : 'bg-zinc-100 text-zinc-900 border-zinc-300'
                                }`}>
                                  {product.stock} units ({product.stockStatus || (product.stock <= 0 ? 'Out of Stock' : 'In Stock')})
                                </span>
                                <Edit3 className="w-3 h-3 text-zinc-400 group-hover:text-black" />
                              </button>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 whitespace-nowrap text-right space-x-2">
                            <button
                              onClick={() => onEditProduct(product)}
                              className="p-2 bg-zinc-100 hover:bg-black hover:text-white text-zinc-700 rounded-xl transition-colors border border-zinc-300 shadow-xs"
                              title="Edit product details, image, price, and specs"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${product.name}"? It will be removed from the store immediately.`)) {
                                  onDeleteProduct(product.id);
                                }
                              }}
                              className="p-2 bg-zinc-100 hover:bg-black hover:text-white text-zinc-700 rounded-xl transition-colors border border-zinc-300 shadow-xs"
                              title="Delete product from database"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: DYNAMIC CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Create Category Form */}
            <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 space-y-4">
              <div>
                <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-zinc-900" />
                  <span>Add New Category</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Create custom categories (e.g. Air Conditioners, Fans, Lights, Bulbs, Digital Locks, Switches, Wires, Electrical Accessories).
                </p>
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Air Conditioners"
                    className="w-full bg-white text-zinc-900 placeholder-zinc-400 text-xs rounded-xl px-3.5 py-2.5 border border-zinc-300 focus:border-zinc-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="e.g. Inverter split AC, window AC, smart WiFi cooling..."
                    className="w-full bg-white text-zinc-900 placeholder-zinc-400 text-xs rounded-xl px-3.5 py-2.5 border border-zinc-300 focus:border-zinc-800 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Category</span>
                </button>
              </form>
            </div>

            {/* Existing Categories List */}
            <div className="md:col-span-2 bg-zinc-50 p-5 rounded-2xl border border-zinc-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-zinc-900 text-sm">Active Categories ({categories.length})</h3>
                <span className="text-xs text-zinc-500">Categories render dynamically across the store</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((cat) => {
                  const count = products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()).length;
                  return (
                    <div key={cat.id || cat.name} className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center justify-between gap-3 shadow-xs">
                      <div className="min-w-0">
                        <div className="font-bold text-zinc-900 text-sm truncate">{cat.name}</div>
                        <div className="text-xs text-zinc-500 truncate">{cat.description || 'Electronic category'}</div>
                        <div className="text-[11px] text-zinc-600 font-mono font-semibold mt-1">
                          {count} {count === 1 ? 'Product' : 'Products'} assigned
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                            onDeleteCategory(cat.id || cat.name);
                          }
                        }}
                        className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: CUSTOMER ORDERS & TRACKING */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            {/* Orders Header & Search */}
            <div className="bg-zinc-50 p-4 sm:p-5 rounded-2xl border border-zinc-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-zinc-900 text-sm sm:text-base flex items-center gap-2">
                    <span>Order Tracking & Fulfillment</span>
                    <span className="text-[10px] bg-zinc-200 text-zinc-800 px-2 py-0.5 rounded-full border border-zinc-300 font-mono">
                      {orders.length} Total
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Update lifecycle status (Confirmed ➔ Packed ➔ Dispatched ➔ Delivered) with courier tracking & timestamps.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search Order ID, Phone or Name..."
                    className="w-full bg-white border border-zinc-300 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-zinc-200 pb-1">
                {['All', 'Confirmed', 'Packed', 'Dispatched', 'Delivered', 'Pending', 'Cancelled'].map((st) => {
                  const count = st === 'All' 
                    ? orders.length 
                    : orders.filter((o) => o.status === st).length;
                  return (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        orderStatusFilter === st
                          ? 'bg-black text-white shadow-sm'
                          : 'bg-white text-zinc-700 hover:text-black border border-zinc-300'
                      }`}
                    >
                      <span>{st}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                        orderStatusFilter === st ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {(() => {
                const filteredOrders = orders.filter((ord) => {
                  const matchStatus = orderStatusFilter === 'All' || ord.status === orderStatusFilter;
                  const q = orderSearch.toLowerCase().trim();
                  const matchSearch = !q || 
                    ord.id.toLowerCase().includes(q) ||
                    ord.customerPhone.includes(q) ||
                    ord.customerName.toLowerCase().includes(q);
                  return matchStatus && matchSearch;
                });

                if (filteredOrders.length === 0) {
                  return (
                    <div className="bg-zinc-50 p-12 rounded-2xl border border-zinc-200 text-center space-y-2">
                      <Package className="w-8 h-8 text-zinc-400 mx-auto" />
                      <div className="text-zinc-800 font-bold text-sm">No orders matching current filter</div>
                      <p className="text-xs text-zinc-500">Try changing status filter or clear your search.</p>
                    </div>
                  );
                }

                return filteredOrders.map((ord) => {
                  const trackingMsg = encodeURIComponent(
                    `Hi ${ord.customerName}, your ASK ENTERPRISES order ${ord.id} is now ${ord.status.toUpperCase()}! ${
                      ord.courierName ? `Carrier: ${ord.courierName}. ` : ''
                    }${ord.trackingNumber ? `AWB: ${ord.trackingNumber}. ` : ''}Thank you!`
                  );
                  const waUrl = `https://wa.me/91${ord.customerPhone.replace(/\D/g, '')}?text=${trackingMsg}`;

                  return (
                    <div 
                      key={ord.id}
                      className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 space-y-4 hover:border-zinc-300 transition-colors shadow-xs"
                    >
                      {/* Top Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3.5">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-zinc-900 text-sm sm:text-base">{ord.id}</span>
                          <span className="text-xs text-zinc-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-400" />
                            <span>
                              {new Date(ord.createdAt).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                          {getStatusBadge(ord.status)}
                          
                          <button
                            onClick={() => {
                              setStatusModalOrder(ord);
                              setNewStatus(ord.status);
                              setStatusNote('');
                              setCourierName(ord.courierName || '');
                              setTrackingNumber(ord.trackingNumber || '');
                              setEstimatedDelivery(ord.estimatedDelivery || '');
                            }}
                            className="bg-black hover:bg-zinc-800 text-white px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Update Status</span>
                          </button>
                        </div>
                      </div>

                      {/* Middle Row: Items and Customer Info */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                        
                        {/* Customer Delivery info */}
                        <div className="md:col-span-5 bg-white p-4 rounded-xl border border-zinc-200 space-y-2 shadow-xs">
                          <div className="font-bold text-zinc-900 flex items-center justify-between">
                            <span className="text-sm">{ord.customerName}</span>
                            <a 
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-zinc-900 hover:underline flex items-center gap-1 text-xs bg-zinc-100 px-2 py-1 rounded-lg border border-zinc-300 font-semibold"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-zinc-900" />
                              <span>Send Status WhatsApp</span>
                            </a>
                          </div>
                          <div className="text-zinc-600 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-zinc-500" />
                            <span className="font-mono text-zinc-800">{ord.customerPhone}</span>
                          </div>
                          <div className="text-zinc-700 pt-1 leading-relaxed">{ord.customerAddress}</div>
                          <div className="text-zinc-500 font-semibold">{ord.customerCity} - {ord.customerPincode}</div>
                          
                          {(ord.courierName || ord.trackingNumber) && (
                            <div className="mt-2 pt-2 border-t border-zinc-200 flex items-center justify-between text-zinc-700">
                              <span className="text-[11px] text-zinc-500">Carrier: <strong className="text-zinc-900">{ord.courierName || 'Expedited Express'}</strong></span>
                              {ord.trackingNumber && (
                                <span className="font-mono text-[10px] bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300 text-zinc-800">
                                  AWB: {ord.trackingNumber}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Items info & Payment */}
                        <div className="md:col-span-7 space-y-2.5">
                          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            {ord.items.map((i, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-zinc-200 shadow-xs">
                                <div className="flex items-center gap-2.5 truncate">
                                  <img
                                    src={i.image}
                                    alt={i.productName}
                                    className="w-7 h-7 rounded object-cover bg-zinc-100 shrink-0 border border-zinc-200"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span className="font-semibold text-zinc-900 truncate max-w-xs">{i.productName}</span>
                                  <span className="text-zinc-500 text-[11px]">x{i.quantity}</span>
                                </div>
                                <span className="font-mono font-bold text-zinc-900 shrink-0">
                                  {formatINR(i.price * i.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 font-bold">
                            <span className="text-zinc-600 flex items-center gap-2">
                              <span>Payment: <strong className="text-zinc-900">{ord.paymentMethod}</strong></span>
                              {ord.upiRefNumber && (
                                <span className="font-mono text-zinc-800 bg-zinc-100 border border-zinc-300 px-2 py-0.5 rounded text-[10px]">
                                  UPI Ref: {ord.upiRefNumber}
                                </span>
                              )}
                            </span>
                            <span className="text-sm font-mono text-zinc-900 font-black">Total: {formatINR(ord.total)}</span>
                          </div>
                        </div>

                      </div>

                      {/* Audit Status History Timeline */}
                      {ord.statusHistory && ord.statusHistory.length > 0 && (
                        <div className="pt-2 border-t border-zinc-200">
                          <div className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-zinc-600" />
                            <span>Status History Timeline ({ord.statusHistory.length} updates)</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {ord.statusHistory.map((h, hIdx) => (
                              <div 
                                key={hIdx} 
                                className="bg-white border border-zinc-200 text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-xs"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                                <span className="font-bold text-zinc-900">{h.status}</span>
                                <span className="text-[10px] text-zinc-500 font-mono">
                                  {new Date(h.timestamp).toLocaleString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {h.note && (
                                  <span className="text-zinc-600 text-[10px] max-w-[200px] truncate" title={h.note}>
                                    • {h.note}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                });
              })()}
            </div>

          </div>
        )}

        {/* MODAL: ORDER STATUS & TRACKING UPDATER */}
        {statusModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl text-zinc-900">
              
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div>
                  <h4 className="text-base font-black text-zinc-900 flex items-center gap-2">
                    <span>Update Order Status</span>
                    <span className="font-mono text-xs bg-zinc-100 border border-zinc-300 px-2 py-0.5 rounded text-zinc-800">
                      {statusModalOrder.id}
                    </span>
                  </h4>
                  <p className="text-xs text-zinc-500">Customer: {statusModalOrder.customerName} ({statusModalOrder.customerCity})</p>
                </div>
                <button
                  onClick={() => setStatusModalOrder(null)}
                  className="p-1.5 text-zinc-400 hover:text-black rounded-lg hover:bg-zinc-100"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">New Order Status *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['Confirmed', 'Packed', 'Dispatched', 'Delivered', 'Pending', 'Cancelled'] as OrderStatus[]).map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setNewStatus(st)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        newStatus === st
                          ? 'bg-black text-white border-black shadow-sm'
                          : 'bg-zinc-50 border-zinc-300 text-zinc-700 hover:border-zinc-400'
                      }`}
                    >
                      {st === 'Confirmed' && <Check className="w-3.5 h-3.5" />}
                      {st === 'Packed' && <Box className="w-3.5 h-3.5" />}
                      {st === 'Dispatched' && <Truck className="w-3.5 h-3.5" />}
                      {st === 'Delivered' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {st === 'Cancelled' && <XCircle className="w-3.5 h-3.5" />}
                      {st === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                      <span>{st}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">Status Update Note (Visible in customer timeline)</label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder={`e.g. Products quality inspected & bubble wrapped...`}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-800 focus:outline-none"
                />
              </div>

              {/* Courier & AWB Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Courier Partner</label>
                  <input
                    type="text"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="BlueDart / Delhivery / DTDC..."
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Tracking / AWB Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. BD982741920IN"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 font-mono placeholder-zinc-400 focus:border-zinc-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">Estimated Delivery Date</label>
                <input
                  type="text"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  placeholder="e.g. Within 2-3 business days"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-800 focus:outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setStatusModalOrder(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:text-black hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateOrderStatus(statusModalOrder.id, newStatus, {
                      note: statusNote,
                      courierName,
                      trackingNumber,
                      estimatedDelivery,
                    });
                    setStatusModalOrder(null);
                  }}
                  className="bg-black hover:bg-zinc-800 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Status Update</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: STORE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 max-w-2xl">
            <h3 className="font-bold text-zinc-900 text-base mb-1">Store Information & Contact Details</h3>
            <p className="text-xs text-zinc-500 mb-5">
              Update WhatsApp ordering phone, store marquee banner, and UPI payment credentials.
            </p>

            {settingsSaved && (
              <div className="mb-4 bg-zinc-100 border border-zinc-300 p-3 rounded-xl text-xs text-zinc-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-zinc-900" />
                <span>Store settings updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Top Announcement Bar Text
                </label>
                <input
                  type="text"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  className="w-full bg-white text-zinc-900 rounded-xl px-3.5 py-2 border border-zinc-300 focus:border-zinc-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Customer Hotline Display Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white text-zinc-900 rounded-xl px-3.5 py-2 border border-zinc-300 focus:border-zinc-800 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    WhatsApp Routing Number (with country code)
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-white text-zinc-900 rounded-xl px-3.5 py-2 border border-zinc-300 focus:border-zinc-800 outline-none font-mono"
                  />
                </div>
              </div>

              {/* UPI QR Payment Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-white border border-zinc-200 rounded-xl shadow-xs">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Store UPI ID (e.g. 9347548525@upi)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. 9347548525@upi"
                    className="w-full bg-zinc-50 text-zinc-900 rounded-xl px-3.5 py-2 border border-zinc-300 focus:border-zinc-800 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    UPI Merchant / Payee Name
                  </label>
                  <input
                    type="text"
                    value={upiName}
                    onChange={(e) => setUpiName(e.target.value)}
                    placeholder="e.g. ASK ENTERPRISES"
                    className="w-full bg-zinc-50 text-zinc-900 rounded-xl px-3.5 py-2 border border-zinc-300 focus:border-zinc-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Store & Warehouse Location Address
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white text-zinc-900 rounded-xl px-3.5 py-2 border border-zinc-300 focus:border-zinc-800 outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Store Settings</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

    </div>
  );
};
