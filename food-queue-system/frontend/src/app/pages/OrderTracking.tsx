import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Clock, ChefHat, Package, CheckCircle,
  Loader2, Wifi, WifiOff, Trash2, AlertTriangle, Sparkles,
  XCircle
} from 'lucide-react';
import { useApp, Order } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../../api/client';
import { useQueueStream } from '../../hooks/useQueueStream';
import { toast } from 'sonner';

export const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, stalls, fetchMyOrders, updateOrderStatus } = useApp();

  const [fetchedOrder, setFetchedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [progress, setProgress] = useState(0);

  // ✅ Cancel-order state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const contextOrder = orders.find((o) => o.id === id);
  const order = contextOrder || fetchedOrder;

  // SSE: Connect to live queue stream for this order's stall.
  const { data: queueData, connectionMode } = useQueueStream(order?.stallId);

  // Derive live position from SSE queue data.
  const livePosition = queueData
    ? queueData.orders.findIndex(o => o.token === order?.token) + 1
    : 0;
  const queuePosition = livePosition > 0 ? livePosition : 1;

  // dynamic AI-based queue position & wait time estimation logic
  const getAiPredictedWait = () => {
    if (!order) return 15;
    
    // 1. Calculate preparation footprint of the order itself
    const totalOrderItemsQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const basePrepTime = totalOrderItemsQty * 3; // base 3 minutes per item
    
    if (!queueData || !queueData.orders) {
      return basePrepTime + 5; // default buffer
    }

    // 2. Locate order in live queue
    const liveIndex = livePosition - 1;
    
    if (liveIndex === -1 || livePosition === 0) {
      // If completed or cancelled
      if (order.status === 'completed') return 0;
      if (order.status === 'cancelled') return 0;
      // If preparing or ready
      return order.status === 'ready' ? 0 : 5;
    }

    if (liveIndex === 0) {
      // Order is actively being prepared (first in queue)
      return order.status === 'preparing' ? 3 : 5;
    }

    // 3. Sum prep times of all preceding orders in the queue
    let precedingPrepTime = 0;
    for (let i = 0; i < liveIndex; i++) {
      // Average 6 minutes per preceding active order
      precedingPrepTime += 6;
    }

    // 4. Vendor load multiplier
    const totalQueueLength = queueData.queue_length || queueData.orders.length;
    const loadFactor = totalQueueLength > 5 ? 1.2 : 1.0;

    const predicted = Math.ceil((precedingPrepTime + basePrepTime) * loadFactor);
    return Math.max(5, predicted);
  };

  const estimatedWait = getAiPredictedWait();



  // Fetch order on mount
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setNotFound(false);

      try { await fetchMyOrders(); } catch { /* non-fatal */ }

      try {
        const res = await api.getOrder(parseInt(id));
        const stallName = stalls.find((s) => s.id === String(res.stall_id))?.stallName || 'Stall';
        const mapped: Order = {
          id: String(res.id),
          stallId: String(res.stall_id),
          stallName,
          items: (res.items || []).map((i: any) => ({
            id: String(i.id),
            name: i.menu_item_name || 'Item',
            price: i.price || 0,
            quantity: i.quantity,
          })),
          total: res.total_price,
          token: res.token,
          status: res.status,
          paymentMode: res.payment_mode || 'counter',
          paymentStatus: res.payment_status || 'pending',
          estimatedTime: 15,
          timestamp: new Date(res.created_at),
        };
        setFetchedOrder(mapped);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // SSE: sync order status into context when it changes server-side
  useEffect(() => {
    if (!queueData || !order) return;
    const liveOrder = queueData.orders.find(o => o.token === order.token);
    if (liveOrder && liveOrder.status !== order.status) {
      updateOrderStatus(order.id, liveOrder.status as any);
      setFetchedOrder(prev =>
        prev ? { ...prev, status: liveOrder.status as any } : prev
      );
    }
  }, [queueData]);

  // Progress bar driven by order status
  useEffect(() => {
    if (!order) return;
    const progressMap: Record<string, number> = {
      placed: 25,
      preparing: 50,
      ready: 75,
      cancelled: 0,
      completed: 100,
    };
    setProgress(progressMap[order.status] ?? 25);
  }, [order?.status]);

  // ✅ Cancel order handler
  const handleCancelOrder = async () => {
    if (!order || !id) return;
    setCancelling(true);
    try {
      await api.deleteOrder(parseInt(id));
      await fetchMyOrders();
      toast.success('Order cancelled successfully.');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.message || 'Could not cancel the order. Please try again.');
    } finally {
      setCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Loading your order…</p>
        </div>
      </div>
    );
  }

  if (notFound && !order) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <p className="text-gray-900 dark:text-white text-xl mb-4">Order not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const steps = [
    { status: 'placed',    icon: Clock,       label: 'Order Placed', time: '0 min' },
    { status: 'preparing', icon: ChefHat,      label: 'Preparing',   time: '5 min' },
    { status: 'ready',     icon: Package,      label: 'Ready',       time: '15 min' },
    { status: 'cancelled', icon: XCircle,    label: 'Cancelled',   time: '' },
    { status: 'completed', icon: CheckCircle,  label: 'Completed',   time: '' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.status === order.status);

  // ✅ Cancel is only offered while the order is still "placed"
  const canCancel = order.status === 'placed';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 pb-12 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </motion.button>

        {/* Order Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-3xl font-bold"
          >
            {order.token}
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Track Your Order</h1>
          <p className="text-gray-600 dark:text-gray-400">{order.stallName}</p>

          {/* SSE connection indicator */}
          <div className="flex items-center justify-center gap-2 mt-2">
            {connectionMode === 'sse' && (
              <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                Live updates active
              </span>
            )}
            {connectionMode === 'polling' && (
              <span className="flex items-center gap-1.5 text-xs text-yellow-600 dark:text-yellow-400">
                <Wifi className="w-3 h-3" />
                Updating every 5s
              </span>
            )}
            {connectionMode === 'idle' && order.status !== 'completed' && (
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <WifiOff className="w-3 h-3" />
                Connecting…
              </span>
            )}
          </div>
        </motion.div>

        {/* Status Badge */}
        <div className="flex justify-center mb-4">
          <StatusBadge status ={order.status} />
        </div>

        {/* Payment Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 max-w-md mx-auto p-4 rounded-xl border flex items-center justify-between text-sm shadow-sm ${
            order.paymentMode === 'upi'
              ? 'bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
              : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
          }`}
        >
          <span className="font-semibold">
            {order.paymentMode === 'upi'
              ? 'Paid Online (UPI QR Scanner)'
              : 'Pay at Counter (Cash/Card)'}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            order.paymentStatus === 'paid'
              ? 'bg-green-200/60 dark:bg-green-800/40 text-green-700 dark:text-green-300'
              : 'bg-amber-200/60 dark:bg-amber-800/40 text-amber-700 dark:text-amber-300'
          }`}>
            {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
          </span>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
            />
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="space-y-6 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <motion.div
                key={step.status}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex items-center gap-6">
                  <motion.div
                    animate={{
                      scale: isCurrent ? [1, 1.2, 1] : 1,
                      rotate: isCurrent && step.status === 'preparing' ? 360 : 0,
                    }}
                    transition={{
                      scale: { duration: 2, repeat: isCurrent ? Infinity : 0 },
                      rotate: { duration: 2, repeat: isCurrent ? Infinity : 0 },
                    }}
                    className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-400 shadow-lg shadow-blue-500/50'
                        : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <Icon className={`w-8 h-8 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  </motion.div>

                  <div className="flex-1">
                    <h3 className={`text-xl font-semibold ${
                      isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {step.label}
                    </h3>
                    {step.time && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{step.time}</p>
                    )}
                  </div>

                  {isActive && !isCurrent && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
                    >
                      <CheckCircle className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </div>

                {index < steps.length - 1 && (
                  <div className="absolute left-8 top-16 w-0.5 h-6 bg-gray-300 dark:bg-gray-700" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-purple-500/20"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Order Details</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>{item.quantity}x {item.name}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
              <span className="font-semibold text-gray-900 dark:text-white">Total</span>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ₹{order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Live Queue Status */}
        {order && order.status !== 'completed' && order.status !== 'cancelled' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-cyan-500/10 dark:from-purple-950/30 dark:via-gray-900/40 dark:to-cyan-950/20 backdrop-blur-md rounded-2xl p-6 border border-purple-200/60 dark:border-purple-500/30 shadow-lg shadow-purple-500/5"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-500 dark:text-purple-400 animate-pulse" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Smart Queue Prediction
              </h3>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Queue Position</p>
                <motion.div
                  key={queuePosition}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.4 }}
                  className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/30"
                >
                  <span className="text-3xl font-extrabold text-white">#{queuePosition}</span>
                </motion.div>
              </div>
              <div className="hidden sm:block h-16 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">AI-Predicted Wait</p>
                <motion.p
                  key={estimatedWait}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.4 }}
                  className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-400 bg-clip-text text-transparent"
                >
                  {estimatedWait} mins
                </motion.p>
              </div>
            </div>
            
            {/* AI Breakdown */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 space-y-2">
              <div className="flex justify-between items-center">
                <span>Preceding Active Queue ({queuePosition - 1} ahead)</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">+{(queuePosition - 1) * 6} mins</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Order Volume Prep footprint ({order.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">+{order.items.reduce((sum, item) => sum + item.quantity, 0) * 3} mins</span>
              </div>
              {queueData && queueData.queue_length > 5 && (
                <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 font-medium">
                  <span>High Load Factor Scaling (Busy Stall)</span>
                  <span>1.2x Multiplier</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200 dark:border-gray-800 font-bold text-gray-700 dark:text-gray-300">
                <span>Total Dynamic Prediction</span>
                <span>~{estimatedWait} mins</span>
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-purple-600 dark:text-purple-400 bg-purple-500/5 dark:bg-purple-400/5 py-2 px-4 rounded-xl border border-purple-500/10">
              {queuePosition === 1
                ? "✨ You're next! The chef is preparing your order right now."
                : `✨ Estimating ~${estimatedWait} minutes until complete based on active queue loading.`}
            </div>
          </motion.div>
        )}

        {/* ✅ Cancel Order — only shown while order is "placed" */}
        <AnimatePresence>
          {canCancel && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ delay: 0.7 }}
              className="mt-6"
            >
              {!showCancelConfirm ? (
                /* ── Trigger button ── */
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  Cancel Order
                </button>
              ) : (
                /* ── Inline confirmation panel ── */
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="rounded-xl border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-5"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-700 dark:text-red-400 text-sm">
                        Cancel this order?
                      </p>
                      <p className="text-red-600 dark:text-red-500 text-xs mt-1">
                        This action cannot be undone. Once cancelled, your order will be permanently removed.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      disabled={cancelling}
                      className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      Keep Order
                    </button>
                    <button
                      onClick={handleCancelOrder}
                      disabled={cancelling}
                      className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {cancelling ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};