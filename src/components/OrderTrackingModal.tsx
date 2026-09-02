import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Package, 
  CheckCircle2, 
  Clock, 
  Truck, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Sparkles,
  Box,
  Layers
} from 'lucide-react';
import { Order, OrderStatus, StoreSettings } from '../types';
import { api } from '../utils/api';
import { formatINR } from '../utils/helpers';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
  storeSettings: StoreSettings;
}

const LIFECYCLE_STEPS: { status: OrderStatus; label: string; description: string; icon: React.ElementType }[] = [
  { status: 'Confirmed', label: 'Confirmed', description: 'Order verified & accepted', icon: CheckCircle2 },
  { status: 'Packed', label: 'Packed', description: 'Quality checked & packed', icon: Box },
  { status: 'Dispatched', label: 'Dispatched', description: 'In transit with courier', icon: Truck },
  { status: 'Delivered', label: 'Delivered', description: 'Delivered to address', icon: ShieldCheck },
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderId,
  storeSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialOrderId || '');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [matchedOrders, setMatchedOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasCopiedId, setHasCopiedId] = useState(false);
  const [hasCopiedAwb, setHasCopiedAwb] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialOrderId) {
        setSearchQuery(initialOrderId);
        handleSearch(initialOrderId);
      } else if (!trackedOrder) {
        // Load latest order if any in memory
        loadRecentOrder();
      }
    }
  }, [isOpen, initialOrderId]);

  const loadRecentOrder = async () => {
    try {
      const orders = await api.getOrders();
      if (orders && orders.length > 0) {
        setTrackedOrder(orders[0]);
        setSearchQuery(orders[0].id);
      }
    } catch (e) {
      console.warn('Failed to load initial order for tracking', e);
    }
  };

  const handleSearch = async (queryToSearch?: string) => {
    const q = (queryToSearch !== undefined ? queryToSearch : searchQuery).trim();
    if (!q) {
      setError('Please enter your Order ID or registered Phone number.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const res = await api.trackOrder(q);
      if (res && res.order) {
        setTrackedOrder(res.order);
        setMatchedOrders(res.allMatching || [res.order]);
      } else {
        setTrackedOrder(null);
        setMatchedOrders([]);
        setError(`No order found matching "${q}". Please verify the Order ID or phone number.`);
      }
    } catch (err) {
      setError('Unable to fetch order status. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const copyToClipboard = (text: string, isAwb = false) => {
    navigator.clipboard.writeText(text);
    if (isAwb) {
      setHasCopiedAwb(true);
      setTimeout(() => setHasCopiedAwb(false), 2000);
    } else {
      setHasCopiedId(true);
      setTimeout(() => setHasCopiedId(false), 2000);
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'Cancelled') return -1;
    if (status === 'Pending') return 0;
    if (status === 'Confirmed') return 0;
    if (status === 'Packed') return 1;
    if (status === 'Dispatched') return 2;
    if (status === 'Delivered') return 3;
    return 0;
  };

  const currentStepIdx = trackedOrder ? getStepIndex(trackedOrder.status) : 0;
  const isCancelled = trackedOrder?.status === 'Cancelled';

  // Find timestamp for a given status from statusHistory
  const getStatusTimestamp = (stepStatus: OrderStatus) => {
    if (!trackedOrder) return null;
    if (trackedOrder.statusHistory && trackedOrder.statusHistory.length > 0) {
      const match = trackedOrder.statusHistory.find((h) => h.status === stepStatus);
      if (match) return match.timestamp;
    }
    // Fallback: If current status is at or past this step, use createdAt / updatedAt
    const stepIdx = getStepIndex(stepStatus);
    if (currentStepIdx >= stepIdx) {
      return stepIdx === 0 ? trackedOrder.createdAt : (trackedOrder.updatedAt || trackedOrder.createdAt);
    }
    return null;
  };

  const formatTimestamp = (tsString?: string | null) => {
    if (!tsString) return '';
    try {
      const d = new Date(tsString);
      return d.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return tsString;
    }
  };

  const cleanPhone = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');
  const trackingWhatsappUrl = trackedOrder
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Hello ASK ENTERPRISES! I am inquiring about my Order ID: ${trackedOrder.id} (Current Status: ${trackedOrder.status}). Could you please share further delivery updates?`
      )}`
    : `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello ASK ENTERPRISES! I would like to track my order.')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-zinc-900">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-zinc-200 bg-zinc-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-bold shadow-sm">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-zinc-900 flex items-center gap-2">
                <span>Live Order Tracking</span>
                <span className="text-[10px] bg-zinc-200 text-zinc-800 px-2 py-0.5 rounded-full border border-zinc-300 font-bold uppercase tracking-wider">
                  Real-Time
                </span>
              </h3>
              <p className="text-xs text-zinc-500">
                Track status updates from confirmation to doorstep delivery
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors"
            title="Close tracker"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Search Bar */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="space-y-2"
          >
            <label className="text-xs font-bold text-zinc-700 flex items-center justify-between">
              <span>Track with Order ID or Phone Number:</span>
              <span className="text-[11px] text-zinc-500 font-normal">e.g. ORD-ASK-948102 or 9876543210</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Order ID (ORD-ASK-XXXXXX) or 10-digit Phone..."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl pl-10 pr-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-800 focus:outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-black hover:bg-zinc-800 text-white px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm shrink-0 flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Track</span>
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>

          {/* If Multiple Orders Matched Phone Number */}
          {matchedOrders.length > 1 && (
            <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-zinc-700">Found {matchedOrders.length} orders for this number:</span>
              <div className="flex flex-wrap gap-2">
                {matchedOrders.map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => {
                      setTrackedOrder(ord);
                      setSearchQuery(ord.id);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                      trackedOrder?.id === ord.id
                        ? 'bg-black text-white border-black font-bold'
                        : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400'
                    }`}
                  >
                    {ord.id} • {ord.status}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVE ORDER TRACKING DETAILS */}
          {trackedOrder ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Order Meta Bar */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-zinc-900">{trackedOrder.id}</span>
                    <button
                      onClick={() => copyToClipboard(trackedOrder.id)}
                      className="p-1 text-zinc-400 hover:text-black rounded hover:bg-zinc-200 transition-colors"
                      title="Copy Order ID"
                    >
                      {hasCopiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="text-xs text-zinc-500 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Placed on {formatTimestamp(trackedOrder.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[11px] text-zinc-500 font-medium">Order Total</div>
                    <div className="text-base font-mono font-black text-zinc-900">{formatINR(trackedOrder.total)}</div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border ${
                    trackedOrder.status === 'Delivered'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : trackedOrder.status === 'Dispatched'
                      ? 'bg-blue-50 text-blue-800 border-blue-300'
                      : trackedOrder.status === 'Packed'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : trackedOrder.status === 'Cancelled'
                      ? 'bg-red-50 text-red-800 border-red-300'
                      : 'bg-zinc-100 text-zinc-800 border-zinc-300'
                  }`}>
                    {trackedOrder.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* DYNAMIC VISUAL PROGRESS STEPPER */}
              {!isCancelled ? (
                <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-5 sm:p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-600 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-zinc-900" />
                      <span>Order Progress Pipeline</span>
                    </h4>
                    {trackedOrder.estimatedDelivery && (
                      <span className="text-xs text-zinc-700 font-semibold bg-white border border-zinc-200 px-3 py-1 rounded-full shadow-xs">
                        Est. Delivery: <strong className="text-zinc-900">{trackedOrder.estimatedDelivery}</strong>
                      </span>
                    )}
                  </div>

                  {/* Visual Stepper Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
                    {LIFECYCLE_STEPS.map((step, idx) => {
                      const StepIcon = step.icon;
                      const isCompleted = currentStepIdx >= idx;
                      const isCurrent = currentStepIdx === idx;
                      const stepTime = getStatusTimestamp(step.status);

                      return (
                        <div 
                          key={step.status} 
                          className={`flex flex-col p-3.5 rounded-2xl border transition-all ${
                            isCurrent
                              ? 'bg-black text-white border-black shadow-md'
                              : isCompleted
                              ? 'bg-white text-zinc-900 border-zinc-300'
                              : 'bg-zinc-100 text-zinc-400 border-zinc-200 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                              isCurrent
                                ? 'bg-white text-black'
                                : isCompleted
                                ? 'bg-black text-white'
                                : 'bg-zinc-200 text-zinc-500'
                            }`}>
                              <StepIcon className="w-4 h-4" />
                            </div>
                            <span className={`text-[10px] font-mono font-bold ${isCurrent ? 'text-zinc-400' : isCompleted ? 'text-zinc-500' : 'text-zinc-400'}`}>
                              0{idx + 1}
                            </span>
                          </div>

                          <div className="font-black text-xs sm:text-sm">{step.label}</div>
                          <div className={`text-[11px] line-clamp-1 mt-0.5 ${isCurrent ? 'text-zinc-300' : 'text-zinc-500'}`}>
                            {step.description}
                          </div>

                          {/* Dynamic Timestamp */}
                          {stepTime ? (
                            <div className={`text-[10px] font-mono mt-2 pt-2 border-t font-semibold ${
                              isCurrent ? 'border-zinc-700 text-zinc-300' : 'border-zinc-200 text-zinc-600'
                            }`}>
                              {formatTimestamp(stepTime)}
                            </div>
                          ) : (
                            <div className={`text-[10px] font-mono mt-2 pt-2 border-t ${isCurrent ? 'border-zinc-700 text-zinc-400' : 'border-zinc-200 text-zinc-400'}`}>
                              Pending
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Courier & Tracking Details Box if Dispatched/Delivered */}
                  {(trackedOrder.courierName || trackedOrder.trackingNumber) && (
                    <div className="bg-white p-4 rounded-2xl border border-zinc-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 shrink-0">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs text-zinc-500 font-medium">Courier Partner</div>
                          <div className="text-sm font-bold text-zinc-900">
                            {trackedOrder.courierName || 'Expedited Logistics Express'}
                          </div>
                        </div>
                      </div>

                      {trackedOrder.trackingNumber && (
                        <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl">
                          <div className="text-right">
                            <div className="text-[10px] text-zinc-500">AWB / Tracking Number</div>
                            <div className="font-mono text-xs font-bold text-zinc-900">{trackedOrder.trackingNumber}</div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(trackedOrder.trackingNumber || '', true)}
                            className="p-1.5 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-zinc-700 hover:text-black transition-colors"
                            title="Copy AWB Number"
                          >
                            {hasCopiedAwb ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-700 text-xs">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="font-bold">This order was cancelled.</span> If this is unexpected, please contact our support team on WhatsApp.
                  </div>
                </div>
              )}

              {/* DETAILED STATUS HISTORY LOGS */}
              {trackedOrder.statusHistory && trackedOrder.statusHistory.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-900" />
                    <span>Audit Status Log History</span>
                  </h4>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3">
                    {trackedOrder.statusHistory.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-start gap-3 pb-3 last:pb-0 border-b last:border-0 border-zinc-200"
                      >
                        <div className="w-2 h-2 rounded-full bg-black mt-1.5 shrink-0" />
                        <div className="flex-1 space-y-0.5">
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <span className="font-bold text-zinc-900 text-xs">
                              {item.status}
                              {item.updatedBy && (
                                <span className="ml-2 font-normal text-[10px] text-zinc-600 bg-zinc-200 px-1.5 py-0.5 rounded">
                                  by {item.updatedBy}
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">
                              {formatTimestamp(item.timestamp)}
                            </span>
                          </div>
                          {item.note && (
                            <p className="text-xs text-zinc-600 pt-0.5">{item.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ITEMS & DELIVERY ADDRESS SUMMARY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Delivery Address */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-2">
                  <div className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-900" />
                    <span>Delivery Address</span>
                  </div>
                  <div className="text-xs space-y-0.5 text-zinc-600">
                    <div className="font-bold text-zinc-900">{trackedOrder.customerName}</div>
                    <div className="text-zinc-600 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>{trackedOrder.customerPhone}</span>
                    </div>
                    <div className="pt-1">{trackedOrder.customerAddress}</div>
                    <div className="text-zinc-500">{trackedOrder.customerCity} - {trackedOrder.customerPincode}</div>
                    <div className="pt-1 text-[11px] text-zinc-500">
                      Payment Mode: <strong className="text-zinc-900">{trackedOrder.paymentMethod}</strong>
                    </div>
                  </div>
                </div>

                {/* Items in Order */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-2">
                  <div className="text-xs font-bold text-zinc-700 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-zinc-900" />
                      <span>Items Ordered ({trackedOrder.items.length})</span>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {trackedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-white p-2 rounded-xl border border-zinc-200 text-xs shadow-xs">
                        <div className="flex items-center gap-2 truncate">
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-7 h-7 rounded object-cover bg-zinc-100 shrink-0 border border-zinc-200"
                            referrerPolicy="no-referrer"
                          />
                          <span className="font-semibold text-zinc-900 truncate max-w-[150px] sm:max-w-[180px]">
                            {item.productName}
                          </span>
                          <span className="text-zinc-500 text-[11px]">x{item.quantity}</span>
                        </div>
                        <span className="font-mono font-bold text-zinc-900 shrink-0">
                          {formatINR(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Direct WhatsApp Support Button */}
              <div className="pt-2">
                <a
                  href={trackingWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white p-3.5 rounded-2xl font-bold text-xs border border-black transition-all shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span>Ask Support / Expedite Delivery via WhatsApp</span>
                </a>
              </div>

            </div>
          ) : (
            !isLoading && !error && (
              <div className="text-center py-10 space-y-3 bg-zinc-50 rounded-3xl border border-dashed border-zinc-300">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-300 flex items-center justify-center mx-auto text-zinc-500">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-zinc-900 text-sm">Enter your Order ID to see live progress</h4>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    You can find your Order ID in your order receipt or confirmation WhatsApp message.
                  </p>
                </div>
              </div>
            )
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
            <span>Guaranteed Express Transit & Delivery Support</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-900 font-bold transition-colors shadow-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
