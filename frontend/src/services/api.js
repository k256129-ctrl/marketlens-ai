const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? "/api/v1" : "/api/v1")
).replace(/\/$/, "");

class ApiError extends Error {
  constructor(message, status, fields = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkErr) {
    throw new ApiError(
      "Cannot reach MarketLens API server. Verify the FastAPI backend is running.",
      0
    );
  }

  if (response.status === 204) {
    return null;
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const detail =
      data?.detail ||
      data?.error ||
      `Request failed with HTTP ${response.status}`;
    throw new ApiError(detail, response.status, data?.fields || []);
  }

  return data;
}

function buildQuery(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      sp.set(k, String(v).trim());
    }
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export const api = {
  baseUrl: API_BASE_URL,

  // Health & Dashboard
  getHealth: () => request("/health"),
  getDashboardOverview: () => request("/dashboard/overview"),

  // Categories
  getCategories: () => request("/categories"),
  createCategory: (payload) =>
    request("/categories", { method: "POST", body: JSON.stringify(payload) }),

  // Products & Price Comparison
  getProducts: (params) => request(`/products${buildQuery(params)}`),
  createProduct: (payload) =>
    request("/products", { method: "POST", body: JSON.stringify(payload) }),

  // Inventory CRUD
  getInventory: (params) => request(`/inventory${buildQuery(params)}`),
  createInventory: (payload) =>
    request("/inventory", { method: "POST", body: JSON.stringify(payload) }),
  updateInventory: (id, payload) =>
    request(`/inventory/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteInventory: (id) =>
    request(`/inventory/${id}`, { method: "DELETE" }),

  // Businesses / Shops CRUD
  getBusinesses: (params) => request(`/businesses${buildQuery(params)}`),
  getBusinessDetail: (id) => request(`/businesses/${id}`),
  createBusiness: (payload) =>
    request("/businesses", { method: "POST", body: JSON.stringify(payload) }),
  updateBusiness: (id, payload) =>
    request(`/businesses/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteBusiness: (id) =>
    request(`/businesses/${id}`, { method: "DELETE" }),

  // Location Intelligence
  getLocations: (params) => request(`/locations${buildQuery(params)}`),
  compareLocations: (ids = []) =>
    request(`/locations/compare${ids.length ? `?ids=${ids.join(",")}` : ""}`),
};