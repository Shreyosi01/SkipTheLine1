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
  stalls: Stall[];
  createStall: (name: string, items: StallItem[], category?: string) => Promise<void>;
  updateStall: (id: string, name: string, items: StallItem[], category?: string) => Promise<void>;
  getVendorStall: () => Stall | undefined;
  setUser: (user: User | null) => void;
  setUserMode: (mode: UserMode) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  loginUser: (email: string, password: string) => Promise<void>;
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
  fetchMyOrders: () => Promise<void>;
  fetchVendorOrders: () => Promise<void>;
  fetchStalls: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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
  image: s.avatar || s.image_url,
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [userMode, setUserMode] = useState<UserMode>('customer');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const stallsRef = React.useRef<Stall[]>([]);
  useEffect(() => { stallsRef.current = stalls; }, [stalls]);

  useEffect(() => {
    fetchStalls();
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      try {
        const parsed = JSON.parse(savedUser);
        setUserState(parsed);
        setUserMode(parsed.mode);
        // Fetch the right orders based on role
        if (parsed.mode === 'vendor') {
          api.vendorOrders()
            .then(res => { if (Array.isArray(res)) mapAndSetOrders(res); })
            .catch(err => console.error('Auto-fetch vendor orders failed:', err));
        } else {
          api.myOrders()
            .then(res => { if (Array.isArray(res)) mapAndSetOrders(res); })
            .catch(err => console.error('Auto-fetch orders failed:', err));
        }
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
  }, []);

  const fetchStalls = async () => {
    try {
      const res = await api.listStalls();
      if (!Array.isArray(res)) return;
      const stallsWithMenus = await Promise.all(
        res.map(async (s: any) => {
          try {
            const menu = await api.getMenu(s.id);
            return mapStall(s, Array.isArray(menu) ? menu : []);
          } catch {
            return mapStall(s, []);
          }
        })
      );
      setStalls(stallsWithMenus);
    } catch (e) {
      console.error('Failed to fetch stalls', e);
    }
  };

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem('user', JSON.stringify(u));
      if (u.mode === 'vendor' && u.avatar) {
        setStalls(prev =>
          prev.map(stall => stall.vendorId === u.id ? { ...stall, image: u.avatar } : stall)
        );
      }
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
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

  const loginUser = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      localStorage.setItem('token', res.access_token);
      const u: User = {
        id: String(res.user.id),
        name: res.user.name,
        email: res.user.email,
        mode: res.user.role as UserMode,
        stallId: res.user.stall_id ? String(res.user.stall_id) : undefined,
        phone: res.user.phone,
        avatar: res.user.avatar,
      };
      setUser(u);
      setUserMode(u.mode);
      // Fetch the right orders based on role immediately after login
      if (u.mode === 'vendor') {
        await Promise.all([fetchVendorOrders(), fetchStalls()]);
      } else {
        await Promise.all([fetchMyOrders(), fetchStalls()]);
      }
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
        stallId: res.user.stall_id ? String(res.user.stall_id) : undefined,
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

  // For customers — fetches their own orders
  const fetchMyOrders = async () => {
    try {
      const res = await api.myOrders();
      if (Array.isArray(res)) mapAndSetOrders(res);
    } catch (e) {
      console.error('Failed to fetch orders', e);
    }
  };

  // For vendors — fetches all orders for their stall
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

  const createStall = async (name: string, items: StallItem[], category = 'snacks') => {
    if (!user) return;
    try {
      const res = await api.createStall({ name, category, avatar: user.avatar });
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
      const updatedUser = { ...user, stallId: String(stallId) };
      setUser(updatedUser);
      await fetchStalls();
    } catch (e: any) {
      console.error('Failed to create stall', e);
      throw e;
    }
  };

  const updateStall = async (id: string, name: string, items: StallItem[], category = 'snacks') => {
    if (!user) return;
    try {
      await api.updateStall(parseInt(id), { name, category, avatar: user.avatar });
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
      user, userMode, cart, orders, isLoading, stalls,
      setUser, setUserMode, addToCart, removeFromCart, clearCart,
      addOrder, updateOrderStatus, loginUser, registerUser,
      logoutUser, deleteUser,
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