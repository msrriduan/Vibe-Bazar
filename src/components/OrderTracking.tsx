import React, { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, X, Sparkles, MapPin, Package, Clock, CheckCircle, AlertTriangle, Truck, Receipt 
} from 'lucide-react';

interface OrderTrackingProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

export default function OrderTracking({ isOpen, onClose, initialOrderId = '' }: OrderTrackingProps) {
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [queriedOrder, setQueriedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleTrackQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderIdInput.trim()) return;

    setIsLoading(true);
    setErrorMessage('');
    setQueriedOrder(null);

    const checkId = orderIdInput.toUpperCase().trim();

    try {
      const docRef = doc(db, 'orders', checkId);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        setQueriedOrder(snapshot.data() as Order);
      } else {
        setErrorMessage(`We couldn't find an order with ID "${checkId}". Double-check your invoice code.`);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(`Network error fetching checkout details. Try again shortly.`);
    } finally {
      setIsLoading(false);
    }
  };

  const statusWorkflowSteps = [
    { key: 'pending', label: 'Processing', desc: 'Awaiting cash confirmation', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', desc: 'Packaging and hand-off', icon: CheckCircle },
    { key: 'delivered', label: 'Shipped', desc: 'Dispatched with courier', icon: Truck },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md overflow-y-auto px-4 py-8 font-sans">
      <div className="relative w-full max-w-2xl rounded-2xl border-2 border-indigo-500 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-purple-600" />
            <h2 className="font-display text-xl font-black uppercase tracking-tight">Track Your Shipment</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Query input field */}
          <form onSubmit={handleTrackQuery} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="e.g. VIBE-84310-955"
                className="w-full text-sm font-mono uppercase bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-purple-500 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-display text-xs font-black uppercase tracking-wider px-5 rounded-xl hover:opacity-90 transition-all disabled:opacity-40"
            >
              {isLoading ? 'Querying...' : 'Track'}
            </button>
          </form>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-3 text-sm text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Stepper tracking result */}
          <AnimatePresence mode="wait">
            {queriedOrder && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                
                {/* Visual Stepper */}
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 bg-zinc-50/50 dark:bg-zinc-900/30">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Estimated status</span>
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase tracking-widest ${
                      queriedOrder.status === 'cancelled'
                        ? 'bg-rose-500/15 text-rose-500'
                        : queriedOrder.status === 'delivered'
                        ? 'bg-green-500/15 text-green-500'
                        : 'bg-indigo-500/15 text-indigo-500'
                    }`}>
                      {queriedOrder.status}
                    </span>
                  </div>

                  {queriedOrder.status === 'cancelled' ? (
                    <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 flex gap-3 text-rose-600 dark:text-rose-400 text-xs">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      <div>
                        <p className="font-bold">This Order Has Been Cancelled.</p>
                        <p className="mt-0.5">Please contact customer support via WhatsApp to check the reason.</p>
                      </div>
                    </div>
                  ) : (
                    /* Linear vertical progress layout */
                    <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
                      {statusWorkflowSteps.map((step, idx) => {
                        const isCurrent = queriedOrder.status === step.key;
                        const isCompleted = 
                          (queriedOrder.status === 'delivered') ||
                          (queriedOrder.status === 'confirmed' && idx < 2) ||
                          (queriedOrder.status === 'pending' && idx === 0);

                        const IconCmp = step.icon;

                        return (
                          <div key={idx} className="flex gap-4 items-start relative z-10 leading-relaxed text-xs">
                            <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              isCompleted 
                                ? 'bg-purple-600 border-purple-600 text-white' 
                                : isCurrent 
                                ? 'bg-white border-purple-500 text-purple-600 dark:bg-zinc-950' 
                                : 'bg-white border-zinc-200 text-zinc-400 dark:bg-zinc-950 dark:border-zinc-800'
                            }`}>
                              <IconCmp className="h-4 w-4" />
                            </div>
                            <div className="pt-0.5">
                              <h4 className={`font-display font-medium ${isCompleted || isCurrent ? 'text-zinc-950 dark:text-white font-black' : 'text-zinc-400'}`}>
                                {step.label}
                              </h4>
                              <p className={`text-[10px] ${isCompleted || isCurrent ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Details list info */}
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
                  <h3 className="font-display text-sm font-black uppercase tracking-wider flex items-center gap-1">
                    <Receipt className="h-4.5 w-4.5 text-purple-600" />
                    Invoice Receipt Details
                  </h3>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-sans">
                    <div>
                      <span className="text-zinc-400 block">Customer Name</span>
                      <strong className="text-zinc-900 dark:text-white">{queriedOrder.customerName}</strong>
                    </div>

                    <div>
                      <span className="text-zinc-400 block">Contact Phone</span>
                      <strong className="text-zinc-900 dark:text-white font-mono">{queriedOrder.customerPhone}</strong>
                    </div>

                    <div className="col-span-2">
                      <span className="text-zinc-400 block">Delivery Address</span>
                      <strong className="text-zinc-900 dark:text-white flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                        <span>{queriedOrder.customerAddress}</span>
                      </strong>
                    </div>

                    <div>
                      <span className="text-zinc-400 block">Payment Processor</span>
                      <strong className="text-zinc-900 dark:text-white uppercase">{queriedOrder.paymentMethod}</strong>
                    </div>

                    <div>
                      <span className="text-zinc-400 block">Clearance Status</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest leading-none block w-max mt-0.5 ${
                        queriedOrder.paymentStatus === 'Confirmed'
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {queriedOrder.paymentStatus}
                      </span>
                    </div>

                    {queriedOrder.transactionId && (
                      <div className="col-span-2">
                        <span className="text-zinc-400 block">Transaction Reference (trxID)</span>
                        <strong className="text-zinc-900 dark:text-white font-mono uppercase">{queriedOrder.transactionId}</strong>
                      </div>
                    )}
                  </div>

                  {/* Items Invoice list */}
                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs text-zinc-400 uppercase tracking-widest block mb-2 font-bold">Ordered Parcel Items</span>
                    <div className="space-y-1.5">
                      {queriedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs font-mono">
                          <span className="text-zinc-600 dark:text-zinc-400">{item.name} <span className="text-zinc-400">x{item.quantity}</span></span>
                          <span className="text-zinc-950 dark:text-white">BDT {item.price * item.quantity}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-display text-sm font-black text-zinc-900 dark:text-white pt-2.5 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                        <span>Grand Total Paid:</span>
                        <span className="text-purple-600 dark:text-purple-400">BDT {queriedOrder.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
