import React, { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, TrendingUp, IndianRupee, Package, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { useApp } from '../context/AppContext';

// ── Colours for pie chart slices ─────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  placed:    '#3b82f6',
  preparing: '#eab308',
  ready:     '#22c55e',
  completed: '#a855f7',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Group orders into 1-hour buckets by created_at and sum revenue per bucket. */
const buildRevenueByHour = (orders: any[]) => {
  const buckets: Record<string, number> = {};
  orders.forEach(o => {
    const h = new Date(o.timestamp).getHours();
    const label = `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? 'AM' : 'PM'}`;
    buckets[label] = (buckets[label] ?? 0) + o.total;
  });
  // Sort chronologically (0-23h)
  return Object.entries(buckets)
    .sort((a, b) => {
      const toH = (s: string) => {
        const n = parseInt(s);
        const pm = s.endsWith('PM');
        return pm ? (n === 12 ? 12 : n + 12) : (n === 12 ? 0 : n);
      };
      return toH(a[0]) - toH(b[0]);
    })
    .map(([time, revenue]) => ({ time, revenue: Math.round(revenue) }));
};

/** Aggregate order items into top-N by quantity sold. */
const buildTopItems = (orders: any[], topN = 6) => {
  const map: Record<string, number> = {};
  orders.forEach(o =>
    o.items.forEach((i: any) => {
      map[i.name] = (map[i.name] ?? 0) + i.quantity;
    })
  );
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([name, qty]) => ({ name, qty }));
};

/** Count orders by status for pie chart. */
const buildStatusBreakdown = (orders: any[]) =>
  Object.entries(
    orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ status, count }));

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyChart: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center justify-center h-[220px] text-gray-400 dark:text-gray-500 text-sm">
    {message}
  </div>
);

// ── Tooltip shared style ──────────────────────────────────────────────────────
const tooltipStyle = {
  backgroundColor: 'var(--color-background-secondary, #f9fafb)',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  color: '#111827',
  fontSize: '13px',
};

// ── Main page ─────────────────────────────────────────────────────────────────
export const VendorAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { orders, user, fetchVendorOrders, getVendorStall } = useApp();

  // Refresh on mount so data is always fresh
  useEffect(() => {
    fetchVendorOrders();
  }, []);

  const vendorStall = getVendorStall();
  const stallId = vendorStall?.id ?? user?.stallId;

  // All orders that belong to this vendor's stall
  const vendorOrders = useMemo(
    () => orders.filter(o => o.stallId === stallId),
    [orders, stallId]
  );

  // ── Derived metrics ────────────────────────────────────────────────────────
  const totalRevenue   = useMemo(() => vendorOrders.reduce((s, o) => s + o.total, 0), [vendorOrders]);
  const totalOrders    = vendorOrders.length;
  const avgOrderValue  = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const completedCount = useMemo(() => vendorOrders.filter(o => o.status === 'completed').length, [vendorOrders]);

  const revenueByHour    = useMemo(() => buildRevenueByHour(vendorOrders),    [vendorOrders]);
  const topItems         = useMemo(() => buildTopItems(vendorOrders),          [vendorOrders]);
  const statusBreakdown  = useMemo(() => buildStatusBreakdown(vendorOrders),  [vendorOrders]);

  const peakHour = revenueByHour.length
    ? revenueByHour.reduce((a, b) => (a.revenue > b.revenue ? a : b)).time
    : null;

  // ── Stat cards ─────────────────────────────────────────────────────────────
  const stats = [
    {
      icon: IndianRupee,
      label: 'Total Revenue',
      value: `₹${totalRevenue.toFixed(2)}`,
      color: 'from-green-500 to-emerald-500',
      sub: `${totalOrders} order${totalOrders !== 1 ? 's' : ''}`,
    },
    {
      icon: Package,
      label: 'Total Orders',
      value: totalOrders,
      color: 'from-blue-500 to-cyan-500',
      sub: `${completedCount} completed`,
    },
    {
      icon: TrendingUp,
      label: 'Avg Order Value',
      value: `₹${avgOrderValue.toFixed(2)}`,
      color: 'from-purple-500 to-pink-500',
      sub: 'per order',
    },
    {
      icon: ShoppingBag,
      label: 'Completion Rate',
      value: totalOrders > 0 ? `${Math.round((completedCount / totalOrders) * 100)}%` : '—',
      color: 'from-orange-500 to-amber-500',
      sub: `${completedCount} of ${totalOrders}`,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 pb-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          onClick={() => navigate('/vendor')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </motion.button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Live data from your {totalOrders} order{totalOrders !== 1 ? 's' : ''}
            {vendorStall ? ` · ${vendorStall.stallName}` : ''}
          </p>
        </motion.div>

        {/* No orders state */}
        {totalOrders === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 mb-8"
          >
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No orders yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-sm">
              Analytics will appear here once customers start placing orders at your stall.
            </p>
          </motion.div>
        )}

        {totalOrders > 0 && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-purple-500/20 transition-colors duration-200"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{stat.sub}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

              {/* Revenue by hour */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-purple-500/20 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Revenue by Hour</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Based on order placement time</p>
                {revenueByHour.length < 2 ? (
                  <EmptyChart message="Need orders across multiple hours to show this chart" />
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={revenueByHour}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(v: number) => [`₹${v}`, 'Revenue']}
                      />
                      <defs>
                        <linearGradient id="revLine" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#22c55e" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="url(#revLine)"
                        strokeWidth={3}
                        dot={{ fill: '#22c55e', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </motion.div>

              {/* Order status breakdown */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-purple-500/20 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Orders by Status</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Current breakdown across all orders</p>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie
                        data={statusBreakdown}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={45}
                      >
                        {statusBreakdown.map((entry) => (
                          <Cell
                            key={entry.status}
                            fill={STATUS_COLORS[entry.status] ?? '#6b7280'}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(v: number, _: any, p: any) => [v, p.payload.status]}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend */}
                  <div className="flex-1 space-y-2.5">
                    {statusBreakdown.map(entry => (
                      <div key={entry.status} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: STATUS_COLORS[entry.status] ?? '#6b7280' }}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                            {entry.status}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {entry.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Top selling items */}
            {topItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-purple-500/20 mb-6 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Top Selling Items</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">By total quantity ordered</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={topItems} layout="vertical" margin={{ left: 8, right: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                    <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#9ca3af"
                      tick={{ fontSize: 12 }}
                      width={110}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(v: number) => [v, 'Units sold']}
                    />
                    <defs>
                      <linearGradient id="itemBar" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                    <Bar dataKey="qty" fill="url(#itemBar)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Peak hour insight */}
            {peakHour && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-green-50 dark:from-green-900/20 to-emerald-50 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700/40 transition-colors duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Peak Hour Insight
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      Your highest revenue hour is{' '}
                      <span className="text-green-700 dark:text-green-400 font-semibold">{peakHour}</span>.
                      Make sure your most popular items are fully stocked and available during this time.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};