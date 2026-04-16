import React from 'react';
import { motion } from 'motion/react';
import { Users } from 'lucide-react';

interface QueueMeterProps {
  queueLength: number;
  estimatedWait: number;
}

export const QueueMeter: React.FC<QueueMeterProps> = ({ queueLength, estimatedWait }) => {
  const percentage = Math.min((queueLength / 20) * 100, 100);
  const color =
    percentage < 30 ? 'from-green-500 to-emerald-500' : percentage < 70 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-pink-500';

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-purple-500/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Queue Status</h3>
        <Users className="w-5 h-5 text-orange-500 dark:text-purple-400" />
      </div>

      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx="96"
            cy="96"
            r="80"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-gray-300 dark:text-gray-700"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="80"
            stroke="url(#gradient)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDasharray: '502.4', strokeDashoffset: 502.4 }}
            animate={{
              strokeDashoffset: 502.4 - (502.4 * percentage) / 100,
            }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className={`stop-${color.split('-')[1]}-500`} />
              <stop offset="100%" className={`stop-${color.split('-')[3]}-500`} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent"
          >
            {queueLength}
          </motion.div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">people ahead</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400 text-sm">Estimated Wait</span>
          <span className="text-gray-900 dark:text-white font-semibold">{estimatedWait} mins</span>
        </div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
        >
          <motion.div
            className={`h-full bg-gradient-to-r ${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ delay: 0.7, duration: 0.8 }}
          />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-orange-500 dark:text-purple-300"
        >
          Order now & save {estimatedWait} mins!
        </motion.p>
      </div>
    </div>
  );
};