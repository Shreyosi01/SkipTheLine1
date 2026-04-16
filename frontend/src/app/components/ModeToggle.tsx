import React from 'react';
import { motion } from 'motion/react';
import { UserMode } from '../context/AppContext';

interface ModeToggleProps {
  mode: UserMode;
  onToggle: (mode: UserMode) => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onToggle }) => {
  return (
    <div className="relative inline-flex items-center bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm p-1 rounded-full border border-purple-500/30">
      <motion.div
        className="absolute inset-y-1 w-[calc(50%-4px)] bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg"
        animate={{
          x: mode === 'customer' ? 2 : '100%',
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      />
      <button
        onClick={() => onToggle('customer')}
        className={`relative z-10 px-6 py-2 rounded-full transition-colors ${
          mode === 'customer' ? 'text-white' : 'text-gray-400'
        }`}
      >
        Customer
      </button>
      <button
        onClick={() => onToggle('vendor')}
        className={`relative z-10 px-6 py-2 rounded-full transition-colors ${
          mode === 'vendor' ? 'text-white' : 'text-gray-400'
        }`}
      >
        Vendor
      </button>
    </div>
  );
};
