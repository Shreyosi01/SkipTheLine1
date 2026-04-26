import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../../api/client';

export type UserMode = 'customer' | 'vendor';
export type OrderStatus = 'placed' | 'preparing' | 'ready' | 'completed';

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
}

export interface Order {
  id: string;
  stallId: string;
  stallName: string;
  items: OrderItem[];
  total: number;
  token: string;
  status: OrderStatus;
  estimatedTime: number;
  timestamp: Date;
}

interface AppContextType {
  user: User | null;
  userMode: UserMode;
  cart: CartItem[];
  orders: Order[];
  isLoading: boolean;
  isInitializing: boolean;
  stalls: Stall[];
  // ✅ avatar param added so CreateStall can pass it directly
  createStall: (name: string, items: StallItem[], category?: string, avatar?: string) => Promise<void>;
  updateStall: (id: string, name: string, items: StallItem[], category?: string, avatar?: string) => Promise<void>;
  getVendorStall: () => Stall | undefined;
  setUser: (user: User | null) => void;
  setUserMode: (mode: UserMode) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
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
  fetchStalls: () => Promise<Stall[]>;
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

const mapStall = (s: any, menuItems?: any[]): Stall => ({
  id: String(s.id),
  vendorId: String(s.owner_id),
  stallName: s.name,
  category: s.category,
  items: (menuItems || []).map((i: any) => ({
    id: String(i.id),
    name: i.name,
    price: i.price,
    description: i.description,
  })),
  updatedAt: s.updated_at || new Date().toISOString(),
  status: 'new' as const,
  image: s.avatar || s.image_url || undefined,
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [userMode, setUserMode] = useState<UserMode>('customer');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const stallsRef = React.useRef<Stall[]>([]);
  useEffect(() => { stallsRef.current = stalls; }, [stalls]);

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

  const restoreSession = async () => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
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
      localStorage.setItem('user', JSON.stringify(u));

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
      console.warn('Session restore failed — clearing:', err);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  const fetchStalls = async (): Promise<Stall[]> => {
    try {
      const res = await api.listStalls();
      if (!Array.isArray(res)) return [];

      const vendorAvatars = getStoredVendorAvatars();

      const stallsWithMenus = await Promise.all(
        res.map(async (s: any) => {
          try {
            const menu = await api.getMenu(s.id);
            const stall = mapStall(s, Array.isArray(menu) ? menu : []);
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
      localStorage.setItem('user', JSON.stringify(u));
      if (u.mode === 'vendor' && u.avatar) {
        persistVendorAvatar(u.id, u.avatar);
        setStalls(prev =>
          prev.map(stall =>
            stall.vendorId === u.id ? { ...stall, image: u.avatar } : stall
          )
        );
      }
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
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
      estimatedTime: 15,
      timestamp: new Date(o.created_at),
    }));
    setOrders(mapped);
  };

  const loginUser = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      localStorage.setItem('token', res.access_token);

      let u: User = {
        id: String(res.user.id),
        name: res.user.name,
        email: res.user.email,
        mode: res.user.role as UserMode,
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
      localStorage.setItem('token', res.access_token);
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
    setUserState(null);
    setOrders([]);
    setCart([]);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    fetchStalls();
  };

  const logoutUser = () => clearSession();

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

  const addOrder = (order: Order) => setOrders(prev => [order, ...prev]);

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + (item.quantity > 0 ? item.quantity : 1) } : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setCart([]);

  // ✅ avatar now comes directly from CreateStall's picker, not from user.avatar
  const createStall = async (name: string, items: StallItem[], category = 'snacks', avatar?: string) => {
    if (!user) return;
    try {
      const vendorAvatars = getStoredVendorAvatars();
      // Priority: picker selection > existing stored avatar > user.avatar
      const resolvedAvatar = avatar || vendorAvatars[user.id] || user.avatar;

      const res = await api.createStall({ name, category, avatar: resolvedAvatar });
      const stallId = res.id;

      await Promise.all(
        items.map(item =>
          api.addMenuItem({
            stall_id: stallId,
            name: item.name,
            price: item.price,
            description: item.description || '',
            is_available: true,
          })
        )
      );

      // ✅ Persist the chosen avatar and update user + stall list in one shot
      const updatedUser = { ...user, stallId: String(stallId), avatar: resolvedAvatar };
      if (resolvedAvatar) persistVendorAvatar(user.id, resolvedAvatar);
      setUser(updatedUser);
      await fetchStalls();
    } catch (e: any) {
      console.error('Failed to create stall', e);
      throw e;
    }
  };

  // ✅ avatar now comes directly from CreateStall's picker
  const updateStall = async (id: string, name: string, items: StallItem[], category = 'snacks', avatar?: string) => {
    if (!user) return;
    try {
      const vendorAvatars = getStoredVendorAvatars();
      const resolvedAvatar = avatar || vendorAvatars[user.id] || user.avatar;

      await api.updateStall(parseInt(id), { name, category, avatar: resolvedAvatar });

      // ✅ Persist updated avatar choice immediately
      if (resolvedAvatar) persistVendorAvatar(user.id, resolvedAvatar);

      const currentMenu: any[] = await api.getMenu(parseInt(id)).catch(() => []);
      const currentIds = new Set(currentMenu.map((i: any) => String(i.id)));
      const incomingExistingIds = new Set(
        items.filter(i => i.id && currentIds.has(i.id)).map(i => i.id)
      );
      await Promise.all(
        currentMenu
          .filter((i: any) => !incomingExistingIds.has(String(i.id)))
          .map((i: any) => api.deleteMenuItem(i.id))
      );
      await Promise.all(
        items.map(item => {
          if (item.id && currentIds.has(item.id)) {
            return api.updateMenuItem(parseInt(item.id), {
              name: item.name,
              price: item.price,
              description: item.description || '',
              is_available: true,
            });
          }
          return api.addMenuItem({
            stall_id: parseInt(id),
            name: item.name,
            price: item.price,
            description: item.description || '',
            is_available: true,
          });
        })
      );
      await fetchStalls();
    } catch (e: any) {
      console.error('Failed to update stall', e);
      throw e;
    }
  };

  const getVendorStall = () => stalls.find(stall => stall.vendorId === user?.id);

  return (
    <AppContext.Provider value={{
      user, userMode, cart, orders, isLoading, isInitializing, stalls,
      setUser, setUserMode, addToCart, removeFromCart, clearCart,
      addOrder, updateOrderStatus, loginUser, registerUser,
      logoutUser, deleteUser, updateProfile,
      fetchMyOrders, fetchVendorOrders, fetchStalls,
      createStall, updateStall, getVendorStall,
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