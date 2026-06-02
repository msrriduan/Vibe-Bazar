import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { Product, CartItem, Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, CheckCircle, Smartphone, MapPin, ClipboardList, Wallet, Truck, MessageSquare, ArrowRight, Sparkles 
} from 'lucide-react';

const BANGLADESH_DISTRICTS = [
  "Bagerhat", "Bandarban", "Barguna", "Barishal", "Bhola", "Bogura", "Brahmanbaria",
  "Chandpur", "Chattogram", "Chuadanga", "Cox's Bazar", "Cumilla",
  "Dhaka", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj",
  "Habiganj", "Jamalpur", "Jashore", "Jhalokati", "Jhenaidah", "Joypurhat",
  "Khagrachhari", "Khulna", "Kishoreganj", "Kurigram", "Kushtia",
  "Lakshmipur", "Lalmonirhat", "Madaripur", "Magura", "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj", "Mymensingh",
  "Naogaon", "Narail", "Narayanganj", "Narsingdi", "Natore", "Netrokona", "Nilphamari", "Noakhali",
  "Pabna", "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur",
  "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet",
  "Tangail", "Thakurgaon"
];

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  immediateProduct?: Product | null; // For instant "Buy Now" checkout bypassing standard cart
}

export default function CheckoutModal({ isOpen, onClose, immediateProduct }: CheckoutModalProps) {
  const { 
    cart, 
    settings, 
    appliedCoupon, 
    placeNewOrder, 
    isPlacingOrder 
  } = useShop();

  // Order state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Dhaka'); // Default to capital 'Dhaka'
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'COD'>('bKash');
  const [transactionId, setTransactionId] = useState('');
  
  // Completed order receipt state
  const [placedReceipt, setPlacedReceipt] = useState<Order | null>(null);

  // Determine active check-out items
  const activeItems: CartItem[] = immediateProduct 
    ? [{ product: immediateProduct, quantity: 1 }]
    : cart;

  // Cart pricing calculation
  const subtotal = activeItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = Math.round(subtotal * (appliedCoupon.discountValue / 100));
    } else {
      discount = appliedCoupon.discountValue;
    }
  }
  const totalAmount = Math.max(0, subtotal - discount);
  const deliveryFee = district === 'Dhaka' ? 70 : 150;

  // Evaluate dynamic COD eligibility checks across activeItems
  // Fulfills: "Admin should be able to: turn ON/OFF COD per product, Restrict COD for selected areas or products"
  const codChecks = activeItems.map(item => {
    const isEnabled = item.product.isCODEnabled;
    const itemAllowedAreas = item.product.codAllowedAreas || 'all';
    
    let isAllowedInCurrentArea = true;
    if (itemAllowedAreas === 'dhaka' && district !== 'Dhaka') {
      isAllowedInCurrentArea = false;
    } else if (itemAllowedAreas === 'none') {
      isAllowedInCurrentArea = false;
    }

    return {
      productName: item.product.name,
      isEnabled,
      allowedAreas: itemAllowedAreas,
      isAllowedInCurrentArea
    };
  });

  const isCODDisabledOverall = codChecks.some(check => !check.isEnabled || !check.isAllowedInCurrentArea);
  
  // Auto-switch away from COD if COD becomes disabled dynamically
  useEffect(() => {
    if (isCODDisabledOverall && paymentMethod === 'COD') {
      setPaymentMethod('bKash');
    }
  }, [isCODDisabledOverall, paymentMethod]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert('Please fill out all billing information.');
      return;
    }
    
    if (phone.length < 11) {
      alert('Please specify a valid Bangladeshi phone number (e.g., 017xxxxxxxx).');
      return;
    }

    if (paymentMethod !== 'COD' && !transactionId.trim()) {
      alert(`Please fill in the manual Transaction ID for your ${paymentMethod} payment.`);
      return;
    }

    try {
      const order = await placeNewOrder({
        name,
        phone,
        address: `${address}, District: ${district} (${district === 'Dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})`,
        paymentMethod,
        transactionId: paymentMethod !== 'COD' ? transactionId : undefined,
        deliveryFee,
        overrideItems: activeItems
      });
      
      setPlacedReceipt(order);
    } catch (err) {
      console.error(err);
      alert('Order placing failed. Let admin know your transaction ID.');
    }
  };

  // Compose dynamic message for WhatsApp redirect
  const triggerWhatsAppRedirect = () => {
    if (!placedReceipt) return;

    const itemsSummary = placedReceipt.items.map(item => `• ${item.name} x${item.quantity}`).join('\n');
    const invoiceString = `Hello Vibebazar team! I have placed an order. Details below:\n\n` +
      `📦 *ORDER ID:* ${placedReceipt.id}\n` +
      `👤 *Customer Name:* ${placedReceipt.customerName}\n` +
      `📞 *Phone:* ${placedReceipt.customerPhone}\n` +
      `📍 *Address:* ${placedReceipt.customerAddress}\n\n` +
      `🛒 *Purchased Items:*\n${itemsSummary}\n\n` +
      `💵 *Total Amount:* ${placedReceipt.totalAmount} BDT\n` +
      `💳 *Payment Method:* ${placedReceipt.paymentMethod}\n` +
      `${placedReceipt.transactionId ? `🔑 *TrxID:* ${placedReceipt.transactionId}\n` : ''}` +
      `Please confirm my order. Thank you!`;

    const encoded = encodeURIComponent(invoiceString);
    const waNumber = settings.whatsappNumber || '8801989475141';
    window.open(`https://wa.me/${waNumber}?text=${encoded}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md overflow-y-auto px-4 py-8 font-sans">
      <div className="relative w-full max-w-4xl rounded-3xl border border-slate-100 dark:border-zinc-850 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-900 px-6 py-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-brand-pink animate-pulse" />
            <h2 className="font-display text-xl font-black uppercase tracking-tight">Secure checkout</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-650 dark:text-zinc-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Dynamic content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {!placedReceipt ? (
              <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Billing fields */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2 text-brand-pink">
                      <MapPin className="h-4.5 w-4.5 text-brand-pink" />
                      1. Delivery & Billing Address
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block mb-1">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Mohammad bin Alom (e.g.)"
                          className="w-full text-sm rounded-xl border border-slate-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 py-2.5 px-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:text-white transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block mb-1">Contact Phone *</label>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="017xxxxxxxx"
                            className="w-full text-sm rounded-xl border border-slate-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 py-2.5 px-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:text-white transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block mb-1">Select District *</label>
                          <select
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            className="w-full text-sm rounded-xl border border-slate-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 py-2.5 px-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:text-white transition-all cursor-pointer font-medium"
                          >
                            {BANGLADESH_DISTRICTS.map((dist) => (
                              <option key={dist} value={dist}>
                                {dist}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Daraz-Style Delivery Charge Banner */}
                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-brand-pink" />
                          <span className="text-xs font-semibold">Delivery Charge (Standard Courier)</span>
                        </div>
                        <span className="font-mono text-sm font-black text-brand-pink">
                          BDT {deliveryFee} <span className="text-[10px] font-normal text-zinc-400">({district === 'Dhaka' ? 'Dhaka District' : 'Outside Dhaka'})</span>
                        </span>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block mb-1">Structural Full Address *</label>
                        <textarea
                          required
                          rows={3}
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="House No, Road Name, Area/Local police station, City, District."
                          className="w-full text-sm rounded-xl border border-slate-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 py-2.5 px-4 focus:border-brand-pink focus:ring-1 focus:ring-brand-pink focus:outline-none dark:text-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Selection */}
                  <div>
                    <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                      <Wallet className="h-4.5 w-4.5 text-brand-pink" />
                      2. Choose Payment Gateway
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bKash')}
                        className={`p-3.5 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1.5 focus:outline-none ${
                          paymentMethod === 'bKash'
                            ? 'bg-pink-500/10 border-pink-500 text-pink-650 dark:border-pink-500 dark:text-pink-400'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-450'
                        }`}
                      >
                        <div className="h-7 w-7 rounded-lg bg-pink-100 flex items-center justify-center font-display text-[9px] font-black text-pink-600 tracking-tight">bK</div>
                        <span className="font-display text-xs font-black">bKash</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Nagad')}
                        className={`p-3.5 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1.5 focus:outline-none ${
                          paymentMethod === 'Nagad'
                            ? 'bg-amber-500/10 border-amber-500 text-amber-655 dark:border-amber-500 dark:text-amber-400'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-450'
                        }`}
                      >
                        <div className="h-7 w-7 rounded-lg bg-amber-100 flex items-center justify-center font-display text-[9px] font-black text-amber-600 tracking-tight">Na</div>
                        <span className="font-display text-xs font-black">Nagad</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Rocket')}
                        className={`p-3.5 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1.5 focus:outline-none ${
                          paymentMethod === 'Rocket'
                            ? 'bg-[#8C3494]/10 border-[#8C3494] text-[#8C3494] dark:border-[#8C3494] dark:text-purple-400'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-450'
                        }`}
                      >
                        <div className="h-7 w-7 rounded-lg bg-indigo-100 flex items-center justify-center font-display text-[9px] font-black text-indigo-600 tracking-tight">Ro</div>
                        <span className="font-display text-xs font-black">Rocket</span>
                      </button>

                      {/* Cash on Delivery option with dynamic state validation alert rules */}
                      <button
                        type="button"
                        disabled={isCODDisabledOverall}
                        onClick={() => setPaymentMethod('COD')}
                        className={`p-3.5 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1.5 focus:outline-none relative ${
                          paymentMethod === 'COD'
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:border-emerald-500 dark:text-emerald-400'
                            : 'border-zinc-200 dark:border-zinc-805 hover:border-zinc-450 disabled:opacity-40 disabled:cursor-not-allowed'
                        }`}
                      >
                        <div className="relative">
                          <Truck className="h-7 w-7 text-zinc-500 dark:text-zinc-400" />
                          <span className="absolute -top-1 -right-2 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-display text-xs font-black">COD</span>
                          <span className="px-1 py-0.2 bg-emerald-500 text-[7px] text-white font-extrabold rounded">FREE</span>
                        </div>
                        {isCODDisabledOverall && (
                          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-700 text-white rounded px-1.5 py-0.5 text-[7px] font-bold">Blocked</span>
                        )}
                      </button>
                    </div>

                    {/* Restricted COD notifications */}
                    {isCODDisabledOverall && (
                      <div className="mt-2.5 p-3 rounded-lg bg-amber-500/10 border-l-4 border-amber-500 text-xs text-amber-700 dark:text-amber-400">
                        <p className="font-bold">Cash on Delivery (COD) of certain items is unavailable:</p>
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                          {codChecks.map((check, i) => (
                            (!check.isEnabled || !check.isAllowedInCurrentArea) && (
                              <li key={i}>
                                <strong>{check.productName}</strong>:{' '}
                                {!check.isEnabled 
                                  ? 'Store COD is turned OFF for this specific item.' 
                                  : `Only allowed inside: ${check.allowedAreas === 'dhaka' ? 'Dhaka City' : check.allowedAreas}.`}
                              </li>
                            )
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Payment Instruction box */}
                    {paymentMethod !== 'COD' && (
                      <div className="mt-5 p-4 rounded-xl border-2 border-dashed border-brand-pink/30 bg-brand-pink/5 space-y-4">
                        <div className="flex gap-3 leading-relaxed">
                          <Smartphone className="h-6 w-6 text-brand-pink flex-shrink-0" />
                          <div>
                            <p className="font-display text-sm font-bold">Vibebazar Payment Instructions:</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                              Send your total bill amount BDT <strong className="text-brand-pink">{totalAmount + deliveryFee}</strong> to the following merchant number using "Send Money" or cash out option:
                            </p>
                            <p className="font-mono text-base font-black bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-1 px-3 mt-2 inline-block">
                              📱 {paymentMethod} Personal: {settings.paymentNumbers[paymentMethod] || '01989475141'}
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider block mb-1">Your Transaction ID (trxID) *</label>
                          <input
                            type="text"
                            required
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="e.g. 8K84X9JWL1"
                            className="w-full text-xs font-mono rounded-lg border border-brand-pink/20 bg-white dark:bg-zinc-900 py-1.5 px-3 uppercase text-zinc-900 dark:text-white"
                          />
                          <p className="text-[10px] text-zinc-400 mt-1">Enter the transaction ID you received from {paymentMethod} SMS confirmation.</p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'COD' && (
                      <div className="mt-5 p-4 rounded-xl border-2 border-dashed border-green-500/30 bg-green-500/5">
                        <div className="flex gap-3 items-start">
                          <Truck className="h-6 w-6 text-green-600 flex-shrink-0" />
                          <div>
                            <p className="font-display text-sm font-bold text-green-700 dark:text-green-400">Cash on Delivery Verified</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                              Fulfill the total billing of BDT <strong>{totalAmount + deliveryFee}</strong> details to the dispatcher upon home parcel handout.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Items & Invoice section */}
                <div className="lg:col-span-5 h-full flex flex-col bg-zinc-50 dark:bg-zinc-900/40 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800">
                  <h3 className="font-display text-sm font-black uppercase tracking-wider mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">Order summary</h3>
                  
                  {/* Cart review */}
                  <div className="flex-1 max-h-48 overflow-y-auto space-y-3 pr-1">
                    {activeItems.map((item) => (
                      <div key={item.product.id} className="flex gap-3 text-xs leading-tight">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-10 w-10 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-medium text-zinc-950 dark:text-white truncate">{item.product.name}</p>
                          <p className="text-zinc-400 font-mono mt-0.5">{item.quantity} x BDT {item.product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon summary */}
                  {appliedCoupon && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2.5 my-3 flex justify-between text-xs text-green-700 dark:text-green-400 font-mono">
                      <span>Promo applied: {appliedCoupon.code}</span>
                      <span>- BDT {discount}</span>
                    </div>
                  )}

                  {/* Checkout calculations */}
                  <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-3 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono text-zinc-900 dark:text-white">BDT {subtotal}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span className="font-mono text-zinc-900 dark:text-white">BDT {deliveryFee}</span>
                    </div>
                    
                    <div className="flex justify-between text-base font-black text-zinc-900 dark:text-white pt-2.5 border-t border-zinc-200 dark:border-zinc-800">
                      <span className="font-display">Grand Total</span>
                      <span className="font-mono text-brand-pink">BDT {totalAmount + deliveryFee}</span>
                    </div>
                  </div>

                  {/* Submission triggers */}
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={isPlacingOrder}
                      className="w-full h-12 bg-gradient-to-r from-brand-orange to-brand-pink text-white hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-brand-pink/15 flex items-center justify-center gap-1.5 disabled:opacity-40"
                    >
                      <span>{isPlacingOrder ? 'Processing...' : 'Place Order'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <p className="text-[10px] text-zinc-400 text-center mt-2">By placing order you confirm payment validation checks.</p>
                  </div>

                </div>

              </form>
            ) : (
              // Success checkout screen with automated WhatsApp link triggers matching prompt
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-5"
              >
                <div className="h-16 w-16 bg-green-500 text-white rounded-full flex items-center justify-center glow-green animate-bounce">
                  <CheckCircle className="h-10 w-10" />
                </div>
                
                <div>
                  <h3 className="font-display text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Order Received!</h3>
                  <p className="font-mono text-sm text-brand-pink mt-1 font-bold">ORDER ID: {placedReceipt.id}</p>
                  <p className="text-zinc-400 text-sm mt-3 max-w-md mx-auto">
                    Acknowledge invoice BDT <strong>{placedReceipt.totalAmount}</strong>. To expedite shipping confirmation, please tap the WhatsApp indicator below to notify the Vibebazar staff right away!
                  </p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full space-y-3">
                  <div className="text-left text-xs font-sans space-y-1">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Customer Name:</span>
                      <strong className="text-zinc-900 dark:text-white">{placedReceipt.customerName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Contact Number:</span>
                      <strong className="text-zinc-900 dark:text-white">{placedReceipt.customerPhone}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Target Address:</span>
                      <strong className="text-zinc-900 dark:text-white truncate max-w-[200px]">{placedReceipt.customerAddress}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Fulfillment Method:</span>
                      <strong className="text-zinc-900 dark:text-white uppercase">{placedReceipt.paymentMethod}</strong>
                    </div>
                  </div>
                </div>

                {/* Primary Automated WhatsApp click CTA as requested by specifications */}
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md pt-2">
                  <button
                    onClick={triggerWhatsAppRedirect}
                    className="flex-1 h-12 bg-[#25D366] hover:bg-[#128C7E] text-white font-display text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#25D366]/20 flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="h-5 w-5 fill-current" />
                    <span>Confirm on WhatsApp</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setPlacedReceipt(null);
                      setName('');
                      setPhone('');
                      setAddress('');
                      setTransactionId('');
                      onClose();
                    }}
                    className="h-12 border-2 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 font-display text-xs font-black uppercase tracking-wider rounded-xl px-5 transition-all text-zinc-700 dark:text-zinc-300"
                  >
                    Explore Catalog
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
