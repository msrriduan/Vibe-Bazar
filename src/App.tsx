import { useState, useEffect, useRef } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductDetails from './components/ProductDetails';
import CheckoutModal from './components/CheckoutModal';
import OrderTracking from './components/OrderTracking';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import { Product } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Facebook, MessageCircle, Heart, Star, Compass, ShieldCheck, 
  HelpCircle, ChevronRight, Sparkles, AlertCircle, ShoppingBag, BadgeAlert, Flame
} from 'lucide-react';
import BrandLogo from './components/BrandLogo';

function StorefrontContent() {
  const {
    products,
    categories,
    settings,
    user,
    isAdmin,
    authLoading
  } = useShop();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal Toggles
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [immediateCheckoutProduct, setImmediateCheckoutProduct] = useState<Product | null>(null);
  const [immediateSize, setImmediateSize] = useState<string>('');
  const [immediateColor, setImmediateColor] = useState<string>('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [viewProductId, setViewProductId] = useState<string | null>(null);

  // Shareover Hash Routing synchronization
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#product-')) {
        const pId = hash.replace('#product-', '');
        setViewProductId(pId);
        setShowAdminPanel(false); // Close Admin screen when switching to item details
      } else {
        setViewProductId(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Filtered Products
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (prod.description && prod.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Featured and normal lists
  const featuredProducts = filteredProducts.filter(p => p.isFeatured && p.stock > 0);
  const normalProducts = filteredProducts.filter(p => !p.isFeatured || p.stock === 0);

  // Trigger Immediate "Buy Now" Checkout
  const handleOpenCheckoutImmediate = (product: Product, size?: string, color?: string) => {
    setImmediateCheckoutProduct(product);
    setImmediateSize(size || '');
    setImmediateColor(color || '');
    setIsCheckoutOpen(true);
  };

  // Carousel Auto-scroll and pause-on-hover setup
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  useEffect(() => {
    if (!featuredProducts.length || !carouselRef.current || isCarouselHovered) return;
    
    const interval = setInterval(() => {
      const container = carouselRef.current;
      if (!container) return;
      
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScrollLeft - 10) {
        // Reset to beginning smoothly
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Scroll by one item
        const itemWidth = container.firstElementChild?.clientWidth || 210;
        container.scrollBy({ left: itemWidth + 16, behavior: 'smooth' }); // item width + spacing gap
      }
    }, 4000); // swipe every 4 seconds

    return () => clearInterval(interval);
  }, [featuredProducts, isCarouselHovered]);

  // Close Checkout Modal & reset direct-buy state
  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
    setImmediateCheckoutProduct(null);
    setImmediateSize('');
    setImmediateColor('');
  };

  // Simulated Facebook Pixel and Google Analytics Logging
  useEffect(() => {
    if (settings.facebookPixelId) {
      console.log(`[FB PIXEL INITIATED]: Tracking initialized with Facebook Pixel ID "${settings.facebookPixelId}"`);
    }
    console.log(`[GOOGLE ANALYTICS INITIATED]: SEO Tag verification and PageView recorded for Vibebazar Store.`);
  }, [settings.facebookPixelId]);

  return (
    <div className="min-h-screen bg-[#f6f8fd] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-300 retro-grid font-sans flex flex-col">
      
      {/* Navbar Integration */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onOpenTracking={() => setIsTrackingOpen(true)}
        showAdminPanel={showAdminPanel}
        setShowAdminPanel={setShowAdminPanel}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {showAdminPanel ? (
            isAdmin ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                key="admin"
              >
                <AdminPanel />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                key="admin-login"
              >
                <AdminLogin onClose={() => setShowAdminPanel(false)} />
              </motion.div>
            )
          ) : viewProductId ? (
            (() => {
              const viewProduct = products.find(p => p.id === viewProductId);
              if (!viewProduct) {
                return (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key="not-found"
                    className="mx-auto max-w-xl text-center py-16"
                  >
                    <p className="font-display font-black text-zinc-550 uppercase">Product not found</p>
                    <button onClick={() => { window.location.hash = ''; }} className="mt-4 px-4 py-2 bg-brand-pink text-white text-xs font-bold rounded-xl uppercase">
                      Back to Home
                    </button>
                  </motion.div>
                );
              }
              return (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  key="product-details-view"
                >
                  <ProductDetails
                    product={viewProduct}
                    onBack={() => { window.location.hash = ''; }}
                    onOpenCheckoutImmediate={handleOpenCheckoutImmediate}
                  />
                </motion.div>
              );
            })()
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="shop"
              className="space-y-12 pb-16"
            >
              
              {/* Dynamic Hero Banner */}
              <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-orange via-brand-pink to-brand-pink p-8 sm:p-12 text-white shadow-xl shadow-brand-pink/15 border border-white/10 select-none">
                  {/* Decorative Elements */}
                  <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-orange/40 blur-3xl animate-pulse" />
                  <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-brand-pink/40 blur-3xl animate-pulse" />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 text-left">
                    <div className="lg:col-span-7 space-y-6">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest leading-none">
                        <Sparkles className="h-3.5 w-3.5 text-brand-gold animate-bounce" />
                        <span className="text-white">Gen-Z Curated Shop</span>
                      </div>

                      <h1 className="font-display text-4.5xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none uppercase">
                        SET THE <span className="bg-white/20 px-3 py-1 rounded-[16px] inline-block text-white tracking-widest leading-none animate-pulse">VIBE</span> <br />FOR YOUR GRID.
                      </h1>

                      <p className="font-sans text-xs sm:text-sm text-zinc-100/95 leading-relaxed font-semibold max-w-md">
                        Bangladeshi trendsetters get ahead has never been this easy. Cash on Delivery across Bangladesh. Authenticity guaranteed of every apparel item on catalog.
                      </p>

                      <div className="flex flex-wrap gap-3 pt-2">
                        <button
                          onClick={() => setSelectedCategory('all')}
                          className="rounded-xl bg-white hover:bg-neutral-50 text-brand-pink font-display text-xs font-black uppercase tracking-wider px-6 py-3.5 shadow-md transition-all flex items-center gap-1.5 hover:scale-[1.01] active:scale-[0.99]"
                        >
                          <span>Explore Catalog</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        
                        <a
                          href="https://www.facebook.com/Vibebazar01"
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl border border-white/40 hover:bg-white/10 text-white font-display text-xs font-black uppercase tracking-wider px-6 py-3.5 transition-all flex items-center gap-2 hover:border-white/80"
                        >
                          <Facebook className="h-4.5 w-4.5" />
                          <span>Visit Facebook</span>
                        </a>
                      </div>
                    </div>

                    <div className="lg:col-span-5 flex justify-center items-center relative">
                      {/* Glow Behind the Logo */}
                      <div className="absolute inset-0 m-auto h-44 w-44 rounded-full bg-zinc-950/20 mix-blend-multiply opacity-40 blur-2xl" />
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="relative z-10 p-6 rounded-3xl bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 glow-brand hover:scale-105 transition-transform duration-300 flex flex-col items-center gap-3"
                      >
                        <BrandLogo size="lg" showText={false} />
                        <span className="font-display font-black text-[10px] tracking-widest text-brand-gold uppercase bg-black/30 dark:bg-black/50 px-3.5 py-1 rounded-full border border-brand-gold/30">
                          Vibebazar
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Vibe Deals 🔥 Section */}
              <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                 <div className="bg-gradient-to-r from-brand-orange/10 via-brand-pink/10 to-brand-orange/5 rounded-3xl border border-brand-pink/20 p-6 sm:p-8 relative overflow-hidden">
                  <div className="absolute right-0 top-0 h-32 w-32 bg-brand-orange/20 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 text-left">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1 bg-brand-pink text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                        <Flame className="h-3 w-3 text-white animate-bounce" />
                        <span>Flash Promo ⚡</span>
                      </div>
                      <h2 className="font-display text-xl sm:text-2xl font-black text-zinc-950 dark:text-white uppercase tracking-tight leading-none">
                        VIBE DEALS <span className="text-brand-pink animate-pulse">🔥</span>
                      </h2>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold font-sans">
                        Use coupon <span className="font-mono text-brand-pink font-black bg-brand-pink/10 dark:bg-brand-pink/20 px-2 py-0.5 rounded-md border border-brand-pink/20">VIBE10</span> to claim 10% Extra Discount on Checkout.
                      </p>
                    </div>
                    
                    <div className="flex gap-1.5 bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl p-3 items-center self-start sm:self-auto">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mr-2">CODE:</span>
                      <code className="text-xs font-mono font-black text-brand-orange bg-white dark:bg-zinc-950 px-2.5 py-1 rounded-lg border border-brand-orange/20 select-all">VIBE10</code>
                    </div>
                  </div>
                </div>
              </section>

              {/* Dynamic product search query alert */}
              {searchQuery && (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <p className="font-display text-sm font-bold text-zinc-500 dark:text-zinc-400">
                    Showing results for "<span className="text-brand-pink dark:text-brand-orange font-black">{searchQuery}</span>" ({filteredProducts.length} items found)
                  </p>
                </div>
              )}

              {/* Grid Catalog Listings */}
              {filteredProducts.length === 0 ? (
                <div className="mx-auto max-w-xl px-4 py-16 text-center">
                  <div className="rounded-full bg-zinc-100 dark:bg-zinc-900 p-4 mb-4 inline-block">
                    <BadgeAlert className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                  </div>
                  <h3 className="font-display font-black text-lg text-zinc-500 dark:text-zinc-400 uppercase tracking-tight">No Items Match Filter</h3>
                  <p className="text-zinc-400 text-xs mt-1">Try relaxing your search spelling or change active categories tabs.</p>
                </div>
              ) : (
                <div className="space-y-12">
                  {/* FEATURED ITEMS SECTION / TRENDING CAROUSEL */}
                  {featuredProducts.length > 0 && (
                    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-brand-gold fill-brand-gold" />
                          <h2 className="font-display text-lg sm:text-xl font-black uppercase tracking-tight text-zinc-950 dark:text-white">Trending / Hot Featured  🔥</h2>
                        </div>
                        <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider hidden sm:inline-block">Swipe right to view →</span>
                      </div>
                      
                      {/* Carousel sliding view */}
                      <div 
                        ref={carouselRef}
                        onMouseEnter={() => setIsCarouselHovered(true)}
                        onMouseLeave={() => setIsCarouselHovered(false)}
                        className="flex overflow-x-auto gap-4 pb-6 pt-1 snap-x scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
                      >
                        {featuredProducts.map((p) => (
                          <div key={p.id} className="w-[210px] sm:w-[250px] flex-shrink-0 snap-start">
                            <ProductCard 
                              product={p} 
                              onOpenCheckoutImmediate={handleOpenCheckoutImmediate} 
                              isCompact={true}
                            />
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* STANDARD NO-FEATURED CATALOG ITEMS LIST */}
                  {normalProducts.length > 0 && (
                    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                        <Compass className="h-5 w-5 text-brand-pink" />
                        <h2 className="font-display text-lg sm:text-xl font-black uppercase tracking-tight text-zinc-950 dark:text-white">All Vibebazar Catalog Items</h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {normalProducts.map((p) => (
                          <ProductCard 
                            key={p.id} 
                            product={p} 
                            onOpenCheckoutImmediate={handleOpenCheckoutImmediate} 
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {/* Guarantees Pitch */}
              <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">
                  <div className="flex gap-4 items-start">
                    <div className="rounded-xl bg-[#D4AF37]/10 p-2.5 text-[#D4AF37] flex-shrink-0 shadow-xs glow-gold">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold uppercase text-zinc-950 dark:text-white">100% Genuine Catalog</h4>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">We source organic cloths and electronics only from official distributor hubs.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="rounded-xl bg-brand-pink/10 p-2.5 text-brand-pink flex-shrink-0 shadow-xs glow-pink">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold uppercase text-zinc-950 dark:text-white">WhatsApp Store Support</h4>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">Chat directly with the staff around-the-clock for delivery modifications.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-500 flex-shrink-0 shadow-xs glow-green">
                      <HelpCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold uppercase text-zinc-950 dark:text-white">Flexible Cash delivery</h4>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">Pay comfortably only after holding the parcel and checking items structure.</p>
                    </div>
                  </div>
                </div>
              </section>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Support Online Banner (From Vibrant Design HTML) */}
      <div className="bg-brand-dark border-t border-zinc-800 text-white py-3.5 px-6 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-xs">
        <div className="flex items-center gap-2 mt-0.5">
          <span className="flex h-2.5 w-2.5 relative items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <p className="font-bold tracking-tight uppercase">Admin Support Online: {settings.paymentNumbers.bKash || '01989475141'}</p>
        </div>
        <div className="flex flex-wrap gap-4 sm:gap-6 items-center justify-center">
          <a
            href={settings.messengerChatUrl || 'https://m.me/Vibebazar01'}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer group text-white hover:text-white"
          >
            <span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-[11px] group-hover:scale-105 transition-transform">💬</span>
            <span className="font-bold">Messenger Ordering Channel</span>
          </a>
          <div className="hidden sm:block h-4 w-px bg-white/20"></div>
          <p className="opacity-60 italic">© Vibebazar Bangladesh. Express Shipping inside Dhaka City.</p>
        </div>
      </div>

      {/* FOOTER - Facebook integrated and optimized for Google rank search indexing structure */}
      <footer className="border-t border-indigo-100 dark:border-zinc-900 bg-white dark:bg-zinc-950/40 text-xs font-sans text-zinc-500 dark:text-zinc-400 py-12 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          
          <div className="md:col-span-5 space-y-4">
            <div className="mb-2">
              <BrandLogo size="sm" />
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 pr-4 leading-relaxed">
              Vibebazar is Bangladesh's premium destination for streetwear hoods, oversized streetwear, noise-cancelling tech models, accessories, and and trendsetting accessories. Custom delivery mechanisms across 64 districts in Bangladesh.
            </p>
            <div className="flex gap-3 pt-1">
              <a 
                href="https://www.facebook.com/Vibebazar01" 
                target="_blank" 
                rel="noreferrer"
                className="h-8 w-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center transition-colors"
                title="Vibebazar Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="font-display text-xs font-black uppercase text-zinc-950 dark:text-white tracking-widest">Active Categories</h4>
            <ul className="space-y-1.5 text-zinc-400">
              <li><button onClick={() => setSelectedCategory('mens-fashion')} className="hover:text-brand-pink transition-colors">Men's Apparel</button></li>
              <li><button onClick={() => setSelectedCategory('womens-fashion')} className="hover:text-brand-pink transition-colors">Women's Fashion Hub</button></li>
              <li><button onClick={() => setSelectedCategory('electronics')} className="hover:text-brand-pink transition-colors">Digital Accessories</button></li>
              <li><button onClick={() => setSelectedCategory('accessories')} className="hover:text-brand-pink transition-colors">Sunglasses & Watches</button></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h4 className="font-display text-xs font-black uppercase text-zinc-950 dark:text-white tracking-widest">Official Helpline</h4>
            <p className="text-zinc-400">Located: Dhaka, Bangladesh</p>
            <p className="text-zinc-400">
              bKash/Nagad helpline: <strong className="text-zinc-900 dark:text-white font-mono">{settings.paymentNumbers.bKash || '01989475141'}</strong>
            </p>
            <p className="text-zinc-440 flex items-center gap-1.5 font-bold mt-1 text-brand-pink">
              <MessageCircle className="h-4 w-4" />
              <span>Messenger Channel ID: Vibebazar01</span>
            </p>
          </div>

          <div className="md:col-span-12 border-t border-zinc-150 dark:border-zinc-900 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px]">
            <p>© {new Date().getFullYear()} Vibebazar BD Online. All copyrights reserved.</p>
            <div className="flex gap-4">
              <button onClick={() => setIsTrackingOpen(true)} className="hover:underline">Shipment Track</button>
              <button onClick={() => setIsCheckoutOpen(true)} className="hover:underline">Payment Gateways</button>
              <span className="text-zinc-300 dark:text-zinc-800">|</span>
              <span className="text-zinc-400">Verified Secure Checkout System</span>
            </div>
          </div>

        </div>
      </footer>

      {/* FLOATING Facebook Messenger chat plugin - compliant with requirements */}
      <a
        href={settings.messengerChatUrl || 'https://m.me/Vibebazar01'}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-zinc-900 border border-white/10 text-white hover:scale-105 shadow-xl transition-all h-12 w-12 rounded-full flex items-center justify-center glow-pink"
        title="Live chat with us on Messenger"
      >
        <MessageCircle className="h-6 w-6" />
      </a>

      {/* Checkout Modal Frame */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckout}
        immediateProduct={immediateCheckoutProduct}
        immediateSize={immediateSize}
        immediateColor={immediateColor}
      />

      {/* Order Tracking modal Frame */}
      <OrderTracking
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <ShopProvider>
      <StorefrontContent />
    </ShopProvider>
  );
}
