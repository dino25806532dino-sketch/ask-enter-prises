import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  MessageCircle, 
  Phone, 
  Lock, 
  Menu, 
  X, 
  Zap, 
  Home, 
  Grid, 
  Package, 
  ChevronDown, 
  ArrowRight,
  QrCode
} from 'lucide-react';
import { StoreSettings } from '../types';
import { formatINR } from '../utils/helpers';
import { getTheme } from '../utils/theme';

interface HeaderProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  ordersCount?: number;
  onOpenOrders?: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  activeView: 'store' | 'categories' | 'admin';
  onNavigate: (view: 'store' | 'categories' | 'admin') => void;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
  storeSettings: StoreSettings;
  onOpenUpiModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  cartTotal,
  onOpenCart,
  ordersCount = 0,
  onOpenOrders,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  activeView,
  onNavigate,
  isAdminLoggedIn,
  onOpenAdminLogin,
  storeSettings,
  onOpenUpiModal,
}) => {
  const [isLogoMenuOpen, setIsLogoMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const logoMenuRef = useRef<HTMLDivElement>(null);

  const theme = getTheme(storeSettings.themeColor);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (logoMenuRef.current && !logoMenuRef.current.contains(event.target as Node)) {
        setIsLogoMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cleanPhone = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hi ASK ENTERPRISES! I am browsing your electronics store and have an inquiry.')}`;

  const handleMenuSelect = (action: 'home' | 'products' | 'categories' | 'admin') => {
    setIsLogoMenuOpen(false);
    setIsMobileMenuOpen(false);

    if (action === 'home') {
      onSelectCategory('All');
      onNavigate('store');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action === 'products') {
      onNavigate('store');
      const el = document.getElementById('products-grid-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (action === 'categories') {
      onNavigate('categories');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action === 'admin') {
      if (isAdminLoggedIn) {
        onNavigate('admin');
      } else {
        onOpenAdminLogin();
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white text-zinc-900 border-b border-zinc-200 shadow-sm backdrop-blur-md">
      
      {/* Top Notification Announcement Bar */}
      <div 
        className="bg-zinc-100 border-b border-zinc-200 text-zinc-900 text-xs font-semibold py-1.5 px-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="text-zinc-800 text-xs truncate">
              {storeSettings.announcementText}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs">
            <a 
              href={`tel:${storeSettings.displayPhone.replace(/\s+/g, '')}`}
              className="flex items-center gap-1 text-zinc-800 hover:text-black hover:underline transition-colors font-semibold"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call: {storeSettings.displayPhone}</span>
            </a>
            <span className="text-zinc-400">•</span>
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-zinc-800 hover:text-black transition-colors font-semibold"
            >
              <MessageCircle className="w-3.5 h-3.5 text-zinc-900" />
              <span>WhatsApp: {storeSettings.displayPhone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Ask Enterprises Clickable Logo / Profile Area with Dropdown Menu */}
          <div className="relative" ref={logoMenuRef}>
            <button 
              onClick={() => setIsLogoMenuOpen(!isLogoMenuOpen)}
              className="flex items-center gap-2.5 text-left group focus:outline-none p-1 -m-1 rounded-xl hover:bg-zinc-100 transition-colors"
              id="brand-logo-menu-btn"
              title="Click to open menu: Home, Products, Categories, Admin"
            >
              <div 
                className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0"
              >
                <Zap className="w-6 h-6 text-white fill-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 group-hover:opacity-90 transition-opacity">
                    ASK <span className="text-zinc-900">ENTERPRISES</span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-zinc-500 transition-transform duration-200" />
                </div>
              </div>
            </button>

            {/* Clickable Logo Dropdown Menu (Home, Products, Categories, Admin) */}
            {isLogoMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-60 bg-white border border-zinc-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-zinc-100 text-[11px] text-zinc-500 font-bold uppercase tracking-wider">
                  Menu Navigation
                </div>
                <div className="space-y-1 pt-1 text-xs">
                  {/* Home */}
                  <button
                    onClick={() => handleMenuSelect('home')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-zinc-800 hover:bg-zinc-100 hover:text-black transition-colors font-semibold group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Home className="w-4 h-4 text-zinc-600 group-hover:text-black" />
                      <span>Home</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  {/* Products */}
                  <button
                    onClick={() => handleMenuSelect('products')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-zinc-800 hover:bg-zinc-100 hover:text-black transition-colors font-semibold group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Package className="w-4 h-4 text-zinc-600 group-hover:text-black" />
                      <span>Products</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  {/* Categories */}
                  <button
                    onClick={() => handleMenuSelect('categories')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-zinc-800 hover:bg-zinc-100 hover:text-black transition-colors font-semibold group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Grid className="w-4 h-4 text-zinc-600 group-hover:text-black" />
                      <span>Categories</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  {/* UPI / QR Scan */}
                  {onOpenUpiModal && (
                    <button
                      onClick={() => {
                        setIsLogoMenuOpen(false);
                        onOpenUpiModal();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-zinc-800 hover:bg-zinc-100 hover:text-black transition-colors font-semibold group"
                    >
                      <div className="flex items-center gap-2.5">
                        <QrCode className="w-4 h-4 text-zinc-600 group-hover:text-black" />
                        <span>UPI / QR Scan</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}

                  <div className="border-t border-zinc-200 my-1"></div>

                  {/* Admin Panel */}
                  <button
                    onClick={() => handleMenuSelect('admin')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-zinc-900 hover:bg-black hover:text-white transition-colors font-bold group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Lock className="w-4 h-4 text-zinc-800 group-hover:text-white" />
                      <span>{isAdminLoggedIn ? 'Admin Dashboard' : 'Admin'}</span>
                    </div>
                    <span className="text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 group-hover:bg-zinc-800 group-hover:text-white border border-zinc-300">
                      {isAdminLoggedIn ? 'Active' : 'Login'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <input
                type="text"
                id="search-input-desktop"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search electronic items, fans, locks, lights..."
                className="w-full bg-zinc-50 text-zinc-900 placeholder-zinc-400 text-sm rounded-full pl-10 pr-10 py-2.5 border border-zinc-300 focus:border-black focus:ring-2 focus:ring-black/10 transition-all outline-none"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-black p-1"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Links & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* WhatsApp Direct Chat Button on Header */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="whatsapp-header-btn"
              className="hidden lg:flex items-center gap-2 bg-zinc-50 text-zinc-900 border border-zinc-300 hover:bg-zinc-100 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105 shadow-sm"
              title="Chat directly on WhatsApp: 9347 54 85 25"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-black"></span>
              </span>
              <MessageCircle className="w-4 h-4 text-zinc-900" />
              <div className="text-left">
                <div className="text-[10px] text-zinc-500 leading-none">Order via WhatsApp</div>
                <div className="text-zinc-900 font-bold">{storeSettings.displayPhone}</div>
              </div>
            </a>

            {/* Nav Switch: Store */}
            <button
              onClick={() => handleMenuSelect('home')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeView === 'store'
                  ? 'bg-black text-white border border-black shadow-sm'
                  : 'text-zinc-700 hover:text-black hover:bg-zinc-100 border border-transparent'
              }`}
              id="nav-home-btn"
            >
              <Home className="w-4 h-4" />
              <span>Products</span>
            </button>

            {/* Nav Switch: Categories */}
            <button
              onClick={() => handleMenuSelect('categories')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeView === 'categories'
                  ? 'bg-black text-white border border-black shadow-sm'
                  : 'text-zinc-700 hover:text-black hover:bg-zinc-100 border border-transparent'
              }`}
              id="nav-categories-btn"
            >
              <Grid className="w-4 h-4" />
              <span>Categories</span>
            </button>

            {/* Nav Switch: UPI / QR Scan */}
            {onOpenUpiModal && (
              <button
                onClick={onOpenUpiModal}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:text-black hover:bg-zinc-100 border border-zinc-300 transition-all shadow-sm"
                title="Scan Store UPI QR Code to Pay"
                id="nav-upi-qr-btn"
              >
                <QrCode className="w-4 h-4 text-zinc-900" />
                <span>UPI / QR Scan</span>
              </button>
            )}

            {/* Cart Button (Customer Interface ONLY) */}
            {activeView !== 'admin' && (
              <button
                onClick={onOpenCart}
                id="open-cart-btn"
                className="relative flex items-center gap-2 bg-black hover:bg-zinc-800 text-white px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-white" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-black">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="font-black">Cart</span>
                {cartTotal > 0 && (
                  <span className="hidden md:inline font-mono bg-zinc-800 text-white px-1.5 py-0.5 rounded text-xs">
                    {formatINR(cartTotal)}
                  </span>
                )}
              </button>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 text-zinc-600 hover:text-black rounded-lg hover:bg-zinc-100"
              id="mobile-menu-toggle"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="mt-2.5 md:hidden">
          <div className="relative w-full">
            <input
              type="text"
              id="search-input-mobile"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search electronic items..."
              className="w-full bg-zinc-50 text-zinc-900 placeholder-zinc-400 text-xs rounded-lg pl-9 pr-9 py-2 border border-zinc-300 outline-none focus:border-black"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 p-1"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Expanded Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden mt-3 pt-3 border-t border-zinc-200 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleMenuSelect('home')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg text-xs font-bold ${
                  activeView === 'store' ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-800'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
              <button
                onClick={() => handleMenuSelect('categories')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg text-xs font-bold ${
                  activeView === 'categories' ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-800'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Categories</span>
              </button>
            </div>

            <div>
              <button
                onClick={() => handleMenuSelect('admin')}
                className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-lg text-xs font-bold bg-zinc-100 text-zinc-900 border border-zinc-300"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
