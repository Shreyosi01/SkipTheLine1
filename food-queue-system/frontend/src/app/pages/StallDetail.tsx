import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Minus, Store, CircleX, CircleCheck } from 'lucide-react';
import { QueueMeter } from '../components/QueueMeter';
import { useApp } from '../context/AppContext';
import { useQueueStream } from '../../hooks/useQueueStream';
import { toast } from 'sonner';

export const StallDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, removeFromCart, cart, stalls } = useApp();

  const stall = stalls.find((s) => String(s.id) === String(id));

  const { data: queueData, connectionMode, loading: queueLoading } = useQueueStream(id);

  // ✅ isOpen falls back to true for stalls that pre-date the field
  const isOpen = (stall as any)?.isOpen ?? true;

  // Helper: get quantity of a given item in cart
  const getCartQuantity = (itemId: string): number => {
    const found = cart.find((i) => i.id === String(itemId) && i.stallId === String(id));
    return found?.quantity ?? 0;
  };

  if (!stall) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <Store className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-900 dark:text-white text-xl font-semibold mb-2">Stall not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = (item: any) => {
    if (!isOpen) {
      toast.error('This stall is currently closed and not accepting orders.');
      return;
    }
    addToCart({
      id: String(item.id),
      stallId: String(stall.id),
      name: item.name,
      price: item.price,
      quantity: 1,
    });
    toast.success(`${item.name} added to cart!`);
  };

  const handleDecrement = (item: any) => {
    const qty = getCartQuantity(String(item.id));
    if (qty <= 1) {
      removeFromCart(String(item.id));
    } else {
      removeFromCart(String(item.id));
      addToCart({
        id: String(item.id),
        stallId: String(stall.id),
        name: item.name,
        price: item.price,
        quantity: qty - 1,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 pb-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </motion.button>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-64 rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-blue-500 via-cyan-500 to-indigo-500"
        >
          {stall.image && (
            <img
              src={stall.image}
              alt={stall.stallName}
              className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-end gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                {stall.image
                  ? <img src={stall.image} alt={stall.stallName} className="w-full h-full object-cover" />
                  : <span className="text-2xl font-black text-white">{stall.stallName.charAt(0).toUpperCase()}</span>
                }
              </div>
              <div>
                {stall.category && (
                  <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white mb-2">
                    {stall.category}
                  </div>
                )}
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">{stall.stallName}</h1>
                  {/* ✅ Open / Closed badge on the hero */}
                  {isOpen ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500/90 text-white backdrop-blur-sm">
                      <CircleCheck className="w-3.5 h-3.5" />
                      Open
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/90 text-white backdrop-blur-sm">
                      <CircleX className="w-3.5 h-3.5" />
                      Closed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ✅ Closed stall notice banner — shown below hero when stall is closed */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-5 py-4 mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40"
          >
            <CircleX className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                This stall is currently closed
              </p>
              <p className="text-xs text-red-500 dark:text-red-500 mt-0.5">
                The vendor is not accepting orders right now. Check back later!
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Menu</h2>

            {stall.items.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <Store className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No items listed yet.</p>
              </div>
            ) : (
              stall.items.map((item, index) => {
                const qty = getCartQuantity(String(item.id));
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.07 }}
                    className={`bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden border border-gray-200 dark:border-purple-500/20 hover:border-blue-300 dark:hover:border-cyan-500/50 transition-all ${
                      !isOpen ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{item.name}</h3>
                          {item.description && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 truncate">{item.description}</p>
                          )}
                          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            ₹{Number(item.price).toFixed(2)}
                          </span>
                        </div>

                        {/* ✅ Add/stepper disabled when stall is closed */}
                        {!isOpen ? (
                          <div className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 font-semibold rounded-lg flex-shrink-0 cursor-not-allowed select-none">
                            <Plus className="w-4 h-4" />
                            Add
                          </div>
                        ) : qty === 0 ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAddToCart(item)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg shadow-md hover:shadow-blue-500/40 transition-all flex-shrink-0"
                          >
                            <Plus className="w-4 h-4" />
                            Add
                          </motion.button>
                        ) : (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-md flex-shrink-0 overflow-hidden"
                          >
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => handleDecrement(item)}
                              className="px-3 py-2 text-white hover:bg-white/20 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </motion.button>

                            <motion.span
                              key={qty}
                              initial={{ scale: 1.4, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="min-w-[1.5rem] text-center text-white font-bold text-sm"
                            >
                              {qty}
                            </motion.span>

                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => handleAddToCart(item)}
                              className="px-3 py-2 text-white hover:bg-white/20 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </motion.button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Queue Meter Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <QueueMeter
              queueLength={queueData?.queue_length ?? 0}
              estimatedWait={queueData?.estimated_wait_minutes ?? 0}
              connectionMode={queueLoading ? 'idle' : connectionMode}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};