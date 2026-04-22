import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Package, IndianRupee, LogOut, Trash2, Clock, ShoppingBag, TrendingUp, Mail, Edit2, Phone, Store } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

// Mock avatars representing restaurants/shops (for vendors)
const SHOP_AVATARS = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&h=150&fit=crop", 
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=150&h=150&fit=crop", 
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&h=150&fit=crop", 
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&h=150&fit=crop", 
  "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=150&h=150&fit=crop", 
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=150&h=150&fit=crop", 
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&h=150&fit=crop", 
  "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=150&h=150&fit=crop"  
];

// Mock 3D avatars representing users (3 Men: Boy, Young, Middle-aged | 3 Women: Girl, Young, Middle-aged)
const CUSTOMER_AVATARS = [
  // Men
  "https://img.freepik.com/free-psd/3d-illustration-little-boy-with-glasses_23-2149436185.jpg?w=150&h=150&fit=crop", // Young Child (Boy)
  "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg?w=150&h=150&fit=crop", // Young Man
  "https://img.freepik.com/free-psd/3d-illustration-business-man-with-glasses_23-2149436194.jpg?w=150&h=150&fit=crop", // Middle-Aged Man
  // Women
  "https://img.freepik.com/free-psd/3d-illustration-little-girl-with-glasses_23-2149436187.jpg?w=150&h=150&fit=crop", // Young Child (Girl)
  "https://img.freepik.com/free-psd/3d-illustration-person-with-pink-hair_23-2149436186.jpg?w=150&h=150&fit=crop", // Young Woman
  "https://img.freepik.com/free-psd/3d-illustration-business-woman-with-glasses_23-2149436193.jpg?w=150&h=150&fit=crop"  // Middle-Aged Woman
];

export const Profile: React.FC = () => {
  const { user, orders, setUser, userMode, logoutUser } = useApp(); // ADDED logoutUser
  const navigate = useNavigate();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  
  // Extract just the digits for the edit input field
  const initialPhoneDigits = user?.phone?.replace(/\D/g, '').slice(-10) || '';
  
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(initialPhoneDigits);
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');

  if (!user) {
    navigate('/auth');
    return null;
  }

  const userOrders = userMode === 'customer'
    ? orders
    : orders.filter((o) => o.stallId === user.stallId);

  const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
  const completedOrders = userOrders.filter((o) => o.status === 'completed').length;
  const lastOrder = userOrders.length > 0 ? userOrders[userOrders.length - 1] : null;

  const handleLogout = () => {
    logoutUser(); // Call Context logout to clear cart and orders
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  const handleDeleteAccount = () => {
    logoutUser(); // Call Context logout to clear everything
    toast.success('Account deleted successfully');
    navigate('/auth');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Ensure only numbers
    if (value.length <= 10) {
      setEditPhone(value);
    }
  };

  // Cleanly display phone with +91 format internally to compare
  const displayPhone = user.phone ? user.phone.replace(/\D/g, '').slice(-10) : '';

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Phone Number Length
    if (editPhone && editPhone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    const hasChanges = 
      editName !== user.name || 
      editEmail !== user.email || 
      editPhone !== displayPhone ||
      editAvatar !== (user.avatar || '');

    if (!hasChanges) {
      toast.info('No changes detected');
      setShowEditProfile(false);
      return;
    }

    setUser({
      ...user,
      name: editName,
      email: editEmail,
      phone: editPhone ? `+91${editPhone}` : '', // Append +91 back to save it cleanly
      avatar: editAvatar,
    });

    toast.success('Profile updated successfully');
    setShowEditProfile(false);
  };

  const stats = userMode === 'customer' ? [
    {
      icon: Package,
      label: 'Total Orders',
      value: userOrders.length,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: IndianRupee,
      label: 'Money Spent',
      value: `₹${totalSpent.toFixed(2)}`,
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: ShoppingBag,
      label: 'Completed Orders',
      value: completedOrders,
      color: 'from-purple-500 to-pink-500',
    },
  ] : [
    {
      icon: Package,
      label: 'Total Orders',
      value: userOrders.length,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: IndianRupee,
      label: 'Revenue Generated',
      value: `₹${totalSpent.toFixed(2)}`,
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: TrendingUp,
      label: 'Completed Orders',
      value: completedOrders,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const avatarsToDisplay = userMode === 'vendor' ? SHOP_AVATARS : CUSTOMER_AVATARS;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 pb-12 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`bg-gradient-to-br ${
            userMode === 'customer'
              ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-500/30'
              : 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-500/30'
          } backdrop-blur-sm rounded-xl p-8 border mb-8`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden shrink-0 border-4 border-white dark:border-gray-800"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover bg-white" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{user.name}</h2>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  {displayPhone && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4" />
                      <span>+91 {displayPhone}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-green-500/20 text-green-600 dark:text-green-400">
                  {userMode === 'customer' ? <User className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                  {userMode === 'customer' ? 'Customer' : 'Vendor'}
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditName(user.name);
                setEditEmail(user.email);
                setEditPhone(displayPhone);
                setEditAvatar(user.avatar || '');
                setShowEditProfile(true);
              }}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
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

        {/* Last Order Section */}
        {lastOrder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-purple-500/20 mb-8"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Last Order</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${
                  userMode === 'customer' ? 'from-blue-500 to-cyan-500' : 'from-blue-500 to-cyan-500'
                } flex items-center justify-center text-white font-bold`}>
                  {lastOrder.token}
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-semibold">{lastOrder.stallName}</p>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(lastOrder.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{lastOrder.total.toFixed(2)}</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    lastOrder.status === 'placed'
                      ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                      : lastOrder.status === 'preparing'
                      ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                      : lastOrder.status === 'ready'
                      ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                      : 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                  }`}
                >
                  {lastOrder.status}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-purple-500/20 mb-8"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          {userOrders.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {userOrders.slice(-5).reverse().map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${
                      userMode === 'customer' ? 'from-blue-500 to-cyan-500' : 'from-blue-500 to-cyan-500'
                    } flex items-center justify-center text-white text-xs font-bold`}>
                      {order.token}
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white text-sm font-semibold">
                        {order.stallName} - {order.items.length} items
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">
                        {new Date(order.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-900 dark:text-white font-semibold">₹{order.total.toFixed(2)}</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-gray-500/50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-red-500/50 transition-all"
          >
            <Trash2 className="w-5 h-5" />
            Delete Account
          </motion.button>
        </motion.div>

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditProfile(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full border border-gray-200 dark:border-purple-500/20 overflow-y-auto max-h-[90vh]"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Profile</h3>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {/* Avatar Selection Based on Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {userMode === 'vendor' ? 'Shop Avatar' : 'Profile Avatar'}
                  </label>
                  <div className={`grid gap-3 mb-4 ${userMode === 'vendor' ? 'grid-cols-4 sm:grid-cols-4' : 'grid-cols-3 sm:grid-cols-3'}`}>
                    {avatarsToDisplay.map((avatarUrl, index) => (
                      <div 
                        key={index}
                        onClick={() => setEditAvatar(avatarUrl)}
                        className={`relative aspect-square cursor-pointer rounded-xl overflow-hidden border-2 bg-gray-50 dark:bg-gray-700 transition-all duration-200 ${
                          editAvatar === avatarUrl 
                            ? 'border-green-500 scale-105 shadow-md shadow-green-500/20 z-10' 
                            : 'border-transparent hover:scale-105 hover:opacity-90'
                        }`}
                      >
                        <img 
                          src={avatarUrl} 
                          alt={`Avatar option ${index + 1}`} 
                          className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {userMode === 'vendor' ? 'Shop Name' : 'Name'}
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-600 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg text-gray-700 dark:text-gray-300 font-semibold select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={handlePhoneChange}
                      placeholder="10-digit number"
                      maxLength={10}
                      className="flex-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowEditProfile(false);
                      setEditName(user.name);
                      setEditEmail(user.email);
                      setEditPhone(displayPhone);
                      setEditAvatar(user.avatar || '');
                    }}
                    className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-lg"
                  >
                    Save Changes
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-200 dark:border-purple-500/20"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Delete Account?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteAccount}
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg shadow-lg"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};