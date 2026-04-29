import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Store,
  Plus,
  Trash2,
  ChevronRight,
  IndianRupee,
  FileText,
  Tag,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Image,
} from 'lucide-react';
import { useApp, StallItem } from '../context/AppContext';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

// ✅ Stall avatar options — same set as Profile used to show vendors
const SHOP_AVATARS = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=150&h=150&fit=crop",
];

const generateId = () => `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const emptyItem = (): StallItem => ({
  id: generateId(),
  name: '',
  price: 0,
  description: '',
});

export const CreateStall: React.FC = () => {
  const { createStall, updateStall, getVendorStall, user, isLoading } = useApp();
  const navigate = useNavigate();

  const existingStall = getVendorStall();
  const isEditing = !!existingStall;

  const [stallName, setStallName] = useState(existingStall?.stallName ?? '');
  const [items, setItems] = useState<StallItem[]>(
    existingStall?.items.length ? existingStall.items : [emptyItem()]
  );
  // ✅ Initialise avatar from existing stall image or user avatar
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    existingStall?.image || user?.avatar || ''
  );
  const [submitted, setSubmitted] = useState(false);
  const [focusedItem, setFocusedItem] = useState<string | null>(null);

  useEffect(() => {
    if (existingStall) {
      setStallName(existingStall.stallName);
      setItems(existingStall.items.length ? existingStall.items : [emptyItem()]);
      setSelectedAvatar(existingStall.image || user?.avatar || '');
    }
  }, [existingStall?.id]);

  const addItem = () => {
    const newItem = emptyItem();
    setItems((prev) => [...prev, newItem]);
    setFocusedItem(newItem.id);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) {
      toast.error('You need at least one item');
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof StallItem, value: string | number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stallName.trim()) {
      toast.error('Please enter a stall name');
      return;
    }
    const validItems = items.filter((i) => i.name.trim() && i.price > 0);
    if (validItems.length === 0) {
      toast.error('Add at least one item with a name and price');
      return;
    }
    try {
      if (isEditing && existingStall) {
        // ✅ Pass selectedAvatar as the 5th argument
        await updateStall(existingStall.id, stallName.trim(), validItems, 'snacks', selectedAvatar);
        toast.success('Stall updated successfully!');
      } else {
        // ✅ Pass selectedAvatar as the 4th argument
        await createStall(stallName.trim(), validItems, 'snacks', selectedAvatar);
        toast.success('Stall created successfully!');
      }
      setSubmitted(true);
      setTimeout(() => navigate('/vendor'), 1800);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.6, repeat: 1 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/40"
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isEditing ? 'Stall Updated!' : 'Stall Created!'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Redirecting to your dashboard…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-16 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/vendor')}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </motion.button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
              {isEditing ? <Edit3 className="w-7 h-7 text-white" /> : <Store className="w-7 h-7 text-white" />}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Your Stall' : 'Create Your Stall'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                {isEditing
                  ? 'Update your stall details — changes reflect instantly everywhere'
                  : 'Set up your stall with items and pricing to start accepting orders'}
              </p>
            </div>
          </div>

          {isEditing && existingStall && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl px-4 py-3"
            >
              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-amber-700 dark:text-amber-400 text-sm">
                Last updated: {new Date(existingStall.updatedAt).toLocaleString()}
              </p>
              <span className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                existingStall.status === 'new'
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                  : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
              }`}>
                {existingStall.status === 'new' ? '🆕 New' : '🔄 Updated'}
              </span>
            </motion.div>
          )}
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ✅ NEW: Stall Avatar Picker */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white dark:bg-gray-800/60 rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-sm"
          >
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
              <Image className="w-4 h-4 text-green-500" />
              Stall Photo
              <span className="text-gray-400 dark:text-gray-500 font-normal text-xs ml-1">(optional — shown as the stall background)</span>
            </label>

            {/* Preview strip showing currently selected image */}
            {selectedAvatar && (
              <div className="mb-4 flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700/40">
                <img
                  src={selectedAvatar}
                  alt="Selected stall"
                  className="w-14 h-14 rounded-lg object-cover border-2 border-green-400"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400">Photo selected</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">This will appear as your stall banner on the home page</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAvatar('')}
                  className="text-xs text-red-500 hover:text-red-600 font-medium flex-shrink-0"
                >
                  Remove
                </button>
              </div>
            )}

            <div className="grid grid-cols-4 gap-3">
              {SHOP_AVATARS.map((avatarUrl, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedAvatar(avatarUrl)}
                  className={`relative aspect-square cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    selectedAvatar === avatarUrl
                      ? 'border-green-500 ring-2 ring-green-500/30 shadow-md shadow-green-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
                  }`}
                >
                  <img
                    src={avatarUrl}
                    alt={`Stall photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Tick badge on selected */}
                  {selectedAvatar === avatarUrl && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stall Name */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800/60 rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-sm"
          >
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Store className="w-4 h-4 text-green-500" />
              Stall Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={stallName}
              onChange={(e) => setStallName(e.target.value)}
              placeholder="e.g. Raj's Chaat Corner"
              className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-lg font-medium"
            />
          </motion.div>

          {/* Items Section */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-green-500" />
                Menu Items
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`bg-white dark:bg-gray-800/60 rounded-2xl border transition-all shadow-sm ${
                      focusedItem === item.id
                        ? 'border-green-400 dark:border-green-500/60 ring-2 ring-green-500/15'
                        : 'border-gray-200 dark:border-gray-700/50'
                    }`}
                    onFocus={() => setFocusedItem(item.id)}
                    onBlur={() => setFocusedItem(null)}
                  >
                    <div className="flex items-center justify-between px-5 pt-4 pb-2">
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        Item {index + 1}
                      </span>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeItem(item.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>

                    <div className="px-5 pb-5 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                            placeholder="Item name (e.g. Pani Puri)"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                          />
                        </div>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            value={item.price || ''}
                            onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="Price"
                            min="0"
                            step="0.5"
                            className="w-full pl-9 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <FileText className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={item.description ?? ''}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Short description (optional)"
                          className="w-full pl-9 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-sm"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <motion.button
                type="button"
                onClick={addItem}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-green-400 hover:text-green-600 dark:hover:border-green-500 dark:hover:text-green-400 flex items-center justify-center gap-2 transition-all group"
              >
                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Add Another Item</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(34, 197, 94, 0.45)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-green-500/25 flex items-center justify-center gap-3 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full"
                  />
                  {isEditing ? 'Updating…' : 'Creating…'}
                </>
              ) : (
                <>
                  {isEditing ? <Edit3 className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  {isEditing ? 'Update Stall' : 'Create Stall'}
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};