import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { Navbar } from './Navbar';
import { useApp } from '../context/AppContext';
import { Toaster } from 'sonner';
import { useTheme } from 'next-themes';

export const Layout: React.FC = () => {
  const { user, userMode } = useApp();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Redirect based on user mode
    if (user && location.pathname === '/') {
      if (userMode === 'vendor') {
        navigate('/vendor');
      }
    }
  }, [userMode, user, navigate, location.pathname]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      <Outlet />
      <Toaster position="top-right" theme={theme as 'light' | 'dark'} />
    </div>
  );
};