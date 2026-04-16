import React from 'react';
import { motion } from 'motion/react';
import { Users, Clock, Package, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router';

export const VendorDashboard: React.FC = () => {
  const { orders, user } = useApp();

  // Filter orders for this vendor's stall only
  const vendorOrders = orders.filter((o) => o.stallId === user?.stallId);

  const totalOrders = vendorOrders.length;
  const activeQueue = vendorOrders.filter((o) => o.status !== 'completed').length;
  const totalRevenue = vendorOrders.reduce((sum, o) => sum + o.total, 0);
  const avgWaitTime = 12;

  const stats = [
    {
      icon: Package,
      label: 'Total Orders',
      value: totalOrders,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      label: 'Active Queue',
      value: activeQueue,
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: `₹${totalRevenue.toFixed(2)}`,
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Clock,
      label: 'Avg Wait Time',
      value: `${avgWaitTime} min`,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 pb-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">👨‍🍳 Vendor Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your orders and track performance</p>
        </motion.div>

        {/* Overview Panel - Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-purple-500/20"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Link to="/vendor/orders">
            <motion.div
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(34, 197, 94, 0.3)' }}
              className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-6 border border-green-300 dark:border-green-500/30 cursor-pointer"
            >
              <Package className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Manage Orders</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">View and update order status</p>
            </motion.div>
          </Link>

          <Link to="/vendor/queue">
            <motion.div
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)' }}
              className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-6 border border-purple-300 dark:border-purple-500/30 cursor-pointer"
            >
              <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Queue Management</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Organize and optimize your queue</p>
            </motion.div>
          </Link>

          <Link to="/vendor/analytics">
            <motion.div
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(34, 197, 94, 0.3)' }}
              className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-6 border border-green-300 dark:border-green-500/30 cursor-pointer"
            >
              <Package className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">View performance insights</p>
            </motion.div>
          </Link>
        </motion.div>

        {/* Live Queue Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Live Queue Status</h2>
          {activeQueue === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-200 dark:border-purple-500/20 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
              <p className="text-gray-600 dark:text-gray-400">No active orders in queue</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-200 dark:border-purple-500/30">
              <div className="flex items-center gap-4 overflow-x-auto pb-2">
                {vendorOrders
                  .filter((o) => o.status !== 'completed')
                  .map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex-shrink-0 text-center"
                    >
                      <div className="relative mb-2">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {order.token}
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'placed'
                            ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                            : order.status === 'preparing'
                            ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                            : 'bg-green-500/20 text-green-600 dark:text-green-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </motion.div>
                  ))}
              </div>
              <div className="mt-4 text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {activeQueue} order{activeQueue !== 1 ? 's' : ''} currently in queue
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Order Management - Recent Orders List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-purple-500/20"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Orders</h2>

          {vendorOrders.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {vendorOrders.slice(0, 5).map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                      {order.token}
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-semibold">{order.items.length} items</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {new Date(order.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">₹{order.total.toFixed(2)}</p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'placed'
                          ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                          : order.status === 'preparing'
                          ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                          : order.status === 'ready'
                          ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                          : 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
