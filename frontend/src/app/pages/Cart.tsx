import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router';
import { mockStalls, generateToken } from '../data/mockData';
import { toast } from 'sonner';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, addToCart, clearCart, addOrder } = useApp();
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const estimatedTime = 15;

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    const order = {
      id: Math.random().toString(36).substr(2, 9),
      stallId: cart[0].stallId,
      stallName: mockStalls.find((s) => s.id === cart[0].stallId)?.name || 'Unknown Stall',
      items: cart,
      total,
      token: generateToken(),
      status: 'placed' as const,
      estimatedTime,
      timestamp: new Date(),
    };

    addOrder(order);
    clearCart();
    toast.success('Order placed successfully!');
    navigate(`/order/₹{order.id}`);
  };

  const updateQuantity = (itemId: string, change: number) => {
    const item = cart.find((i) => i.id === itemId);
    if (item) {
      if (change < 0 && item.quantity === 1) {
        removeFromCart(itemId);
      } else {
        addToCart({ ...item, quantity: change });
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 pb-12 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <ShoppingCart className="w-10 h-10" />
            Your Cart
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Review your order and checkout</p>
        </motion.div>

        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <ShoppingCart className="w-20 h-20 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Add some delicious items to get started!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg"
            >
              Browse Stalls
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items */}
            <AnimatePresence>
              {cart.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-purple-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{item.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {mockStalls.find((s) => s.id === item.stallId)?.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center text-gray-900 dark:text-white transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </motion.button>
                        <span className="text-gray-900 dark:text-white font-semibold w-8 text-center">
                          {item.quantity}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </motion.button>
                      </div>

                      {/* Price */}
                      <div className="text-right min-w-[80px]">
                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800/80 dark:to-indigo-900/20 backdrop-blur-sm rounded-xl p-6 border border-blue-200 dark:border-indigo-500/30"
            >
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Service Fee</span>
                  <span>₹0.00</span>
                </div>
                <div className="border-t border-blue-200 dark:border-indigo-500/30 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Estimated pickup time</span>
                  <span className="text-blue-500 dark:text-cyan-300 font-semibold">{estimatedTime} mins</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(249, 115, 22, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2"
              >
                Checkout
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};