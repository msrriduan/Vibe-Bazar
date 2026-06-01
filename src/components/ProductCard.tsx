import React, { useState } from 'react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { motion } from 'motion/react';
import { ShoppingBag, ChevronLeft, ChevronRight, Check, MapPin } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenCheckoutImmediate: (product: Product) => void;
  key?: string;
}

export default function ProductCard({ product, onOpenCheckoutImmediate }: ProductCardProps) {
  const { addToCart } = useShop();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [addedTemp, setAddedTemp] = useState(false);

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex(prev => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex(prev => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock === 0) return;
    addToCart(product, 1);
    setAddedTemp(true);
    setTimeout(() => setAddedTemp(false), 2000);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock === 0) return;
    onOpenCheckoutImmediate(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      className="group overflow-hidden rounded-[16px] border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 h-full flex flex-col shadow-sm hover:shadow-brand-pink/5 hover:border-brand-pink/40 hover:-translate-y-1 transition-all font-sans relative"
    >
      {/* Dynamic badges */}
      <div className="absolute left-6 top-6 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.isFeatured && (
          <span className="rounded-lg bg-gradient-to-r from-brand-orange to-brand-pink px-2 py-1 font-display text-[10px] font-black text-white uppercase tracking-wider shadow-sm animate-pulse">
            ★ Hot
          </span>
        )}
        {product.stock === 0 ? (
          <span className="rounded-lg bg-slate-400 px-2 py-1 font-display text-[10px] font-black text-white uppercase tracking-wider shadow-sm">
            Sold Out
          </span>
        ) : product.stock <= 5 ? (
          <span className="rounded-lg bg-amber-500 px-2 py-1 font-display text-[10px] font-black text-white uppercase tracking-wider shadow-sm">
            Only {product.stock} Left
          </span>
        ) : null}
      </div>

      <div className="absolute right-6 top-6 z-10 pointer-events-none">
        {product.isCODEnabled ? (
          <span className="rounded-lg bg-emerald-500 text-[9px] font-black text-white px-2 py-1 uppercase tracking-wider shadow-xs glow-green">
            COD OK
          </span>
        ) : (
          <span className="rounded-lg bg-zinc-100 dark:bg-zinc-900 px-2 py-1 text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest border border-zinc-200/50 dark:border-zinc-800">
            Pre-Paid Only
          </span>
        )}
      </div>

      {/* Image Gallery */}
      <div className="relative w-full h-44 bg-slate-100 dark:bg-zinc-900 rounded-2xl mb-4 overflow-hidden group-hover:opacity-95 transition-opacity">
        <img
          src={product.images[currentImgIndex]}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Carousel buttons */}
        {product.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 hover:bg-white dark:bg-zinc-900/90 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 shadow-sm backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 hover:bg-white dark:bg-zinc-900/90 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 shadow-sm backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            
            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
              {product.images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-all ${
                    currentImgIndex === i ? 'bg-brand-pink w-3' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Product info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <span className="text-[10px] font-extrabold text-brand-pink dark:text-brand-orange uppercase tracking-wider block mb-1">
            {product.category.replace('-', ' ')}
          </span>
          {/* Title */}
          <h3 className="text-lg font-black mt-2 text-slate-900 dark:text-white capitalize group-hover:text-brand-pink dark:group-hover:text-brand-orange transition-colors line-clamp-1">
            {product.name}
          </h3>
          {/* Description */}
          {product.description && (
            <p className="font-sans text-xs text-zinc-550 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Area Restrictions indicator */}
          {product.isCODEnabled && product.codAllowedAreas !== 'all' && (
            <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold mt-1.5">
              <MapPin className="h-3 w-3" />
              <span>COD Restricted to: {product.codAllowedAreas === 'dhaka' ? 'Dhaka City Only' : product.codAllowedAreas}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between gap-2">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Price</span>
            <span className="font-mono text-lg font-black text-slate-900 dark:text-white">
              BDT {product.price}
            </span>
          </div>

          {/* Action trigger controls */}
          <div className="flex items-center gap-1.5">
            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                addedTemp
                  ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-500/25'
                  : 'border-slate-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-brand-pink dark:hover:border-brand-orange hover:text-brand-pink'
              } disabled:opacity-30`}
              title="Add to shopping cart"
            >
              {addedTemp ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
            </button>

            {/* Buy Now button */}
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="px-4 h-9 bg-gradient-to-r from-brand-orange to-brand-pink hover:opacity-95 text-white font-display text-xs font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-35 shadow-md shadow-brand-pink/15 flex items-center gap-1"
            >
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
