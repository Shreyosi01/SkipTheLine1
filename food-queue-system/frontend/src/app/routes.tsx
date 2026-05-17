import { createBrowserRouter, Navigate } from 'react-router';
import { Auth } from './pages/Auth';
import { LandingPage } from './pages/LandingPage';
import { CustomerHome } from './pages/CustomerHome';
import { StallDetail } from './pages/StallDetail';
import { Cart } from './pages/Cart';
import { OrderTracking } from './pages/OrderTracking';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { VendorDashboard } from './pages/VendorDashboard';
import { VendorOrders } from './pages/VendorOrders';
import { VendorQueue } from './pages/VendorQueue';
import { VendorAnalytics } from './pages/VendorAnalytics';
import { Profile } from './pages/Profile';
import { Layout } from './components/Layout';
import { CreateStall } from './pages/CreateStall';
import { Payment } from './pages/Payment';

export const router = createBrowserRouter([
  {
    path: '/auth',
    Component: Auth,
  },
  {
    path: '/',
    Component: LandingPage,
  },
  {
    path: '/welcome',
    element: <Navigate to="/" replace />,
  },
  {
    Component: Layout,
    children: [
      // Customer Routes
      { path: 'dashboard', Component: CustomerHome },
      { path: 'stall/:id', Component: StallDetail },
      { path: 'cart', Component: Cart },
      { path: 'payment', Component: Payment },
      // ✅ confirmation MUST be above order/:id so it isn't caught as id="confirmation"
      { path: 'order/confirmation', Component: OrderConfirmation },
      { path: 'order/:id', Component: OrderTracking },

      // Vendor Routes
      { path: 'vendor', Component: VendorDashboard },
      { path: 'vendor/orders', Component: VendorOrders },
      { path: 'vendor/queue', Component: VendorQueue },
      { path: 'vendor/analytics', Component: VendorAnalytics },
      { path: 'vendor/stall', Component: CreateStall },

      // Profile
      { path: 'profile', Component: Profile },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);