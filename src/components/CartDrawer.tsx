import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  MessageCircle, 
  Tag, 
  ShieldCheck, 
  Zap, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CartItem, StoreSettings } from '../types';
import { formatINR, generateWhatsAppOrderUrl } from '../utils/helpers';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  storeSettings: StoreSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  storeSettings,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscountRate, setCouponDiscountRate] = useState(0);
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * couponDiscountRate);
  const shipping = subtotal >= storeSettings.freeShippingThreshold || subtotal === 0 ? 0 : storeSettings.shippingCharge;
  const finalTotal = subtotal - discountAmount + shipping;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    
    if (code === 'ASK15') {
      setAppliedCoupon('ASK15 (15% OFF)');
      setCouponDiscountRate(0.15);
      setCouponCode('');
    } else if (code === 'WELCOME10') {
      setAppliedCoupon('WELCOME10 (10% OFF)');
      setCouponDiscountRate(0.10);
      setCouponCode('');
    } else if (code === 'FLAT500' && subtotal >= 3000) {
      setAppliedCoupon('FLAT500 (₹500 OFF)');
      setCouponDiscountRate(500 / subtotal);
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon! Try ASK15 or WELCOME10');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscountRate(0);
  };

  const whatsappOrderUrl = generateWhatsAppOrderUrl(items, finalTotal, storeSettings);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div 
          className="w-screen max-w-md bg-white border-l border-zinc-200 text-zinc-900 flex flex-col justify-between shadow-2xl"
          id="cart-drawer-panel"
        >
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white border border-zinc-300 flex items-center justify-center text-zinc-900 shadow-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-zinc-900 text-base">Your Electronics Cart</h3>
                <p className="text-[11px] text-zinc-500">
                  {items.length} {items.length === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="text-xs text-zinc-500 hover:text-black p-1.5 transition-colors"
                  title="Clear Cart"
                  id="clear-cart-btn"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-300 text-zinc-600 hover:text-black hover:bg-zinc-200 flex items-center justify-center transition-all shadow-xs"
                id="close-cart-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 divide-y divide-zinc-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-zinc-900 text-base">Your Cart is Empty</h4>
                  <p className="text-xs text-zinc-500 max-w-xs">
                    Browse our collection of fans, digital lockers, lights, switches, and chargers to add items.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="bg-black hover:bg-zinc-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.product.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                  
                  {/* Thumbnail */}
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-zinc-100 border border-zinc-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-1">
                      <h5 className="text-xs font-bold text-zinc-900 truncate" title={item.product.name}>
                        {item.product.name}
                      </h5>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-zinc-400 hover:text-black p-1 shrink-0"
                        title="Remove product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] text-zinc-600 font-bold font-mono">
                      {formatINR(item.product.price)} each
                    </div>

                    {/* Quantity Modifier */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center bg-zinc-100 border border-zinc-300 rounded-lg p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="w-6 h-6 rounded bg-white hover:bg-zinc-200 shadow-xs flex items-center justify-center text-zinc-800 text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-bold text-zinc-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-6 h-6 rounded bg-white hover:bg-zinc-200 shadow-xs disabled:opacity-40 flex items-center justify-center text-zinc-800 text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-mono font-bold text-xs text-zinc-900">
                        {formatINR(item.product.price * item.quantity)}
                      </span>
                    </div>

                  </div>

                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout Actions */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-zinc-50 border-t border-zinc-200 space-y-4">
              
              {/* Coupon Code Input */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-white border border-zinc-300 px-3 py-2 rounded-xl text-xs text-zinc-900 shadow-xs">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900" />
                      <span>{appliedCoupon} Applied</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-zinc-500 hover:text-black text-[11px] underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Coupon: ASK15"
                        className="w-full bg-white text-zinc-900 placeholder-zinc-400 text-xs rounded-xl pl-8 pr-3 py-2 border border-zinc-300 focus:border-zinc-800 outline-none uppercase font-mono shadow-xs"
                      />
                      <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <button
                      type="submit"
                      className="bg-black hover:bg-zinc-800 text-white text-xs font-bold px-3 py-2 rounded-xl border border-black transition-colors shadow-xs"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-zinc-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-zinc-900" /> {couponError}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-mono text-zinc-800">{formatINR(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-zinc-900 font-bold">
                    <span>Discount</span>
                    <span className="font-mono">-{formatINR(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-600">
                  <span>Shipping</span>
                  <span className="font-mono text-zinc-800">
                    {shipping === 0 ? (
                      <span className="text-zinc-900 font-bold">FREE</span>
                    ) : (
                      formatINR(shipping)
                    )}
                  </span>
                </div>

                <div className="pt-2 border-t border-zinc-200 flex justify-between items-baseline font-bold text-sm">
                  <span className="text-zinc-900">Estimated Total</span>
                  <span className="font-mono text-lg text-zinc-900 font-black">{formatINR(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout Action Buttons */}
              <div className="space-y-2">
                {/* 1. Direct Instant Checkout Modal */}
                <button
                  onClick={onProceedToCheckout}
                  id="cart-proceed-checkout-btn"
                  className="w-full flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-black py-3 px-4 rounded-xl text-xs sm:text-sm shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Proceed to Quick Checkout</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </button>

                {/* 2. Direct WhatsApp Order Button */}
                <a
                  href={whatsappOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="cart-whatsapp-order-btn"
                  className="w-full flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition-all border border-zinc-300"
                >
                  <MessageCircle className="w-4 h-4 text-zinc-900" />
                  <span>1-Click Order via WhatsApp ({storeSettings.displayPhone})</span>
                </a>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-800" />
                <span>Secure Electronic Equipment Packaging & Guaranteed Delivery</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
