import { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, Moon, Sun, LogIn, LogOut, Search, Sparkles, 
  Trash, Plus, Minus, Ticket, Check, X, Shield, RefreshCw, MessageSquare
} from 'lucide-react';
import BrandLogo from './BrandLogo';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  onOpenCheckout: () => void;
  onOpenTracking: () => void;
  showAdminPanel: boolean;
  setShowAdminPanel: (show: boolean) => void;
}

export default function Navbar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onOpenCheckout,
  onOpenTracking,
  showAdminPanel,
  setShowAdminPanel
}: NavbarProps) {
  const {
    categories,
    user,
    isAdmin,
    login,
    logout,
    cart,
    removeFromCart,
    updateCartQuantity,
    appliedCoupon,
    applyCouponCode,
    removeAppliedCoupon,
    theme,
    toggleTheme,
    seedDatabase
  } = useShop();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState({ text: '', isError: false });
  const [isSeeding, setIsSeeding] = useState(false);

  // Cart math
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = Math.round(subtotal * (appliedCoupon.discountValue / 100));
    } else {
      discount = appliedCoupon.discountValue;
    }
  }
  const totalAmount = Math.max(0, subtotal - discount);

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    const res = applyCouponCode(promoInput);
    setPromoMessage({ text: res.message, isError: !res.success });
    if (res.success) {
      setPromoInput('');
    }
    setTimeout(() => setPromoMessage({ text: '', isError: false }), 4000);
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    await seedDatabase();
    setIsSeeding(false);
    alert('Vibebazar Catalog successfully initialized in Firestore!');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-indigo-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setSelectedCategory('all');
                setShowAdminPanel(false);
              }}
              className="group flex items-center transition-transform hover:scale-[1.01] active:scale-[0.99] focus:outline-none"
            >
              <BrandLogo size="md" />
            </button>
            <span className="hidden rounded-full bg-brand-pink/10 px-2.5 py-0.5 font-mono text-[9px] font-black tracking-wider text-brand-pink dark:bg-brand-orange/10 dark:text-brand-orange sm:inline-block">BD STORE</span>
          </div>

          {/* Search bar - hidden when in Admin view */}
          {!showAdminPanel && (
            <div className="relative flex-1 max-w-md hidden md:block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find hot apparel, earbuds, accessories..."
                className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 py-2 pl-11 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 shadow-sm focus:border-brand-pink dark:focus:border-brand-orange focus:outline-none focus:ring-4 focus:ring-brand-pink/10 transition-all font-sans"
              />
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-2 sm:gap-4 font-sans">
            {/* Seed Button on empty DB */}
            {!isAdmin && (
              <button 
                onClick={handleSeed}
                disabled={isSeeding}
                className="hidden items-center gap-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 font-sans text-xs font-bold text-amber-600 dark:text-amber-400 transition-colors disabled:opacity-50 sm:flex"
              >
                <RefreshCw className={`h-3 w-3 ${isSeeding ? 'animate-spin' : ''}`} />
                Seed Shop Data
              </button>
            )}

            {/* Dark mode button */}
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Tracking page button */}
            <button
              onClick={onOpenTracking}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-brand-pink dark:hover:border-brand-orange px-3.5 py-1.5 text-xs font-black text-zinc-700 dark:text-zinc-300 transition-all font-display uppercase tracking-wider"
            >
              Track Order
            </button>

            {/* Admin Toggle */}
            {isAdmin && (
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                  showAdminPanel 
                    ? 'bg-brand-pink text-white shadow-sm' 
                    : 'border border-brand-pink/50 text-brand-pink dark:text-brand-orange hover:bg-brand-pink/5'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>{showAdminPanel ? 'Exit Admin' : 'Admin Panel'}</span>
              </button>
            )}

            {/* OAuth Login */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-brand-pink bg-zinc-200" title={user.email || ''}>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-display font-bold text-zinc-700">{user.email?.charAt(0).toUpperCase()}</div>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="hidden h-9 items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 px-3 text-xs font-bold sm:flex gap-1.5 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-brand-orange to-brand-pink hover:opacity-95 text-white px-4 text-xs font-black uppercase tracking-wider transition-all gap-1.5 shadow-sm shadow-brand-pink/15"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Admin Login</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            {!showAdminPanel && (
              <button
                onClick={() => setIsCartOpen(true)}
                 className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:opacity-90 transition-all font-display font-medium shadow-md shadow-black/10"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-pink text-[10px] font-black text-white glow-pink">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Categories Bar */}
      {!showAdminPanel && categories.length > 0 && (
        <div className="border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20 py-2.5 overflow-x-auto scrollbar-none">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1.5 sm:gap-2.5 font-display text-xs font-bold">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap rounded-xl px-4 py-1.5 transition-all text-[11px] uppercase tracking-wider font-extrabold ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-brand-orange to-brand-pink text-white shadow-md shadow-brand-pink/20'
                      : 'bg-white dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-brand-pink dark:hover:border-brand-orange'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Search - visible only on small screens and when not in Admin Panel */}
      {!showAdminPanel && (
        <div className="px-4 pb-3 pt-1 md:hidden">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find clothing, electronic widgets..."
              className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 py-1.5 pl-10 pr-4 text-xs text-zinc-900 dark:text-white shadow-xs focus:border-brand-pink focus:outline-none focus:ring-4 focus:ring-brand-pink/10 transition-all"
            />
          </div>
        </div>
      )}

      {/* Slide-out Shopping Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
            />

            {/* Sidebar Cart panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col bg-white dark:bg-zinc-950 shadow-2xl border-l border-brand-pink/30 font-sans"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 px-6 py-5">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-brand-pink" />
                  <h3 className="font-display text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">Your Cart ({cartItemCount})</h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 dark:text-zinc-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-zinc-50 dark:bg-zinc-900 p-4 mb-4">
                      <ShoppingBag className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                    </div>
                    <p className="font-display font-medium text-zinc-500 dark:text-zinc-400">Cart feels empty.</p>
                    <p className="text-xs text-zinc-400 mt-1">Grab some fine streetwear & accessory items!</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <motion.div
                      layout
                      key={item.product.id}
                      className="flex gap-4 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-55/40 dark:bg-zinc-900/40 p-3 relative hover:border-zinc-300 dark:hover:border-zinc-800 transition-colors"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-sm font-bold text-zinc-900 dark:text-white truncate">{item.product.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-xs font-black text-brand-pink dark:text-brand-orange">BDT {item.product.price}</span>
                          {item.product.stock <= 5 && (
                            <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[8px] font-bold text-amber-500 uppercase tracking-widest">Only {item.product.stock} Left</span>
                          )}
                        </div>
                        
                        {/* Quantity control */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="rounded bg-zinc-100 p-1 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-mono text-xs font-semibold w-5 text-center text-zinc-900 dark:text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="rounded bg-zinc-100 p-1 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors disabled:opacity-30"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-zinc-400 hover:text-rose-500 p-1 rounded-lg self-start transition-colors"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Checkout details & Coupon Box */}
              {cart.length > 0 && (
                <div className="border-t border-brand-pink/20 bg-zinc-50 dark:bg-zinc-900/70 p-6 space-y-4">
                  {/* Coupon Application Input */}
                  <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">Coupon / Discount Code</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Ticket className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          placeholder="e.g. VIBE10 (10% Off)"
                          className="w-full text-xs uppercase rounded-lg border border-zinc-200 dark:border-zinc-800 py-1.5 pl-8 pr-2 focus:outline-none dark:bg-zinc-900 dark:text-white font-mono"
                        />
                      </div>
                      <button
                        onClick={handleApplyPromo}
                        className="bg-brand-pink font-display text-white px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg hover:bg-brand-orange transition-colors"
                      >
                        Apply
                      </button>
                    </div>

                    {promoMessage.text && (
                      <p className={`text-[10px] font-bold ${promoMessage.isError ? 'text-rose-500' : 'text-green-500'}`}>
                        {promoMessage.text}
                      </p>
                    )}

                    {/* Show applied promo */}
                    {appliedCoupon && (
                      <div className="flex items-center justify-between rounded-lg bg-green-500/10 border border-green-500/20 px-2.5 py-1 text-xs">
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-mono font-bold">
                          <Check className="h-3 w-3" />
                          <span>Promo applied: {appliedCoupon.code}</span>
                        </div>
                        <button
                          onClick={removeAppliedCoupon}
                          className="text-zinc-400 hover:text-rose-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-1 text-xs font-sans">
                    <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                      <span>Subtotal</span>
                      <span className="font-mono text-zinc-900 dark:text-white">BDT {subtotal}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Discount</span>
                        <span className="font-mono">- BDT {discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-black text-zinc-900 dark:text-white pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                      <span className="font-display">Total (BDT)</span>
                      <span className="font-mono text-brand-pink dark:text-brand-orange">BDT {totalAmount}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      onOpenCheckout();
                    }}
                    className="w-full h-11 bg-gradient-to-r from-brand-orange to-brand-pink hover:opacity-95 text-white font-display font-black tracking-wider rounded-xl uppercase shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <span>Proceed to Checkout</span>
                    <ShoppingBag className="h-4 w-4" />
                  </button>
                  <p className="text-[10px] text-zinc-400 text-center">Fast delivery available all over Bangladesh with Cash on Delivery (COD).</p>
                </div>
              )}

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
