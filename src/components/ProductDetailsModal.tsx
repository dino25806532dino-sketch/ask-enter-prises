import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Zap, 
  ShieldCheck, 
  Truck, 
  Star, 
  Check, 
  AlertTriangle, 
  MessageCircle, 
  Plus, 
  Minus,
  Sparkles
} from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { formatINR, calculateDiscountPercentage, generateWhatsAppProductInquiryUrl } from '../utils/helpers';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  storeSettings: StoreSettings;
  isInCart?: boolean;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  storeSettings,
  isInCart = false,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>(product?.image || '');

  // Update active image if product changes
  React.useEffect(() => {
    if (product) {
      setActiveImage(product.image);
    }
  }, [product]);

  if (!product) return null;

  const allImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  const discountPercent = calculateDiscountPercentage(product.price, product.originalPrice);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const whatsappUrl = generateWhatsAppProductInquiryUrl(product, storeSettings);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < product.stock) setQuantity(quantity + 1);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white border border-zinc-200 text-zinc-900 rounded-3xl shadow-2xl overflow-hidden my-6"
        id="product-details-dialog"
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          id="close-details-btn"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-zinc-100 border border-zinc-300 text-zinc-600 hover:text-black hover:bg-zinc-200 flex items-center justify-center transition-all shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          
          {/* Left Column: Large Product Image (5 cols) */}
          <div className="md:col-span-5 bg-zinc-50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-200 relative">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-zinc-200">
              <img
                src={activeImage || product.image}
                alt={product.name}
                className="w-full h-full object-contain p-2"
                referrerPolicy="no-referrer"
              />
              
              {discountPercent > 0 && (
                <div className="absolute top-3 left-3 bg-white text-zinc-900 font-black text-xs px-2.5 py-1 rounded-lg shadow-sm border border-zinc-200">
                  {discountPercent}% OFF
                </div>
              )}

              <div className="absolute bottom-3 left-3">
                <span className="bg-black text-white text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase shadow-xs">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Multiple Images Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all bg-white p-0.5 ${
                      activeImage === img ? 'border-black shadow-sm' : 'border-zinc-200 hover:border-zinc-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} - view ${i + 1}`} 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Guarantees under image */}
            <div className="mt-4 space-y-2 bg-white border border-zinc-200 p-3 rounded-xl text-xs">
              <div className="flex items-center gap-2 text-zinc-700">
                <ShieldCheck className="w-4 h-4 text-zinc-900 shrink-0" />
                <span>{product.warranty}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-700">
                <Truck className="w-4 h-4 text-zinc-900 shrink-0" />
                <span>Express Dispatch Available</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-700">
                <Check className="w-4 h-4 text-zinc-900 shrink-0" />
                <span>100% Genuine Electronic Unit</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Actions (7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              
              {/* Brand & Category & Rating */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider bg-zinc-100 border border-zinc-300 px-2.5 py-0.5 rounded-full">
                  {product.brand}
                </span>

                <div className="flex items-center gap-1.5 bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-200">
                  <Star className="w-4 h-4 text-black fill-black" />
                  <span className="text-sm font-bold text-zinc-900">{product.rating}</span>
                  <span className="text-xs text-zinc-500">({product.reviewCount} customer reviews)</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 leading-snug">
                {product.name}
              </h2>

              {/* Price & Savings */}
              <div className="flex items-baseline gap-3 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
                <span className="text-2xl sm:text-3xl font-black text-zinc-900 font-mono">
                  {formatINR(product.price * quantity)}
                </span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-sm text-zinc-400 line-through font-mono">
                      {formatINR(product.originalPrice * quantity)}
                    </span>
                    <span className="text-xs font-bold text-white bg-black px-2 py-0.5 rounded">
                      Save {formatINR((product.originalPrice - product.price) * quantity)}
                    </span>
                  </>
                )}
              </div>

              {/* Availability Status & Stock */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 font-semibold">Availability:</span>
                {isOutOfStock ? (
                  <span className="text-xs font-bold text-zinc-500 flex items-center gap-1 bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-full">
                    <AlertTriangle className="w-3.5 h-3.5" /> Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="text-xs font-bold text-white flex items-center gap-1 bg-black px-2.5 py-0.5 rounded-full">
                    <AlertTriangle className="w-3.5 h-3.5 text-white" /> Only {product.stock} units left in warehouse
                  </span>
                ) : (
                  <span className="text-xs font-bold text-zinc-900 flex items-center gap-1 bg-zinc-100 border border-zinc-300 px-2.5 py-0.5 rounded-full">
                    <Check className="w-3.5 h-3.5" /> In Stock ({product.stock} units available)
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Product Overview
                </h4>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {product.description || product.shortDescription}
                </p>
              </div>

              {/* Technical Specifications */}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
                    <span>Technical Specifications</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {Object.entries(product.specs).map(([key, val]) => (
                      <div key={key} className="bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl">
                        <span className="text-zinc-500 block text-[10px] uppercase">{key}</span>
                        <span className="font-semibold text-zinc-900">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-4 pt-4 border-t border-zinc-200">
              
              {/* Quantity Counter */}
              {!isOutOfStock && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-zinc-700">Select Quantity:</span>
                  <div className="flex items-center bg-zinc-100 border border-zinc-300 rounded-xl p-1">
                    <button
                      onClick={handleDecrease}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-40 flex items-center justify-center text-zinc-900 transition-colors shadow-xs"
                      id="details-qty-minus"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-mono font-bold text-sm text-zinc-900">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncrease}
                      disabled={quantity >= product.stock}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-40 flex items-center justify-center text-zinc-900 transition-colors shadow-xs"
                      id="details-qty-plus"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Main Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => onAddToCart(product, quantity)}
                  disabled={isOutOfStock}
                  id="details-add-to-cart-btn"
                  className="flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300 py-3 px-4 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isInCart ? 'Add More to Cart' : 'Add to Cart'}</span>
                </button>

                <button
                  onClick={() => onBuyNow(product, quantity)}
                  disabled={isOutOfStock}
                  id="details-buy-now-btn"
                  className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 border border-yellow-500 py-3 px-4 rounded-xl text-sm font-black shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 fill-current text-zinc-950" />
                  <span>Instant Buy Now</span>
                </button>
              </div>

              {/* WhatsApp Direct Inquiry Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="details-whatsapp-inquiry-btn"
                className="w-full flex items-center justify-center gap-2 bg-zinc-50 text-zinc-900 hover:bg-zinc-100 border border-zinc-300 py-2.5 px-4 rounded-xl text-xs font-bold transition-all"
              >
                <MessageCircle className="w-4 h-4 text-zinc-900" />
                <span>Ask Question on WhatsApp ({storeSettings.displayPhone})</span>
              </a>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
