import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Smartphone, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Maximize2, 
  Minimize2,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import { formatINR } from '../utils/helpers';
import { StoreSettings } from '../types';

interface UpiPaymentBoxProps {
  amount: number;
  orderNote?: string;
  storeSettings: StoreSettings;
  upiRefNumber?: string;
  onUpiRefChange?: (ref: string) => void;
  isCompact?: boolean;
}

export const UpiPaymentBox: React.FC<UpiPaymentBoxProps> = ({
  amount,
  orderNote = 'ASK Enterprises Order',
  storeSettings,
  upiRefNumber = '',
  onUpiRefChange,
  isCompact = false,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [qrError, setQrError] = useState(false);
  const [activeApp, setActiveApp] = useState<string | null>(null);

  const upiId = storeSettings.upiId || '9347548525@upi';
  const payeeName = storeSettings.upiName || storeSettings.storeName || 'ASK ENTERPRISES';
  
  // Standard UPI URI format accepted across Indian UPI applications
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(orderNote)}`;

  // Direct app-specific intent links for mobile devices
  const gpayUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(orderNote)}`;
  const phonepeUri = `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(orderNote)}`;
  const paytmUri = `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(orderNote)}`;

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(upiUri, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setQrError(false);
        }
      })
      .catch((err) => {
        console.warn('QR code generation failed, using fallback:', err);
        if (isMounted) {
          // Fallback to QR API if canvas failed
          setQrDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUri)}`);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [upiUri]);

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 sm:p-5 space-y-4 text-zinc-900 shadow-sm">
      
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black shadow-xs">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-zinc-900">Scan & Pay via UPI</span>
              <span className="bg-zinc-200 text-zinc-800 border border-zinc-300 text-[10px] font-bold px-1.5 py-0.2 rounded">
                0% Extra Fee
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              GPay, PhonePe, Paytm, BHIM, CRED, Amazon Pay
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-zinc-500 block">Payable Amount</span>
          <span className="font-mono font-black text-base sm:text-lg text-zinc-900">{formatINR(amount)}</span>
        </div>
      </div>

      {/* QR Code and Instructions Section */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        
        {/* QR Display Card (5 cols on sm) */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center p-3.5 bg-white border border-zinc-200 rounded-xl relative group shadow-xs">
          <div className="relative bg-white p-2.5 rounded-xl border border-zinc-200">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`Scan UPI QR to pay ${formatINR(amount)}`}
                className="w-40 h-40 sm:w-44 sm:h-44 object-contain rounded"
              />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center text-zinc-400">
                <RefreshCw className="w-6 h-6 animate-spin text-zinc-400" />
              </div>
            )}

            {/* Center UPI Logo Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-8 h-8 bg-black rounded-lg border-2 border-white flex items-center justify-center shadow-md">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-zinc-700 font-semibold">
            <span>Scan with any UPI Scanner</span>
            <button
              type="button"
              onClick={() => setIsEnlarged(!isEnlarged)}
              className="text-zinc-500 hover:text-black p-1"
              title={isEnlarged ? "Minimize QR" : "Enlarge QR"}
            >
              {isEnlarged ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* UPI ID & App Shortcuts (7 cols on sm) */}
        <div className="sm:col-span-7 space-y-3">
          
          {/* UPI ID Copy Card */}
          <div className="bg-white border border-zinc-200 p-3 rounded-xl space-y-1.5 shadow-xs">
            <div className="text-[10px] uppercase font-bold text-zinc-500 flex items-center justify-between">
              <span>Verified Store UPI ID</span>
              <span className="text-zinc-700 font-medium">{payeeName}</span>
            </div>
            <div className="flex items-center justify-between gap-2 bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-300">
              <span className="font-mono text-xs font-bold text-zinc-900 select-all truncate">
                {upiId}
              </span>
              <button
                type="button"
                onClick={handleCopyUpiId}
                className="flex items-center gap-1 bg-black hover:bg-zinc-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md transition-all shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-white" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Pay on Mobile Apps */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-zinc-700 block">
              Direct 1-Tap Pay via Mobile App:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <a
                href={upiUri}
                className="flex items-center justify-center gap-1.5 bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800 text-xs font-bold py-2 px-2.5 rounded-lg transition-all text-center shadow-xs"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Any UPI App</span>
              </a>

              <a
                href={gpayUri}
                className="flex items-center justify-center gap-1.5 bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800 text-xs font-bold py-2 px-2.5 rounded-lg transition-all text-center shadow-xs"
              >
                <span>Google Pay</span>
              </a>

              <a
                href={phonepeUri}
                className="flex items-center justify-center gap-1.5 bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800 text-xs font-bold py-2 px-2.5 rounded-lg transition-all text-center shadow-xs"
              >
                <span>PhonePe</span>
              </a>

              <a
                href={paytmUri}
                className="flex items-center justify-center gap-1.5 bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800 text-xs font-bold py-2 px-2.5 rounded-lg transition-all text-center shadow-xs"
              >
                <span>Paytm UPI</span>
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* Transaction Reference / UTR Input */}
      {onUpiRefChange && (
        <div className="pt-2 border-t border-zinc-200 space-y-1.5">
          <label className="block text-xs font-bold text-zinc-800">
            UPI Ref / UTR / Transaction No. (Optional / After Payment)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={upiRefNumber}
              onChange={(e) => onUpiRefChange(e.target.value)}
              placeholder="e.g. 12-digit UTR (423871928371) or 'Paid via GPay'"
              className="flex-1 bg-white text-zinc-900 placeholder-zinc-400 text-xs rounded-xl px-3 py-2 border border-zinc-300 focus:border-zinc-800 outline-none font-mono"
            />
          </div>
          <p className="text-[10px] text-zinc-500 flex items-center gap-1">
            <Info className="w-3 h-3 text-zinc-400 shrink-0" />
            <span>You can also send the payment screenshot directly to our WhatsApp hotline after placing the order.</span>
          </p>
        </div>
      )}

      {/* Enlarged Modal View */}
      {isEnlarged && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 p-6 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl text-zinc-900">
            <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
              <h4 className="font-bold text-zinc-900 text-sm">UPI Payment QR Code</h4>
              <button
                type="button"
                onClick={() => setIsEnlarged(false)}
                className="text-xs bg-zinc-100 text-zinc-700 border border-zinc-300 px-2 py-1 rounded-lg hover:bg-black hover:text-white transition-colors"
              >
                Close
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-sm border border-zinc-200 mx-auto">
              <img
                src={qrDataUrl}
                alt="Enlarged UPI QR Code"
                className="w-64 h-64 object-contain rounded"
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-mono font-bold text-zinc-900">{formatINR(amount)}</div>
              <div className="text-xs text-zinc-500 font-mono select-all">{upiId}</div>
            </div>

            <button
              type="button"
              onClick={() => setIsEnlarged(false)}
              className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-2.5 rounded-xl text-xs"
            >
              Done Scanning
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
