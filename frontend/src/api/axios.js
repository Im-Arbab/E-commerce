import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // send the httpOnly auth cookie on every request
  headers: { "Content-Type": "application/json" },
});

// Normalize error messages so components can just read err.message
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default api;
