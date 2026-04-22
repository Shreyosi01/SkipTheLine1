import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  ShoppingBag,
  X,
  ChevronRight,
  Store,
  Sparkles,
  RefreshCw,
  IndianRupee,
  UtensilsCrossed,
  Clock,
  BadgeCheck,
} from 'lucide-react';
import { useApp, Stall, StallItem } from '../context/AppContext';

// ─── helpers ──────────────────────────────────────────────────────────────────
const validItems = (stall: Stall): StallItem[] =>
  stall.items.filter((i) => i.name.trim() && i.price > 0);

// ─── Menu item row ────────────────────────────────────────────────────────────
const MenuItemRow: React.FC<{ item: StallItem; index: number }> = ({ item, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    className="flex items-center justify-between py-3 px-4 rounded-xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700/60 hover:border-blue-200 dark:hover:border-cyan-700/50 hover:shadow-sm transition-all"
  >
    <div className="flex items-center gap-3 min-w-0">
      <span className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex-shrink-0" />
      <div className="min-w-0">
        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
          {item.name}
        </p>
        {item.description && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
            {item.description}
          </p>
        )}
      </div>
    </div>
    <div className="flex items-center gap-1 ml-4 flex-shrink-0">
      <IndianRupee className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
      <span className="font-bold text-gray-900 dark:text-white text-sm">{item.price}</span>
    </div>
  </motion.div>
);

// ─── Stall card ───────────────────────────────────────────────────────────────
const StallCard: React.FC<{
  stall: Stall;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ stall, index, isExpanded, onToggle }) => {
  const items = validItems(stall);
  const minPrice = items?.length ? Math.min(...items.map((i) => i.price)) : 0;
  const maxPrice = items?.length ? Math.max(...items.map((i) => i.price)) : 0;

  const GRADIENTS = [
    'from-blue-500 via-cyan-500 to-indigo-500',
    'from-violet-500 via-purple-500 to-blue-500',
    'from-cyan-500 via-teal-500 to-emerald-400',
    'from-rose-500 via-pink-500 to-fuchsia-500',
    'from-orange-500 via-amber-500 to-yellow-400',
    'from-indigo-500 via-blue-500 to-cyan-400',
  ];
  const gradient = GRADIENTS[index % GRADIENTS?.length];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, layout: { duration: 0.3 } }}
      className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
        isExpanded
          ? 'border-blue-300 dark:border-cyan-500/40 shadow-lg shadow-blue-500/10 dark:shadow-cyan-500/10'
          : 'border-gray-200 dark:border-gray-700/60 hover:border-blue-200 dark:hover:border-cyan-700/50 hover:shadow-md hover:shadow-blue-500/5'
      } bg-white dark:bg-gray-800/60`}
    >
      {/* Gradient top stripe */}
      <div className={`h-2 w-full bg-gradient-to-r ${gradient}`} />

      {/* Clickable header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left focus:outline-none"
      >
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4 min-w-0">
            {/* Avatar */}
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-xl shadow-md flex-shrink-0`}
            >
              {stall.stallName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight truncate">
                  {stall.stallName}
                </h3>
                {/* New / Updated badge */}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    stall.status === 'new'
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {stall.status === 'new' ? (
                    <><Sparkles className="w-3 h-3" /> New</>
                  ) : (
                    <><RefreshCw className="w-3 h-3" /> Updated</>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                  <UtensilsCrossed className="w-3 h-3" />
                  {items?.length} item{items?.length !== 1 ? 's' : ''}
                </span>
                {items?.length > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-gray-400 dark:text-gray-500">
                    <IndianRupee className="w-3 h-3" />
                    {minPrice === maxPrice ? `${minPrice}` : `${minPrice} – ${maxPrice}`}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                  <BadgeCheck className="w-3 h-3 text-green-400" />
                  Verified vendor
                </span>
              </div>
            </div>
          </div>

          {/* Expand chevron */}
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </motion.div>
        </div>
      </button>

      {/* Expanded menu */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700/50 pt-4 space-y-2">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                Menu
              </p>

              {items?.length === 0 ? (
                <div className="text-center py-6">
                  <UtensilsCrossed className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">No items listed yet</p>
                </div>
              ) : (
                items.map((item, i) => (
                  <MenuItemRow key={item.id} item={item} index={i} />
                ))
              )}

              {/* Last updated */}
              <div className="flex items-center gap-1.5 pt-2">
                <Clock className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Last updated{' '}
                  {new Date(stall.updatedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState: React.FC<{ isFiltered: boolean }> = ({ isFiltered }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-20 px-6"
  >
    <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-5">
      {isFiltered ? (
        <Search className="w-9 h-9 text-gray-400 dark:text-gray-500" />
      ) : (
        <Store className="w-9 h-9 text-gray-400 dark:text-gray-500" />
      )}
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
      {isFiltered ? 'No stalls match your search' : 'No stalls open yet'}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
      {isFiltered
        ? "Try a different search term."
        : 'Vendors are setting up. Check back soon for exciting food options!'}
    </p>
  </motion.div>
);

// ─── Main page  (route: "/stalls") ───────────────────────────────────────────
export const CustomerStallList: React.FC = () => {
  // ✅ reads from AppContext — same array vendors write to via createStall / updateStall
  const { stalls } = useApp();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stalls;
    return stalls.filter(
      (s) =>
        s.stallName.toLowerCase().includes(q) ||
        s.items.some((it) => it.name.toLowerCase().includes(q))
    );
  }, [stalls, search]);

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  // Summary counts
  const totalItems = stalls.reduce(
    (acc, s) => acc + s.items.filter((i) => i.name && i.price > 0)?.length,
    0
  );
  const newCount = stalls.filter((s) => s.status === 'new')?.length;
  const updatedCount = stalls.filter((s) => s.status === 'updated')?.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-16 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Browse Stalls</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm ml-[52px]">
            Discover food stalls and explore their menus
          </p>
        </motion.div>

        {/* Summary pills */}
        {stalls?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 mb-6 flex-wrap"
          >
            <span className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300">
              {stalls?.length} stall{stalls?.length !== 1 ? 's' : ''}
            </span>
            <span className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300">
              {totalItems} menu items
            </span>
            {newCount > 0 && (
              <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/40 rounded-full text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {newCount} new
              </span>
            )}
            {updatedCount > 0 && (
              <span className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/40 rounded-full text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> {updatedCount} updated
              </span>
            )}
          </motion.div>
        )}

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative mb-6"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stalls or food items…"
            className="w-full pl-11 pr-10 py-3.5 bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 dark:focus:border-cyan-500 focus:ring-2 focus:ring-blue-400/20 dark:focus:ring-cyan-500/20 transition-all text-sm shadow-sm"
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stall list */}
        <AnimatePresence mode="wait">
          {filtered?.length === 0 ? (
            <EmptyState key="empty" isFiltered={search.trim()?.length > 0} />
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filtered.map((stall, index) => (
                <StallCard
                  key={stall.id}
                  stall={stall}
                  index={index}
                  isExpanded={expandedId === stall.id}
                  onToggle={() => toggleExpand(stall.id)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};