import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Sparkles, Sun, Moon } from 'lucide-react';
import { useApp, UserMode } from '../context/AppContext';
import { useNavigate } from 'react-router';
import { ModeToggle } from '../components/ModeToggle';
import { useTheme } from 'next-themes';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedMode, setSelectedMode] = useState<UserMode>('customer');
  const { setUser, setUserMode } = useApp();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      name: isLogin ? email.split('@')[0] : name,
      email,
      mode: selectedMode,
      // Assign vendor to a stall - in a real app, this would be based on their registration/assignment
      stallId: selectedMode === 'vendor' ? '1' : undefined,
    };
    setUser(user);
    setUserMode(selectedMode);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Theme Toggle - Top Right */}
      {mounted && (
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="fixed top-6 right-6 z-50 p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </motion.button>
      )}

      {/* Left Side - Animated Illustration */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`hidden lg:flex lg:w-1/2 ${
          selectedMode === 'customer'
            ? 'bg-gradient-to-br from-blue-600 via-cyan-600 to-indigo-700'
            : 'bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700'
        } relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1763619814380-1637cdf5f796?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjB3YWl0aW5nJTIwcXVldWUlMjBsaW5lfGVufDF8fHx8MTc3NTMyNzk0NHww&ixlib=rb-4.1.0&q=80&w=1080')] bg-cover bg-center opacity-20" />
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <motion.div
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="mb-8"
          >
            <div className="w-32 h-32 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center border-4 border-white/30">
              <Sparkles className="w-16 h-16" />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold mb-4 text-center"
          >
            Skip the Line,
            <br />
            Savor the Time
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-center text-white/80 max-w-md"
          >
            Order digitally, track in real-time, and never wait in a queue again.
          </motion.p>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-900 transition-colors duration-200">
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-2xl ${
              selectedMode === 'customer'
                ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                : 'bg-gradient-to-br from-green-500 to-emerald-500'
            }`}>
              Q
            </div>
            <span className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
              selectedMode === 'customer'
                ? 'from-blue-400 to-cyan-400'
                : 'from-green-400 to-emerald-400'
            }`}>
              QueueSkip
            </span>
          </div>

          {/* Tab Toggle */}
          <div className="flex mb-8 bg-gray-100 dark:bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-md font-semibold transition-all ${
                isLogin
                  ? selectedMode === 'customer'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-md font-semibold transition-all ${
                !isLogin
                  ? selectedMode === 'customer'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="mb-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">Select your mode</p>
            <div className="flex justify-center">
              <ModeToggle mode={selectedMode} onToggle={setSelectedMode} />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative"
                >
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    required={!isLogin}
                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-purple-500/30 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none transition-all ${
                      selectedMode === 'customer'
                        ? 'focus:border-blue-500 dark:focus:border-cyan-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-500/20'
                        : 'focus:border-green-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-green-500/20 dark:focus:ring-emerald-500/20'
                    }`}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                className={`w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-purple-500/30 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none transition-all ${
                  selectedMode === 'customer'
                    ? 'focus:border-blue-500 dark:focus:border-cyan-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-500/20'
                    : 'focus:border-green-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-green-500/20 dark:focus:ring-emerald-500/20'
                }`}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className={`w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-purple-500/30 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none transition-all ${
                  selectedMode === 'customer'
                    ? 'focus:border-blue-500 dark:focus:border-cyan-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-500/20'
                    : 'focus:border-green-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-green-500/20 dark:focus:ring-emerald-500/20'
                }`}
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{
                scale: 1.02,
                boxShadow: selectedMode === 'customer'
                  ? '0 0 30px rgba(59, 130, 246, 0.5)'
                  : '0 0 30px rgba(34, 197, 94, 0.5)'
              }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 text-white font-bold rounded-lg shadow-lg transition-all ${
                selectedMode === 'customer'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-blue-500/50'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-green-500/50'
              }`}
            >
              {isLogin ? 'Login' : 'Get Started'}
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm"
          >
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className={`font-semibold ${
                selectedMode === 'customer'
                  ? 'text-blue-500 hover:text-blue-400'
                  : 'text-green-500 hover:text-green-400'
              }`}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};