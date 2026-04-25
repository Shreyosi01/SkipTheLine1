const BASE_URL = "https://skiptheline-g8dy.onrender.com";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${getToken()}`,
});

// Returns the parsed JSON whether ok or not — callers check res.detail for errors
const handleResponse = async (response: Response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof data.detail === "string"
        ? data.detail
        : Array.isArray(data.detail)
        ? data.detail.map((e: any) => `${e.loc?.slice(-1)[0]}: ${e.msg}`).join(", ")
        : `HTTP error! status: ${response.status}`;
    throw new Error(message);
  }
  return data;
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

  // ── Account ─────────────────────────────────────
  deleteAccount: () =>
    fetch(`${BASE_URL}/auth/delete`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handleResponse),

  // ── Stalls ──────────────────────────────────────
  listStalls: () =>
    fetch(`${BASE_URL}/stalls`).then(handleResponse),

  getMyStall: () =>
    fetch(`${BASE_URL}/stalls/vendor/me`, {
      headers: authHeaders(),
    }).then(handleResponse),

  createStall: (data: { name: string; category: string; avatar?: string }) =>
    fetch(`${BASE_URL}/stalls`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateStall: (stallId: number, data: { name: string; category: string; avatar?: string }) =>
    fetch(`${BASE_URL}/stalls/${stallId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  getStall: (stallId: number) =>
    fetch(`${BASE_URL}/stalls/${stallId}`).then(handleResponse),

  // ── Menu ────────────────────────────────────────
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

  // ── Orders ──────────────────────────────────────
  placeOrder: (data: { stall_id: number; items: { menu_item_id: number; quantity: number }[] }) =>
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

  // ── Queue ───────────────────────────────────────
  getQueue: (stallId: number) =>
    fetch(`${BASE_URL}/queue/${stallId}`).then(handleResponse),

  getQueuePosition: (orderId: number) =>
    fetch(`${BASE_URL}/queue/position/${orderId}`, {
      headers: authHeaders(),
    }).then(handleResponse),
};