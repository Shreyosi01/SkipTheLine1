import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Users, Clock, Package, DollarSign, Store,
  Plus, Edit3, Sparkles, ToggleLeft, ToggleRight, Loader2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Link, useNavigate } from 'react-router';
import { api } from '../../api/client';
import { toast } from 'sonner';

export const VendorDashboard: React.FC = () => {
  const { orders, user, getVendorStall, fetchVendorOrders, fetchStalls } = useApp();
  const navigate = useNavigate();

  // ✅ Local state for open/closed — initialised from stall data once loaded
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [togglingOpen, setTogglingOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Refresh vendor orders every time the dashboard is visited
  useEffect(() => {
    fetchVendorOrders();
  }, []);

  const vendorStall = getVendorStall();
  const stallId = vendorStall?.id ?? user?.stallId;
  const vendorOrders = orders.filter((o) => o.stallId === stallId);

  // ✅ Sync isOpen from stall data whenever it loads/changes
  useEffect(() => {
    if (vendorStall) {
      setIsOpen((vendorStall as any).isOpen ?? true);
    }
  }, [vendorStall?.id]);

  const totalOrders = vendorOrders.length;
  const activeQueue = vendorOrders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length;
  const totalRevenue = vendorOrders.reduce((sum, o) => sum + o.total, 0);
  const avgWaitTime = 12;

  const stats = [
    { icon: Package,   label: 'Total Orders',  value: totalOrders,              color: 'from-blue-500 to-cyan-500' },
    { icon: Users,     label: 'Active Queue',   value: activeQueue,              color: 'from-purple-500 to-pink-500' },
    { icon: DollarSign,label: 'Total Revenue',  value: `₹${totalRevenue.toFixed(2)}`, color: 'from-green-500 to-emerald-500' },
    { icon: Clock,     label: 'Avg Wait Time',  value: `${avgWaitTime} min`,     color: 'from-green-500 to-emerald-500' },
  ];

  // ✅ Toggle stall open/closed via API
  const handleToggleOpen = async () => {
    if (!vendorStall) return;
    setTogglingOpen(true);
    const next = !isOpen;
    try {
      await api.toggleStallAvailability(parseInt(vendorStall.id), next);
      setIsOpen(next);
      await fetchStalls();
      toast.success(next ? 'Stall is now Open — accepting orders!' : 'Stall is now Closed — orders paused.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update stall availability');
    } finally {
      setTogglingOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 pb-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">👨‍🍳 Vendor Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your orders and track performance</p>
        </motion.div>

        {/* Stall Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          {vendorStall ? (
            <div className={`rounded-2xl border p-6 transition-colors duration-300 ${
              isOpen
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700/40'
                : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-700/40'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden transition-colors duration-300 ${
                    isOpen
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/25'
                      : 'bg-gradient-to-br from-red-400 to-rose-500 shadow-red-500/25'
                  }`}>
                    {vendorStall.image ? (
                      <img src={vendorStall.image} alt={vendorStall.stallName} className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-7 h-7 text-white" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{vendorStall.stallName}</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        vendorStall.status === 'new'
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                          : vendorStall.status === 'updated'
                          ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                          : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                      }`}>
                        {vendorStall.status === 'new' ? '🆕 New' : vendorStall.status === 'updated' ? '🔄 Updated' : '✅ Active'}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {vendorStall.items.length} item{vendorStall.items.length !== 1 ? 's' : ''} on menu ·
                      Last updated: {new Date(vendorStall.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* ✅ Right side: Open/Closed toggle + Edit button */}
                <div className="flex items-center gap-3 self-start sm:self-auto">

                  {/* Open / Closed toggle */}
                  <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-colors duration-200 ${
                    isOpen
                      ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600/40'
                      : 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-600/40'
                  }`}>
                    <span className={`text-xs font-bold select-none ${
                      isOpen ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {isOpen ? 'OPEN' : 'CLOSED'}
                    </span>

                    <button
                      onClick={handleToggleOpen}
                      disabled={togglingOpen}
                      className="relative flex-shrink-0 focus:outline-none disabled:opacity-60"
                      title={isOpen ? 'Click to close stall' : 'Click to open stall'}
                    >
                      {togglingOpen ? (
                        <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
                      ) : isOpen ? (
                        <ToggleRight className="w-8 h-8 text-green-500 dark:text-green-400" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-red-400 dark:text-red-500" />
                      )}
                    </button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(34,197,94,0.35)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/vendor/stall')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-md shadow-green-500/20 transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Stall
                  </motion.button>
                </div>
              </div>

              {/* ✅ Closed warning message */}
              {!isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 flex items-center gap-2 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 rounded-xl px-4 py-3"
                >
                  <span className="text-red-500 text-base">⛔</span>
                  <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                    Your stall is currently closed. Customers can see your menu but cannot place orders until you reopen.
                  </p>
                </motion.div>
              )}

              {/* Menu item pills */}
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
                   .filter((o) => o.status !== 'completed' && o.status !== 'cancelled')
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
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'placed'    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                        : order.status === 'preparing' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                        : 'bg-green-500/20 text-green-600 dark:text-green-400'
                      }`}>
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

        {/* Order History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-purple-500/20"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="w-6 h-6 text-purple-500" />
                {showHistory ? 'Full Order History' : 'Active Orders'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {showHistory
                  ? `All orders including completed & cancelled (${vendorOrders.length})`
                  : `Currently active orders needing action (${vendorOrders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length})`}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all ${
                showHistory
                  ? 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              {showHistory ? 'Back to Active' : 'View Full History'}
            </motion.button>
          </div>

          {!showHistory ? (
            /* Active orders — cards with action shortcut */
            vendorOrders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length === 0 ? (
              <div className="text-center py-10">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No active orders right now.</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">New customer orders will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vendorOrders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.07 }}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {order.token}
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-semibold text-sm">{order.items.map(i => `${i.name} (x${i.quantity})`).join(', ').slice(0, 45)}{order.items.join('').length > 45 ? '…' : ''}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">{new Date(order.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">₹{order.total.toFixed(2)}</p>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        order.status === 'placed'    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                        : order.status === 'preparing' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                        : 'bg-green-500/20 text-green-600 dark:text-green-400'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            /* Full history — rich rows */
            vendorOrders.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-10">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {vendorOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      order.status === 'cancelled'
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-700/40'
                        : 'bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
                        order.status === 'cancelled' ? 'bg-red-400' : 'bg-gradient-to-r from-green-500 to-emerald-500'
                      }`}>
                        {order.token}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            order.status === 'cancelled'  ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                            : order.status === 'placed'    ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                            : order.status === 'preparing' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                            : order.status === 'ready'     ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                            : 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400'
                          }`}>{order.status.toUpperCase()}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            order.paymentStatus === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                          }`}>{order.paymentMode === 'upi' ? 'UPI' : 'Counter'} · {order.paymentStatus?.toUpperCase()}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-md">
                          {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{new Date(order.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400 dark:text-gray-500">Total</p>
                      <p className="text-xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">₹{order.total.toFixed(2)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          )}
        </motion.div>

      </div>
    </div>
  );
};