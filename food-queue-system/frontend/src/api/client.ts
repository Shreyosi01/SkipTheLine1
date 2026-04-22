const BASE_URL = "https://skiptheline-g8dy.onrender.com";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${getToken()}`,
});

export const api = {
  register: (data: object) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  login: (data: object) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  getMenu: (stallId: number) =>
    fetch(`${BASE_URL}/menu/${stallId}`).then(r => r.json()),

  addMenuItem: (data: object) =>
    fetch(`${BASE_URL}/menu`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(r => r.json()),

  updateMenuItem: (itemId: number, data: object) =>
    fetch(`${BASE_URL}/menu/${itemId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(r => r.json()),

  deleteMenuItem: (itemId: number) =>
    fetch(`${BASE_URL}/menu/${itemId}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(r => r.json()),

  placeOrder: (data: object) =>
    fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(r => r.json()),

  myOrders: () =>
    fetch(`${BASE_URL}/orders/my`, {
      headers: authHeaders(),
    }).then(r => r.json()),

  getOrder: (orderId: number) =>
    fetch(`${BASE_URL}/orders/${orderId}`, {
      headers: authHeaders(),
    }).then(r => r.json()),

  vendorOrders: () =>
    fetch(`${BASE_URL}/orders`, {
      headers: authHeaders(),
    }).then(r => r.json()),

  updateOrderStatus: (orderId: number, status: string) =>
    fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    }).then(r => r.json()),

  getQueue: (stallId: number) =>
    fetch(`${BASE_URL}/queue/${stallId}`).then(r => r.json()),

  getQueuePosition: (orderId: number) =>
    fetch(`${BASE_URL}/queue/position/${orderId}`, {
      headers: authHeaders(),
    }).then(r => r.json()),
};