import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, TrendingUp, DollarSign, Package, Clock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const VendorAnalytics: React.FC = () => {
  const navigate = useNavigate();

  // Mock data for charts
  const revenueData = [
    { time: '9AM', revenue: 120 },
    { time: '10AM', revenue: 280 },
    { time: '11AM', revenue: 450 },
    { time: '12PM', revenue: 680 },
    { time: '1PM', revenue: 920 },
    { time: '2PM', revenue: 750 },
    { time: '3PM', revenue: 580 },
    { time: '4PM', revenue: 420 },
  ];

  const ordersPerHour = [
    { hour: '9AM', orders: 12 },
    { hour: '10AM', orders: 28 },
    { hour: '11AM', orders: 45 },
    { hour: '12PM', orders: 68 },
    { hour: '1PM', orders: 82 },
    { hour: '2PM', orders: 65 },
    { hour: '3PM', orders: 48 },
    { hour: '4PM', orders: 32 },
  ];

  const categoryData = [
    { name: 'Burgers', value: 35, color: '#f97316' },
    { name: 'Pizza', value: 25, color: '#ef4444' },
    { name: 'Tacos', value: 20, color: '#a855f7' },
    { name: 'Sushi', value: 15, color: '#3b82f6' },
    { name: 'Other', value: 5, color: '#6b7280' },
  ];

  const stats = [
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: '₹24,250',
      change: '+12.5%',
      positive: true,
    },
    {
      icon: Package,
      label: 'Total Orders',
      value: '380',
      change: '+8.2%',
      positive: true,
    },
    {
      icon: Clock,
      label: 'Avg Wait Time',
      value: '12 min',
      change: '-5.3%',
      positive: true,
    },
    {
      icon: TrendingUp,
      label: 'Customer Satisfaction',
      value: '4.8/5',
      change: '+0.3',
      positive: true,
    },
  ];

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
          <h1 className="text-4xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-gray-400">Track your performance and insights</p>
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
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8 text-purple-400" />
                  <span
                    className={`text-sm font-semibold ${
                      stat.positive ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Revenue Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #6b21a8',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="url(#colorRevenue)"
                  strokeWidth={3}
                  dot={{ fill: '#f97316', r: 4 }}
                />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Orders Per Hour */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Orders Per Hour</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ordersPerHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #6b21a8',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="orders" fill="url(#colorOrders)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Popular Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #6b21a8',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-4">
              {categoryData.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-gray-300">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-white font-semibold">{category.value}%</span>
                    <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${category.value}%` }}
                        transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                        className="h-full"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Peak Hours Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-xl p-6 border border-green-500/30"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Peak Hours Insight</h3>
              <p className="text-gray-300">
                Your busiest hours are between <span className="text-green-400 font-semibold">12PM - 2PM</span>.
                Consider adding extra staff during this time to reduce wait times and improve customer satisfaction.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
