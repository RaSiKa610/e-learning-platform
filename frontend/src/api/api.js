import axios from "axios";

export const API_BASE = "https://e-learning-platform-k1kg.onrender.com";

const api = axios.create({
  baseURL: `${API_BASE}/api`
});

// Attach JWT automatically
api.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default api;