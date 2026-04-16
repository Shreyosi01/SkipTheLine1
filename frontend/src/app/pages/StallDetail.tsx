import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Star } from 'lucide-react';
import { mockStalls } from '../data/mockData';
import { QueueMeter } from '../components/QueueMeter';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export const StallDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useApp();

  const stall = mockStalls.find((s) => s.id === id);

  if (!stall) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 flex items-center justify-center transition-colors duration-200">
        <p className="text-gray-900 dark:text-white text-xl">Stall not found</p>
      </div>
    );
  }

  const handleAddToCart = (item: typeof stall.menu[0]) => {
    addToCart({
      id: item.id,
      stallId: stall.id,
      name: item.name,
      price: item.price,
      quantity: 1,
    });
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20 pb-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Stalls</span>
        </motion.button>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-96 rounded-2xl overflow-hidden mb-8"
        >
          <img src={stall.image} alt={stall.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-900 via-white/70 dark:via-gray-900/70 to-transparent" />
          
          {/* Stall Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-end justify-between">
              <div>
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-sm font-semibold text-white mb-3">
                  {stall.category}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">{stall.name}</h1>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-gray-900 dark:text-white font-semibold">{stall.rating}</span>
                  <span className="text-gray-700 dark:text-gray-300 ml-2">({Math.floor(Math.random() * 500 + 100)} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2 space-y-6">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-3xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Menu
            </motion.h2>

            {stall.menu.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-200 dark:border-purple-500/20 hover:border-blue-300 dark:hover:border-cyan-500/50 transition-all"
              >
                <div className="flex gap-4 p-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{item.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        ₹{item.price.toFixed(2)}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddToCart(item)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        Add to Cart
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Queue Meter Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <QueueMeter queueLength={stall.queueLength} estimatedWait={stall.estimatedWait} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};