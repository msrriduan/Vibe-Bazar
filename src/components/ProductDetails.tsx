import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { 
  ArrowLeft, ShoppingBag, ShieldCheck, HelpCircle, MessageCircle, 
  MapPin, Truck, ChevronRight, Star, AlertCircle, Sparkles, Check
} from 'lucide-react';
import { motion } from 'motion/react';
import ProductCard from './ProductCard';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onOpenCheckoutImmediate: (product: Product, size?: string, color?: string) => void;
}

export default function ProductDetails({ product, onBack, onOpenCheckoutImmediate }: ProductDetailsProps) {
  const { products, addToCart } = useShop();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedTemp, setAddedTemp] = useState(false);

  // Set default size if sizes are available
  const sizeList = product.sizes 
    ? product.sizes.split(',').map(s => s.trim()).filter(Boolean) 
    : [];

  const colorList = product.colors
    ? product.colors.split(',').map(c => c.trim()).filter(Boolean)
    : [];

  // Respect admin toggles for displaying sizes or colors or both
  const displaySizes = product.showSizes !== false && sizeList.length > 0;
  const displayColors = product.showColors !== false && colorList.length > 0;

  useEffect(() => {
    if (displaySizes) {
      setSelectedSize(sizeList[0]);
    } else {
      setSelectedSize('');
    }

    if (displayColors) {
      setSelectedColor(colorList[0]);
    } else {
      setSelectedColor('');
    }

    setCurrentImgIndex(0);
    setQuantity(1);
    setAddedTemp(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  // Handle slide/gallery resets or change
  const handleNextImage = () => {
    setCurrentImgIndex((prev) => (prev + 1) % product.images.length);
  };

  const handlePrevImage = () => {
    setCurrentImgIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  // Filter other products in same category for the "You May Also Like" carousel/grid
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCartWithDetails = () => {
    addToCart(product, quantity, selectedSize || undefined, selectedColor || undefined);
    setAddedTemp(true);
    setTimeout(() => setAddedTemp(false), 2000);
  };

  const handleBuyNowWithDetails = () => {
    onOpenCheckoutImmediate(product, selectedSize || undefined, selectedColor || undefined);
  };

  // Parse structured specifications from details
  const parsedSpecs = product.details
    ? product.details.split(/[,\n]/).map(line => line.trim()).filter(Boolean)
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans">
      
      {/* Back Button and Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-brand-pink dark:hover:text-brand-orange transition-colors group cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Catalog</span>
        </button>

        <nav className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          <button onClick={onBack} className="hover:text-zinc-600 dark:hover:text-white transition-colors">Home</button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-zinc-500">{product.category.replace('-', ' ')}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-brand-pink truncate max-w-[120px] sm:max-w-none">{product.name}</span>
        </nav>
      </div>

      {/* Main Grid: Images & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2rem] border border-slate-100 dark:border-zinc-900 shadow-sm relative overflow-hidden">
        
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 h-64 w-64 bg-brand-pink/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-64 w-64 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />

        {/* Left: Product Media Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative w-full aspect-square bg-slate-100 dark:bg-zinc-900 rounded-2xl overflow-hidden border border-slate-200/50 dark:border-zinc-800 flex items-center justify-center group">
            
            {/* Dynamic badges */}
            <div className="absolute left-4 top-4 z-10 flex flex-col gap-1.5 pointer-events-none">
              {product.isFeatured && (
                <span className="rounded-lg bg-gradient-to-r from-brand-orange to-brand-pink px-2 py-1 font-display text-[10px] font-black text-white uppercase tracking-wider shadow-sm animate-pulse">
                  ★ Hot
                </span>
              )}
            </div>

            <div className="absolute right-4 top-4 z-10 pointer-events-none">
              {product.isCODEnabled ? (
                <span className="rounded-lg bg-emerald-500 text-[9px] font-black text-white px-2 py-1 uppercase tracking-wider shadow-xs shadow-emerald-500/25">
                  COD OK
                </span>
              ) : (
                <span className="rounded-lg bg-red-500 text-[9px] font-black text-white px-2 py-1 uppercase tracking-wider shadow-xs">
                  Pre-Paid Only
                </span>
              )}
            </div>

            <img
              src={product.images[currentImgIndex]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 selection:bg-transparent"
            />

            {/* Carousel navigation overlay */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90"
                >
                  ‹
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Thumbnails grid */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImgIndex(idx)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all bg-slate-100 dark:bg-zinc-900 ${
                    currentImgIndex === idx 
                      ? 'border-brand-pink shadow-md shadow-brand-pink/10 opacity-100 scale-102' 
                      : 'border-transparent opacity-65 hover:opacity-90'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Actions & Information (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between text-left space-y-6">
          <div className="space-y-4">
            
            {/* Meta and Ratings */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-slate-100 dark:bg-zinc-900 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-brand-pink dark:text-brand-orange">
                {product.category.replace('-', ' ')}
              </span>
              
              <div className="flex items-center gap-1.5 bg-brand-pink/5 px-2.5 py-1 rounded-full border border-brand-pink/15">
                <div className="flex text-brand-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-current text-brand-pink" />
                  ))}
                </div>
                <span className="text-[10px] font-black text-brand-pink">5.0 (Verified)</span>
              </div>
            </div>

            {/* Title / Header */}
            <div>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase leading-none tracking-tight">
                {product.name}
              </h1>
              <p className="font-sans text-xs text-zinc-550 dark:text-zinc-400 mt-2 max-w-xl">
                {product.description}
              </p>
            </div>

            {/* Price Tag */}
            <div className="flex flex-wrap items-baseline gap-4 py-1.5 border-y border-slate-100 dark:border-zinc-905">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Regular Price</span>
                <span className="font-mono text-3xl font-black text-slate-900 dark:text-white">
                  BDT {product.price}
                </span>
              </div>
            </div>

            {/* Size Picker (If size options are found and enabled by admin) */}
            {displaySizes && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">Select Available Size</label>
                <div className="flex flex-wrap gap-2">
                  {sizeList.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                        selectedSize === size
                          ? 'bg-gradient-to-r from-brand-orange to-brand-pink border-transparent text-white shadow-md shadow-brand-pink/20 scale-102'
                          : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-750'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Picker (If color options are found and enabled by admin) */}
            {displayColors && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">Select Available Color</label>
                <div className="flex flex-wrap gap-2">
                  {colorList.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                        selectedColor === color
                          ? 'bg-gradient-to-r from-brand-orange to-brand-pink border-transparent text-white shadow-md shadow-brand-pink/20 scale-102'
                          : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-750'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">Select Quantity</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-805 rounded-xl max-w-[120px]">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-10 h-10 flex items-center justify-center text-sm font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-l-xl transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-mono text-xs font-black select-none text-zinc-800 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="w-10 h-10 flex items-center justify-center text-sm font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-r-xl transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Total: BDT {product.price * quantity}</span>
              </div>
            </div>

            {/* Cash On Delivery & Area Notices */}
            <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-2xl p-4 border border-slate-200/50 dark:border-zinc-805 text-xs text-zinc-550 dark:text-zinc-400 space-y-2 max-w-xl">
              <div className="flex items-start gap-2.5">
                <Truck className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-zinc-950 dark:text-white uppercase text-[10px] tracking-wider">Express Shipment Delivery</h5>
                  <p className="mt-0.5 text-[11px] leading-relaxed">Dhaka delivery inside 24-48 hours. District shipping 2-3 working days.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-brand-pink flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-zinc-950 dark:text-white uppercase text-[10px] tracking-wider leading-none">Security Guaranteed</h5>
                  <p className="mt-0.5 text-[11px] leading-relaxed">
                    {product.isCODEnabled 
                      ? "Pay comfortably after receiving and checking the product at your doorsteps."
                      : "We accept secure digital bKash, Nagad or Rocket prepaid checkout on this item."}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Checkout CTA Actions */}
          <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100 dark:border-zinc-900">
            
            {/* Add to Cart button */}
            <button
              onClick={handleAddToCartWithDetails}
              className={`flex-1 min-w-[140px] px-6 h-12 rounded-xl border flex items-center justify-center gap-2 font-display text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                addedTemp
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'bg-white dark:bg-zinc-900 border-slate-250 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-brand-pink dark:hover:border-brand-orange hover:text-brand-pink dark:hover:text-brand-orange'
              }`}
            >
              {addedTemp ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
              <span>{addedTemp ? 'Added to Cart ✓' : 'Add to Shopping Cart'}</span>
            </button>

            {/* Buy Now button */}
            <button
              onClick={handleBuyNowWithDetails}
              className="px-8 h-12 bg-gradient-to-r from-brand-orange to-brand-pink hover:opacity-95 text-white font-display text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-brand-pink/20 flex items-center justify-center gap-2 flex-grow sm:flex-none cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>Instant Checkout (Buy Now)</span>
              <ChevronRight className="h-4 w-4" />
            </button>

          </div>

        </div>
      </div>

      {/* Specifications Details Section - Daraz/Amazon Style Tabs */}
      {parsedSpecs.length > 0 && (
        <section className="mt-8 bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2rem] border border-slate-100 dark:border-zinc-900 shadow-sm text-left">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-900 pb-3 mb-6">
            <Sparkles className="h-5 w-5 text-brand-pink fill-brand-pink/10" />
            <h3 className="font-display text-base font-black uppercase tracking-tight text-zinc-950 dark:text-white">Product Detailed Specifications</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parsedSpecs.map((spec, idx) => {
              const parts = spec.split(':');
              const key = parts[0];
              const val = parts.slice(1).join(':').trim();

              return (
                <div key={idx} className="flex border-b border-dashed border-zinc-100 dark:border-zinc-900/60 pb-2 text-xs">
                  <span className="w-1/3 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">{key}</span>
                  <span className="w-2/3 font-medium text-zinc-800 dark:text-zinc-300 capitalize">{val || 'Yes'}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Related Products from same category slider/list */}
      {relatedProducts.length > 0 && (
        <section className="mt-12 space-y-6 text-left">
          <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-805 pb-3">
            <ShoppingBag className="h-5 w-5 text-brand-pink" />
            <h3 className="font-display text-base sm:text-lg font-black uppercase tracking-tight text-zinc-950 dark:text-white">
              Related Items (Also in {product.category.replace('-', ' ')})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onOpenCheckoutImmediate={onOpenCheckoutImmediate}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
