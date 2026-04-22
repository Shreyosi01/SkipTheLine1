import React from 'react';
import { motion } from 'motion/react';
import { Users, Clock, Package, DollarSign, Store, Plus, Edit3, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Link, useNavigate } from 'react-router';

export const VendorDashboard: React.FC = () => {
  const { orders, user, getVendorStall } = useApp();
  const navigate = useNavigate();

  const vendorStall = getVendorStall();
  const vendorOrders = orders.filter((o) => o.stallId === user?.stallId);

  const totalOrders = vendorOrders.length;
  const activeQueue = vendorOrders.filter((o) => o.status !== 'completed').length;
  const totalRevenue = vendorOrders.reduce((sum, o) => sum + o.total, 0);
  const avgWaitTime = 12;

  const stats = [
    { icon: Package, label: 'Total Orders', value: totalOrders, color: 'from-blue-500 to-cyan-500' },
    { icon: Users, label: 'Active Queue', value: activeQueue, color: 'from-purple-500 to-pink-500' },
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: `₹${totalRevenue.toFixed(2)}`,
      color: 'from-green-500 to-emerald-500',
    },
    { icon: Clock, label: 'Avg Wait Time', value: `${avgWaitTime} min`, color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 pb-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">👨‍🍳 Vendor Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your orders and track performance</p>
        </motion.div>

        {/* ── Stall Status Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          {vendorStall ? (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-700/40 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Left: stall info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25 flex-shrink-0">
                    <Store className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{vendorStall.stallName}</h2>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          vendorStall.status === 'new'
                            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                            : vendorStall.status === 'updated'
                            ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                            : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                        }`}
                      >
                        {vendorStall.status === 'new'
                          ? '🆕 New'
                          : vendorStall.status === 'updated'
                          ? '🔄 Updated'
                          : '✅ Active'}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {vendorStall.items.length} item{vendorStall.items.length !== 1 ? 's' : ''} on menu ·
                      Last updated: {new Date(vendorStall.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Right: edit button */}
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(34,197,94,0.35)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/vendor/stall')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-md shadow-green-500/20 transition-all self-start sm:self-auto"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Stall
                </motion.button>
              </div>

              {/* Items preview */}
              <div className="mt-5 flex flex-wrap gap-2">
                {vendorStall.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 bg-white dark:bg-gray-800/60 px-3 py-1.5 rounded-xl border border-green-100 dark:border-green-700/30 text-sm"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
                    <span className="text-green-600 dark:text-green-400 font-semibold">₹{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* No stall yet — CTA */
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative overflow-hidden bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl border-2 border-dashed border-green-300 dark:border-green-700/50 p-8 text-center cursor-pointer"
              onClick={() => navigate('/vendor/stall')}
            >
              <div className="absolute top-4 right-4 opacity-10">
                <Sparkles className="w-20 h-20 text-green-500" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Set Up Your Stall</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-5 max-w-sm mx-auto">
                You haven't created your stall yet. Add your menu items and start accepting orders from customers.
              </p>
              <Link
                to="/vendor/stall"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-md shadow-green-500/25 hover:shadow-green-500/40 transition-all"
              >
                <Store className="w-4 h-4" />
                Create My Stall
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.15 }}
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
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 border border-gray-200 dark:border-purple-500/20 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
              <p className="text-gray-600 dark:text-gray-400">No active orders in queue</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-500/30">
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

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-purple-500/20"
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
