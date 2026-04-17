import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

export type UserMode = 'customer' | 'vendor';
export type OrderStatus = 'placed' | 'preparing' | 'ready' | 'completed';

export interface User {
  id: string;
  name: string;
  email: string;
  mode: UserMode;
  stallId?: string;
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
  setUser: (user: User | null) => void;
  setUserMode: (mode: UserMode) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (name: string, email: string, password: string, role: UserMode, stallId?: number) => Promise<void>;
  logoutUser: () => void;
  fetchMyOrders: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [userMode, setUserMode] = useState<UserMode>('customer');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      const parsed = JSON.parse(savedUser);
      setUserState(parsed);
      setUserMode(parsed.mode);
    }
  }, []);

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem('user', JSON.stringify(u));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  // ── Auth ──────────────────────────────────────────────────────────
  const loginUser = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res.detail) throw new Error(res.detail);

      localStorage.setItem('token', res.access_token);

      const u: User = {
        id: String(res.user.id),
        name: res.user.name,
        email: res.user.email,
        mode: res.user.role as UserMode,
        stallId: res.user.stall_id ? String(res.user.stall_id) : undefined,
      };
      setUser(u);
      setUserMode(u.mode);
      await fetchMyOrders();
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (
    name: string, email: string, password: string,
    role: UserMode, stallId?: number
  ) => {
    setIsLoading(true);
    try {
      const res = await api.register({ name, email, password, role, stall_id: stallId });
      if (res.detail) throw new Error(res.detail);

      localStorage.setItem('token', res.access_token);

      const u: User = {
        id: String(res.user.id),
        name: res.user.name,
        email: res.user.email,
        mode: res.user.role as UserMode,
        stallId: res.user.stall_id ? String(res.user.stall_id) : undefined,
      };
      setUser(u);
      setUserMode(u.mode);
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = () => {
    setUser(null);
    setOrders([]);
    setCart([]);
  };

  
  const fetchMyOrders = async () => {
    try {
      const res = await api.myOrders();
      if (!Array.isArray(res)) return;

      
      const mapped: Order[] = res.map((o: any) => ({
        id: String(o.id),
        stallId: String(o.stall_id),
        stallName: o.stall_name || 'Stall',
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
    } catch (e) {
      console.error('Failed to fetch orders', e);
    }
  };

  const addOrder = (order: Order) => {
    setOrders((prev) => [...prev, order]);
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  };

  
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + (item.quantity > 0 ? item.quantity : 1) }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => setCart([]);

  return (
    <AppContext.Provider value={{
      user, userMode, cart, orders, isLoading,
      setUser, setUserMode,
      addToCart, removeFromCart, clearCart,
      addOrder, updateOrderStatus,
      loginUser, registerUser, logoutUser,
      fetchMyOrders,
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