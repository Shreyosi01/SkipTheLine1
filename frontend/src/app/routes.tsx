import { createBrowserRouter, Navigate } from 'react-router';
import { Auth } from './pages/Auth';
import { CustomerHome } from './pages/CustomerHome';
import { StallDetail } from './pages/StallDetail';
import { Cart } from './pages/Cart';
import { OrderTracking } from './pages/OrderTracking';
import { VendorDashboard } from './pages/VendorDashboard';
import { VendorOrders } from './pages/VendorOrders';
import { VendorQueue } from './pages/VendorQueue';
import { VendorAnalytics } from './pages/VendorAnalytics';
import { Profile } from './pages/Profile';
import { Layout } from './components/Layout';

export const router = createBrowserRouter([
  {
    path: '/auth',
    Component: Auth,
  },
  {
    path: '/',
    Component: Layout,
    children: [
      // Customer Routes
      { index: true, Component: CustomerHome },
      { path: 'stall/:id', Component: StallDetail },
      { path: 'cart', Component: Cart },
      { path: 'order/:id', Component: OrderTracking },

      // Vendor Routes
      { path: 'vendor', Component: VendorDashboard },
      { path: 'vendor/orders', Component: VendorOrders },
      { path: 'vendor/queue', Component: VendorQueue },
      { path: 'vendor/analytics', Component: VendorAnalytics },

      // Profile
      { path: 'profile', Component: Profile },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
