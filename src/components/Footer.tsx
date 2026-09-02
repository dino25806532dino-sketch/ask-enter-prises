import React from 'react';
import { 
  Zap, 
  MessageCircle, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  Lock,
  QrCode,
  Package
} from 'lucide-react';
import { ProductCategory, StoreSettings, Category } from '../types';
import { CATEGORIES } from '../data/initialProducts';

interface FooterProps {
  storeSettings: StoreSettings;
  onSelectCategory: (cat: ProductCategory) => void;
  onOpenAdminLogin: () => void;
  isAdminLoggedIn: boolean;
  onOpenUpiModal?: () => void;
  onOpenTrackingModal?: () => void;
  categories?: Category[];
}

export const Footer: React.FC<FooterProps> = ({
  storeSettings,
  onSelectCategory,
  onOpenAdminLogin,
  isAdminLoggedIn,
  onOpenUpiModal,
  onOpenTrackingModal,
  categories,
}) => {
  const displayCategories = categories && categories.length > 0 ? categories : CATEGORIES;
  const cleanPhone = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello ASK ENTERPRISES! I would like to get a price quote / product support.')}`;

  return (
    <footer className="bg-white text-zinc-900 border-t border-zinc-200 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top Feature Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-zinc-50 rounded-3xl border border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 shrink-0 shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900">100% Genuine Electronics</h4>
              <p className="text-[11px] text-zinc-600">Direct factory authorized</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900">Full Manufacturer Warranty</h4>
              <p className="text-[11px] text-zinc-600">1 to 5 years brand coverage</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 shrink-0 shadow-sm">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900">Safe Heavy Packaging</h4>
              <p className="text-[11px] text-zinc-600">Shock-resistant transit</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 shrink-0 shadow-sm">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900">Instant UPI & QR Scan</h4>
              <p className="text-[11px] text-zinc-700 font-bold">GPay, PhonePe, Paytm</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs">
          
          {/* Brand Info (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-md">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-black text-zinc-900">
                ASK <span className="text-zinc-600">ENTERPRISES</span>
              </span>
            </div>

            <p className="text-zinc-600 max-w-sm leading-relaxed">
              Your premier direct electronics dealer. Supplying energy-efficient BLDC fans, biometric digital safes, architectural LED lighting, touch modular switchboards, and GaN ultra-fast chargers across India.
            </p>

            <div className="space-y-2 text-zinc-700">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-zinc-900" />
                <span className="font-mono font-bold text-zinc-900">Hotline: {storeSettings.displayPhone}</span>
              </div>

              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-zinc-900" />
                <a 
                  href={whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-zinc-900 hover:underline font-bold"
                >
                  WhatsApp: +91 {storeSettings.displayPhone}
                </a>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                <span>{storeSettings.address}</span>
              </div>
            </div>
          </div>

          {/* Electronics Categories (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-bold text-zinc-900 text-sm uppercase tracking-wider">
              Electronics Categories
            </h4>
            <div className="grid grid-cols-2 gap-2 text-zinc-600">
              {displayCategories.map((cat) => (
                <button
                  key={cat.id || cat.name}
                  onClick={() => onSelectCategory(cat.name || cat.id)}
                  className="text-left hover:text-black transition-colors py-1 truncate"
                >
                  • {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Direct Support & Admin Login (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-bold text-zinc-900 text-sm uppercase tracking-wider">
              Payments & Support
            </h4>
            
            <p className="text-zinc-600">
              Pay quickly via any UPI application or contact our support team for bulk invoice quotes.
            </p>

            <div className="flex flex-col gap-2">
              {onOpenTrackingModal && (
                <button
                  onClick={onOpenTrackingModal}
                  className="inline-flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-4 py-2 rounded-xl font-bold transition-all border border-zinc-300 shadow-sm text-xs"
                >
                  <Package className="w-4 h-4 text-zinc-900" />
                  <span>Live Order Tracking</span>
                </button>
              )}

              {onOpenUpiModal && (
                <button
                  onClick={onOpenUpiModal}
                  className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-black text-white px-4 py-2 rounded-xl font-bold transition-all shadow-sm text-xs"
                >
                  <QrCode className="w-4 h-4 text-white" />
                  <span>Scan Store UPI QR Code</span>
                </button>
              )}

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-4 py-2 rounded-xl font-bold transition-all border border-zinc-300 shadow-sm text-xs"
              >
                <MessageCircle className="w-4 h-4 text-zinc-900" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenAdminLogin}
                className="text-zinc-500 hover:text-zinc-900 flex items-center gap-1 text-[11px] underline"
              >
                <Lock className="w-3 h-3" />
                <span>{isAdminLoggedIn ? 'Go to Admin Dashboard' : 'Store Admin Login'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
          <div>
            © {new Date().getFullYear()} ASK ENTERPRISES. All Rights Reserved. Electronics Only.
          </div>
          <div className="text-zinc-600">
            WhatsApp Hotline: <span className="font-bold text-zinc-900">{storeSettings.displayPhone}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
