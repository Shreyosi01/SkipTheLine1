import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, ChefHat, Package, CheckCircle, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export const VendorOrders: React.FC = () => {
  const { orders, updateOrderStatus, user } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'placed' | 'preparing' | 'ready'>('all');

  // Filter orders for this vendor's stall only
  const vendorOrders = orders.filter((o) => o.stallId === user?.stallId);
  const filteredOrders = filter === 'all' ? vendorOrders : vendorOrders.filter((o) => o.status === filter);

  const handleStatusChange = (orderId: string, newStatus: 'placed' | 'preparing' | 'ready' | 'completed') => {
    updateOrderStatus(orderId, newStatus);
    toast.success(`Order status updated to ${newStatus}`);
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      placed: 'preparing',
      preparing: 'ready',
      ready: 'completed',
    };
    return statusFlow[currentStatus as keyof typeof statusFlow];
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          onClick={() => navigate('/vendor')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Order Management</h1>
          <p className="text-gray-400">Manage and update order statuses</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3 mb-8 overflow-x-auto pb-2"
        >
          {['all', 'placed', 'preparing', 'ready'].map((status) => (
            <motion.button
              key={status}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(status as any)}
              className={`px-6 py-2 rounded-full font-semibold transition-all whitespace-nowrap ${
                filter === status
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white border border-purple-500/20'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Package className="w-20 h-20 mx-auto mb-4 text-gray-600" />
            <h2 className="text-2xl font-semibold text-white mb-2">No orders found</h2>
            <p className="text-gray-400">Orders will appear here when customers place them</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrders.map((order, index) => {
              const nextStatus = getNextStatus(order.status);
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20"
                >
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                        {order.token}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{order.stallName}</p>
                        <p className="text-gray-400 text-sm">
                          {new Date(order.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        ₹{order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 mb-4 p-3 bg-gray-900/50 rounded-lg">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-300">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-gray-400">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'placed'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                          : order.status === 'preparing'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                          : order.status === 'ready'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                      }`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  {order.status !== 'completed' && nextStatus && (
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleStatusChange(order.id, nextStatus as any)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-green-500/50 transition-all"
                      >
                        {nextStatus === 'preparing' && <ChefHat className="w-4 h-4" />}
                        {nextStatus === 'ready' && <Package className="w-4 h-4" />}
                        {nextStatus === 'completed' && <CheckCircle className="w-4 h-4" />}
                        Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                      </motion.button>
                    </div>
                  )}

                  {/* Timer */}
                  <motion.div
                    className="mt-4 flex items-center justify-center gap-2 text-purple-300 text-sm"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Est. {order.estimatedTime} mins</span>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
