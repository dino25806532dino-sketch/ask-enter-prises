import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Truck, 
  Zap, 
  Banknote, 
  Smartphone, 
  ArrowRight,
  AlertCircle,
  QrCode
} from 'lucide-react';
import { CartItem, Order, StoreSettings } from '../types';
import { formatINR } from '../utils/helpers';
import { UpiPaymentBox } from './UpiPaymentBox';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderCreated: (order: Order) => void;
  storeSettings: StoreSettings;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderCreated,
  storeSettings,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [notes, setNotes] = useState('');
  const [upiRefNumber, setUpiRefNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI'>('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= storeSettings.freeShippingThreshold || subtotal === 0 ? 0 : storeSettings.shippingCharge;
  const total = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !phone.trim() || !address.trim() || !city.trim() || !pincode.trim()) {
      setFormError('Please fill all required customer contact & delivery fields.');
      return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
      setFormError('Please enter a valid 10-digit mobile / WhatsApp phone number.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const orderId = `ASK-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder: Order = {
        id: orderId,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerAddress: address.trim(),
        customerPincode: pincode.trim(),
        customerCity: city.trim(),
        items: items.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          image: i.product.image,
        })),
        subtotal,
        discount: 0,
        shipping,
        total,
        paymentMethod,
        upiRefNumber: paymentMethod === 'UPI' ? upiRefNumber.trim() || undefined : undefined,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        notes: [notes.trim(), upiRefNumber.trim() ? `UPI Ref: ${upiRefNumber.trim()}` : ''].filter(Boolean).join(' | ') || undefined,
      };

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ffffff', '#e4e4e7', '#a1a1aa', '#71717a'],
        });
      } catch (err) {
        // ignore
      }

      setIsSubmitting(false);
      onOrderCreated(newOrder);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white border border-zinc-200 text-zinc-900 rounded-3xl shadow-2xl overflow-hidden my-6"
        id="checkout-dialog"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-zinc-300 flex items-center justify-center text-zinc-900 shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-zinc-900 text-lg">Instant Electronics Checkout</h3>
              <p className="text-xs text-zinc-500">
                ASK ENTERPRISES Direct Fast Dispatch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-300 text-zinc-600 hover:text-black hover:bg-zinc-200 flex items-center justify-center transition-all shadow-xs"
            id="close-checkout-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {formError && (
            <div className="bg-zinc-100 border border-zinc-300 p-3 rounded-xl text-xs text-zinc-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-zinc-900 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Customer Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              1. Customer & Delivery Address
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-700 font-semibold mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  id="checkout-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Reddy"
                  className="w-full bg-zinc-50 text-zinc-900 placeholder-zinc-400 text-xs rounded-xl px-3.5 py-2.5 border border-zinc-300 focus:border-zinc-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-700 font-semibold mb-1">
                  WhatsApp / Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  id="checkout-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 98480 12345"
                  className="w-full bg-zinc-50 text-zinc-900 placeholder-zinc-400 text-xs rounded-xl px-3.5 py-2.5 border border-zinc-300 focus:border-zinc-800 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-700 font-semibold mb-1">
                Full Street Address / House No / Landmark *
              </label>
              <textarea
                required
                rows={2}
                id="checkout-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Flat 301, Sri Krishna Nilayam, Main Road, Beside Post Office"
                className="w-full bg-zinc-50 text-zinc-900 placeholder-zinc-400 text-xs rounded-xl px-3.5 py-2 border border-zinc-300 focus:border-zinc-800 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-700 font-semibold mb-1">
                  City / Town *
                </label>
                <input
                  type="text"
                  required
                  id="checkout-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Hyderabad"
                  className="w-full bg-zinc-50 text-zinc-900 placeholder-zinc-400 text-xs rounded-xl px-3.5 py-2.5 border border-zinc-300 focus:border-zinc-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-700 font-semibold mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  id="checkout-pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 500033"
                  className="w-full bg-zinc-50 text-zinc-900 placeholder-zinc-400 text-xs rounded-xl px-3.5 py-2.5 border border-zinc-300 focus:border-zinc-800 outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3 pt-3 border-t border-zinc-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                2. Choose Payment Method
              </h4>
              {paymentMethod === 'UPI' && (
                <span className="text-[11px] font-bold text-zinc-900 flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Instant QR Enabled</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label 
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'UPI'
                    ? 'bg-black text-white border-black shadow-sm'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-400'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="UPI"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                  className="text-black focus:ring-black"
                />
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    <span>UPI / QR Scan</span>
                  </div>
                  <div className={`text-[10px] ${paymentMethod === 'UPI' ? 'text-zinc-300 font-semibold' : 'text-zinc-500'}`}>
                    GPay, PhonePe, Paytm, BHIM, CRED
                  </div>
                </div>
              </label>

              <label 
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'bg-black text-white border-black shadow-sm'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-400'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="text-black focus:ring-black"
                />
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <Banknote className="w-4 h-4" />
                    <span>Cash on Delivery</span>
                  </div>
                  <div className={`text-[10px] ${paymentMethod === 'COD' ? 'text-zinc-300 font-semibold' : 'text-zinc-500'}`}>
                    Pay cash upon delivery at your address
                  </div>
                </div>
              </label>
            </div>

            {/* If UPI is selected, display the live dynamic UPI QR and scanner panel */}
            {paymentMethod === 'UPI' && (
              <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <UpiPaymentBox
                  amount={total}
                  orderNote={`ASK ENTERPRISES - ${items.length} items`}
                  storeSettings={storeSettings}
                  upiRefNumber={upiRefNumber}
                  onUpiRefChange={setUpiRefNumber}
                />
              </div>
            )}
          </div>

          {/* Items Mini Summary */}
          <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-zinc-900 border-b border-zinc-200 pb-1.5">
              <span>Order Items ({items.length})</span>
              <span className="font-mono text-zinc-900">{formatINR(total)}</span>
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1 text-zinc-600 text-[11px]">
              {items.map((i) => (
                <div key={i.product.id} className="flex justify-between">
                  <span className="truncate max-w-[280px]">
                    {i.quantity}x {i.product.name}
                  </span>
                  <span className="font-mono text-zinc-800">
                    {formatINR(i.product.price * i.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              id="confirm-place-order-btn"
              className="w-full flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-black py-3.5 px-4 rounded-xl text-sm shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{isSubmitting ? 'Confirming Order...' : `Place Order • ${formatINR(total)}`}</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500">
            <Truck className="w-3.5 h-3.5 text-zinc-800" />
            <span>Delivery Tracking Updates will be sent to your WhatsApp number</span>
          </div>

        </form>
      </div>
    </div>
  );
};
