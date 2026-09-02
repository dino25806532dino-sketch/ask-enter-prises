import React from 'react';
import { 
  CheckCircle2, 
  X, 
  MessageCircle, 
  Copy, 
  PackageCheck,
  QrCode,
  Truck
} from 'lucide-react';
import { Order, StoreSettings } from '../types';
import { formatINR } from '../utils/helpers';
import { UpiPaymentBox } from './UpiPaymentBox';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  storeSettings: StoreSettings;
  onTrackOrder?: (orderId: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  storeSettings,
  onTrackOrder,
}) => {
  if (!order) return null;

  const cleanPhone = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');
  const shareText = `⚡ *ORDER CONFIRMATION - ASK ENTERPRISES*\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `*Order ID:* ${order.id}\n` +
    `*Customer:* ${order.customerName}\n` +
    `*Phone:* ${order.customerPhone}\n` +
    `*Delivery City:* ${order.customerCity} (${order.customerPincode})\n` +
    `*Payment Mode:* ${order.paymentMethod}${order.upiRefNumber ? ` (Ref: ${order.upiRefNumber})` : ''}\n` +
    `*Total Amount:* ${formatINR(order.total)}\n\n` +
    `*Items:*\n` +
    order.items.map((i, idx) => `${idx + 1}. ${i.productName} (Qty: ${i.quantity})`).join('\n') +
    `\n━━━━━━━━━━━━━━━━━━━━━\n` +
    `Please confirm the order dispatch timeline.`;

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(shareText)}`;

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white border border-zinc-200 text-zinc-900 rounded-3xl shadow-2xl overflow-hidden my-6"
        id="order-success-dialog"
      >
        {/* Success Header */}
        <div className="bg-zinc-50 p-6 text-center border-b border-zinc-200 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 border border-zinc-300 text-zinc-600 hover:text-black hover:bg-zinc-200 flex items-center justify-center transition-all shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-black border border-black flex items-center justify-center mx-auto mb-3 text-white shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-zinc-900">
            Order Placed Successfully!
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Thank you for shopping at ASK ENTERPRISES
          </p>
        </div>

        {/* Order Details Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Order ID & Status Badge */}
          <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Order Reference ID</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-bold text-base text-zinc-900">{order.id}</span>
                <button
                  onClick={handleCopyOrderId}
                  className="text-zinc-500 hover:text-black p-1 rounded hover:bg-zinc-200"
                  title="Copy Order ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Status</span>
              <span className="inline-block bg-zinc-200 text-zinc-900 border border-zinc-300 text-xs font-bold px-2.5 py-0.5 rounded-full mt-0.5">
                {order.status}
              </span>
            </div>
          </div>

          {/* If UPI payment method, show dynamic UPI QR Box for quick settlement */}
          {order.paymentMethod === 'UPI' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-zinc-700 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-zinc-900" />
                  <span>Scan to Pay / UPI Reference</span>
                </h4>
                {order.upiRefNumber && (
                  <span className="text-[10px] bg-zinc-100 border border-zinc-300 px-2 py-0.5 rounded font-mono text-zinc-800">
                    Ref: {order.upiRefNumber}
                  </span>
                )}
              </div>
              <UpiPaymentBox
                amount={order.total}
                orderNote={`Order ${order.id} - ${order.customerName}`}
                storeSettings={storeSettings}
                isCompact={true}
              />
            </div>
          )}

          {/* Items Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-zinc-700 flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-zinc-900" />
              <span>Ordered Electronic Items</span>
            </h4>
            <div className="bg-zinc-50 rounded-2xl border border-zinc-200 divide-y divide-zinc-200">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-10 h-10 rounded-lg object-cover bg-white shrink-0 border border-zinc-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-zinc-900 truncate max-w-[200px] sm:max-w-xs">
                        {item.productName}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Qty: {item.quantity} x {formatINR(item.price)}
                      </div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-zinc-900 shrink-0">
                    {formatINR(item.price * item.quantity)}
                  </div>
                </div>
              ))}
              
              <div className="p-3 bg-zinc-100 flex justify-between font-bold text-sm">
                <span className="text-zinc-700">Total Paid / Payable:</span>
                <span className="font-mono text-zinc-900 text-base font-black">{formatINR(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 text-xs space-y-1.5">
            <div className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
              Delivery Address:
            </div>
            <div className="text-zinc-900 font-semibold">{order.customerName} ({order.customerPhone})</div>
            <div className="text-zinc-700">{order.customerAddress}</div>
            <div className="text-zinc-500">{order.customerCity} - {order.customerPincode}</div>
            <div className="text-zinc-500 pt-1 text-[11px]">
              Payment Method: <span className="font-bold text-zinc-900">{order.paymentMethod}</span>
              {order.upiRefNumber && <span className="font-mono text-zinc-700 ml-2">({order.upiRefNumber})</span>}
            </div>
          </div>

          {/* WhatsApp Confirmation Action Button */}
          <div className="space-y-2 pt-2">
            {onTrackOrder && (
              <button
                onClick={() => onTrackOrder(order.id)}
                className="w-full flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-sm transition-all"
              >
                <Truck className="w-4 h-4 text-white" />
                <span>Track Live Order Status</span>
              </button>
            )}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold py-3 px-4 rounded-xl text-xs sm:text-sm border border-zinc-300 shadow-xs transition-all"
            >
              <MessageCircle className="w-4 h-4 text-zinc-900" />
              <span>Send Order & Payment Proof on WhatsApp</span>
            </a>

            <button
              onClick={onClose}
              className="w-full bg-white hover:bg-zinc-100 text-zinc-700 font-bold py-2.5 px-4 rounded-xl text-xs border border-zinc-300 transition-colors shadow-xs"
            >
              Continue Shopping
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
