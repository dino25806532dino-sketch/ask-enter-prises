import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  QrCode, 
  Copy, 
  Check, 
  Smartphone, 
  Zap, 
  ShieldCheck, 
  MessageCircle,
  RefreshCw
} from 'lucide-react';
import { StoreSettings } from '../types';
import { formatINR } from '../utils/helpers';

interface UpiQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount?: number;
  note?: string;
  storeSettings: StoreSettings;
}

export const UpiQrModal: React.FC<UpiQrModalProps> = ({
  isOpen,
  onClose,
  amount,
  note = 'Direct Store Payment',
  storeSettings,
}) => {
  const [customAmount, setCustomAmount] = useState<string>(amount ? String(amount) : '');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const effectiveAmount = customAmount ? parseFloat(customAmount) : (amount || 0);
  const upiId = storeSettings.upiId || '9347548525@upi';
  const payeeName = storeSettings.upiName || storeSettings.storeName || 'ASK ENTERPRISES';

  const upiUri = effectiveAmount > 0
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${effectiveAmount}&cu=INR&tn=${encodeURIComponent(note)}`
    : `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&cu=INR&tn=${encodeURIComponent(note)}`;

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    QRCode.toDataURL(upiUri, {
      width: 420,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.warn('QR code generation error:', err);
        if (isMounted) {
          setQrDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(upiUri)}`);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [upiUri, isOpen]);

  if (!isOpen) return null;

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const cleanPhone = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ASK ENTERPRISES! I am making a UPI payment of ₹${effectiveAmount || ''} via UPI ID ${upiId}.`)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white border border-zinc-200 text-zinc-900 rounded-3xl shadow-2xl overflow-hidden my-6"
        id="upi-qr-modal-dialog"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-black shadow-sm">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-zinc-900 text-base sm:text-lg">Instant UPI & QR Scan</h3>
              <p className="text-xs text-zinc-500">
                {storeSettings.storeName} Direct Payment Gateway
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-300 text-zinc-600 hover:text-black hover:bg-zinc-200 flex items-center justify-center transition-all shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Amount Box */}
          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Payment For</span>
              <div className="font-bold text-zinc-900 text-sm">{note}</div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-600 font-semibold">Amount (₹):</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-28 bg-white text-zinc-900 text-sm font-mono font-bold px-2.5 py-1.5 rounded-lg border border-zinc-300 focus:border-zinc-800 outline-none"
              />
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-5 bg-zinc-50 border border-zinc-200 rounded-2xl relative">
            <div className="relative bg-white p-3 rounded-2xl shadow-sm border border-zinc-200">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="UPI QR Code"
                  className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-lg"
                />
              ) : (
                <div className="w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-zinc-400" />
                </div>
              )}

              {/* Logo in Center */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 bg-black rounded-xl border-2 border-white flex items-center justify-center shadow-md">
                  <Zap className="w-5 h-5 text-white fill-white" />
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-700 font-bold mt-3 text-center">
              Scan with GPay, PhonePe, Paytm, BHIM, CRED or any Banking App
            </p>
            {effectiveAmount > 0 && (
              <p className="text-sm font-mono font-black text-zinc-900 mt-1">
                Amount: {formatINR(effectiveAmount)}
              </p>
            )}
          </div>

          {/* UPI ID Copy Bar */}
          <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-2xl space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-zinc-500 uppercase">Payee UPI ID</span>
              <span className="text-zinc-900">{payeeName}</span>
            </div>
            <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-zinc-300">
              <span className="font-mono text-xs font-bold text-zinc-900 select-all">
                {upiId}
              </span>
              <button
                type="button"
                onClick={handleCopyUpiId}
                className="flex items-center gap-1.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold px-3 py-1 rounded-lg transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                <span>{copied ? 'Copied!' : 'Copy UPI ID'}</span>
              </button>
            </div>
          </div>

          {/* Mobile Instant Pay Links */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-zinc-700 block">
              1-Tap Pay from this Phone:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a
                href={upiUri}
                className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-900 text-xs font-bold py-2.5 px-2 rounded-xl text-center transition-colors flex items-center justify-center gap-1 shadow-xs"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Any App</span>
              </a>
              <a
                href={upiUri}
                className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-900 text-xs font-bold py-2.5 px-2 rounded-xl text-center transition-colors shadow-xs"
              >
                Google Pay
              </a>
              <a
                href={`phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}${effectiveAmount > 0 ? `&am=${effectiveAmount}` : ''}&cu=INR&tn=${encodeURIComponent(note)}`}
                className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-900 text-xs font-bold py-2.5 px-2 rounded-xl text-center transition-colors shadow-xs"
              >
                PhonePe
              </a>
              <a
                href={`paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}${effectiveAmount > 0 ? `&am=${effectiveAmount}` : ''}&cu=INR&tn=${encodeURIComponent(note)}`}
                className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-900 text-xs font-bold py-2.5 px-2 rounded-xl text-center transition-colors shadow-xs"
              >
                Paytm
              </a>
            </div>
          </div>

          {/* WhatsApp Confirmation */}
          <div className="pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold py-3 px-4 rounded-xl text-xs border border-black transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span>Send Payment Confirmation on WhatsApp ({storeSettings.displayPhone})</span>
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};
