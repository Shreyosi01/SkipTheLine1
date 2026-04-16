import React from 'react';
import { motion } from 'motion/react';
import { Star, Clock, Users } from 'lucide-react';
import { Link } from 'react-router';
import { Stall } from '../data/mockData';

interface FoodCardProps {
  stall: Stall;
  index: number;
}

export const FoodCard: React.FC<FoodCardProps> = ({ stall, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, rotateX: 5 }}
      className="group relative"
    >
      <Link to={`/stall/${stall.id}`}>
        <div className="relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-200 dark:border-purple-500/20 hover:border-blue-300 dark:hover:border-cyan-500/50 transition-all duration-300 shadow-sm hover:shadow-lg dark:shadow-none">
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <motion.img
              src={stall.image}
              alt={stall.name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.4 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-900 via-white/50 dark:via-gray-900/50 to-transparent" />
            
            {/* Category Badge */}
            <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-xs font-semibold text-white">
              {stall.category}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                {stall.name}
              </h3>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-gray-900 dark:text-white font-semibold text-sm">{stall.rating}</span>
              </div>
            </div>

            {/* Queue Info */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>{stall.queueLength} in queue</span>
              </div>
              <div className="flex items-center gap-2 text-blue-500 dark:text-cyan-400">
                <Clock className="w-4 h-4" />
                <span>{stall.estimatedWait} mins</span>
              </div>
            </div>

            {/* Animated Queue Dots */}
            <div className="flex items-center gap-1 pt-2">
              {[...Array(Math.min(stall.queueLength, 10))].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                />
              ))}
              {stall.queueLength > 10 && (
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">+{stall.queueLength - 10}</span>
              )}
            </div>
          </div>

          {/* Glow Effect on Hover */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.1), transparent 70%)',
            }}
          />
        </div>
      </Link>
    </motion.div>
  );
};