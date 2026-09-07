import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  PackageCheck,
  Calendar,
  Copy,
  Check
} from 'lucide-react';
import { CartItem, Order, StoreSettings } from '../types';
import { formatINR, formatOrderDate, generateWhatsAppOrderUrl } from '../utils/helpers';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  storeSettings: StoreSettings;
  customerOrders?: Order[];
  activeTab?: 'cart' | 'orders';
  onTabChange?: (tab: 'cart' | 'orders') => void;
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
  customerOrders = [],
  activeTab = 'cart',
  onTabChange,
}) => {
  const [currentTab, setCurrentTab] = useState<'cart' | 'orders'>(activeTab);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscountRate, setCouponDiscountRate] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Sync tab if parent passes a different tab
  useEffect(() => {
    if (activeTab) {
      setCurrentTab(activeTab);
    }
  }, [activeTab, isOpen]);

  const handleSwitchTab = (tab: 'cart' | 'orders') => {
    setCurrentTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const handleCopyOrderId = (id: string) => {
    try {
      navigator.clipboard.writeText(id);
      setCopiedOrderId(id);
      setTimeout(() => setCopiedOrderId(null), 2000);
    } catch (e) {
      // ignore
    }
  };

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

  const cleanPhone = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappOrderUrl = generateWhatsAppOrderUrl(items, finalTotal, storeSettings);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div 
          className="w-screen max-w-md bg-white border-l border-zinc-200 text-zinc-900 flex flex-col justify-between shadow-2xl"
          id="cart-drawer-panel"
        >
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 bg-zinc-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white border border-zinc-300 flex items-center justify-center text-zinc-900 shadow-xs">
                  {currentTab === 'cart' ? (
                    <ShoppingBag className="w-4 h-4" />
                  ) : (
                    <PackageCheck className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="font-black text-zinc-900 text-base">
                    {currentTab === 'cart' ? 'Your Electronics Cart' : 'My Confirmed Orders'}
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    {currentTab === 'cart'
                      ? `${items.length} ${items.length === 1 ? 'item' : 'items'} in cart`
                      : `${customerOrders.length} ${customerOrders.length === 1 ? 'order' : 'orders'} placed`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentTab === 'cart' && items.length > 0 && (
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

            {/* Segmented Switcher: Cart / Order Information */}
            <div className="mt-3.5 flex bg-zinc-200/80 p-1 rounded-xl border border-zinc-300">
              <button
                onClick={() => handleSwitchTab('cart')}
                id="tab-btn-cart"
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  currentTab === 'cart'
                    ? 'bg-white text-zinc-900 shadow-xs border border-zinc-300'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Cart</span>
                {items.length > 0 && (
                  <span className="ml-1 bg-black text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                    {items.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleSwitchTab('orders')}
                id="tab-btn-orders"
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  currentTab === 'orders'
                    ? 'bg-white text-zinc-900 shadow-xs border border-zinc-300'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>Order Information</span>
                {customerOrders.length > 0 && (
                  <span className="ml-1 bg-emerald-700 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                    {customerOrders.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Drawer Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {currentTab === 'cart' ? (
              /* Active Cart Tab */
              items.length === 0 ? (
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
                  {customerOrders.length > 0 && (
                    <button
                      onClick={() => handleSwitchTab('orders')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 px-4 py-2 rounded-xl transition-all shadow-xs"
                    >
                      <PackageCheck className="w-3.5 h-3.5 text-zinc-900" />
                      <span>View {customerOrders.length} Confirmed Order{customerOrders.length > 1 ? 's' : ''}</span>
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="bg-black hover:bg-zinc-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-3 divide-y divide-zinc-100">
                  {items.map((item) => (
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
                  ))}
                </div>
              )
            ) : (
              /* My Orders Tab */
              customerOrders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400">
                    <PackageCheck className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-zinc-900 text-base">No Confirmed Orders Yet</h4>
                    <p className="text-xs text-zinc-500 max-w-xs">
                      When you place an order with Buy Now or Quick Checkout, your confirmed purchases will immediately appear here.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSwitchTab('cart')}
                    className="bg-black hover:bg-zinc-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all"
                  >
                    Go to Active Cart
                  </button>
                </div>
              ) : (
                <div className="space-y-4" id="confirmed-orders-list">
                  <div className="flex items-center justify-between pb-1 text-xs text-zinc-500 font-semibold border-b border-zinc-100">
                    <span>{customerOrders.length} Confirmed {customerOrders.length === 1 ? 'Order' : 'Orders'}</span>
                    <span className="text-[11px] text-emerald-800 font-bold">● Active Store Sync</span>
                  </div>

                  {customerOrders.map((order) => {
                    const statusText = order.status || 'Confirmed';
                    let deliveryMessage = 'Your order will be delivered within 7 days.';
                    let deliveryBadgeClass = 'bg-zinc-100 border-zinc-300 text-zinc-900';
                    let deliveryIcon = '🚚';

                    if (statusText === 'Delayed') {
                      deliveryMessage = 'Your order has been delayed. We will update you soon.';
                      deliveryBadgeClass = 'bg-amber-50 border-amber-300 text-amber-900';
                      deliveryIcon = '⚠️';
                    } else if (statusText === 'Delivered') {
                      deliveryMessage = 'Your order has been delivered successfully!';
                      deliveryBadgeClass = 'bg-emerald-50 border-emerald-300 text-emerald-900';
                      deliveryIcon = '✅';
                    }

                    return (
                      <div 
                        key={order.id}
                        className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3.5 shadow-xs hover:border-zinc-300 transition-colors"
                        id={`order-card-${order.id}`}
                      >
                        {/* Order Header Meta */}
                        <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-zinc-200">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-black text-zinc-900">
                                #{order.id}
                              </span>
                              <button
                                onClick={() => handleCopyOrderId(order.id)}
                                className="text-zinc-400 hover:text-black p-0.5 rounded transition-colors"
                                title="Copy Order ID"
                              >
                                {copiedOrderId === order.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            {/* Order Date */}
                            <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-1">
                              <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                              <span>Order Date: <strong className="text-zinc-800 font-semibold">{formatOrderDate(order.createdAt)}</strong></span>
                            </div>
                          </div>

                          {/* Order Status */}
                          <div className="shrink-0 text-right">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-2xs ${
                              statusText === 'Delayed'
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : statusText === 'Ready to Deliver'
                                ? 'bg-blue-50 text-blue-900 border-blue-300'
                                : statusText === 'Delivered'
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                : statusText === 'Order Received'
                                ? 'bg-zinc-100 text-zinc-900 border-zinc-300'
                                : 'bg-zinc-900 text-white border-zinc-900'
                            }`}>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{statusText}</span>
                            </span>
                          </div>
                        </div>

                        {/* Customer Details & Delivery Address */}
                        <div className="bg-white p-3 rounded-xl border border-zinc-200/80 space-y-1 text-xs">
                          <div className="flex items-center justify-between text-zinc-900">
                            <span>Customer Name: <strong className="font-bold text-zinc-950">{order.customerName}</strong></span>
                            {order.customerPhone && (
                              <span className="text-[11px] text-zinc-500 font-mono">📱 {order.customerPhone}</span>
                            )}
                          </div>
                          <div className="text-zinc-600 text-[11px] leading-relaxed">
                            <span className="font-semibold text-zinc-700">Delivery Address: </span>
                            {order.customerAddress}{order.customerCity ? `, ${order.customerCity}` : ''}{order.customerPincode ? ` - ${order.customerPincode}` : ''}
                          </div>
                        </div>

                        {/* Products inside this order */}
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-zinc-200/80 shadow-2xs">
                              {/* Product Image */}
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="w-14 h-14 rounded-lg object-cover bg-zinc-100 border border-zinc-200 shrink-0"
                                referrerPolicy="no-referrer"
                              />

                              {/* Product Name, Quantity, Price */}
                              <div className="flex-1 min-w-0">
                                <h5 className="text-xs font-bold text-zinc-900 truncate" title={item.productName}>
                                  {item.productName}
                                </h5>
                                <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-600">
                                  <span>Quantity: <strong className="font-mono text-zinc-900 font-bold">{item.quantity}</strong></span>
                                  <span>Price: <strong className="font-mono text-zinc-900 font-bold">{formatINR(item.price)}</strong></span>
                                </div>
                              </div>

                              {/* Line Total */}
                              <div className="text-right shrink-0">
                                <span className="font-mono font-black text-xs text-zinc-900">
                                  {formatINR(item.price * item.quantity)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Total & Payment Info */}
                        <div className="pt-2 border-t border-zinc-200/80 flex items-center justify-between text-xs">
                          <span className="text-zinc-600">
                            Payment: <strong className="text-zinc-800">{order.paymentMethod}</strong>
                            {order.upiRefNumber ? ` (Ref: ${order.upiRefNumber})` : ''}
                          </span>
                          <div className="text-right">
                            <span className="text-zinc-600 text-[11px] mr-1.5">Total Amount:</span>
                            <span className="font-mono text-base font-black text-zinc-900">
                              {formatINR(order.total)}
                            </span>
                          </div>
                        </div>

                        {/* Expected Delivery Notice */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Expected Delivery:</span>
                          <div className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold shadow-2xs ${deliveryBadgeClass}`}>
                            <span className="text-base shrink-0">{deliveryIcon}</span>
                            <span className="flex-1 leading-snug">{deliveryMessage}</span>
                          </div>
                        </div>

                        {/* Admin Message / Order Update Section */}
                        <div className="bg-zinc-100 border border-zinc-300 rounded-xl p-3.5 space-y-2 shadow-2xs" id={`admin-message-box-${order.id}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold text-zinc-950 text-xs">
                              <MessageCircle className="w-3.5 h-3.5 text-zinc-800" />
                              <span>Admin Message / Order Update</span>
                            </div>
                            {order.adminMessageTimestamp && (
                              <span className="text-[10px] text-zinc-600 font-mono">
                                {formatOrderDate(order.adminMessageTimestamp)}
                              </span>
                            )}
                          </div>

                          <div className="bg-white p-3 rounded-lg border border-zinc-200 text-xs leading-relaxed text-zinc-900 font-medium">
                            {order.adminMessage ? (
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Latest Message from Admin:</span>
                                <p className="text-zinc-950 font-bold italic text-xs">“{order.adminMessage}”</p>
                              </div>
                            ) : (
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Latest Message from Admin:</span>
                                <p className="text-zinc-800 italic text-xs">
                                  {statusText === 'Order Received'
                                    ? '“Your order has been received. Our team will verify and contact you shortly.”'
                                    : statusText === 'Confirmed'
                                    ? '“Your order has been confirmed. We will contact you before delivery.”'
                                    : statusText === 'Ready to Deliver'
                                    ? '“Your order is ready to deliver and will arrive soon.”'
                                    : statusText === 'Delayed'
                                    ? '“Your order has been delayed. We will update you soon.”'
                                    : statusText === 'Delivered'
                                    ? '“Your order has been delivered successfully! Thank you for choosing ASK ENTERPRISES.”'
                                    : '“Your order is confirmed and being prepared.”'}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Previous messages from admin if any */}
                          {order.messages && order.messages.length > 1 && (
                            <div className="pt-1.5 border-t border-zinc-200 space-y-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Previous Messages:</span>
                              <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                                {order.messages.slice(1).map((msg) => (
                                  <div key={msg.id} className="bg-white/80 p-2 rounded-md border border-zinc-200 text-[11px] text-zinc-700">
                                    <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-0.5">
                                      <span className="font-semibold text-zinc-800">Admin</span>
                                      <span className="font-mono">{formatOrderDate(msg.timestamp)}</span>
                                    </div>
                                    <p className="italic">“{msg.message}”</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* WhatsApp Customer Support Button */}
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                            `Hello ASK ENTERPRISES! 👋\nI need customer support regarding my Order #${order.id}.\nCustomer: ${order.customerName}\nProducts: ${order.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}\nTotal: ${formatINR(order.total)}\nStatus: ${order.status}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-xs"
                          id={`whatsapp-customer-support-btn-${order.id}`}
                        >
                          <MessageCircle className="w-4 h-4 text-white" />
                          <span>WhatsApp Customer Support</span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>

          {/* Footer Summary & Checkout Actions for Active Cart */}
          {currentTab === 'cart' && items.length > 0 && (
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
                  className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-black py-3 px-4 rounded-xl text-xs sm:text-sm shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] border border-yellow-500"
                >
                  <Zap className="w-4 h-4 fill-current text-zinc-950" />
                  <span>Proceed to Quick Checkout</span>
                  <ArrowRight className="w-4 h-4 ml-auto text-zinc-950" />
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

          {/* Footer for My Orders Tab */}
          {currentTab === 'orders' && (
            <div className="p-4 bg-zinc-50 border-t border-zinc-200 space-y-2 text-center">
              <p className="text-[11px] text-zinc-500">
                Questions about your delivery? Contact Ask Enterprises directly.
              </p>
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 bg-black hover:bg-zinc-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition-all"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span>WhatsApp Customer Support ({storeSettings.displayPhone})</span>
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

