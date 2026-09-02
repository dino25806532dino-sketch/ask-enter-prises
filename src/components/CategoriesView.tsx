import React from 'react';
import { 
  Fan, 
  ShieldCheck, 
  LampCeiling, 
  Lightbulb, 
  ToggleRight, 
  Zap, 
  Cable, 
  Cpu, 
  Layers,
  ArrowRight, 
  Sparkles,
  Wind,
  UtensilsCrossed
} from 'lucide-react';
import { Category, Product } from '../types';
import { formatINR } from '../utils/helpers';

interface CategoriesViewProps {
  categories: Category[];
  products: Product[];
  onSelectCategory: (categoryName: string) => void;
}

const getCategoryIcon = (categoryName: string) => {
  const lower = categoryName.toLowerCase();
  if (lower.includes('air') || lower.includes('condition') || lower.includes('ac') || lower.includes('cool')) return <Wind className="w-5 h-5" />;
  if (lower.includes('fan')) return <Fan className="w-5 h-5" />;
  if (lower.includes('lock') || lower.includes('safe') || lower.includes('security')) return <ShieldCheck className="w-5 h-5" />;
  if (lower.includes('appliance') || lower.includes('home') || lower.includes('kitchen') || lower.includes('geyser') || lower.includes('grinder')) return <UtensilsCrossed className="w-5 h-5" />;
  if (lower.includes('iron')) return <Sparkles className="w-5 h-5" />;
  if (lower.includes('light') || lower.includes('panel') || lower.includes('strip')) return <LampCeiling className="w-5 h-5" />;
  if (lower.includes('bulb')) return <Lightbulb className="w-5 h-5" />;
  if (lower.includes('switch') || lower.includes('socket')) return <ToggleRight className="w-5 h-5" />;
  if (lower.includes('charger') || lower.includes('adapter')) return <Zap className="w-5 h-5" />;
  if (lower.includes('cable') || lower.includes('wire')) return <Cable className="w-5 h-5" />;
  if (lower.includes('electronic') || lower.includes('sensor') || lower.includes('hub')) return <Cpu className="w-5 h-5" />;
  return <Layers className="w-5 h-5" />;
};

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  'air conditioners': 'https://firebasestorage.googleapis.com/v0/b/linkstoreweb.firebasestorage.app/o/products%2FT8lGyFoSKxPSsZGoo2LxVf7dUe53%2FP-MP9GLNNA_1779275089734_0.jpg?alt=media&token=947d93ff-1de9-433d-b17d-4ed6e8b03bfa',
  'fans': 'https://firebasestorage.googleapis.com/v0/b/linkstoreweb.firebasestorage.app/o/products%2FT8lGyFoSKxPSsZGoo2LxVf7dUe53%2FP-MPA5NMHU_1779031758509_0.jpg?alt=media&token=18590c1f-ef07-4229-8e47-e31b81604ddf',
  'home appliances': 'https://firebasestorage.googleapis.com/v0/b/linkstoreweb.firebasestorage.app/o/products%2FT8lGyFoSKxPSsZGoo2LxVf7dUe53%2FP-MPC71M16_1779262279148_0.jpg?alt=media&token=eeebdf1c-2917-48f8-a145-ee083dddfd12',
  'digital lockers': 'https://firebasestorage.googleapis.com/v0/b/linkstoreweb.firebasestorage.app/o/products%2FT8lGyFoSKxPSsZGoo2LxVf7dUe53%2FP-MP823WU1_1778919952927_0.jpg?alt=media&token=e78ad21e-85c5-4c32-87a9-0580aad9c366',
  'iron box': 'https://firebasestorage.googleapis.com/v0/b/linkstoreweb.firebasestorage.app/o/products%2FT8lGyFoSKxPSsZGoo2LxVf7dUe53%2FP-MPA7A9KS_1779034267652_0.jpg?alt=media&token=4a59f518-ffeb-44c1-9dc5-0ec3da6194b3',
  'lighting': 'https://firebasestorage.googleapis.com/v0/b/linkstoreweb.firebasestorage.app/o/products%2FT8lGyFoSKxPSsZGoo2LxVf7dUe53%2FP-MPA5IJ1H_1779032608404_0.jpg?alt=media&token=240dd0be-3ecb-43d9-952b-fc06e8e89f81',
  'lights': 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800&auto=format&fit=crop&q=80',
  'bulbs': 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=800&auto=format&fit=crop&q=80',
  'switches': 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80',
  'chargers': 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
  'cables': 'https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?w=800&auto=format&fit=crop&q=80',
  'other electronics': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
};

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  products,
  onSelectCategory,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-zinc-100 border border-zinc-300 text-zinc-900 px-3 py-1 rounded-full text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
          <span>OFFICIAL ELECTRONIC PRODUCT CATEGORIES</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900">
          Explore Electronics Categories
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600">
          Browse our certified catalog of fans, digital security safes, lighting solutions, switches, and high-performance power electronics.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-4">
        {categories.map((cat) => {
          const catProducts = products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase());
          const minPrice = catProducts.length > 0 ? Math.min(...catProducts.map(p => p.price)) : 0;
          const fallbackImage = DEFAULT_CATEGORY_IMAGES[cat.name.toLowerCase()] || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80';
          const bannerImage = cat.image || (catProducts.length > 0 ? catProducts[0].image : fallbackImage);

          return (
            <div
              key={cat.id || cat.name}
              onClick={() => onSelectCategory(cat.name)}
              className="group cursor-pointer bg-white rounded-2xl border border-zinc-200 hover:border-black shadow-sm hover:shadow-md overflow-hidden transition-all duration-200 hover:-translate-y-1"
            >
              {/* Image banner */}
              <div className="relative h-44 w-full bg-zinc-100 overflow-hidden">
                <img
                  src={bannerImage}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = fallbackImage;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                <div className="absolute top-3 left-3 bg-white text-zinc-900 p-2 rounded-xl shadow-md border border-zinc-200">
                  {getCategoryIcon(cat.name)}
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <span className="bg-black/75 backdrop-blur-md text-white border border-white/20 text-[11px] font-bold px-2.5 py-0.5 rounded-lg">
                    {catProducts.length} Models
                  </span>

                  {minPrice > 0 && (
                    <span className="text-zinc-900 text-xs font-mono font-bold bg-white px-2 py-0.5 rounded shadow">
                      From {formatINR(minPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-2">
                <h3 className="font-black text-zinc-900 text-base group-hover:text-black transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-zinc-600 line-clamp-2">
                  {cat.description || 'Certified electronic components and equipment'}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs font-bold text-zinc-700 group-hover:text-black border-t border-zinc-100">
                  <span>View All {cat.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
