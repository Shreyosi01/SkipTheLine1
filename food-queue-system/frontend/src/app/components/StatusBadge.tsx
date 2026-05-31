import React from 'react';
import { motion } from 'motion/react';
import { Clock, ChefHat, CheckCircle, Package } from 'lucide-react';

interface StatusBadgeProps {
  status: 'placed' | 'preparing' | 'ready' | 'completed';
}

const statusConfig = {
  placed: {
    icon: Clock,
    label: 'Order Placed',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50',
  },
  preparing: {
    icon: ChefHat,
    label: 'Preparing',
    color: 'from-yellow-500 to-orange-500',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/50',
  },
  ready: {
    icon: Package,
    label: 'Ready for Pickup',
    color: 'from-green-500 to-emerald-500',
    bg: 'bg-green-500/20',
    border: 'border-green-500/50',
  },
  completed: {
    icon: CheckCircle,
    label: 'Completed',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/50',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.bg} border ${config.border} backdrop-blur-sm`}
    >
      <motion.div
        animate={{ rotate: status === 'preparing' ? 360 : 0 }}
        transition={{ duration: 2, repeat: status === 'preparing' ? Infinity : 0 }}
      >
        <Icon className={`w-4 h-4 bg-gradient-to-r ${config.color} bg-clip-text text-transparent`} style={{ fill: 'url(#iconGradient)' }} />
      </motion.div>
      <span className={`text-sm font-semibold bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
        {config.label}
      </span>
    </motion.div>
  );
};
