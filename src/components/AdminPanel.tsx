import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Product, Order, Category, Coupon, SystemSettings } from '../types';
import { 
  Plus, Trash, Edit, Save, Check, X, Shield, RefreshCw, Smartphone, 
  MapPin, ShoppingCart, Layers, Tag, Settings, DollarSign, Archive, Eye
} from 'lucide-react';

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

  // Active Admin Sub-tab
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'categories' | 'coupons' | 'settings'>('orders');

  // Edit / Input states
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
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

  const [newCatId, setNewCatId] = useState('');
  const [newCatName, setNewCatName] = useState('');

  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'flat',
    discountValue: 10,
    minOrderAmount: 1000,
    isActive: true
  });

  const [settingsForm, setSettingsForm] = useState<SystemSettings>(settings);

  // Filters for orders
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'confirmed' | 'delivered' | 'cancelled'>('all');

  // Actions
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.id || !productForm.name) {
      alert('Product ID and Name are required.');
      return;
    }

    const payload: Omit<Product, 'createdAt' | 'updatedAt'> & { createdAt?: any; updatedAt?: any } = {
      id: productForm.id,
      name: productForm.name,
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
      if (editingProductId) {
        // Retrieve creation timestamp to avoid wiping
        const original = products.find(p => p.id === editingProductId);
        await updateProduct({
          ...payload,
          createdAt: original?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Product);
        setEditingProductId(null);
      } else {
        await addProduct(payload as Product);
      }
      // Reset form
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
      alert('Action failed. Read browser console for strict rule exceptions.');
    }
  };

  const handleEditProductClick = (p: Product) => {
    setEditingProductId(p.id);
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
  };

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatId || !newCatName) return;
    try {
      const formattedId = newCatId.toLowerCase().trim().replace(/\s+/g, '-');
      await addCategory(formattedId, newCatName.trim());
      setNewCatId('');
      setNewCatName('');
    } catch {
      alert('Category creation failed.');
    }
  };

  const handleAddCouponSubmit = async (e: React.FormEvent) => {
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
      alert('Coupon creation failed.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStoreSettings(settingsForm);
      alert('Vibebazar configurations updated successfully!');
    } catch {
      alert('Failed saving store configurations.');
    }
  };

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans">
      
      {/* Brand Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-indigo-500/20 pb-6 mb-8 gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <Shield className="h-7 w-7 text-purple-600 animate-pulse" />
            Vibebazar Admin Dashboard
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Live Store analytics, delivery dispatch system, catalog, category settings, and payment ledger checks.</p>
        </div>
        
        <button
          onClick={seedDatabase}
          className="flex items-center gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 font-display text-white px-4 py-2 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-orange-500/20"
        >
          <RefreshCw className="h-4.5 w-4.5" />
          Re-seed Catalog Data
        </button>
      </div>

      {/* Ribbon Navigation */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto mb-8 font-display">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
            activeTab === 'orders'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-black'
              : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 hover:border-zinc-300'
          }`}
        >
          <ShoppingCart className="h-4.5 w-4.5" />
          <span>Fulfill Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
            activeTab === 'products'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-black'
              : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'
          }`}
        >
          <Archive className="h-4.5 w-4.5" />
          <span>Product Catalog ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
            activeTab === 'categories'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-black'
              : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'
          }`}
        >
          <Layers className="h-4.5 w-4.5" />
          <span>Categories ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
            activeTab === 'coupons'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-black'
              : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'
          }`}
        >
          <Tag className="h-4.5 w-4.5" />
          <span>Voucher Codes ({coupons.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('settings');
            setSettingsForm(settings);
          }}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
            activeTab === 'settings'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-black'
              : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'
          }`}
        >
          <Settings className="h-4.5 w-4.5" />
          <span>Payment Numbers</span>
        </button>
      </div>

      {/* Tabs panels */}
      <div className="space-y-6">

        {/* 1. ORDER DISPATCH FULLFILLMENT MANAGER */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            {/* Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 font-display text-xs font-bold uppercase tracking-wider">
              {(['all', 'pending', 'confirmed', 'delivered', 'cancelled'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setOrderFilter(filter)}
                  className={`rounded-lg px-4 py-2 border transition-all ${
                    orderFilter === filter
                      ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 dark:border-white font-black'
                      : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800'
                  }`}
                >
                  {filter} ({orders.filter(o => filter === 'all' || o.status === filter).length})
                </button>
              ))}
            </div>

            {/* Orders list */}
            {filteredOrders.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <ShoppingCart className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
                <h3 className="mt-4 font-display font-medium text-zinc-500 dark:text-zinc-400">Empty Pipelines</h3>
                <p className="text-zinc-400 text-xs mt-1">No orders match the current filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
                  >
                    {/* Order metadata */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-100 dark:border-zinc-900 pb-3 gap-2">
                      <div className="leading-tight">
                        <span className="font-mono text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded uppercase">{order.id}</span>
                        <span className="text-zinc-400 text-[10px] block mt-1">Purchased: {new Date(order.createdAt).toLocaleString()}</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {/* Transaction confirmation status */}
                        <span className={`rounded-xl px-2.5 py-0.5 font-display text-[9px] font-black uppercase tracking-wider border ${
                          order.paymentStatus === 'Confirmed'
                            ? 'bg-green-500/15 border-green-500/30 text-green-600'
                            : 'bg-amber-500/15 border-amber-500/30 text-amber-600'
                        }`}>
                          {order.paymentStatus === 'Confirmed' ? '💳 Clear (Paid)' : '💳 Payment: Pending'}
                        </span>

                        <span className={`rounded-xl px-2.5 py-0.5 font-display text-[9px] font-black uppercase tracking-wider border ${
                          order.status === 'pending'
                            ? 'bg-amber-500/15 border-amber-500/30 text-amber-600'
                            : order.status === 'confirmed'
                            ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-600'
                            : order.status === 'delivered'
                            ? 'bg-green-500/15 border-green-500/30 text-green-600'
                            : 'bg-rose-500/15 border-rose-500/30 text-rose-600'
                        }`}>
                          📦 Status: {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Customer invoice and details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                      <div className="space-y-1.5">
                        <p className="text-zinc-400 uppercase tracking-widest font-bold text-[10px]">Customer profile</p>
                        <p className="font-bold text-sm text-zinc-900 dark:text-white capitalize">{order.customerName}</p>
                        <p className="font-mono text-zinc-600 dark:text-zinc-300">{order.customerPhone}</p>
                        <p className="text-zinc-500 flex items-center gap-1 mt-1">
                          <MapPin className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                          <span>{order.customerAddress}</span>
                        </p>
                      </div>

                      <div className="space-y-1.5 border-t md:border-t-0 md:border-x border-zinc-100 dark:border-zinc-900 md:px-6 pt-3 md:pt-0">
                        <p className="text-zinc-400 uppercase tracking-widest font-bold text-[10px]">Fulfillment Details</p>
                        <p className="font-bold">Gateway: <span className="uppercase text-purple-600">{order.paymentMethod}</span></p>
                        {order.transactionId ? (
                          <p className="font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-1.5 py-0.5 block w-max uppercase select-all font-bold">
                            trxID: {order.transactionId}
                          </p>
                        ) : (
                          <p className="text-zinc-400 italic">No trxID (COD Delivery option)</p>
                        )}
                        {order.discountCode && (
                          <p className="text-green-600 font-mono text-[10px] font-bold">Voucher: {order.discountCode} (- BDT {order.discountAmount})</p>
                        )}
                      </div>

                      <div className="space-y-1.5 pt-3 md:pt-0">
                        <p className="text-zinc-400 uppercase tracking-widest font-bold text-[10px]">Cart summary & billing</p>
                        <div className="space-y-0.5">
                          {order.items.map((item, i) => (
                            <p key={i} className="text-zinc-500 truncate">
                              • <strong>{item.name}</strong> x{item.quantity} ({item.price} BDT)
                            </p>
                          ))}
                        </div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white pt-1.5 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                          Invoice Total: <span className="text-purple-600 dark:text-purple-400 font-mono text-base font-black">BDT {order.totalAmount}</span>
                        </p>
                      </div>
                    </div>

                    {/* Action buttons controls: Fulfills Order management, payment tracking, state controls */}
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex flex-wrap gap-2 justify-end">
                      {order.paymentStatus === 'Pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, order.status, 'Confirmed')}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white font-display text-[10px] font-black uppercase tracking-wider rounded-lg px-3 py-1.5 shadow-sm transition-all"
                        >
                          <Check className="h-3 w-3" />
                          Confirm Payment (Paid)
                        </button>
                      )}

                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white font-display text-[10px] font-black uppercase tracking-wider rounded-lg px-3 py-1.5 shadow-sm transition-all"
                        >
                          <Check className="h-3 w-3" />
                          Confirm Order
                        </button>
                      )}

                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="flex items-center gap-1 bg-teal-600 hover:bg-teal-500 text-white font-display text-[10px] font-black uppercase tracking-wider rounded-lg px-3 py-1.5 shadow-sm transition-all"
                        >
                          <Check className="h-3 w-3" />
                          Mark Shipped/Delivered
                        </button>
                      )}

                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="flex items-center gap-1 border-2 border-rose-500 text-rose-500 hover:bg-rose-500/5 font-display text-[10px] font-black uppercase tracking-wider rounded-lg px-3 py-1 transition-all"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* 2. CATALOG PRODUCT CATALOG EDITOR */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left form - Add / Edit Product */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border-2 border-indigo-500/30 bg-zinc-50 dark:bg-zinc-900 p-5 space-y-4">
                <h3 className="font-display text-lg font-black uppercase tracking-tight text-purple-600 dark:text-purple-400">
                  {editingProductId ? '✏️ Edit Catalog Item' : '➕ Add Catalog Item'}
                </h3>

                <form onSubmit={handleProductSubmit} className="space-y-4 text-xs font-sans">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">Product ID *</label>
                      <input
                        type="text"
                        required
                        disabled={!!editingProductId}
                        value={productForm.id}
                        onChange={(e) => setProductForm({ ...productForm, id: e.target.value })}
                        placeholder="e.g. vib-101"
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-sm focus:outline-none focus:border-purple-500 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">Stock count *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                        placeholder="Availability count"
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-sm focus:outline-none focus:border-purple-500 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="e.g. Aura Premium Silk Panjabi"
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-sm focus:outline-none focus:border-purple-500 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">Category *</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-sm focus:outline-none focus:border-purple-500 dark:text-white"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">Price (BDT) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                        placeholder="Price in BDT"
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-sm focus:outline-none focus:border-purple-500 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">Hotlinks Image Gallery (separate with comma) *</label>
                    <input
                      type="text"
                      required
                      value={productForm.images}
                      onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                      placeholder="e.g. https://images.com/pic1.jpg, https://images.com/pic2.jpg"
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-sm focus:outline-none focus:border-purple-500 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="cod-toggle"
                        checked={productForm.isCODEnabled}
                        onChange={(e) => setProductForm({ ...productForm, isCODEnabled: e.target.checked })}
                        className="h-4 w-4 bg-white rounded border border-zinc-300 pointer-events-auto"
                      />
                      <label htmlFor="cod-toggle" className="text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-widest select-none cursor-pointer">Enable COD</label>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="featured-toggle"
                        checked={productForm.isFeatured}
                        onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                        className="h-4 w-4 bg-white rounded border border-zinc-300 pointer-events-auto"
                      />
                      <label htmlFor="featured-toggle" className="text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-widest select-none cursor-pointer">★ Hot/Featured</label>
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">COD Shipping restriction zones</label>
                    <select
                      value={productForm.codAllowedAreas}
                      onChange={(e) => setProductForm({ ...productForm, codAllowedAreas: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-sm focus:outline-none focus:border-purple-500 dark:text-white"
                    >
                      <option value="all">All Bangladesh (Standard)</option>
                      <option value="dhaka">Inside Dhaka City Only</option>
                      <option value="none">Pre-paid Only (No COD allowed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">Fulfillment Bio/Description</label>
                    <textarea
                      rows={4}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="Write fabric specifications, details, dimensions..."
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-sm focus:outline-none focus:border-purple-500 dark:text-white"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 h-11 bg-purple-600 text-white hover:bg-purple-500 font-display text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-purple-500/25"
                    >
                      {editingProductId ? 'Save Product' : 'Add Product'}
                    </button>
                    {editingProductId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProductId(null);
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
                        }}
                        className="h-11 border-2 border-zinc-300 hover:border-zinc-400 font-display text-xs font-black uppercase tracking-wider px-4 rounded-xl text-zinc-500 hover:text-zinc-700 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Right catalog table - list of catalog items */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-display text-base font-black uppercase tracking-wide">Catalog Stocks Grid ({products.length} Items)</h3>
              
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden">
                {products.map((p) => (
                  <div key={p.id} className="p-4 flex gap-4 text-xs items-center justify-between">
                    <div className="flex gap-4 items-center">
                      <img src={p.images[0]} alt={p.name} className="h-11 w-11 object-cover rounded-md" />
                      <div className="max-w-md min-w-0">
                        <p className="font-bold text-zinc-950 dark:text-white truncate">{p.name}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">
                          ID: <span className="uppercase text-purple-600">{p.id}</span> | STOCK: <strong className={p.stock <= 5 ? 'text-amber-500 font-bold' : 'text-green-500'}>{p.stock}</strong> | PRICE: {p.price} BDT
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${p.isCODEnabled ? 'bg-green-500/10 text-green-600' : 'bg-zinc-400/10 text-zinc-500'}`}>
                            COD: {p.isCODEnabled ? `OK (${p.codAllowedAreas})` : 'NO'}
                          </span>
                          {p.isFeatured && (
                            <span className="text-[8px] font-black uppercase bg-purple-500/10 text-purple-600 px-1.5 py-0.5 rounded">Featured</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleEditProductClick(p)}
                        className="p-1.5 rounded-lg border-2 border-zinc-200 dark:border-zinc-850 text-zinc-500 hover:text-purple-600 dark:text-zinc-400 dark:hover:text-purple-400 transition-colors"
                        title="Edit product"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => {
                          if (confirm(`Wipe item ${p.name}? This is irreversible.`)) {
                            deleteExistingProduct(p.id);
                          }
                        }}
                        className="p-1.5 rounded-lg border-2 border-zinc-200 dark:border-zinc-850 text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 transition-colors"
                        title="Delete product"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 3. CATEGORY MANAGER */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left box - Add Category Form */}
            <div className="md:col-span-5">
              <div className="rounded-2xl border-2 border-indigo-500/30 bg-zinc-50 dark:bg-zinc-900 p-5 space-y-4">
                <h3 className="font-display text-lg font-black uppercase tracking-tight text-purple-600 dark:text-purple-400">Add Collection / Category</h3>
                
                <form onSubmit={handleAddCategorySubmit} className="space-y-4 text-xs font-sans">
                  <div>
                    <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">Category Slug/ID *</label>
                    <input
                      type="text"
                      required
                      value={newCatId}
                      onChange={(e) => setNewCatId(e.target.value)}
                      placeholder="e.g. winter-hoodies"
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-sm focus:outline-none focus:border-purple-500 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">Display Label Name *</label>
                    <input
                      type="text"
                      required
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="e.g. Winter Hoodies Collection (BD)"
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-sm focus:outline-none focus:border-purple-500 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:opacity-90 font-display text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md"
                  >
                    Add Category
                  </button>
                </form>
              </div>
            </div>

            {/* Right List - Categories table */}
            <div className="md:col-span-7 space-y-4">
              <h3 className="font-display text-base font-black uppercase tracking-wide">Dynamic storefront tabs</h3>

              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden text-xs">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-4 flex items-center justify-between">
                    <div className="leading-tight">
                      <p className="font-bold text-zinc-950 dark:text-white uppercase tracking-wider font-display">{cat.name}</p>
                      <p className="font-mono text-[10px] text-zinc-400 mt-1">ID: {cat.id}</p>
                    </div>

                    {cat.id !== 'all' && (
                      <button
                        onClick={() => {
                          if (confirm(`Wipe category "${cat.name}"? Products won't be deleted, but won't cluster under this label.`)) {
                            deleteCategory(cat.id);
                          }
                        }}
                        className="p-1.5 hover:text-rose-600 text-zinc-400 rounded-lg transition-colors"
                        title="Delete category"
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

        {/* 4. COUPON MANAGER VOUCHER PROMOS */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left Box - Coupon addition form */}
            <div className="md:col-span-5">
              <div className="rounded-2xl border-2 border-indigo-500/30 bg-zinc-50 dark:bg-zinc-900 p-5 space-y-4">
                <h3 className="font-display text-lg font-black uppercase tracking-tight text-purple-600 dark:text-purple-400">Issue shop coupon</h3>

                <form onSubmit={handleAddCouponSubmit} className="space-y-4 text-xs font-sans">
                  <div>
                    <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">Coupon code name *</label>
                    <input
                      type="text"
                      required
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                      placeholder="e.g. VIBE25"
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-sm focus:outline-none focus:border-purple-500 dark:text-white uppercase font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">Reduction Type *</label>
                      <select
                        value={couponForm.discountType}
                        onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as 'percentage' | 'flat' })}
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-sm focus:outline-none focus:border-purple-500 dark:text-white"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Cash BDT</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">Discount amount *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={couponForm.discountValue}
                        onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                        placeholder="e.g. 15 for 15% reduction"
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-sm focus:outline-none focus:border-purple-500 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">Min invoice subtotal (BDT) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={couponForm.minOrderAmount}
                      onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: Number(e.target.value) })}
                      placeholder="e.g. 1000"
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-3 text-sm focus:outline-none focus:border-purple-500 dark:text-white font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="coupon-active-toggle"
                      checked={couponForm.isActive}
                      onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                      className="h-4 w-4 bg-white rounded border border-zinc-300 pointer-events-auto"
                    />
                    <label htmlFor="coupon-active-toggle" className="text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-widest select-none cursor-pointer">Activate Voucher Code</label>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 font-display text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md"
                  >
                    Issue Code
                  </button>
                </form>
              </div>
            </div>

            {/* Right List - Active Coupons table */}
            <div className="md:col-span-7 space-y-4">
              <h3 className="font-display text-base font-black uppercase tracking-wide">Active promotional vouchers</h3>

              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden text-xs">
                {coupons.map((c) => (
                  <div key={c.code} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-zinc-950 dark:text-white font-mono text-sm tracking-wider uppercase">{c.code}</p>
                      <p className="text-zinc-400 mt-1">
                        Reduction: <strong className="text-green-600">{c.discountValue}{c.discountType === 'percentage' ? '%' : ' BDT'}</strong> | Min Order: {c.minOrderAmount} BDT
                      </p>
                    </div>

                    <div className="flex gap-4 items-center">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                        c.isActive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-rose-500'
                      }`}>
                        {c.isActive ? 'Active' : 'Muted'}
                      </span>
                      
                      <button
                        onClick={() => {
                          if (confirm(`Wipe coupon code "${c.code}"?`)) {
                            deleteCoupon(c.code);
                          }
                        }}
                        className="p-1.5 hover:text-rose-600 text-zinc-400 rounded-lg transition-colors"
                        title="Delete coupon"
                      >
                        <Trash className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 5. SETTINGS MANAGER COCONUT CONFIGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <div className="rounded-2xl border-2 border-indigo-500/30 bg-zinc-50 dark:bg-zinc-900 p-6 space-y-6">
              <div>
                <h3 className="font-display text-lg font-black uppercase tracking-tight text-purple-600 dark:text-purple-400 flex items-center gap-2">
                  <Settings className="h-5.5 w-5.5 animate-spin-slow" />
                  Gateway & Support Line Settings
                </h3>
                <p className="text-zinc-400 text-xs mt-1">Configure bKash / Nagad / Rocket receiving phone numbers and automated WhatsApp details.</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-sans">
                
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 space-y-4">
                  <p className="font-display text-xs font-black uppercase tracking-widest text-zinc-400">1. Mobile Banking Numbers</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">bKash Personal *</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.paymentNumbers.bKash}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          paymentNumbers: { ...settingsForm.paymentNumbers, bKash: e.target.value }
                        })}
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 py-1.5 px-3 text-sm focus:outline-none dark:text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">Nagad Personal *</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.paymentNumbers.Nagad}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          paymentNumbers: { ...settingsForm.paymentNumbers, Nagad: e.target.value }
                        })}
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 py-1.5 px-3 text-sm focus:outline-none dark:text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">Rocket Personal *</label>
                      <input
                        type="text"
                        value={settingsForm.paymentNumbers.Rocket || ''}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          paymentNumbers: { ...settingsForm.paymentNumbers, Rocket: e.target.value }
                        })}
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 py-1.5 px-3 text-sm focus:outline-none dark:text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 space-y-4">
                  <p className="font-display text-xs font-black uppercase tracking-widest text-zinc-400">2. Business Support Integration</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">WhatsApp Admin Number *</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.whatsappNumber}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                        placeholder="e.g. 8801989475141"
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 py-1.5 px-3 text-sm focus:outline-none dark:text-white font-mono"
                      />
                      <p className="text-[9px] text-zinc-400 mt-1">Requires country code! (e.g. 88019xxxxxxxx)</p>
                    </div>

                    <div>
                      <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">Facebook Messenger Link</label>
                      <input
                        type="url"
                        value={settingsForm.messengerChatUrl || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, messengerChatUrl: e.target.value })}
                        placeholder="e.g. https://m.me/Vibebazar01"
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 py-1.5 px-3 text-sm focus:outline-none dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-500 font-bold uppercase tracking-widest block mb-1">Facebook Pixel ID</label>
                    <input
                      type="text"
                      value={settingsForm.facebookPixelId || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, facebookPixelId: e.target.value })}
                      placeholder="e.g. 1234567890"
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 py-1.5 px-3 text-sm focus:outline-none dark:text-white font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white font-display text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-purple-500/25 flex items-center justify-center gap-1.5"
                >
                  <Save className="h-4.5 w-4.5" />
                  <span>Save configurations</span>
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
