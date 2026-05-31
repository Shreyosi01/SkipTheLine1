import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { Navbar } from './Navbar';
import { useApp } from '../context/AppContext';

export const Layout: React.FC = () => {
  const { user, userMode, isInitializing } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Wait for session restoration to complete before redirecting
  // If isInitializing is true, don't redirect to auth yet — the user might
  // have a valid token being verified by restoreSession() right now.
  useEffect(() => {
    if (!isInitializing && !user) {
      navigate('/');
    }
  }, [user, isInitializing, navigate]);

  useEffect(() => {
    // Redirect based on user mode
    if (user && location.pathname === '/dashboard') {
      if (userMode === 'vendor') {
        navigate('/vendor');
      }
    }
  }, [userMode, user, navigate, location.pathname]);

  // Show nothing while initializing to avoid flashing the login page
  if (isInitializing) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      <Outlet />
    </div>
  );
};