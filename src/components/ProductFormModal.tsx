import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Zap, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle, 
  FolderPlus, 
  Star, 
  Sparkles, 
  Layers, 
  FileCheck 
} from 'lucide-react';
import { Product, Category } from '../types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>) => void;
  initialProduct?: Product | null;
  categories: Category[];
  onAddCategory?: (categoryName: string) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
  categories,
  onAddCategory,
}) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('ASK Enterprises');
  const [category, setCategory] = useState('Fans');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);

  const [price, setPrice] = useState<number>(1499);
  const [originalPrice, setOriginalPrice] = useState<number>(2199);
  const [discountPercent, setDiscountPercent] = useState<number>(30);
  const [stock, setStock] = useState<number>(25);
  const [stockStatus, setStockStatus] = useState<'In Stock' | 'Low Stock' | 'Out of Stock'>('In Stock');
  const [rating, setRating] = useState<number>(5.0);

  const [image, setImage] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [warranty, setWarranty] = useState('1 Year Manufacturer Warranty');
  
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: 'Voltage', value: '220-240V AC 50Hz' },
    { key: 'Build Material', value: 'Heavy Duty Flame-Retardant' },
    { key: 'Certification', value: 'ISI & CE Certified' },
  ]);

  const [features, setFeatures] = useState<string[]>([
    'Energy efficient high performance electronics',
    'Surge protection and voltage fluctuation safety',
    'Tested and certified for durability & safety',
  ]);

  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto calculate discount percentage when price or originalPrice changes
  const handlePriceChange = (newPrice: number) => {
    setPrice(newPrice);
    if (originalPrice > newPrice && originalPrice > 0) {
      const disc = Math.round(((originalPrice - newPrice) / originalPrice) * 100);
      setDiscountPercent(disc);
    }
  };

  const handleOriginalPriceChange = (newOrig: number) => {
    setOriginalPrice(newOrig);
    if (newOrig > price && newOrig > 0) {
      const disc = Math.round(((newOrig - price) / newOrig) * 100);
      setDiscountPercent(disc);
    }
  };

  const handleStockChange = (newStock: number) => {
    setStock(newStock);
    if (newStock <= 0) {
      setStockStatus('Out of Stock');
    } else if (newStock <= 10) {
      setStockStatus('Low Stock');
    } else {
      setStockStatus('In Stock');
    }
  };

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setBrand(initialProduct.brand || 'ASK Enterprises');
      setCategory(initialProduct.category);
      setPrice(initialProduct.price);
      setOriginalPrice(initialProduct.originalPrice || initialProduct.price);
      setDiscountPercent(initialProduct.discountPercent || (initialProduct.originalPrice && initialProduct.originalPrice > initialProduct.price ? Math.round(((initialProduct.originalPrice - initialProduct.price) / initialProduct.originalPrice) * 100) : 0));
      setStock(initialProduct.stock);
      setStockStatus(initialProduct.stockStatus || (initialProduct.stock <= 0 ? 'Out of Stock' : 'In Stock'));
      setRating(initialProduct.rating || 5.0);
      setImage(initialProduct.image);
      setShortDescription(initialProduct.shortDescription || '');
      setDescription(initialProduct.description || initialProduct.shortDescription || '');
      setWarranty(initialProduct.warranty || '1 Year Manufacturer Warranty');
      
      if (initialProduct.specs) {
        setSpecs(Object.entries(initialProduct.specs).map(([k, v]) => ({ key: k, value: v })));
      } else {
        setSpecs([]);
      }

      if (initialProduct.features && initialProduct.features.length > 0) {
        setFeatures(initialProduct.features);
      } else {
        setFeatures(['Energy efficient high performance electronics']);
      }
    } else {
      // Reset form for fresh product creation
      setName('');
      setBrand('ASK Enterprises');
      setCategory(categories[0]?.name || 'Fans');
      setPrice(999);
      setOriginalPrice(1499);
      setDiscountPercent(33);
      setStock(20);
      setStockStatus('In Stock');
      setRating(5.0);
      setImage('');
      setImageFileName('');
      setShortDescription('');
      setDescription('');
      setWarranty('1 Year Manufacturer Warranty');
      setSpecs([
        { key: 'Voltage', value: '220-240V AC 50Hz' },
        { key: 'Build Material', value: 'Heavy Duty Flame-Retardant' },
      ]);
      setFeatures([
        '100% Genuine electronics with manufacturer warranty',
        'Tested for peak power efficiency and longevity',
      ]);
    }
  }, [initialProduct, isOpen, categories]);

  if (!isOpen) return null;

  // Handle local file upload from computer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, JPEG, WEBP, etc.).');
      return;
    }

    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setImage(result);
        setFormError('');
      }
    };
    reader.onerror = () => {
      setFormError('Failed to read image file from your computer.');
    };
    reader.readAsDataURL(file);
  };

  const handleAddNewCategory = () => {
    if (!newCategoryName.trim()) return;
    const catName = newCategoryName.trim();
    if (onAddCategory) {
      onAddCategory(catName);
    }
    setCategory(catName);
    setNewCategoryName('');
    setIsAddingNewCat(false);
  };

  const handleAddSpecRow = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const handleRemoveSpecRow = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...specs];
    updated[index][field] = val;
    setSpecs(updated);
  };

  const handleAddFeature = () => {
    setFeatures([...features, '']);
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleFeatureChange = (index: number, val: string) => {
    const updated = [...features];
    updated[index] = val;
    setFeatures(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Product Name is required.');
      return;
    }
    if (!image) {
      setFormError('Product Image is required. Please upload an image from your computer or provide an image link.');
      return;
    }
    if (price <= 0) {
      setFormError('Product Price must be greater than ₹0.');
      return;
    }

    const specsMap: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specsMap[s.key.trim()] = s.value.trim();
      }
    });

    const cleanFeatures = features.filter((f) => f.trim().length > 0);

    const productPayload: Partial<Product> = {
      ...(initialProduct ? { id: initialProduct.id } : {}),
      name: name.trim(),
      brand: brand.trim() || 'ASK Enterprises',
      category: category.trim() || 'Other Electronics',
      price: Number(price),
      originalPrice: Number(originalPrice) || Number(price),
      discountPercent: Number(discountPercent) || 0,
      stock: Number(stock) >= 0 ? Number(stock) : 0,
      stockStatus: stockStatus,
      rating: Number(rating) || 5.0,
      reviewCount: initialProduct?.reviewCount || 1,
      image: image,
      shortDescription: shortDescription.trim() || `${name.trim()} by ${brand.trim()}`,
      description: description.trim() || shortDescription.trim() || name.trim(),
      warranty: warranty.trim() || '1 Year Manufacturer Warranty',
      specs: specsMap,
      features: cleanFeatures,
      isFeatured: initialProduct?.isFeatured || false,
      isNewArrival: initialProduct?.isNewArrival || true,
      createdAt: initialProduct?.createdAt || new Date().toISOString(),
    };

    onSave(productPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-white border border-zinc-200 text-zinc-900 rounded-3xl shadow-2xl overflow-hidden my-6"
        id="product-form-modal"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-zinc-900 text-lg">
                {initialProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <p className="text-xs text-zinc-500">
                ASK ENTERPRISES Admin Product Manager
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-black hover:bg-zinc-200 flex items-center justify-center transition-all"
            id="close-product-form-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          
          {formError && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-xs text-red-700 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Product Image Upload from Computer */}
          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-900 uppercase tracking-wide flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-zinc-900" />
                <span>Product Image (Upload from Computer) *</span>
              </label>
              {image && (
                <button
                  type="button"
                  onClick={() => { setImage(''); setImageFileName(''); }}
                  className="text-[11px] text-zinc-500 hover:text-red-600 font-semibold"
                >
                  Remove Image
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              {/* Image Preview Thumbnail */}
              <div className="h-36 sm:h-40 rounded-xl border border-dashed border-zinc-300 bg-white flex flex-col items-center justify-center p-2 overflow-hidden relative group">
                {image ? (
                  <img
                    src={image}
                    alt="Uploaded Product Preview"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-center p-3 text-zinc-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                    <span className="text-[11px] block">No image chosen</span>
                  </div>
                )}
              </div>

              {/* Upload Actions & Direct URL Option */}
              <div className="sm:col-span-2 space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                  id="product-image-file-input"
                />

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    id="upload-image-computer-btn"
                    className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-black text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Image from Computer</span>
                  </button>
                </div>

                {imageFileName && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-700 font-medium">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="truncate">Selected file: {imageFileName}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-zinc-500 mb-1">
                    Or paste direct Image Link / URL:
                  </label>
                  <input
                    type="text"
                    value={image.startsWith('data:') ? '' : image}
                    onChange={(e) => {
                      setImage(e.target.value);
                      setImageFileName('');
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-white text-zinc-900 placeholder-zinc-400 text-xs rounded-xl px-3 py-2 border border-zinc-300 focus:border-zinc-900 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Product Name, Brand & Dynamic Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                id="form-product-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Havells BLDC Smart Remote Ceiling Fan 1200mm"
                className="w-full bg-white text-zinc-900 placeholder-zinc-400 text-xs rounded-xl px-3.5 py-2.5 border border-zinc-300 focus:border-zinc-900 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Brand
              </label>
              <input
                type="text"
                id="form-product-brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. ASK, Havells, Philips"
                className="w-full bg-white text-zinc-900 placeholder-zinc-400 text-xs rounded-xl px-3.5 py-2.5 border border-zinc-300 focus:border-zinc-900 outline-none"
              />
            </div>
          </div>

          {/* 3. Category Selection & Dynamic New Category Creator */}
          <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700">
                Category *
              </label>
              <button
                type="button"
                onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                className="text-[11px] text-zinc-900 hover:underline font-bold flex items-center gap-1"
              >
                <FolderPlus className="w-3.5 h-3.5 text-zinc-900" />
                <span>{isAddingNewCat ? 'Cancel New Category' : '+ Create Custom Category'}</span>
              </button>
            </div>

            {isAddingNewCat ? (
              <div className="flex items-center gap-2 pt-1 animate-in fade-in">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter new category name (e.g. Smart Sensors, Inverters...)"
                  className="flex-1 bg-white text-zinc-900 placeholder-zinc-400 text-xs rounded-xl px-3 py-2 border border-zinc-300 focus:border-zinc-900 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddNewCategory}
                  className="bg-zinc-900 hover:bg-black text-white font-bold text-xs px-3.5 py-2 rounded-xl"
                >
                  Add
                </button>
              </div>
            ) : (
              <select
                id="form-product-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white text-zinc-900 text-xs rounded-xl px-3.5 py-2.5 border border-zinc-300 focus:border-zinc-900 outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 4. Pricing, Discount, Stock Quantity, Stock Status, Rating */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                min={1}
                id="form-product-price"
                value={price}
                onChange={(e) => handlePriceChange(Number(e.target.value))}
                className="w-full bg-white text-zinc-900 font-mono font-bold text-xs rounded-xl px-3 py-2 border border-zinc-300 focus:border-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                MRP Price (₹)
              </label>
              <input
                type="number"
                min={1}
                id="form-product-original-price"
                value={originalPrice}
                onChange={(e) => handleOriginalPriceChange(Number(e.target.value))}
                className="w-full bg-white text-zinc-700 font-mono text-xs rounded-xl px-3 py-2 border border-zinc-300 focus:border-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                min={0}
                max={99}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full bg-white text-zinc-900 font-mono font-bold text-xs rounded-xl px-3 py-2 border border-zinc-300 focus:border-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                required
                min={0}
                id="form-product-stock-qty"
                value={stock}
                onChange={(e) => handleStockChange(Number(e.target.value))}
                className="w-full bg-white text-zinc-900 font-mono text-xs rounded-xl px-3 py-2 border border-zinc-300 focus:border-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                Stock Status
              </label>
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value as any)}
                className="w-full bg-white text-zinc-900 text-xs rounded-xl px-2.5 py-2 border border-zinc-300 focus:border-zinc-900 outline-none"
              >
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* 5. Rating & Warranty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Product Rating (1.0 to 5.0)</span>
              </label>
              <input
                type="number"
                min={1}
                max={5}
                step={0.1}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full bg-white text-zinc-900 font-mono text-xs rounded-xl px-3.5 py-2 border border-zinc-300 focus:border-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Warranty Statement
              </label>
              <input
                type="text"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                placeholder="e.g. 2 Years Manufacturer Warranty"
                className="w-full bg-white text-zinc-900 placeholder-zinc-400 text-xs rounded-xl px-3.5 py-2 border border-zinc-300 focus:border-zinc-900 outline-none"
              />
            </div>
          </div>

          {/* 6. Descriptions */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Short Description / Tagline
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="e.g. High efficiency BLDC fan with smart remote control and silent operation."
                className="w-full bg-white text-zinc-900 placeholder-zinc-400 text-xs rounded-xl px-3.5 py-2 border border-zinc-300 focus:border-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Product Description *
              </label>
              <textarea
                rows={3}
                required
                id="form-product-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide complete product details, specifications summary, usage instructions, and safety precautions..."
                className="w-full bg-white text-zinc-900 placeholder-zinc-400 text-xs rounded-xl px-3.5 py-2 border border-zinc-300 focus:border-zinc-900 outline-none resize-none"
              />
            </div>
          </div>

          {/* 7. Product Features (Bullet Points) */}
          <div className="space-y-2 pt-2 border-t border-zinc-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
                <span>Product Features (Bullet Points)</span>
              </span>
              <button
                type="button"
                onClick={handleAddFeature}
                className="flex items-center gap-1 text-[11px] bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-300 transition-colors font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Feature</span>
              </button>
            </div>

            <div className="space-y-2">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-5 text-center text-xs text-zinc-900 font-bold">•</span>
                  <input
                    type="text"
                    value={feat}
                    onChange={(e) => handleFeatureChange(idx, e.target.value)}
                    placeholder={`Feature point ${idx + 1}`}
                    className="flex-1 bg-white text-zinc-900 text-xs rounded-xl px-3 py-1.5 border border-zinc-300 outline-none focus:border-zinc-900"
                  />
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="text-zinc-400 hover:text-red-600 p-1.5 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 8. Product Technical Specifications Table */}
          <div className="space-y-2 pt-2 border-t border-zinc-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 uppercase flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-zinc-900" />
                <span>Product Specifications (Key-Value)</span>
              </span>
              <button
                type="button"
                onClick={handleAddSpecRow}
                className="flex items-center gap-1 text-[11px] bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-300 transition-colors font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Spec Row</span>
              </button>
            </div>

            <div className="space-y-2">
              {specs.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={s.key}
                    onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                    placeholder="Spec Key (e.g. Power / Wattage)"
                    className="w-2/5 bg-white text-zinc-900 text-xs rounded-xl px-3 py-1.5 border border-zinc-300 outline-none focus:border-zinc-900"
                  />
                  <input
                    type="text"
                    value={s.value}
                    onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                    placeholder="Value (e.g. 28 Watts Peak)"
                    className="flex-1 bg-white text-zinc-900 text-xs rounded-xl px-3 py-1.5 border border-zinc-300 outline-none focus:border-zinc-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecRow(idx)}
                    className="text-zinc-400 hover:text-red-600 p-1.5 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Submit & Cancel Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold px-4 py-2.5 rounded-xl text-xs border border-zinc-300 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              id="save-product-btn"
              className="flex items-center gap-2 bg-zinc-900 hover:bg-black text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all hover:scale-[1.02] active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{initialProduct ? 'Update Product' : 'Save Product'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
