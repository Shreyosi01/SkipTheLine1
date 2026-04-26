import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Store, Clock, Package, ChevronRight, BadgeCheck,
  Sparkles, RefreshCw, IndianRupee, ArrowLeft,
} from 'lucide-react';
import { useApp, Stall, StallItem } from '../context/AppContext';
import { Link, useParams, useNavigate } from 'react-router';

const validItems = (stall: Stall): StallItem[] =>
  stall.items.filter((i) => i.name.trim() && i.price > 0);

const GRADIENTS = [
  'from-blue-500 via-cyan-500 to-indigo-500',
  'from-violet-500 via-purple-500 to-blue-500',
  'from-cyan-500 via-teal-500 to-emerald-400',
  'from-rose-500 via-pink-500 to-fuchsia-500',
  'from-orange-500 via-amber-500 to-yellow-400',
  'from-indigo-500 via-blue-500 to-cyan-400',
];

// ─── Stall Card ───────────────────────────────────────────────────────────────
const StallCard: React.FC<{ stall: Stall; index: number }> = ({ stall, index }) => {
  const items = validItems(stall);
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ y: -5, scale: 1.01 }}
      className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/60 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-cyan-500/10 transition-all"
    >
      {/* Banner */}
      <div className={`h-24 bg-gradient-to-br ${gradient} relative overflow-hidden flex items-center justify-center`}>

        {/* ✅ FIXED: use normal opacity instead of mix-blend-overlay so the
            image is always visible regardless of the gradient underneath */}
        {stall.image && (
          <img
            src={stall.image}
            alt={stall.stallName}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        )}

        {/* Subtle highlight — sits on top of image */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_30%,white,transparent)]" />

        {/* ✅ FIXED: avatar icon removed — it was duplicating the image and
            covering it. Show initial letter only when there's no image. */}
        {!stall.image && (
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 z-10 shadow-lg">
            <span className="text-2xl font-black text-white">
              {stall.stallName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* New / Updated badge */}
        <span className={`absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold z-10 ${
          stall.status === 'new' ? 'bg-blue-600/90 text-white' : 'bg-amber-500/90 text-white'
        }`}>
          {stall.status === 'new'
            ? <><Sparkles className="w-3 h-3" /> New</>
            : <><RefreshCw className="w-3 h-3" /> Updated</>}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-3">
          {stall.stallName}
        </h3>

        {items.length > 0 ? (
          <div className="space-y-1.5 mb-4">
            {items.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300 truncate mr-2">{item.name}</span>
                <span className="flex items-center gap-0.5 font-semibold text-gray-900 dark:text-white flex-shrink-0">
                  <IndianRupee className="w-3 h-3 text-cyan-500" />
                  {item.price}
                </span>
              </div>
            ))}
            {items.length > 3 && (
              <p className="text-xs text-gray-400 dark:text-gray-500">+{items.length - 3} more items</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">No items listed yet</p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/60">
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <BadgeCheck className="w-3.5 h-3.5 text-green-500" />
            <span>Verified vendor</span>
          </div>
          <Link
            to={`/stall/${stall.id}`}
            className="flex items-center gap-1 text-blue-500 dark:text-cyan-400 text-sm font-semibold hover:gap-2 transition-all"
          >
            View Menu <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Stall Detail  (route: /stall/:id) ───────────────────────────────────────
export const StallDetail: React.FC = () => {
  const { stalls } = useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const stall = stalls.find((s) => String(s.id) === String(id));

  if (!stall) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Stall not found 😢</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  const items = validItems(stall);
  const idx = stalls.indexOf(stall);
  const gradient = GRADIENTS[idx % GRADIENTS.length];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-16 transition-colors duration-200">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to stalls</span>
        </motion.button>

        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`h-40 rounded-2xl bg-gradient-to-br ${gradient} relative overflow-hidden mb-6 flex items-center justify-center`}
        >
          {/* ✅ FIXED: same fix as StallCard — plain opacity, no mix-blend */}
          {stall.image && (
            <img
              src={stall.image}
              alt={stall.stallName}
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_30%,white,transparent)]" />

          <div className="text-center text-white relative z-10">
            {/* Only show letter avatar if there's no image */}
            {!stall.image && (
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 mx-auto mb-2 shadow-lg">
                <span className="text-3xl font-black">{stall.stallName.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <h1 className="text-2xl font-bold drop-shadow-md">{stall.stallName}</h1>
            <p className="text-white/90 text-sm font-medium drop-shadow-sm">
              Updated{' '}
              {new Date(stall.updatedAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </p>
          </div>

          <span className={`absolute top-4 right-4 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold z-10 ${
            stall.status === 'new' ? 'bg-blue-600/90 text-white' : 'bg-amber-500/90 text-white'
          }`}>
            {stall.status === 'new' ? '✨ New' : '🔄 Updated'}
          </span>
        </motion.div>

        {/* Menu */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Menu</h2>

        {items.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700">
            <Store className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 dark:text-gray-500">No items listed yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/60 hover:border-blue-200 dark:hover:border-cyan-700/50 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{item.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 ml-4 flex-shrink-0">
                  <IndianRupee className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                  <span className="font-bold text-gray-900 dark:text-white">{item.price}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Customer Home  (route: "/") ─────────────────────────────────────────────
export const CustomerHome: React.FC = () => {
  const { stalls, orders } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const recentOrders = orders.slice(-3).reverse();

  const filteredStalls = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return stalls;
    return stalls.filter(
      (s) =>
        s.stallName.toLowerCase().includes(q) ||
        s.items.some((it) => it.name.toLowerCase().includes(q))
    );
  }, [stalls, searchTerm]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 pb-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Skip the Line Today
            </span>
            <span className="ml-3">🍔</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 dark:text-gray-400"
          >
            Order digitally and track your food in real-time
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search stalls or food items…"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-purple-500/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-500/20 transition-all"
            />
          </div>
        </motion.div>

        {recentOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mb-10"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Recent Orders</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentOrders.map((order, index) => (
                <Link key={order.id} to={`/order/${order.id}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800/50 dark:to-indigo-900/20 backdrop-blur-sm rounded-xl p-4 border border-blue-200 dark:border-indigo-500/30 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                        {order.token}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'placed' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                        : order.status === 'preparing' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                        : order.status === 'ready' ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                        : 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-gray-900 dark:text-white font-semibold mb-1">{order.stallName}</p>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>{order.items.length} items</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{order.estimatedTime}m</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      ₹{order.total.toFixed(2)}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {stalls.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-24">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Store className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Stalls Open Yet</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Vendors are still setting up. Check back soon — exciting food is on its way!
              </p>
            </motion.div>
          ) : filteredStalls.length === 0 ? (
            <motion.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-20">
              <p className="text-gray-500 dark:text-gray-400 text-xl">No stalls match your search</p>
            </motion.div>
          ) : (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStalls.map((stall, index) => (
                <StallCard key={stall.id} stall={stall} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};