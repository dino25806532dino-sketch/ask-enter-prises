import React from 'react';
import { 
  ShoppingBag, 
  Eye, 
  Zap, 
  Star, 
  ShieldCheck, 
  Check, 
  AlertTriangle,
  MessageCircle
} from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { formatINR, calculateDiscountPercentage, generateWhatsAppProductInquiryUrl } from '../utils/helpers';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  storeSettings: StoreSettings;
  isInCart?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onAddToCart,
  onBuyNow,
  storeSettings,
  isInCart = false,
}) => {
  const discountPercent = calculateDiscountPercentage(product.price, product.originalPrice);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const whatsappUrl = generateWhatsAppProductInquiryUrl(product, storeSettings);

  return (
    <div 
      className="group relative flex flex-col bg-white rounded-2xl border border-zinc-200 hover:border-zinc-400 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
      id={`product-card-${product.id}`}
    >
      {/* Top Image Container */}
      <div className="relative w-full pt-[80%] bg-zinc-100 overflow-hidden cursor-pointer" onClick={() => onViewDetails(product)}>
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Category Pill on Top Left */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span 
            className="bg-black text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider text-white shadow-xs"
          >
            {product.category}
          </span>
        </div>

        {/* Discount Badge on Top Right */}
        {discountPercent > 0 && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span 
              className="bg-white text-zinc-900 font-black text-[11px] px-2 py-0.5 rounded-md shadow-sm border border-zinc-200"
            >
              {discountPercent}% OFF
            </span>
          </div>
        )}

        {/* Stock Status Tag on Image bottom */}
        <div className="absolute bottom-2 left-2.5 z-10 flex items-center gap-1.5">
          {isOutOfStock ? (
            <span className="bg-zinc-100 text-zinc-600 border border-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <AlertTriangle className="w-3 h-3 text-zinc-600" /> Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <AlertTriangle className="w-3 h-3 text-white" /> Only {product.stock} left
            </span>
          ) : (
            <span className="bg-white/95 text-zinc-900 border border-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <Check className="w-3 h-3 text-zinc-900" /> In Stock
            </span>
          )}
        </div>

        {/* Floating Quick WhatsApp inquiry button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-2 right-2.5 z-10 bg-white hover:bg-zinc-100 text-zinc-900 p-1.5 rounded-full shadow-md border border-zinc-200 transition-transform hover:scale-110"
          title="Inquire about this product on WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5 text-zinc-900" />
        </a>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        <div className="space-y-1.5">
          {/* Brand and Rating Row */}
          <div className="flex items-center justify-between text-xs">
            <span 
              className="font-bold uppercase tracking-wider text-[10px] text-zinc-500"
            >
              {product.brand}
            </span>
            <div className="flex items-center gap-1 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
              <Star className="w-3 h-3 text-black fill-black" />
              <span className="text-zinc-900 font-bold text-[11px]">{product.rating}</span>
              <span className="text-zinc-500 text-[10px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 
            onClick={() => onViewDetails(product)}
            className="font-bold text-zinc-900 text-sm sm:text-base leading-snug line-clamp-2 cursor-pointer hover:underline transition-all"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed font-normal">
            {product.shortDescription}
          </p>
        </div>

        {/* Pricing & Warranty Section */}
        <div className="pt-2 border-t border-zinc-100">
          <div className="flex items-baseline gap-2">
            <span 
              className="text-lg sm:text-xl font-black font-mono text-zinc-900"
            >
              {formatINR(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-zinc-400 line-through font-mono">
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-zinc-700" />
            <span className="truncate">{product.warranty}</span>
          </div>
        </div>

        {/* Action Buttons: View Details, Add to Cart, Buy Now */}
        <div className="space-y-2 pt-1">
          
          {/* Top Row: View Details & Add to Cart */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onViewDetails(product)}
              id={`view-details-${product.id}`}
              className="flex items-center justify-center gap-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-300 py-2 px-2 rounded-xl text-xs font-bold transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-zinc-600" />
              <span>Details</span>
            </button>

            <button
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              id={`add-to-cart-${product.id}`}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                isOutOfStock
                  ? 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed'
                  : isInCart
                  ? 'bg-zinc-200 text-zinc-900 border-zinc-400'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-300 hover:border-zinc-400'
              }`}
            >
              {isInCart ? <Check className="w-3.5 h-3.5 text-zinc-900" /> : <ShoppingBag className="w-3.5 h-3.5 text-zinc-700" />}
              <span>{isInCart ? 'Added' : 'Add to Cart'}</span>
            </button>
          </div>

          {/* Bottom Row: Buy Now */}
          <button
            onClick={() => onBuyNow(product)}
            disabled={isOutOfStock}
            id={`buy-now-${product.id}`}
            className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200'
                : 'bg-black hover:bg-zinc-800 text-white hover:scale-[1.01] active:scale-[0.99] border border-black'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Buy Now</span>
          </button>

        </div>

      </div>
    </div>
  );
};
