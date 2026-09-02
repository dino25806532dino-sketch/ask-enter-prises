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
  Wind,
  UtensilsCrossed,
  Sparkles
} from 'lucide-react';
import { Category, StoreSettings } from '../types';

interface CategoryNavProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  productCounts: Record<string, number>;
  storeSettings?: StoreSettings;
}

const getCategoryIcon = (categoryName: string) => {
  const lower = categoryName.toLowerCase();
  if (lower.includes('fan')) return <Fan className="w-4 h-4" />;
  if (lower.includes('air') || lower.includes('condition') || lower.includes('ac') || lower.includes('cool')) return <Wind className="w-4 h-4" />;
  if (lower.includes('lock') || lower.includes('safe') || lower.includes('security')) return <ShieldCheck className="w-4 h-4" />;
  if (lower.includes('appliance') || lower.includes('home') || lower.includes('kitchen') || lower.includes('geyser') || lower.includes('grinder')) return <UtensilsCrossed className="w-4 h-4" />;
  if (lower.includes('iron')) return <Sparkles className="w-4 h-4" />;
  if (lower.includes('light') || lower.includes('panel') || lower.includes('strip')) return <LampCeiling className="w-4 h-4" />;
  if (lower.includes('bulb')) return <Lightbulb className="w-4 h-4" />;
  if (lower.includes('switch') || lower.includes('socket')) return <ToggleRight className="w-4 h-4" />;
  if (lower.includes('charger') || lower.includes('adapter')) return <Zap className="w-4 h-4" />;
  if (lower.includes('cable') || lower.includes('wire')) return <Cable className="w-4 h-4" />;
  if (lower.includes('electronic') || lower.includes('sensor') || lower.includes('hub')) return <Cpu className="w-4 h-4" />;
  return <Layers className="w-4 h-4" />;
};

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  productCounts,
}) => {
  const totalAllCount = Object.values(productCounts).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="bg-zinc-50 border-b border-zinc-200 sticky top-[69px] sm:top-[73px] z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1">
          
          {/* "All Electronics" Pill */}
          <button
            onClick={() => onSelectCategory('All')}
            id="cat-pill-all"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 shrink-0 border ${
              selectedCategory === 'All'
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100 hover:text-black hover:border-zinc-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Products</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
              selectedCategory === 'All' ? 'bg-white text-black' : 'bg-zinc-100 text-zinc-700'
            }`}>
              {totalAllCount}
            </span>
          </button>

          {/* Dynamic Categories */}
          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            const count = productCounts[cat.name.toLowerCase()] || productCounts[cat.id?.toLowerCase()] || 0;

            return (
              <button
                key={cat.id || cat.name}
                onClick={() => onSelectCategory(cat.name)}
                id={`cat-pill-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 shrink-0 border ${
                  isSelected
                    ? 'bg-black text-white border-black shadow-sm'
                    : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100 hover:text-black hover:border-zinc-400'
                }`}
              >
                <span>
                  {getCategoryIcon(cat.name)}
                </span>
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                  isSelected ? 'bg-white text-black' : 'bg-zinc-100 text-zinc-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}

        </div>
      </div>
    </div>
  );
};
