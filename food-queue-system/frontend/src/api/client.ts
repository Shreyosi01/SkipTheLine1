const BASE_URL = "https://skiptheline-g8dy.onrender.com";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${getToken()}`,
});

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
  // ── Auth ────────────────────────────────────────
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

  // Verifies stored token and returns fresh user data from DB
  getMe: () =>
    fetch(`${BASE_URL}/auth/me`, {
      headers: authHeaders(),
    }).then(handleResponse),

  // Persists profile edits (name/email/phone) to the DB
  updateMe: (data: { name?: string; email?: string; phone?: string }) =>
    fetch(`${BASE_URL}/auth/me`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

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

  // ✅ NEW: Toggle availability without sending the full item body
  toggleAvailability: (itemId: number, isAvailable: boolean) =>
    fetch(`${BASE_URL}/menu/${itemId}/availability`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ is_available: isAvailable }),
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

  // ✅ UPDATED: optional status filter — pass undefined for all orders,
  // or a status string to fetch only that status from the DB
  vendorOrders: (status?: string) =>
    fetch(
      `${BASE_URL}/orders${status ? `?status=${status}` : ""}`,
      { headers: authHeaders() }
    ).then(handleResponse),

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

  // ✅ NEW: Returns the SSE stream URL — callers pass this to new EventSource(url)
  // Not a fetch call — EventSource handles the connection itself
  getQueueStreamUrl: (stallId: number) =>
    `${BASE_URL}/queue/${stallId}/stream`,
};