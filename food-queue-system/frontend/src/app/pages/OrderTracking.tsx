import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, ChefHat, Package, CheckCircle, Loader2, Wifi, WifiOff } from 'lucide-react';
import { useApp, Order } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../../api/client';
import { useQueueStream } from '../../hooks/useQueueStream';

export const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, stalls, fetchMyOrders, updateOrderStatus } = useApp();

  const [fetchedOrder, setFetchedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [progress, setProgress] = useState(0);

  const contextOrder = orders.find((o) => o.id === id);
  const order = contextOrder || fetchedOrder;

  // ✅ SSE: Connect to live queue stream for this order's stall.
  // stallId is only known once we have the order, so we pass it conditionally.
  // useQueueStream handles null gracefully (returns loading=true, data=null).
  const { data: queueData, connectionMode } = useQueueStream(order?.stallId);

  // Derive live position from SSE queue data.
  // This replaces the old local-context calculation which was wrong —
  // context only contains the current customer's orders, not all stall orders.
  const livePosition = queueData
    ? queueData.orders.findIndex(o => o.token === order?.token) + 1
    : 0;
  const queuePosition = livePosition > 0 ? livePosition : 1;
  const estimatedWait = queueData
    ? (queuePosition - 1) * 5
    : order?.estimatedTime ?? 15;

  // ✅ TEAMMATE: fetches fresh orders on mount then falls back to direct API call.
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

  // ✅ SSE: When live queue data arrives, sync order status into context
  // if it has changed server-side. This is what makes the timeline update
  // without the customer needing to refresh.
  useEffect(() => {
    if (!queueData || !order) return;
    const liveOrder = queueData.orders.find(o => o.token === order.token);
    if (liveOrder && liveOrder.status !== order.status) {
      // Update context so the timeline re-renders
      updateOrderStatus(order.id, liveOrder.status as any);
      // Also update fetchedOrder if that's what we're rendering
      setFetchedOrder(prev =>
        prev ? { ...prev, status: liveOrder.status as any } : prev
      );
    }
  }, [queueData]);

  // Progress bar driven by order status
  useEffect(() => {
    if (!order) return;
    const progressMap: Record<string, number> = {
      placed: 25, preparing: 50, ready: 75, completed: 100,
    };
    setProgress(progressMap[order.status] ?? 25);
  }, [order?.status]);

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
            onClick={() => navigate('/')}
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
    { status: 'completed', icon: CheckCircle,  label: 'Completed',   time: '' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.status === order.status);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 pb-12 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          onClick={() => navigate('/')}
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

          {/* ✅ SSE connection indicator */}
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
        <div className="flex justify-center mb-8">
          <StatusBadge status={order.status} />
        </div>

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
        {order.status !== 'completed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-200 dark:border-purple-500/30"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
              Live Queue Status
            </h3>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Your Position</p>
                <motion.div
                  key={queuePosition}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.4 }}
                  className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
                >
                  <span className="text-3xl font-bold text-white">#{queuePosition}</span>
                </motion.div>
              </div>
              <div className="h-16 w-px bg-gray-300 dark:bg-gray-700" />
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Est. Wait Time</p>
                <motion.p
                  key={estimatedWait}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.4 }}
                  className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
                >
                  {estimatedWait}m
                </motion.p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {queuePosition === 1
                  ? "You're next! Your order is being prepared."
                  : `${queuePosition - 1} order${queuePosition - 1 !== 1 ? 's' : ''} ahead of you`}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};