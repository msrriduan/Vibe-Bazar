import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { Product, Order, Category, Coupon, SystemSettings } from '../types';
import { 
  Plus, Trash, Edit, Save, Check, X, Shield, RefreshCw, Smartphone, 
  MapPin, ShoppingCart, Layers, Tag, Settings, DollarSign, Archive, Eye,
  Search, Phone, ChevronDown, ChevronUp, Star, CreditCard, Bell, 
  AlertTriangle, CheckCircle2, XCircle, Truck, Package, Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminPanel() {
  const {
    products,
    categories,
    coupons,
    settings,
    orders,
    addProduct,
    updateProduct,
    deleteExistingProduct,
    addCategory,
    deleteCategory,
    updateOrderStatus,
    addCoupon,
    deleteCoupon,
    updateStoreSettings,
    seedDatabase
  } = useShop();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'promos' | 'settings'>('overview');

  // Interactive local feedback for real-time actions
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Search & Filter state
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'confirmed' | 'delivered' | 'cancelled'>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // Add / Edit Product forms
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    category: 'mens-fashion',
    price: 1000,
    stock: 10,
    images: '',
    isCODEnabled: true,
    codAllowedAreas: 'all',
    isFeatured: false,
    description: ''
  });

  // Categories & Coupon addition
  const [newCatId, setNewCatId] = useState('');
  const [newCatName, setNewCatName] = useState('');

  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'flat',
    discountValue: 10,
    minOrderAmount: 1000,
    isActive: true
  });

  // Settings modification
  const [settingsForm, setSettingsForm] = useState<SystemSettings>(settings);

  // Stats derivations
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    
    const todayOrders = orders.filter(o => {
      if (!o.createdAt) return false;
      const d = typeof o.createdAt === 'string' ? new Date(o.createdAt) : new Date(o.createdAt);
      return d.toDateString() === today;
    });

    const pendingRev = orders
      .filter(o => o.status !== 'cancelled' && o.paymentStatus === 'Pending')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const completedSales = orders
      .filter(o => o.status !== 'cancelled' && (o.paymentStatus === 'Confirmed' || o.status === 'delivered'))
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const lowStockCount = products.filter(p => p.stock <= 5).length;

    return {
      todayCount: todayOrders.length,
      pendingRevenue: pendingRev,
      completedRevenue: completedSales,
      lowStock: lowStockCount
    };
  }, [orders, products]);

  // Handle Steppers Optimistically
  const handleStockStepper = async (product: Product, amount: number) => {
    const newStock = Math.max(0, product.stock + amount);
    setUpdatingProductId(product.id);
    try {
      await updateProduct({
        ...product,
        stock: newStock,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Stock adjust failed", err);
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handlePriceStepper = async (product: Product, amount: number) => {
    const newPrice = Math.max(0, product.price + amount);
    setUpdatingProductId(product.id);
    try {
      await updateProduct({
        ...product,
        price: newPrice,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Price adjust failed", err);
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    setUpdatingProductId(product.id);
    try {
      await updateProduct({
        ...product,
        isFeatured: !product.isFeatured,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Featured toggle failed", err);
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handleToggleCOD = async (product: Product) => {
    setUpdatingProductId(product.id);
    try {
      await updateProduct({
        ...product,
        isCODEnabled: !product.isCODEnabled,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("COD toggle failed", err);
    } finally {
      setUpdatingProductId(null);
    }
  };

  // Submit Product Add/Edit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.id || !productForm.name) {
      alert('Product ID and Name are required.');
      return;
    }

    const payload: Omit<Product, 'createdAt' | 'updatedAt'> & { createdAt?: any; updatedAt?: any } = {
      id: productForm.id.toLowerCase().trim().replace(/\s+/g, '-'),
      name: productForm.name.trim(),
      category: productForm.category,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      images: productForm.images.split(',').map(s => s.trim()).filter(Boolean),
      isCODEnabled: productForm.isCODEnabled,
      codAllowedAreas: productForm.codAllowedAreas,
      isFeatured: productForm.isFeatured,
      description: productForm.description
    };

    try {
      if (editingProduct) {
        await updateProduct({
          ...payload,
          createdAt: editingProduct.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Product);
        setEditingProduct(null);
      } else {
        await addProduct(payload as Product);
      }
      
      // Reset & exit
      setShowAddProductModal(false);
      setProductForm({
        id: '',
        name: '',
        category: 'mens-fashion',
        price: 1000,
        stock: 10,
        images: '',
        isCODEnabled: true,
        codAllowedAreas: 'all',
        isFeatured: false,
        description: ''
      });
    } catch (err) {
      alert('Action failed. Verify logs for permissions or schema errors.');
    }
  };

  const triggerEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
      images: p.images.join(', '),
      isCODEnabled: p.isCODEnabled,
      codAllowedAreas: p.codAllowedAreas,
      isFeatured: p.isFeatured || false,
      description: p.description || ''
    });
    setShowAddProductModal(true);
  };

  // Category addition
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatId || !newCatName) return;
    try {
      const formattedId = newCatId.toLowerCase().trim().replace(/\s+/g, '-');
      await addCategory(formattedId, newCatName.trim());
      setNewCatId('');
      setNewCatName('');
    } catch {
      alert('Failed to add category.');
    }
  };

  // Coupon issue
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code) return;
    try {
      const codeUpper = couponForm.code.toUpperCase().trim();
      await addCoupon({
        code: codeUpper,
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue),
        minOrderAmount: Number(couponForm.minOrderAmount),
        isActive: couponForm.isActive,
        createdAt: new Date().toISOString()
      });
      setCouponForm({
        code: '',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 1000,
        isActive: true
      });
    } catch {
      alert('Coupon generation failed.');
    }
  };

  // Settings Save
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStoreSettings(settingsForm);
      alert('Preferences and Gateway contacts synced successfully!');
    } catch {
      alert('Could not update system preferences.');
    }
  };

  // Filters Computations
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesStatus = orderFilter === 'all' || o.status === orderFilter;
      const matchesSearch = 
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerPhone.includes(orderSearch);
      return matchesStatus && matchesSearch;
    });
  }, [orders, orderFilter, orderSearch]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      return p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
             p.id.toLowerCase().includes(productSearch.toLowerCase()) ||
             p.category.toLowerCase().includes(productSearch.toLowerCase());
    });
  }, [products, productSearch]);

  // Quick actions with minimum thumb distance helper text or instant validation
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/15 text-amber-400 border-amber-505/20';
      case 'confirmed': return 'bg-indigo-500/15 text-indigo-400 border-indigo-505/20';
      case 'delivered': return 'bg-emerald-500/15 text-emerald-400 border-emerald-505/25';
      case 'cancelled': return 'bg-rose-500/15 text-rose-400 border-rose-505/20';
      default: return 'bg-zinc-700/10 text-zinc-400';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-32">
      {/* Dynamic Glow Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-pink/5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-brand-orange/5 blur-3xl pointer-events-none rounded-full" />

      {/* Elegant Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-900 px-4 py-4.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-brand-orange/10 to-brand-pink/10 border border-brand-pink/20 rounded-xl">
              <Shield className="h-5 w-5 text-brand-pink animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-display font-black uppercase text-sm tracking-tight text-white leading-none">
                  Vibebazar Cockpit
                </h1>
                <span className="text-[9px] font-black uppercase tracking-widest bg-brand-pink/15 text-brand-pink px-1.5 py-0.5 rounded-full scale-90">
                  Mobile Pro
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium">Smart Administration Interface</p>
            </div>
          </div>

          <button
            onClick={seedDatabase}
            className="flex items-center gap-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-display text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 transition-all text-center"
          >
            <RefreshCw className="h-3.5 w-3.5 text-zinc-400" />
            <span>Reset Demo</span>
          </button>
        </div>
      </header>

      {/* Main Responsive Sandbox */}
      <main className="max-w-5xl mx-auto px-4 mt-6">
        
        {/* TAB OVERVIEW: Core visual metric dashboard */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Quick stock warning marquee */}
            {stats.lowStock > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-300 flex items-center gap-3 shadow-md"
              >
                <div className="p-1.5 bg-amber-500/10 rounded-lg">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-400" />
                </div>
                <div>
                  <span className="font-bold">LOW STOCK WARNING</span>
                  <p className="text-[11px] text-amber-200/80 mt-0.5">{stats.lowStock} products are running critically low on inventory. Tap stock to refill.</p>
                </div>
              </motion.div>
            )}

            {/* Quick Metrics display */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 p-5 rounded-2.5xl relative overflow-hidden">
                <div className="absolute right-4 top-4 h-9 w-9 bg-brand-orange/5 rounded-xl border border-brand-orange/10 flex items-center justify-center">
                  <Package className="h-4.5 w-4.5 text-brand-orange" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Today's Orders</p>
                <p className="font-display font-black text-2xl text-white mt-1.5">{stats.todayCount}</p>
                <div className="text-[9px] font-bold text-zinc-500 mt-2 block">
                  New invoices processed inside 24h
                </div>
              </div>

              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 p-5 rounded-2.5xl relative overflow-hidden">
                <div className="absolute right-4 top-4 h-9 w-9 bg-brand-pink/5 rounded-xl border border-brand-pink/10 flex items-center justify-center">
                  <DollarSign className="h-4.5 w-4.5 text-brand-pink" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Pending Revenue</p>
                <p className="font-display font-black text-2xl text-amber-450 mt-1.5">{stats.pendingRevenue} <span className="text-xs">BDT</span></p>
                <div className="text-[9px] font-bold text-zinc-500 mt-2 block">
                  Waiting for ledger verification or delivery
                </div>
              </div>

              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 p-5 rounded-2.5xl relative overflow-hidden">
                <div className="absolute right-4 top-4 h-9 w-9 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Completed Sales</p>
                <p className="font-display font-black text-2xl text-emerald-400 mt-1.5">{stats.completedRevenue} <span className="text-xs">BDT</span></p>
                <div className="text-[9px] font-bold text-zinc-500 mt-2 block">
                  Paid invoices or delivered assignments
                </div>
              </div>
            </div>

            {/* Quick Action Station */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Quick Operations</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="p-5.5 rounded-2xl bg-zinc-900 border border-zinc-850 hover:border-zinc-805 text-left active:scale-[0.98] transition-all cursor-pointer"
                >
                  <ShoppingCart className="h-6 w-6 text-brand-pink mb-3" />
                  <p className="text-xs font-bold text-white uppercase">Orders Dispatch</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Ready to ship: {orders.filter(o => o.status === 'confirmed').length} items</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      id: '',
                      name: '',
                      category: 'mens-fashion',
                      price: 1500,
                      stock: 12,
                      images: '',
                      isCODEnabled: true,
                      codAllowedAreas: 'all',
                      isFeatured: false,
                      description: ''
                    });
                    setShowAddProductModal(true);
                  }}
                  className="p-5.5 rounded-2xl bg-zinc-900 border border-zinc-850 hover:border-zinc-805 text-left active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Plus className="h-6 w-6 text-emerald-450 mb-3" />
                  <p className="text-xs font-bold text-white uppercase">Insert Catalog</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Upload new merchandise to app instantly</p>
                </button>
              </div>
            </div>

            {/* System Status & Diagnostics logs */}
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/35 p-4 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-300">
                  <Smartphone className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Device Dashboard Settings</span>
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Vibebazar mobile interface auto-saves edits to the Firebase Firestore. Stock adjustments, toggles, and status updates persist immediately without full page reloads.
              </p>
            </div>

          </div>
        )}

        {/* TAB ORDERS: Fulfillment Manager */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            {/* Quick status sliders / horizontal filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {(['all', 'pending', 'confirmed', 'delivered', 'cancelled'] as const).map((filter) => {
                const count = orders.filter(o => filter === 'all' || o.status === filter).length;
                return (
                  <button
                    key={filter}
                    onClick={() => setOrderFilter(filter)}
                    className={`rounded-xl px-4 py-3 border text-[10px] font-black uppercase tracking-wider whitespace-nowrap active:scale-95 transition-all cursor-pointer ${
                      orderFilter === filter
                        ? 'bg-white text-zinc-950 border-white font-black shadow-lg shadow-white/5'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-850'
                    }`}
                  >
                    {filter} ({count})
                  </button>
                );
              })}
            </div>

            {/* Order search input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search Client Name, Order ID, Phone..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-850 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-brand-pink text-white"
              />
            </div>

            {/* Dynamic Orders Card Layout */}
            <div className="space-y-3.5">
              {filteredOrders.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-zinc-850 rounded-2xl">
                  <ShoppingCart className="mx-auto h-12 w-12 text-zinc-700" />
                  <h3 className="mt-4 text-sm font-semibold text-zinc-500">Pipeline Empty</h3>
                  <p className="text-zinc-600 text-[10px] mt-1">No orders matched current selection criteria.</p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  
                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-zinc-900 bg-zinc-900/40 overflow-hidden hover:border-zinc-800 transition-all shadow-md mt-1"
                    >
                      {/* Accordion header: High summary block */}
                      <div 
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="p-4 flex items-center justify-between cursor-pointer active:bg-zinc-900/60 select-none"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-black bg-brand-pink/10 text-brand-pink px-2 py-0.5 rounded-md uppercase">
                              #{order.id.slice(-6).toUpperCase()}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          
                          <div className="text-zinc-300 font-bold text-xs capitalize">
                            {order.customerName}
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-3">
                          <div>
                            <p className="font-display font-black text-xs text-white">{order.totalAmount} BDT</p>
                            <p className="text-[9px] text-zinc-500 font-medium">
                              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                            </p>
                          </div>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                        </div>
                      </div>

                      {/* Expandable details sandbox */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-zinc-900 bg-zinc-950/70"
                          >
                            <div className="p-4.5 space-y-4 text-xs leading-relaxed">
                              
                              {/* Order Metadata Block */}
                              <div className="grid grid-cols-2 gap-4 border-b border-zinc-900 pb-4">
                                <div className="space-y-1">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">Ordered Time</span>
                                  <span className="text-zinc-300 font-semibold text-[11px] block">
                                    {order.createdAt ? new Date(order.createdAt).toLocaleString('en-BD') : 'Unknown Time'}
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">Invoice Total</span>
                                  <p className="text-brand-pink font-display font-black text-[13px]">{order.totalAmount} BDT</p>
                                </div>
                              </div>

                              {/* Customer Information Block */}
                              <div className="space-y-2 border-b border-zinc-900 pb-4">
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block">Shipping Profile</span>
                                <div className="space-y-1.5 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-900">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-white capitalize text-[11px]">{order.customerName}</span>
                                    <a
                                      href={`tel:${order.customerPhone}`}
                                      className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-wider uppercase px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform"
                                    >
                                      <Phone className="h-3.5 w-3.5" />
                                      <span>Tap to call</span>
                                    </a>
                                  </div>
                                  <div className="text-[11px] text-zinc-405 font-medium">{order.customerPhone}</div>
                                  <div className="text-[11px] text-zinc-400 flex items-start gap-1 mt-1 font-medium">
                                    <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                                    <span>{order.customerAddress}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Item list Summary */}
                              <div className="space-y-2 border-b border-zinc-900 pb-4">
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-450 block">Cart Summary</span>
                                <div className="space-y-1.5">
                                  {order.items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-[11px] font-medium py-0.5">
                                      <div className="text-zinc-300">
                                        • {item.name} <span className="text-zinc-500">x{item.quantity}</span>
                                      </div>
                                      <span className="font-mono text-zinc-400">{item.price * item.quantity} BDT</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Ledger & Shipping Method details */}
                              <div className="grid grid-cols-2 gap-4 pb-4">
                                <div className="space-y-1">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">Ledger Channel</span>
                                  <span className="text-zinc-300 font-bold uppercase block text-[11px]">{order.paymentMethod}</span>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">Transaction Reference</span>
                                  {order.transactionId ? (
                                    <span className="font-mono bg-zinc-900 text-brand-pink border border-zinc-850 px-2 py-0.5 rounded text-[10px] lowercase block font-black w-max">
                                      {order.transactionId}
                                    </span>
                                  ) : (
                                    <span className="text-zinc-550 italic text-[10px]">Collect Cash on Delivery</span>
                                  )}
                                </div>
                              </div>

                              {/* THUMB DRIVEN DISPATCH ACTIONS: Big high-hit area triggers */}
                              <div className="pt-2 flex flex-col gap-2.5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">Thumb Actions</span>
                                
                                <div className="grid grid-cols-2 gap-2">
                                  {/* Action 1: Confirmed Payment */}
                                  {order.paymentStatus === 'Pending' ? (
                                    <button
                                      onClick={() => updateOrderStatus(order.id, order.status, 'Confirmed')}
                                      className="min-h-[48px] rounded-xl bg-emerald-600 active:bg-emerald-700 text-white font-display text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-transform"
                                    >
                                      <CreditCard className="h-4 w-4" />
                                      <span>Verify Payment</span>
                                    </button>
                                  ) : (
                                    <div className="min-h-[48px] rounded-xl border border-emerald-520/20 bg-emerald-510/5 text-emerald-400 flex items-center justify-center gap-1 pb-1">
                                      <CheckCircle2 className="h-4 w-4" />
                                      <span className="text-[9px] font-black uppercase tracking-wider">Payment OK</span>
                                    </div>
                                  )}

                                  {/* Action 2: Confirm Order or Ship */}
                                  {order.status === 'pending' ? (
                                    <button
                                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                      className="min-h-[48px] rounded-xl bg-indigo-600 active:bg-indigo-700 text-white font-display text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-transform"
                                    >
                                      <Check className="h-4 w-4" />
                                      <span>Confirm Order</span>
                                    </button>
                                  ) : order.status === 'confirmed' ? (
                                    <button
                                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                                      className="min-h-[48px] rounded-xl bg-teal-600 active:bg-teal-700 text-white font-display text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-transform"
                                    >
                                      <Truck className="h-4 w-4" />
                                      <span>Deliver Package</span>
                                    </button>
                                  ) : (
                                    <div className="min-h-[48px] rounded-xl border border-indigo-520/10 bg-indigo-515/5 text-indigo-405 flex items-center justify-center gap-1 pb-1">
                                      <Check className="h-4 w-4" />
                                      <span className="text-[9px] font-black uppercase tracking-wider">Dispatched</span>
                                    </div>
                                  )}
                                </div>

                                {/* Cancel order button */}
                                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                  <button
                                    onClick={() => {
                                      if (confirm('Cancel this customer invoice? This is permanent.')) {
                                        updateOrderStatus(order.id, 'cancelled');
                                      }
                                    }}
                                    className="min-h-[44px] rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/5 font-display text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                                  >
                                    <XCircle className="h-4 w-4 text-rose-500" />
                                    <span>Void / Cancel Order</span>
                                  </button>
                                )}

                              </div>

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* TAB PRODUCTS: Rapid Stock & Price update */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            
            {/* Upper controls */}
            <div className="flex flex-col sm:flex-row gap-3.5 sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter by name, ID or description..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-brand-pink text-white"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    id: '',
                    name: '',
                    category: 'mens-fashion',
                    price: 1200,
                    stock: 15,
                    images: '',
                    isCODEnabled: true,
                    codAllowedAreas: 'all',
                    isFeatured: false,
                    description: ''
                  });
                  setShowAddProductModal(true);
                }}
                className="rounded-xl bg-gradient-to-r from-brand-orange to-brand-pink text-white font-display text-xs font-black uppercase tracking-wider h-11 px-5 flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:opacity-95 active:scale-95 shadow-lg"
              >
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Smart Stepper Stock Grid */}
            <div className="space-y-3">
              {filteredProducts.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-zinc-850 rounded-2xl">
                  <Archive className="mx-auto h-12 w-12 text-zinc-750" />
                  <p className="mt-4 text-sm font-semibold text-zinc-500">No merchandise matches filter.</p>
                </div>
              ) : (
                filteredProducts.map((prod) => {
                  const isUpdating = updatingProductId === prod.id;
                  
                  return (
                    <div
                      key={prod.id}
                      className="rounded-2xl border border-zinc-900 bg-zinc-900/35 p-4 space-y-4 relative overflow-hidden"
                    >
                      {/* Loading block overlay */}
                      {isUpdating && (
                        <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center z-10">
                          <div className="h-5 w-5 border-2 border-brand-pink/30 border-t-brand-pink rounded-full animate-spin" />
                        </div>
                      )}

                      {/* Header block details */}
                      <div className="flex gap-3.5 items-start">
                        <img 
                          src={prod.images && prod.images.length > 0 ? prod.images[0] : 'https://picsum.photos/100'} 
                          alt={prod.name} 
                          className="h-14 w-14 object-cover rounded-xl border border-zinc-900 bg-zinc-900 shrink-0" 
                        />
                        <div className="min-w-0 flex-1 text-xs">
                          <h4 className="font-bold text-white leading-tight truncate">{prod.name}</h4>
                          <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mt-1">
                            ID: {prod.id}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-[8px] bg-brand-orange/10 border border-brand-orange/15 text-brand-orange font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                              {prod.category}
                            </span>
                          </div>
                        </div>

                        {/* Top corner actions */}
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => triggerEditProduct(prod)}
                            className="p-2 bg-zinc-900 border border-zinc-850 hover:border-zinc-800 text-zinc-400 rounded-xl active:scale-90"
                            title="Edit database info"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Wipe "${prod.name}" from public listing permanently?`)) {
                                deleteExistingProduct(prod.id);
                              }
                            }}
                            className="p-2 bg-zinc-900 border border-zinc-850 hover:border-rose-950 text-rose-500 rounded-xl active:scale-90 animate-fade"
                            title="Delete"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* RESPONSIVE MOBILE STEPPERS */}
                      <div className="grid grid-cols-2 gap-3 pb-1">
                        
                        {/* Stepper A: Inventory Stock Counter */}
                        <div className="space-y-1 bg-zinc-950/65 rounded-xl p-2.5 border border-zinc-900">
                          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-zinc-500">
                            <span>Available Stock</span>
                            <span className={prod.stock <= 5 ? 'text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded' : 'text-zinc-600'}>
                              {prod.stock <= 5 ? 'low' : 'ok'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-1">
                            <button
                              type="button"
                              onClick={() => handleStockStepper(prod, -1)}
                              className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-850 text-zinc-300 font-bold text-lg flex items-center justify-center active:scale-95 select-none touch-manipulation"
                            >
                              -
                            </button>
                            <span className="font-display font-black text-sm text-white select-all">
                              {prod.stock}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStockStepper(prod, 1)}
                              className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-850 text-zinc-300 font-bold text-lg flex items-center justify-center active:scale-95 select-none touch-manipulation"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Stepper B: Price Adjustments */}
                        <div className="space-y-1 bg-zinc-950/65 rounded-xl p-2.5 border border-zinc-900 flex flex-col justify-between">
                          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-zinc-500">
                            <span>Billed Price BDT</span>
                            <span className="font-mono text-brand-pink">BDT</span>
                          </div>

                          <div className="flex items-center justify-between mt-1">
                            <button
                              type="button"
                              onClick={() => handlePriceStepper(prod, -100)}
                              className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-850 text-zinc-400 font-bold text-xs flex items-center justify-center active:scale-95 select-none touch-manipulation"
                            >
                              -100
                            </button>
                            <span className="font-display font-black text-xs text-white">
                              {prod.price}
                            </span>
                            <button
                              type="button"
                              onClick={() => handlePriceStepper(prod, 100)}
                              className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-850 text-zinc-405 font-bold text-xs flex items-center justify-center active:scale-95 select-none touch-manipulation"
                            >
                              +100
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* Immediate switch state triggers */}
                      <div className="flex gap-4 items-center pt-2.5 border-t border-zinc-900 text-[10px] font-bold text-zinc-400">
                        <label className="flex items-center gap-2 select-none cursor-pointer">
                          <input
                            type="checkbox"
                            checked={prod.isFeatured || false}
                            onChange={() => handleToggleFeatured(prod)}
                            className="h-4.5 w-4.5 accent-brand-pink cursor-pointer pointer-events-auto rounded bg-zinc-950 border border-zinc-800"
                          />
                          <span>Hot (Featured)</span>
                        </label>

                        <label className="flex items-center gap-2 select-none cursor-pointer">
                          <input
                            type="checkbox"
                            checked={prod.isCODEnabled}
                            onChange={() => handleToggleCOD(prod)}
                            className="h-4.5 w-4.5 accent-emerald-500 cursor-pointer pointer-events-auto rounded bg-zinc-950 border border-zinc-805"
                          />
                          <span>Cash On Delivery</span>
                        </label>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* TAB PROMOS & CATEGORIES: Vouchers & Store labels */}
        {activeTab === 'promos' && (
          <div className="space-y-8">
            
            {/* Promo Codes Segment */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                  <Percent className="h-4 w-4 text-brand-pink" />
                  <span>Promotional Vouchers ({coupons.length})</span>
                </h3>
              </div>

              {/* Add Coupon Form */}
              <div className="rounded-2xl border border-zinc-900 bg-zinc-900/35 p-5 space-y-4">
                <form onSubmit={handleCouponSubmit} className="space-y-4 text-xs font-sans">
                  <div>
                    <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">Coupon code label</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. EXTRA10"
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-905 rounded-xl py-3 px-4 text-xs font-bold uppercase font-mono tracking-wider focus:outline-none focus:border-brand-pink text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">Deduction Method</label>
                      <select
                        value={couponForm.discountType}
                        onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as 'percentage' | 'flat' })}
                        className="w-full bg-zinc-950 border border-zinc-905 rounded-xl py-3 px-3 text-xs font-semibold focus:outline-none text-white"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Cash Value BDT</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">Discount Amount</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={couponForm.discountValue}
                        onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                        placeholder="e.g. 10"
                        className="w-full bg-zinc-950 border border-zinc-905 rounded-xl py-3 px-4 text-xs font-semibold font-mono focus:outline-none text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">Minimum Order Basket (BDT)</label>
                    <input
                      type="number"
                      required
                      value={couponForm.minOrderAmount}
                      onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-905 rounded-xl py-3 px-4 text-xs font-semibold font-mono focus:outline-none text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-zinc-100 text-zinc-950 font-display text-xs font-black uppercase tracking-wider transition-all active:scale-95 hover:opacity-90 mt-2 cursor-pointer"
                  >
                    Issue Promo Code
                  </button>
                </form>
              </div>

              {/* Coupons List */}
              <div className="space-y-2">
                {coupons.map((c) => (
                  <div 
                    key={c.code}
                    className="p-3.5 rounded-xl border border-zinc-900 bg-zinc-900/20 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono text-brand-pink text-[11px] font-black tracking-widest bg-brand-pink/5 border border-brand-pink/10 px-2.5 py-0.5 rounded-md uppercase">
                        {c.code}
                      </span>
                      <p className="text-zinc-400 font-medium text-[10px] mt-1.5">
                        Amount: <strong className="text-emerald-400">{c.discountValue}{c.discountType === 'percentage' ? '%' : ' BDT'}</strong> | Min: {c.minOrderAmount} BDT
                      </p>
                    </div>

                    <div className="flex gap-3 items-center">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        c.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-rose-455'
                      }`}>
                        {c.isActive ? 'Active' : 'Unmounted'}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm(`Remove promotion code "${c.code}" permanently?`)) {
                            deleteCoupon(c.code);
                          }
                        }}
                        className="p-2 border border-zinc-850 hover:border-zinc-800 rounded-lg text-zinc-500 hover:text-rose-450"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Storefront Categories Segment */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-brand-pink" />
                <span>Storefront Categories ({categories.length})</span>
              </h3>

              {/* Category creation Form */}
              <div className="rounded-2xl border border-zinc-900 bg-zinc-900/35 p-5 space-y-4">
                <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs font-sans">
                  <div>
                    <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">Unique slug name (ID)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. winterwear"
                      value={newCatId}
                      onChange={(e) => setNewCatId(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-905 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:border-brand-pink text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">Display Category Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Premium Winterwear"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-905 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:border-brand-pink text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-zinc-100 text-zinc-950 font-display text-xs font-black uppercase tracking-wider transition-all active:scale-95 hover:opacity-90 mt-2 cursor-pointer"
                  >
                    Add Category
                  </button>
                </form>
              </div>

              {/* Categories Display */}
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div 
                    key={cat.id}
                    className="p-3.5 rounded-xl border border-zinc-900 bg-zinc-900/20 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-display font-bold text-white text-xs block">
                        {cat.name}
                      </span>
                      <span className="font-mono text-[9px] text-zinc-500 block mt-0.5">
                        Slug mapping: {cat.id}
                      </span>
                    </div>

                    {cat.id !== 'all' && (
                      <button
                        onClick={() => {
                          if (confirm(`Wipe category grouping "${cat.name}"? Products won't be deleted but won't group under this menu.`)) {
                            deleteCategory(cat.id);
                          }
                        }}
                        className="p-2 border border-zinc-850 hover:border-zinc-800 rounded-lg text-zinc-500 hover:text-rose-455 cursor-pointer"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB SETTINGS: official numbers and preferences */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/35 p-5 space-y-6">
              <div>
                <h3 className="font-display text-base font-black uppercase text-white tracking-tight flex items-center gap-1.5">
                  <Settings className="h-5 w-5 text-brand-pink" />
                  <span>Gateway & Merchant settings</span>
                </h3>
                <p className="text-zinc-[450] text-[11px] font-medium leading-relaxed mt-1">
                  Adjust standard consumer-facing support lines, payment methods numbers, and analytic pixels in real-time.
                </p>
              </div>

              <form onSubmit={handleSettingsSubmit} className="space-y-5 text-xs font-sans">
                
                {/* 1. Mobile banking credentials key form */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-4">
                  <p className="font-display text-[9px] font-black uppercase tracking-widest text-zinc-450 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-brand-pink rounded-full" />
                    <span>Official MFS Payment Ledger numbers</span>
                  </p>
                  
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-zinc-500 font-bold block mb-1 font-mono uppercase tracking-widest text-[9px]">bKash Personal Number</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.paymentNumbers.bKash}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          paymentNumbers: { ...settingsForm.paymentNumbers, bKash: e.target.value }
                        })}
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-xl py-3 px-4 text-xs font-semibold font-mono text-white focus:outline-none focus:border-brand-pink"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-500 font-bold block mb-1 font-mono uppercase tracking-widest text-[9px]">Nagad Personal Number</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.paymentNumbers.Nagad}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          paymentNumbers: { ...settingsForm.paymentNumbers, Nagad: e.target.value }
                        })}
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-xl py-3 px-4 text-xs font-semibold font-mono text-white focus:outline-none focus:border-brand-pink"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-500 font-bold block mb-1 font-mono uppercase tracking-widest text-[9px]">Rocket Number</label>
                      <input
                        type="text"
                        value={settingsForm.paymentNumbers.Rocket || ''}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          paymentNumbers: { ...settingsForm.paymentNumbers, Rocket: e.target.value }
                        })}
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-xl py-3 px-4 text-xs font-semibold font-mono text-white focus:outline-none focus:border-brand-pink"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Chat Support Lines Integrations */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-4">
                  <p className="font-display text-[9px] font-black uppercase tracking-widest text-zinc-450 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-brand-pink rounded-full" />
                    <span>Business customer integration links</span>
                  </p>
                  
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-zinc-500 font-bold block mb-1 font-mono uppercase tracking-widest text-[9px]">WhatsApp Notification Number</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.whatsappNumber}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-xl py-3 px-4 text-xs font-semibold font-mono text-white focus:outline-none focus:border-brand-pink"
                      />
                      <p className="text-[9px] text-zinc-500 mt-1">Remember to set correct country code (e.g., 8801989475141)</p>
                    </div>

                    <div>
                      <label className="text-zinc-500 font-bold block mb-1 font-mono uppercase tracking-widest text-[9px]">Facebook Messenger Hook Link</label>
                      <input
                        type="url"
                        value={settingsForm.messengerChatUrl || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, messengerChatUrl: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-xl py-3 px-4 text-xs font-semibold text-white focus:outline-none focus:border-brand-pink"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-500 font-bold block mb-1 font-mono uppercase tracking-widest text-[9px]">Facebook pixel ID</label>
                      <input
                        type="text"
                        value={settingsForm.facebookPixelId || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, facebookPixelId: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-xl py-3 px-4 text-xs font-semibold text-white focus:outline-none focus:border-brand-pink"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-orange to-brand-pink text-white font-display text-xs font-black uppercase tracking-wider transition-all hover:opacity-95 active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="h-4.5 w-4.5" />
                  <span>Sync Configurations</span>
                </button>

              </form>
            </div>
          </div>
        )}

      </main>

      {/* Floating Bottom Navigator (Optimized for thumb tap-action toggling) */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/80 backdrop-blur-md border-t border-zinc-900 p-2.5 pb-6">
        <div className="max-w-lg mx-auto grid grid-cols-5 gap-1 text-center font-display">
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center justify-center py-2 rounded-xl cursor-pointer select-none transition-transform active:scale-90 ${
              activeTab === 'overview' ? 'text-brand-pink' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Shield className="h-4.5 w-4.5" />
            <span className="text-[8px] font-black uppercase tracking-wider mt-1.5 block">Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center justify-center py-2 rounded-xl cursor-pointer select-none transition-transform active:scale-90 relative ${
              activeTab === 'orders' ? 'text-brand-pink' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {orders.filter(o => o.status === 'pending').length > 0 && (
              <span className="absolute top-1 right-2 bg-brand-pink text-[8px] text-white h-3.5 w-3.5 rounded-full flex items-center justify-center font-bold">
                {orders.filter(o => o.status === 'pending').length}
              </span>
            )}
            <ShoppingCart className="h-4.5 w-4.5" />
            <span className="text-[8px] font-black uppercase tracking-wider mt-1.5 block">Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex flex-col items-center justify-center py-2 rounded-xl cursor-pointer select-none transition-transform active:scale-90 ${
              activeTab === 'products' ? 'text-brand-pink' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Archive className="h-4.5 w-4.5 z-10" />
            <span className="text-[8px] font-black uppercase tracking-wider mt-1.5 block">Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('promos')}
            className={`flex flex-col items-center justify-center py-2 rounded-xl cursor-pointer select-none transition-transform active:scale-90 ${
              activeTab === 'promos' ? 'text-brand-pink' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Layers className="h-4.5 w-4.5" />
            <span className="text-[8px] font-black uppercase tracking-wider mt-1.5 z-10 block">Promo</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center py-2 rounded-xl cursor-pointer select-none transition-transform active:scale-90 ${
              activeTab === 'settings' ? 'text-brand-pink' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Settings className="h-4.5 w-4.5" />
            <span className="text-[8px] font-black uppercase tracking-wider mt-1.5 block">Settings</span>
          </button>

        </div>
      </footer>

      {/* FULL SCREEN MODAL: Add / Edit Product Form */}
      <AnimatePresence>
        {showAddProductModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm overflow-y-auto p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="max-w-md mx-auto my-8 bg-zinc-900 border border-zinc-800 rounded-2.5xl p-6.5 text-left text-xs text-zinc-300 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="font-display font-black uppercase text-sm text-brand-pink tracking-tight">
                  {editingProduct ? 'Edit Catalog SKU' : 'Publish SKU'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-850 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1 text-[9px]">Product SKU ID *</label>
                    <input
                      type="text"
                      required
                      disabled={!!editingProduct}
                      value={productForm.id}
                      onChange={(e) => setProductForm({ ...productForm, id: e.target.value })}
                      placeholder="vib-101"
                      className="w-full bg-zinc-950 border border-zinc-805 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-brand-pink text-white disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1 text-[9px]">Stock count *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                      placeholder="10"
                      className="w-full bg-zinc-950 border border-zinc-805 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-brand-pink text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1 text-[9px]">Public Title *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Aura Silk Panjabi"
                    className="w-full bg-zinc-950 border border-zinc-805 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-brand-pink text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1 text-[9px]">Category group *</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-805 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-brand-pink text-white"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1 text-[9px]">Value Price BDT *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      placeholder="1500"
                      className="w-full bg-zinc-950 border border-zinc-805 rounded-xl py-2.5 px-3 text-xs font-semibold font-mono focus:outline-none focus:border-brand-pink text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1 text-[9px]">Hotlink Galleries (separated with commas) *</label>
                  <input
                    type="text"
                    required
                    value={productForm.images}
                    onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                    placeholder="https://picsum.photos/400"
                    className="w-full bg-zinc-950 border border-zinc-805 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-brand-pink text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 bg-zinc-950 p-2.5 rounded-xl border border-zinc-805 text-[10px] font-bold">
                  <label className="flex items-center gap-1.5 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isCODEnabled}
                      onChange={(e) => setProductForm({ ...productForm, isCODEnabled: e.target.checked })}
                      className="h-4 w-4 text-brand-pink bg-zinc-900 border-zinc-805 rounded pointer-events-auto cursor-pointer"
                    />
                    <span>COD Enabled</span>
                  </label>

                  <label className="flex items-center gap-1.5 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isFeatured}
                      onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                      className="h-4 w-4 text-brand-pink bg-zinc-900 border-zinc-850 rounded pointer-events-auto cursor-pointer"
                    />
                    <span>★ Hot SKU</span>
                  </label>
                </div>

                <div>
                  <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1 text-[9px]">Allowed COD Areas</label>
                  <select
                    value={productForm.codAllowedAreas}
                    onChange={(e) => setProductForm({ ...productForm, codAllowedAreas: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-805 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-brand-pink text-white animate-fade"
                  >
                    <option value="all">All Bangladesh (Standard)</option>
                    <option value="dhaka">Inside Dhaka Only</option>
                    <option value="none">Pre-paid Only (No COD allowed)</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1 text-[9px]">Description & Properties</label>
                  <textarea
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Write specifics, material types..."
                    className="w-full bg-zinc-950 border border-zinc-805 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:border-brand-pink text-white"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-brand-orange to-brand-pink text-white font-display text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-md shadow-brand-pink/20 cursor-pointer"
                  >
                    {editingProduct ? 'Save Changes' : 'Publish Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(false)}
                    className="h-11 rounded-xl border border-zinc-800 hover:border-zinc-700 font-display text-[10px] font-black uppercase tracking-wider px-4 text-zinc-400 hover:text-white transition-all active:scale-95"
                  >
                    Discard
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
