import React, { useState } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Truck, 
  MessageCircle, 
  Sparkles, 
  ArrowRight, 
  PhoneCall,
  Palette,
  Check,
  Wind,
  UtensilsCrossed
} from 'lucide-react';
import { StoreSettings, ProductCategory, ThemeColor } from '../types';
import { getTheme, THEMES } from '../utils/theme';

interface HeroBannerProps {
  storeSettings: StoreSettings;
  onExploreCategory: (cat: ProductCategory) => void;
  onScrollToProducts: () => void;
  onUpdateThemeColor?: (color: ThemeColor) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  storeSettings,
  onExploreCategory,
  onScrollToProducts,
  onUpdateThemeColor,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const theme = getTheme(storeSettings.themeColor);
  const cleanPhone = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello ASK ENTERPRISES! I want to inquire about bulk/retail electronics pricing.')}`;

  return (
    <div className="relative bg-white text-zinc-900 border-b border-zinc-200 py-8 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Premier Header Control Row */}
        <div className="flex items-center justify-end gap-2 mb-4">
          {/* Quick Monochrome Theme Selector */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              id="premier-color-picker-toggle-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-300 shadow-sm transition-all"
              title="Select Monochrome Mode"
            >
              <Palette className="w-3.5 h-3.5 text-zinc-800" />
              <span className="hidden sm:inline">Theme:</span>
              <span className="font-semibold text-zinc-900">{theme.name}</span>
              <span 
                className="w-3 h-3 rounded-full border border-zinc-400 inline-block shadow-sm bg-black"
              />
            </button>

            {/* Dropdown Monochrome Palette */}
            {showColorPicker && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-zinc-200 p-3 rounded-2xl shadow-xl z-30 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100">
                  <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Black & White Options</span>
                  </span>
                  <span className="text-[10px] text-zinc-500">Live preview</span>
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  {(Object.keys(THEMES) as ThemeColor[]).map((cKey) => {
                    const t = THEMES[cKey];
                    const isSelected = (storeSettings.themeColor || 'monochrome') === cKey;
                    return (
                      <button
                        key={cKey}
                        onClick={() => {
                          if (onUpdateThemeColor) {
                            onUpdateThemeColor(cKey);
                          }
                          setShowColorPicker(false);
                        }}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-black text-white font-bold'
                            : 'hover:bg-zinc-100 text-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-4 h-4 rounded-full shadow-sm border border-zinc-400 shrink-0 bg-black" 
                          />
                          <span>{t.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Hero Text (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-zinc-900">
              Power Up With <br />
              <span className="text-black underline decoration-zinc-300 decoration-4 underline-offset-8">
                ASK ENTERPRISES
              </span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Your trusted premier destination for electronics and appliances. Direct dealer pricing on Air Conditioners, BLDC Fans, Home Appliances, Biometric Digital Lockers, Dry Irons, and LED Lighting.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={onScrollToProducts}
                id="hero-shop-now-btn"
                className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all text-sm"
              >
                <span>Shop Products</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="hero-whatsapp-btn"
                className="flex items-center gap-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 font-bold px-5 py-3 rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all text-sm border border-zinc-300"
              >
                <MessageCircle className="w-4 h-4 text-zinc-900" />
                <span>WhatsApp: {storeSettings.displayPhone}</span>
              </a>
            </div>

            {/* Micro Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 max-w-lg mx-auto lg:mx-0 text-left">
              <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl shadow-sm">
                <ShieldCheck className="w-5 h-5 shrink-0 text-zinc-900" />
                <div>
                  <div className="text-xs font-bold text-zinc-900 leading-tight">100% Genuine</div>
                  <div className="text-[10px] text-zinc-500">Tested Quality</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl shadow-sm">
                <Truck className="w-5 h-5 shrink-0 text-zinc-900" />
                <div>
                  <div className="text-xs font-bold text-zinc-900 leading-tight">Fast Dispatch</div>
                  <div className="text-[10px] text-zinc-500">Safe Packing</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl shadow-sm col-span-2 sm:col-span-1">
                <PhoneCall className="w-5 h-5 text-zinc-900 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-zinc-900 leading-tight">Instant Support</div>
                  <div className="text-[10px] text-zinc-500">{storeSettings.displayPhone}</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Highlight Bento Cards (5 Cols) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
            
            {/* Card 1: Air Conditioners */}
            <div 
              onClick={() => onExploreCategory('Air Conditioners')}
              className="group cursor-pointer bg-zinc-50 hover:bg-white p-4 rounded-2xl border border-zinc-200 hover:border-zinc-400 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md relative overflow-hidden"
            >
              <div 
                className="w-9 h-9 rounded-xl border border-zinc-200 bg-white text-zinc-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm"
              >
                <Wind className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-zinc-900 text-sm group-hover:underline transition-colors">
                Air Conditioners
              </h3>
              <p className="text-[11px] text-zinc-600 mt-1">
                Daikin & Voltas 5-Star Split ACs with copper condenser.
              </p>
              <div className="text-[10px] font-bold mt-2 flex items-center gap-1 text-zinc-800 group-hover:text-black">
                <span>View ACs</span> →
              </div>
            </div>

            {/* Card 2: Home Appliances */}
            <div 
              onClick={() => onExploreCategory('Home Appliances')}
              className="group cursor-pointer bg-zinc-50 hover:bg-white p-4 rounded-2xl border border-zinc-200 hover:border-zinc-400 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md relative overflow-hidden"
            >
              <div 
                className="w-9 h-9 rounded-xl border border-zinc-200 bg-white text-zinc-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm"
              >
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-zinc-900 text-sm group-hover:underline transition-colors">
                Home Appliances
              </h3>
              <p className="text-[11px] text-zinc-600 mt-1">
                Geysers, mixer grinders, gas stoves & dispensers.
              </p>
              <div className="text-[10px] font-bold mt-2 flex items-center gap-1 text-zinc-800 group-hover:text-black">
                <span>Explore Appliances</span> →
              </div>
            </div>

            {/* Card 3: Fans */}
            <div 
              onClick={() => onExploreCategory('Fans')}
              className="group cursor-pointer bg-zinc-50 hover:bg-white p-4 rounded-2xl border border-zinc-200 hover:border-zinc-400 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md relative overflow-hidden"
            >
              <div 
                className="w-9 h-9 rounded-xl border border-zinc-200 bg-white text-zinc-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm"
              >
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-zinc-900 text-sm group-hover:underline transition-colors">
                BLDC & Exhaust Fans
              </h3>
              <p className="text-[11px] text-zinc-600 mt-1">
                Save 65% power with remote controlled smart ceiling fans.
              </p>
              <div className="text-[10px] font-bold mt-2 flex items-center gap-1 text-zinc-800 group-hover:text-black">
                <span>Browse Fans</span> →
              </div>
            </div>

            {/* Card 4: Digital Lockers */}
            <div 
              onClick={() => onExploreCategory('Digital Lockers')}
              className="group cursor-pointer bg-zinc-50 hover:bg-white p-4 rounded-2xl border border-zinc-200 hover:border-zinc-400 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md relative overflow-hidden"
            >
              <div 
                className="w-9 h-9 rounded-xl border border-zinc-200 bg-white text-zinc-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm"
              >
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-zinc-900 text-sm group-hover:underline transition-colors">
                Digital Lockers
              </h3>
              <p className="text-[11px] text-zinc-600 mt-1">
                Ozone Safilo & Tusker biometric fingerprint safes.
              </p>
              <div className="text-[10px] font-bold mt-2 flex items-center gap-1 text-zinc-800 group-hover:text-black">
                <span>View Lockers</span> →
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
