import { OrderStatus } from '../context/AppContext';

export const requestPermission = async (): Promise<void> => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

export const notifyCustomer = (order: any, status: OrderStatus) => {
  requestPermission();
  const title = `Your order is ${status}`;
  const body = `${order.stallName} – ${order.items.length} item(s) – ₹${order.total.toFixed(2)}`;
  new Notification(title, { body, icon: '/notification.png' });
  new Audio('/notification_customer.mp3').play().catch(() => {});
};

export const notifyVendor = (order: any) => {
  requestPermission();
  const title = 'New order received!';
  const body = `${order.stallName} – ${order.items.length} item(s)`;
  new Notification(title, { body, icon: '/notification_vendor.png' });
  new Audio('/notification_vendor.mp3').play().catch(() => {});
};
