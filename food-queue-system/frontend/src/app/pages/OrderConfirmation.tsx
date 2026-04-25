import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Clock, Hash, IndianRupee, ChefHat, ArrowRight, Home, Package } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router';
import { Order } from '../context/AppContext';

const STATUS_STEPS = [
  { key: 'placed',    label: 'Order Placed',   icon: Package,    color: 'from-blue-500 to-cyan-500' },
  { key: 'preparing', label: 'Preparing',       icon: ChefHat,    color: 'from-amber-500 to-orange-500' },
  { key: 'ready',     label: 'Ready to Pickup', icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
];

const ConfettiPiece: React.FC<{ index: number }> = ({ index }) => {
  const colors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#f43f5e'];
  const color = colors[index % colors.length];
  const left = `${(index * 7.3 + 5) % 95}%`;
  const delay = (index * 0.15) % 1.2;
  const duration = 1.8 + (index % 4) * 0.4;
  const rotate = index % 2 === 0 ? 360 : -360;

  return (
    <motion.div
      className="absolute top-0 w-2.5 h-2.5 rounded-sm"
      style={{ left, backgroundColor: color }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{ y: 320, opacity: 0, rotate }}
      transition={{ delay, duration, ease: 'easeIn' }}
    />
  );
};

export const OrderConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order: Order | undefined = location.state?.order;
  const confettiShown = useRef(false);

  useEffect(() => {
    if (!order) {
      navigate('/', { replace: true });
    }
  }, [order, navigate]);

  if (!order) return null;

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === order.status);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 pb-16 transition-colors duration-200 overflow-hidden">

      {/* Confetti burst */}
      <div className="fixed inset-x-0 top-16 pointer-events-none overflow-hidden h-80 z-50">
        <AnimatePresence>
          {Array.from({ length: 18 }).map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
        </AnimatePresence>
      </div>

      <div className="max-w-lg mx-auto px-4 sm:px-6">

        {/* Success Icon */}
        <motion.div
          className="flex flex-col items-center mb-8"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.2 }}
        >
          <div className="relative mb-5">
            <motion.div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl shadow-green-500/30"
              animate={{ boxShadow: ['0 0 0 0 rgba(34,197,94,0.4)', '0 0 0 24px rgba(34,197,94,0)', '0 0 0 0 rgba(34,197,94,0)'] }}
              transition={{ repeat: 3, duration: 1.2, delay: 0.4 }}
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="text-3xl font-bold text-gray-900 dark:text-white mb-1"
          >
            Order Confirmed! 🎉
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="text-gray-500 dark:text-gray-400 text-center"
          >
            Your order has been placed at <span className="font-semibold text-gray-800 dark:text-gray-200">{order.stallName}</span>
          </motion.p>
        </motion.div>

        {/* Token Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 mb-5 shadow-lg shadow-blue-500/25"
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,white,transparent)]" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Your Token Number</p>
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-white/70" />
                <span className="text-5xl font-black text-white tracking-tight">{order.token}</span>
              </div>
              <p className="text-blue-100 text-xs mt-1">Show this at the counter</p>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <span className="text-3xl font-black text-white">{order.token}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/60 overflow-hidden mb-5"
        >
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700/60">
            <h2 className="font-bold text-gray-900 dark:text-white">Order Summary</h2>
          </div>

          <div className="px-5 py-3 space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm py-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {item.quantity}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-0.5">
                  <IndianRupee className="w-3 h-3 text-cyan-500" />
                  {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-700/40 dark:to-indigo-900/20 border-t border-gray-200 dark:border-gray-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>Est. {order.estimatedTime} mins</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total:</span>
              <IndianRupee className="w-4 h-4 text-cyan-500" />
              <span className="text-2xl font-black bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                {order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Progress Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/60 px-5 py-5 mb-6"
        >
          <h2 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wide">
            Order Progress
          </h2>
          <div className="flex items-center gap-0">
            {STATUS_STEPS.map((step, i) => {
              const Icon = step.icon;
              const isCompleted = i <= currentStepIndex;
              const isActive = i === currentStepIndex;
              const isLast = i === STATUS_STEPS.length - 1;

              return (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center flex-shrink-0">
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.9 + i * 0.12 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? `bg-gradient-to-br ${step.color} shadow-md`
                          : 'bg-gray-200 dark:bg-gray-700'
                      } ${isActive ? 'ring-4 ring-blue-200 dark:ring-blue-900/50' : ''}`}
                    >
                      <Icon className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                    </motion.div>
                    <p className={`text-xs mt-1.5 font-medium text-center leading-tight max-w-[60px] ${
                      isCompleted ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                  {!isLast && (
                    <div className={`flex-1 h-1 rounded-full mx-1 mb-4 transition-all ${
                      i < currentStepIndex
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-400'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Link
            to={`/order/${order.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
          >
            Track Order <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <Home className="w-4 h-4" /> Back to Home
          </Link>
        </motion.div>

      </div>
    </div>
  );
};