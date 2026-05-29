import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react';
import { usePageVisibility } from '../hooks/usePageVisibility';
import { api } from '../../api/client';
import { toast } from 'sonner';


export type UserMode = 'customer' | 'vendor';
export type OrderStatus = 'placed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  mode: UserMode;
  stallId?: string;
  phone?: string;
  avatar?: string;
}

export interface CartItem {
  id: string;
  stallId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface StallItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  isAvailable?: boolean; // ✅ NEW: whether this item is currently in stock
}

export interface Stall {
  id: string;
  vendorId: string;
  stallName: string;
  items: StallItem[];
  updatedAt: string;
  status: 'new' | 'updated';
  image?: string;
  category?: string;
  isOpen?: boolean; // ✅ NEW: whether the stall is currently accepting orders
  upiId?: string;
  qrCodeUrl?: string;
}

export interface Order {
  id: string;
  stallId: string;
  stallName: string;
  items: OrderItem[];
  total: number;
  token: string;
  status: OrderStatus;
  paymentMode?: 'upi' | 'counter';
  paymentStatus?: 'paid' | 'pending';
  estimatedTime: number;
  timestamp: Date;
}

interface AppContextType {
  user: User | null;
  userMode: UserMode;
  cart: CartItem[];
  orders: Order[]; // full list (active + completed + cancelled)
  completedOrders: Order[];
  cancelledOrders: Order[];
  isLoading: boolean;
  isInitializing: boolean;
  stalls: Stall[];
  createStall: (name: string, items: StallItem[], category?: string, avatar?: string, upiId?: string, qrCodeUrl?: string) => Promise<void>;
  updateStall: (id: string, name: string, items: StallItem[], category?: string, avatar?: string, upiId?: string, qrCodeUrl?: string) => Promise<void>;
  getVendorStall: () => Stall | undefined;
  setUser: (user: User | null) => void;
  setUserMode: (mode: UserMode) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateCartItemQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updatePaymentStatus: (id: string, status: 'paid' | 'pending') => void;
  loginUser: (email: string, password: string) => Promise<User>;
  registerUser: (
    name: string,
    email: string,
    password: string,
    role: UserMode,
    stallId?: number,
    phone?: string
  ) => Promise<void>;
  logoutUser: () => void;
  deleteUser: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string; phone?: string; avatar?: string }) => Promise<void>;
  fetchMyOrders: () => Promise<void>;
  fetchVendorOrders: () => Promise<void>;
  fetchStalls: (forceRefresh?: boolean) => Promise<Stall[]>;
}
const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Vendor avatar persistence ─────────────────────────────────────────────
const VENDOR_AVATARS_KEY = 'vendorAvatars';

const getStoredVendorAvatars = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(VENDOR_AVATARS_KEY) || '{}');
  } catch {
    return {};
  }
};

const persistVendorAvatar = (vendorId: string, avatar: string) => {
  if (!avatar) return;
  const map = getStoredVendorAvatars();
  map[vendorId] = avatar;
  localStorage.setItem(VENDOR_AVATARS_KEY, JSON.stringify(map));
};
// ───────────────────────────────────────────────────────────────────────────

// ✅ UPDATED: now maps is_open from the API response onto the Stall object,
// and maps is_available from each menu item onto StallItem.
const mapStall = (s: any, menuItems?: any[]): Stall => ({
  id: String(s.id),
  vendorId: String(s.owner_id),
  stallName: s.name,
  category: s.category,
  isOpen: s.is_open ?? true, // ✅ default true so existing stalls appear open
  upiId: s.upi_id || undefined,
  qrCodeUrl: s.qr_code_url || undefined,
  items: (menuItems || []).map((i: any) => ({
    id: String(i.id),
    name: i.name,
    price: i.price,
    description: i.description,
    isAvailable: i.is_available ?? true, // ✅ default true for safety
  })),
  updatedAt: s.updated_at || new Date().toISOString(),
  status: s.is_updated ? ('updated' as const) : ('new' as const),
  image: s.avatar || s.image_url || undefined,
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [userMode, setUserMode] = useState<UserMode>('customer');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]); // active orders only
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [cancelledOrders, setCancelledOrders] = useState<Order[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const stallsRef = React.useRef<Stall[]>([]);
  const isVisible = usePageVisibility();
  const prevOrdersRef = React.useRef<Order[]>([]);

  useEffect(() => { stallsRef.current = stalls; }, [stalls]);

  const determineActiveRole = (): UserMode => {
    const path = window.location.pathname;
    if (path.startsWith('/vendor')) {
      return 'vendor';
    }
    if (
      path.startsWith('/dashboard') ||
      path.startsWith('/stall') ||
      path.startsWith('/cart') ||
      path.startsWith('/payment') ||
      path.startsWith('/order')
    ) {
      return 'customer';
    }
    const sessionRole = sessionStorage.getItem('active_role') as UserMode | null;
    if (sessionRole) return sessionRole;

    const vendorToken = localStorage.getItem('vendor_token');
    const customerToken = localStorage.getItem('customer_token');
    if (vendorToken && !customerToken) return 'vendor';
    if (customerToken && !vendorToken) return 'customer';

    return 'customer';
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const initApp = async () => {
      try {
        await Promise.all([fetchStalls(), restoreSession()]);
      } finally {
        setIsInitializing(false);
      }
    };
    initApp();
  }, []);

  // Background polling coordinator – respects page visibility
  useEffect(() => {
    if (!user) return;
    // isVisible obtained from hook at component level

    const startPolling = (fn: () => void, intervalMs: number) => {
      if (!isVisible) return () => {};
      fn(); // immediate fetch
      const id = setInterval(() => {
        if (isVisible) fn();
      }, intervalMs);
      return () => clearInterval(id);
    };

    const stopOrders = startPolling(() => {
      if (userMode === 'vendor') {
        fetchVendorOrders().catch(() => {});
      } else {
        fetchMyOrders().catch(() => {});
      }
    }, 8000); // 8 seconds

    const stopStalls = startPolling(() => {
      fetchStalls().catch(() => {});
    }, 30000); // 30 seconds

    return () => {
      stopOrders();
      stopStalls();
    };
  }, [user?.id, userMode]);


  const restoreSession = async () => {
    const activeRole = determineActiveRole();
    sessionStorage.setItem('active_role', activeRole);

    const savedToken = localStorage.getItem(`${activeRole}_token`);
    const savedUser  = localStorage.getItem(`${activeRole}_user`);
    if (!savedToken || !savedUser) return;

    try {
      const freshUser = await api.getMe();

      let localAvatar: string | undefined;
      try { localAvatar = JSON.parse(savedUser)?.avatar; } catch { /* ignore */ }

      const u: User = {
        id: String(freshUser.id),
        name: freshUser.name,
        email: freshUser.email,
        mode: freshUser.role as UserMode,
        stallId: freshUser.stall_id != null ? String(freshUser.stall_id) : undefined,
        phone: freshUser.phone,
        avatar: localAvatar,
      };

      if (u.mode === 'vendor' && u.avatar) {
        persistVendorAvatar(u.id, u.avatar);
      }

      setUserState(u);
      setUserMode(u.mode);
      localStorage.setItem(`${activeRole}_user`, JSON.stringify(u));

      if (u.mode === 'vendor') {
        api.vendorOrders()
          .then(res => { if (Array.isArray(res)) mapAndSetOrders(res); })
          .catch(err => console.error('Auto-fetch vendor orders failed:', err));
      } else {
        api.myOrders()
          .then(res => { if (Array.isArray(res)) mapAndSetOrders(res); })
          .catch(err => console.error('Auto-fetch orders failed:', err));
      }
    } catch (err) {
      console.warn('Session restore failed — clearing role session:', err);
      localStorage.removeItem(`${activeRole}_user`);
      localStorage.removeItem(`${activeRole}_token`);
    }
  };


  const menuCache = React.useRef<Record<string, StallItem[]>>({});

  const fetchStalls = async (forceRefresh = false): Promise<Stall[]> => {
    try {
      // Reset menu cache on forced refresh to avoid stale menu items
      if (forceRefresh) {
        menuCache.current = {};
      }
      const res = await api.listStalls(forceRefresh ? { noCache: true } : {});
      if (!Array.isArray(res)) return [];

      const vendorAvatars = getStoredVendorAvatars();

      const stallsWithMenus = await Promise.all(
        res.map(async (s: any) => {
          try {
            // Determine whether to use cached menu or fetch fresh data
            let menuItems: any[] = [];
            if (!forceRefresh && menuCache.current[s.id]) {
              // Use cached menu when not forcing refresh
              menuItems = menuCache.current[s.id];
            } else {
              // Always fetch fresh menu data when forceRefresh is true or cache miss
              const menu = await api.getMenu(s.id);
              menuItems = Array.isArray(menu) ? menu : [];
              // Update cache with the new data
              menuCache.current[s.id] = menuItems;
            }
            const stall = mapStall(s, menuItems);
            const localAvatar = vendorAvatars[String(s.owner_id)];
            return { ...stall, image: stall.image || localAvatar || undefined };
          } catch {
            const stall = mapStall(s, []);
            const localAvatar = vendorAvatars[String(s.owner_id)];
            return { ...stall, image: stall.image || localAvatar || undefined };
          }
        })
      );

      setStalls(stallsWithMenus);
      return stallsWithMenus;
    } catch (e) {
      console.error('Failed to fetch stalls', e);
      return [];
    }
  };

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) {
      const activeRole = u.mode;
      sessionStorage.setItem('active_role', activeRole);
      localStorage.setItem(`${activeRole}_user`, JSON.stringify(u));
      if (u.mode === 'vendor' && u.avatar) {
        persistVendorAvatar(u.id, u.avatar);
        setStalls(prev =>
          prev.map(stall =>
            stall.vendorId === u.id ? { ...stall, image: u.avatar } : stall
          )
        );
      }
    } else {
      const activeRole = sessionStorage.getItem('active_role') || 'customer';
      localStorage.removeItem(`${activeRole}_user`);
      localStorage.removeItem(`${activeRole}_token`);
    }
  };


  const updateProfile = async (data: { name?: string; email?: string; phone?: string; avatar?: string }) => {
    if (!user) return;
    try {
      const { avatar, ...serverFields } = data;
      await api.updateMe(serverFields);
      setUser({ ...user, ...data });
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const resolveStallName = (stallId: string): string =>
    stallsRef.current.find(s => s.id === stallId)?.stallName || 'Stall';

  const mapAndSetOrders = (apiData: any[]) => {
    const previousOrders = prevOrdersRef.current;
    const mapped: Order[] = apiData.map((o: any) => ({
      id: String(o.id),
      stallId: String(o.stall_id),
      stallName: resolveStallName(String(o.stall_id)),
      items: (o.items || []).map((i: any) => ({
        id: String(i.id),
        name: i.menu_item_name || 'Item',
        price: i.price || 0,
        quantity: i.quantity,
      })),
      total: o.total_price,
      token: o.token,
      status: o.status as OrderStatus,
      paymentMode: o.payment_mode || 'counter',
      paymentStatus: o.payment_status || 'pending',
      // Dynamic estimated time: 15 minutes total, subtract elapsed minutes
      estimatedTime: Math.max(0, 15 - Math.floor((Date.now() - new Date(o.created_at).getTime()) / 60000)),
      timestamp: new Date(o.created_at),
    }));
    const active = mapped.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
    const completed = mapped.filter(o => o.status === 'completed');
    const cancelled = mapped.filter(o => o.status === 'cancelled');

    // Update refs for future diffing after notifications are sent
    // Customer notifications
    if (userMode === 'customer' && previousOrders.length > 0) {
      mapped.forEach(newOrder => {
        const prevOrder = previousOrders.find(o => o.id === newOrder.id);
        if (prevOrder && prevOrder.status !== newOrder.status) {
          import('../services/notification').then(m => m.notifyCustomer(newOrder, newOrder.status));
        }
      });
    }
    // Vendor notifications
    if (userMode === 'vendor' && previousOrders.length > 0) {
      mapped.forEach(newOrder => {
        const prevOrder = previousOrders.find(o => o.id === newOrder.id);
        if (prevOrder && prevOrder.status !== newOrder.status) {
          import('../services/notification').then(m => m.notifyVendor(newOrder));
        }
      });
    }
    prevOrdersRef.current = mapped;
    setOrders(active);
    setCompletedOrders(completed);
    setCancelledOrders(cancelled);
  };


  const loginUser = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      const role = res.user.role as UserMode;
      sessionStorage.setItem('active_role', role);
      localStorage.setItem(`${role}_token`, res.access_token);

      let u: User = {
        id: String(res.user.id),
        name: res.user.name,
        email: res.user.email,
        mode: role,
        stallId: res.user.stall_id != null ? String(res.user.stall_id) : undefined,
        phone: res.user.phone,
        avatar: res.user.avatar,
      };

      setUser(u);
      setUserMode(u.mode);

      if (u.mode === 'vendor') {
        const [freshStalls] = await Promise.all([fetchStalls(), fetchVendorOrders()]);
        if (!u.stallId) {
          const vendorStall = freshStalls.find(s => s.vendorId === u.id);
          if (vendorStall) {
            u = { ...u, stallId: vendorStall.id };
            setUser(u);
          }
        }
      } else {
        await Promise.all([fetchMyOrders(), fetchStalls()]);
      }

      return u;
    } finally {
      setIsLoading(false);
    }
  };


  const registerUser = async (
    name: string, email: string, password: string, role: UserMode, stallId?: number, phone?: string
  ) => {
    setIsLoading(true);
    try {
      const res = await api.register({ name, email, password, role, stall_id: stallId, phone });
      sessionStorage.setItem('active_role', role);
      localStorage.setItem(`${role}_token`, res.access_token);
      const u: User = {
        id: String(res.user.id),
        name: res.user.name,
        email: res.user.email,
        mode: res.user.role as UserMode,
        stallId: res.user.stall_id != null ? String(res.user.stall_id) : undefined,
        phone: res.user.phone || phone,
      };
      setUser(u);
      setUserMode(u.mode);
    } finally {
      setIsLoading(false);
    }
  };


  const clearSession = () => {
    const activeRole = sessionStorage.getItem('active_role') || 'customer';
    setUserState(null);
    setOrders([]);
    setCart([]);
    localStorage.removeItem(`${activeRole}_user`);
    localStorage.removeItem(`${activeRole}_token`);
    fetchStalls();
  };


  const logoutUser  = () => clearSession();

  const deleteUser = async () => {
    try {
      await api.deleteAccount();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete account');
    } finally {
      clearSession();
    }
  };

  const fetchMyOrders = async () => {
    try {
      const res = await api.myOrders();
      if (Array.isArray(res)) mapAndSetOrders(res);
    } catch (e) {
      console.error('Failed to fetch orders', e);
    }
  };

  const fetchVendorOrders = async () => {
    try {
      const res = await api.vendorOrders();
      if (Array.isArray(res)) mapAndSetOrders(res);
    } catch (e) {
      console.error('Failed to fetch vendor orders', e);
    }
  };

  const addOrder  = (order: Order) => setOrders(prev => [order, ...prev]);

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    // Optimistically update UI before sending request
    setOrders(prev => {
      const updated = prev.map(o => (o.id === id ? { ...o, status } : o));
      // Update completed and cancelled lists based on optimistic status
      setCompletedOrders(prevComp =>
        status === 'completed'
          ? [...prevComp, updated.find(o => o.id === id)!]
          : prevComp.filter(o => o.id !== id)
      );
      setCancelledOrders(prevCanc =>
        status === 'cancelled'
          ? [...prevCanc, updated.find(o => o.id === id)!]
          : prevCanc.filter(o => o.id !== id)
      );
      // Trigger notification immediately
      const changedOrder = updated.find(o => o.id === id);
      if (changedOrder) {
        if (userMode === 'customer') {
          import('../services/notification').then(m => m.notifyCustomer(changedOrder, status));
        } else if (userMode === 'vendor') {
          import('../services/notification').then(m => m.notifyVendor(changedOrder));
        }
      }
      // Return filtered active orders
      return updated.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
    });
    try {
      await api.updateOrderStatus(id, status);
      // If needed, refresh the list for consistency
      if (userMode === 'vendor') await fetchVendorOrders();
      else await fetchMyOrders();
    } catch (e) {
      console.error('Failed to update order status', e);
      // Roll back optimistic update by refetching latest orders
      if (userMode === 'vendor') await fetchVendorOrders();
      else await fetchMyOrders();
      throw e;
    }
  };

  const updatePaymentStatus = (id: string, status: 'paid' | 'pending') => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, paymentStatus: status } : o));
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + (item.quantity > 0 ? item.quantity : 1) }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart          = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const updateCartItemQuantity  = (id: string, quantity: number) =>
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  const clearCart = () => setCart([]);

  const createStall = async (name: string, items: StallItem[], category = 'snacks', avatar?: string, upiId?: string, qrCodeUrl?: string) => {
    if (!user) return;
    try {
      const vendorAvatars  = getStoredVendorAvatars();
      const resolvedAvatar = avatar || vendorAvatars[user.id] || user.avatar;

      const res    = await api.createStall({ name, category, avatar: resolvedAvatar, upi_id: upiId, qr_code_url: qrCodeUrl });
      const stallId = res.id;

      await Promise.all(
        items.map(item =>
          api.addMenuItem({
            stall_id:     stallId,
            name:         item.name,
            price:        item.price,
            description:  item.description || '',
            is_available: item.isAvailable ?? true, // ✅ respects item-level toggle
          })
        )
      );

      const updatedUser = { ...user, stallId: String(stallId), avatar: resolvedAvatar };
      if (resolvedAvatar) persistVendorAvatar(user.id, resolvedAvatar);
      // Invalidate menu cache for this stall to ensure fresh data
      delete (menuCache.current as any)[stallId];
      setUser(updatedUser);
      // Force refresh stalls to get updated menu items
      await fetchStalls(true);

    } catch (e: any) {
      console.error('Failed to create stall', e);
      throw e;
    }
  };

  const updateStall = async (id: string, name: string, items: StallItem[], category = 'snacks', avatar?: string, upiId?: string, qrCodeUrl?: string) => {
    if (!user) return;
    try {
      const vendorAvatars  = getStoredVendorAvatars();
      const resolvedAvatar = avatar || vendorAvatars[user.id] || user.avatar;

      await api.updateStall(parseInt(id), { name, category, avatar: resolvedAvatar, upi_id: upiId, qr_code_url: qrCodeUrl });

      if (resolvedAvatar) persistVendorAvatar(user.id, resolvedAvatar);

      const currentMenu: any[] = await api.getMenu(parseInt(id)).catch(() => []);
      const currentIds         = new Set(currentMenu.map((i: any) => String(i.id)));
      const incomingExistingIds = new Set(
        items.filter(i => i.id && currentIds.has(i.id)).map(i => i.id)
      );

      // Delete menu items that were removed
      await Promise.all(
        currentMenu
          .filter((i: any) => !incomingExistingIds.has(String(i.id)))
          .map((i: any) => api.deleteMenuItem(i.id))
      );

      // Update existing items / add new ones — ✅ respects item-level availability toggle
      await Promise.all(
        items.map(item => {
          if (item.id && currentIds.has(item.id)) {
            return api.updateMenuItem(parseInt(item.id), {
              name:         item.name,
              price:        item.price,
              description:  item.description || '',
              is_available: item.isAvailable ?? true, // ✅ respects item-level toggle
            });
          }
          return api.addMenuItem({
            stall_id:     parseInt(id),
            name:         item.name,
            price:        item.price,
            description:  item.description || '',
            is_available: item.isAvailable ?? true, // ✅ respects item-level toggle
          });
        })
      );

      // Invalidate menu cache for this stall to ensure fresh data after update
      delete (menuCache.current as any)[id];
      // Force refresh stalls to reflect updated menu items
      await fetchStalls(true);
    } catch (e: any) {
      console.error('Failed to update stall', e);
      throw e;
    }
  };

  const getVendorStall = () => stalls.find(stall => stall.vendorId === user?.id);

  return (
    <AppContext.Provider value={{
      user,
      userMode,
      cart,
      orders,
      completedOrders,
      cancelledOrders,
      isLoading,
      isInitializing,
      stalls,
      setUser,
      setUserMode,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      clearCart,
      addOrder,
      updateOrderStatus,
      updatePaymentStatus,
      loginUser,
      registerUser,
      logoutUser,
      deleteUser,
      updateProfile,
      fetchMyOrders,
      fetchVendorOrders,
      fetchStalls,
      createStall,
      updateStall,
      getVendorStall,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};