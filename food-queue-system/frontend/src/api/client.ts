const BASE_URL = "https://skiptheline-g8dy.onrender.com";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${getToken()}`,
});

// Helper to handle responses and catch HTTP errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const api = {
  register: (data: object) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),

  login: (data: object) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Use this to re-fetch menu items after a refresh
  getMenu: (stallId: number) =>
    fetch(`${BASE_URL}/menu/${stallId}`).then(handleResponse),

  addMenuItem: (data: object) =>
    fetch(`${BASE_URL}/menu`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateMenuItem: (itemId: number, data: object) =>
    fetch(`${BASE_URL}/menu/${itemId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteMenuItem: (itemId: number) =>
    fetch(`${BASE_URL}/menu/${itemId}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handleResponse),

  placeOrder: (data: object) =>
    fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  myOrders: () =>
    fetch(`${BASE_URL}/orders/my`, {
      headers: authHeaders(),
    }).then(handleResponse),

  getOrder: (orderId: number) =>
    fetch(`${BASE_URL}/orders/${orderId}`, {
      headers: authHeaders(),
    }).then(handleResponse),

  vendorOrders: () =>
    fetch(`${BASE_URL}/orders`, {
      headers: authHeaders(),
    }).then(handleResponse),

  updateOrderStatus: (orderId: number, status: string) =>
    fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    }).then(handleResponse),

  getQueue: (stallId: number) =>
    fetch(`${BASE_URL}/queue/${stallId}`).then(handleResponse),

  getQueuePosition: (orderId: number) =>
    fetch(`${BASE_URL}/queue/position/${orderId}`, {
      headers: authHeaders(),
    }).then(handleResponse),
};