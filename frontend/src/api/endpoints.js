import api from "./axios";

// ---------- Auth ----------
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  profile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

// ---------- Products ----------
export const productAPI = {
  list: (params) => api.get("/products", { params }),
  featured: () => api.get("/products/featured"),
  filters: () => api.get("/products/filters"),
  getOne: (id) => api.get(`/products/${id}`),
  review: (id, data) => api.post(`/products/${id}/reviews`, data),

  // admin
  adminList: (params) => api.get("/products/admin/all", { params }),
  create: (formData) =>
    api.post("/products", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, formData) =>
    api.put(`/products/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  remove: (id) => api.delete(`/products/${id}`),
  updateStock: (id, stock) => api.patch(`/products/${id}/stock`, { stock }),
};

export const mobileAPI = {
  list: (params) => api.get("/mobiles", { params }),
  mine: () => api.get("/mobiles/mine"),
  inquiries: () => api.get("/mobiles/inquiries"),
  reply: (id, message) => api.post(`/mobiles/inquiries/${id}/reply`, { message }),
  reviewQueue: () => api.get("/mobiles/admin/review"),
  setStatus: (id, status) => api.patch(`/mobiles/${id}/status`, { status }),
  inquire: (id, message) => api.post(`/mobiles/${id}/inquiries`, { message }),
  create: (data) => api.post("/mobiles", data),
};

export const serviceInquiryAPI = {
  create: (data) => api.post("/service-inquiries", data),
  list: () => api.get("/service-inquiries"),
  setStatus: (id, status) => api.patch(`/service-inquiries/${id}/status`, { status }),
};

// ---------- Orders ----------
export const orderAPI = {
  create: (data) => api.post("/orders", data),
  myOrders: () => api.get("/orders/my"),
  getOne: (id) => api.get(`/orders/${id}`),
  pay: (id, paymentResult) => api.put(`/orders/${id}/pay`, paymentResult),

  // admin
  all: (params) => api.get("/orders", { params }),
  stats: () => api.get("/orders/stats"),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// ---------- Users (admin) ----------
export const userAPI = {
  list: (params) => api.get("/users", { params }),
  getOne: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  remove: (id) => api.delete(`/users/${id}`),
};

// ---------- Payments ----------
export const paymentAPI = {
  createCheckoutSession: (orderId) =>
    api.post("/payments/create-checkout-session", { orderId }),
  getSession: (sessionId) => api.get(`/payments/session/${sessionId}`),
};
