import React from 'react';
import { motion } from 'motion/react';
import { Users } from 'lucide-react';

interface QueueMeterProps {
  queueLength: number;
  estimatedWait: number; // ✅ was string "~15" in old StallDetail — now correctly number
  connectionMode?: 'sse' | 'polling' | 'idle';
}

export const QueueMeter: React.FC<QueueMeterProps> = ({
  queueLength,
  estimatedWait,
  connectionMode = 'idle',
}) => {
  const percentage = Math.min((queueLength / 20) * 100, 100);

  const dotColor =
    connectionMode === 'sse' ? 'bg-green-400'
    : connectionMode === 'polling' ? 'bg-yellow-400'
    : 'bg-gray-400';

  const headerLabel =
    connectionMode === 'sse' ? 'Queue Status · Live'
    : connectionMode === 'polling' ? 'Queue Status · Updating'
    : 'Queue Status';

  // ✅ SVG stop colors — Tailwind class interpolation doesn't work at runtime
  const stopStart =
    percentage < 30 ? '#22c55e' : percentage < 70 ? '#eab308' : '#ef4444';
  const stopEnd =
    percentage < 30 ? '#10b981' : percentage < 70 ? '#f97316' : '#ec4899';

  const barColor =
    percentage < 30 ? 'from-green-500 to-emerald-500'
    : percentage < 70 ? 'from-yellow-500 to-orange-500'
    : 'from-red-500 to-pink-500';

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-purple-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {headerLabel}
          </h3>
          {connectionMode !== 'idle' && (
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
            </span>
          )}
        </div>
        <Users className="w-5 h-5 text-orange-500 dark:text-purple-400" />
      </div>

      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="transform -rotate-90 w-full h-full">
          <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12"
            fill="none" className="text-gray-300 dark:text-gray-700" />
          <motion.circle
            cx="96" cy="96" r="80"
            stroke="url(#queueGradient)"
            strokeWidth="12" fill="none" strokeLinecap="round"
            initial={{ strokeDasharray: '502.4', strokeDashoffset: 502.4 }}
            animate={{ strokeDashoffset: 502.4 - (502.4 * percentage) / 100 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="queueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={stopStart} />
              <stop offset="100%" stopColor={stopEnd} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            key={queueLength}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
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
          <motion.span
            key={estimatedWait}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-900 dark:text-white font-semibold"
          >
            {estimatedWait} mins
          </motion.span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${barColor}`}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-orange-500 dark:text-purple-300"
        >
          {estimatedWait > 0 ? `Order now & save ${estimatedWait} mins!` : 'No queue right now — order instantly!'}
        </motion.p>
      </div>
    </div>
  );
};