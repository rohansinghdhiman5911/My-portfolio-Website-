import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Compass, CheckCircle2, Paintbrush, ShieldAlert, Download, MessageSquare, Bell, BellRing, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useBranding } from '../context/BrandingContext';

interface TrackedOrder {
  id: string;
  name: string;
  channelName: string;
  packageType: string;
  status: 'new' | 'contacted' | 'completed';
  liveInfo?: string;
  createdAt: string;
}

export default function DeliveryTracker() {
  const { branding } = useBranding();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<TrackedOrder[] | null>(null);
  const [error, setError] = useState('');
  const [liveAlerts, setLiveAlerts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'ready' }[]>([]);

  const ordersRef = useRef<TrackedOrder[] | null>(null);
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  // Fetch and poll tracked orders automatically
  useEffect(() => {
    let active = true;

    const fetchTrackedOrders = async () => {
      try {
        // Read dismissed order IDs from localStorage
        const dismissedIdsRaw = localStorage.getItem('rohan_dismissed_order_ids');
        let dismissedIds: string[] = [];
        if (dismissedIdsRaw) {
          try {
            dismissedIds = JSON.parse(dismissedIdsRaw);
          } catch (e) {
            dismissedIds = [];
          }
        }

        // Fetch all inquiries from db
        const res = await fetch('/api/inquiries');
        if (res.ok && active) {
          const allInquiries: TrackedOrder[] = await res.json();
          
          // Filter to non-dismissed orders
          const matchedOrders = allInquiries.filter(inq => 
            !dismissedIds.map(id => id.toLowerCase()).includes(inq.id.toLowerCase())
          );

          const currentOrders = ordersRef.current;
          if (currentOrders) {
            matchedOrders.forEach((newOrder) => {
              const oldOrder = currentOrders.find((o) => o.id === newOrder.id);
              if (oldOrder) {
                // Check if status changed
                if (oldOrder.status !== newOrder.status) {
                  let statusLabel = 'Received';
                  let alertType: 'success' | 'info' | 'ready' = 'info';
                  if (newOrder.status === 'contacted') {
                    statusLabel = 'Custom Designing 🎨';
                    alertType = 'info';
                  } else if (newOrder.status === 'completed') {
                    statusLabel = 'Ready for Delivery! 🚀';
                    alertType = 'ready';
                  } else {
                    statusLabel = 'Order Received ✅';
                    alertType = 'success';
                  }

                  const alertMsg = `Your Order #${newOrder.id} status was updated to: ${statusLabel}!`;
                  setLiveAlerts((prev) => [
                    ...prev,
                    { id: `${newOrder.id}_${Date.now()}`, message: alertMsg, type: alertType }
                  ]);
                } 
                // Check if liveInfo text changed
                else if (oldOrder.liveInfo !== newOrder.liveInfo && newOrder.liveInfo) {
                  const alertMsg = `New update on Order #${newOrder.id}: "${newOrder.liveInfo}"`;
                  setLiveAlerts((prev) => [
                    ...prev,
                    { id: `${newOrder.id}_${Date.now()}`, message: alertMsg, type: 'success' }
                  ]);
                }
              }
            });
          }

          setOrders(matchedOrders);
          setError('');
        }
      } catch (err) {
        console.error("Error fetching tracked orders:", err);
        if (active) setError("Could not sync tracking status live.");
      }
    };

    // Load initial data with visual loading spinner
    setLoading(true);
    fetchTrackedOrders().finally(() => {
      if (active) setLoading(false);
    });

    // Handle real-time WebSocket sync events instead of heavy CPU polling!
    const handleInquiriesRealtime = () => {
      fetchTrackedOrders();
    };

    window.addEventListener('realtime:inquiries', handleInquiriesRealtime);

    return () => {
      active = false;
      window.removeEventListener('realtime:inquiries', handleInquiriesRealtime);
    };
  }, []);

  const handleDismissAlert = (id: string) => {
    setLiveAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const handleDismissTrackedOrder = (orderId: string) => {
    const dismissedIdsRaw = localStorage.getItem('rohan_dismissed_order_ids') || '[]';
    let dismissedIds: string[] = [];
    try {
      dismissedIds = JSON.parse(dismissedIdsRaw);
    } catch (e) {
      dismissedIds = [];
    }
    if (!dismissedIds.map(id => id.toLowerCase()).includes(orderId.toLowerCase())) {
      dismissedIds.push(orderId);
      localStorage.setItem('rohan_dismissed_order_ids', JSON.stringify(dismissedIds));
    }
    setOrders((prev) => prev ? prev.filter(o => o.id.toLowerCase() !== orderId.toLowerCase()) : null);
  };

  const getStatusStep = (status: 'new' | 'contacted' | 'completed') => {
    switch (status) {
      case 'new': return 1;
      case 'contacted': return 2;
      case 'completed': return 3;
      default: return 1;
    }
  };

  return (
    <section id="tracker" className="py-12 bg-zinc-950 border-t border-zinc-900 relative">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-5 sm:p-6 backdrop-blur-sm shadow-md">
          {/* Header row with badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-zinc-850/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                <h3 className="font-display text-base font-bold text-white tracking-tight">
                  Live Thumbnail Delivery Tracker
                </h3>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                See your booster pack steps updated live in real time!
              </p>
            </div>
            <span className="self-start sm:self-auto text-[10px] uppercase tracking-widest text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Cloud SQL Synchronized
            </span>
          </div>

          {/* Automatic Tracker Badge/Status Indicator instead of manual search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <div className="text-xs text-zinc-300 font-sans">
                <span className="font-bold text-indigo-400">Automatic Sync Active</span>: Tracking your project details directly from the live database.
              </div>
            </div>
            {loading && (
              <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono shrink-0">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing...</span>
              </div>
            )}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mt-4 p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Real-time Order Live Alerts from SQL Backend */}
          <AnimatePresence>
            {liveAlerts.length > 0 && (
              <div className="mt-4 space-y-2.5">
                {liveAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-lg ${
                      alert.type === 'ready'
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : alert.type === 'info'
                        ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping shrink-0" />
                      <BellRing className="h-4 w-4 text-indigo-400 animate-pulse shrink-0" />
                      <span className="text-xs sm:text-sm font-sans font-bold leading-relaxed">{alert.message}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDismissAlert(alert.id)}
                      className="p-1 rounded-lg hover:bg-zinc-950/50 hover:text-white text-zinc-400 transition-colors shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Tracking Results */}
          <AnimatePresence>
            {orders && orders.map((order) => {
              // Render smaller, decreased layout for completed order
              if (order.status === 'completed') {
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mt-6 p-4 sm:p-5 bg-emerald-950/20 border-2 border-emerald-500/40 rounded-xl space-y-4 shadow-lg shadow-emerald-950/10 relative"
                  >
                    {/* Manual Dismiss Button */}
                    <button
                      type="button"
                      onClick={() => handleDismissTrackedOrder(order.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-emerald-900/40 text-emerald-400/80 hover:text-white transition-all border border-emerald-500/10 hover:border-emerald-500/30"
                      title="Dismiss tracker panel"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/10 pb-3 pr-8 sm:pr-0">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-mono text-[10px] text-zinc-400 font-semibold uppercase">Order Completed:</span>
                        <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                          {order.id}
                        </span>
                        <span className="text-zinc-600">|</span>
                        <span className="text-zinc-300 font-sans font-semibold">{order.name} ({order.channelName || 'N/A'})</span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-emerald-400 font-sans flex items-center gap-2">
                          <span>🎉</span> Client, your project is completed! Now pickup your project!
                        </h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Your premium CTR booster pack thumbnails are fully processed. Pick up your final design files now.
                        </p>
                      </div>
                      <a
                        href={`https://wa.me/${branding.whatsappNumber || '919041489449'}?text=${encodeURIComponent(`Hello ${branding.companyName || 'Rohan'}! My Order ID is ${order.id} and it is completed. I would like to get my high-res thumbnail files.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold px-4.5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shrink-0 text-xs font-sans hover:scale-[1.02]"
                      >
                        <MessageSquare className="w-4 h-4 fill-current" />
                        Pickup Thumbnail Now
                      </a>
                    </div>
                  </motion.div>
                );
              }

              const currentStep = getStatusStep(order.status);
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 p-4 sm:p-5 bg-zinc-950/80 border border-zinc-850 rounded-xl space-y-5 shadow-inner"
                >
                  {/* Order meta info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b border-zinc-850 pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] text-zinc-500 font-semibold uppercase">Order ID:</span>
                        <span className="font-mono font-bold text-indigo-400 bg-indigo-950/30 px-2 py-0.5 rounded border border-indigo-500/10">
                          {order.id}
                        </span>
                        <span className="text-zinc-600">|</span>
                        <span className="text-zinc-400 font-sans font-medium">{order.name} ({order.channelName || 'N/A'})</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono">Booked on: {order.createdAt}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-zinc-400 font-semibold uppercase block sm:inline mr-1">Package:</span>
                      <span className="font-semibold text-zinc-200 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        {order.packageType}
                      </span>
                    </div>
                  </div>

                  {/* High-fidelity Stepper Tracker */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative pt-2">
                    {/* Stepper Step 1 */}
                    <div className="flex items-start gap-3 bg-zinc-900/30 p-3 rounded-lg border border-zinc-850/60">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold ${
                        currentStep >= 1
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                      }`}>
                        {currentStep >= 1 ? <CheckCircle2 className="w-4 h-4" /> : "1"}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Order Received</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Specifications and requirements analyzed successfully.</p>
                      </div>
                    </div>

                    {/* Stepper Step 2 */}
                    <div className="flex items-start gap-3 bg-zinc-900/30 p-3 rounded-lg border border-zinc-850/60">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold ${
                        currentStep >= 2
                          ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                      }`}>
                        {currentStep === 2 ? (
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                        ) : currentStep > 2 ? (
                          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <Paintbrush className="w-4 h-4 text-zinc-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Custom Designing</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          {currentStep === 1 ? 'Awaiting designer queue.' : currentStep === 2 ? 'Active composition layout design...' : 'Completed rendering designs.'}
                        </p>
                      </div>
                    </div>

                    {/* Stepper Step 3 */}
                    <div className="flex items-start gap-3 bg-zinc-900/30 p-3 rounded-lg border border-zinc-850/60">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold ${
                        currentStep >= 3
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 animate-pulse'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                      }`}>
                        {currentStep >= 3 ? <Download className="w-4 h-4" /> : "3"}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Ready for Delivery</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          {currentStep < 3 ? 'Awaiting final rendering.' : 'Delivered! Check your Email or WhatsApp.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Live Tracking update text from SQL Database */}
                  <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 font-mono text-[9px] text-zinc-500 uppercase tracking-wider font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                      <span>Designer Live Update:</span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans italic">
                      "{order.liveInfo || 'Your designer is reviewing your brief.'}"
                    </p>
                  </div>

                  {/* Delivery Call-To-Action if Completed */}
                  {currentStep === 3 && (
                    <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-emerald-300 font-medium">Your design booster is fully rendered & processed!</span>
                      </div>
                      <a
                        href={`https://wa.me/${branding.whatsappNumber || '919041489449'}?text=${encodeURIComponent(`Hello ${branding.companyName || 'Rohan'}! My Order ID is ${order.id} and it shows completed. I would like to get my high-res thumbnail files.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto font-sans"
                      >
                        <MessageSquare className="w-3.5 h-3.5 fill-current" />
                        Collect on WhatsApp
                      </a>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
