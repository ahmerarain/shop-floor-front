import axios from "axios";
import { toast } from "sonner";
/// <reference types="vite/client" />

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5004/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Error:", error?.response?.data?.error);
    // Handle common errors
    if (error.response?.status === 401) {
      toast.error(error?.response?.data?.error);
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
      // Handle unauthorized access
      console.error("Unauthorized access");
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error("Server error:", error.response.data);
    }
    return Promise.reject(error);
  }
);

// Export all services
export * from "./user";
export * from "./csv";
export * from "./label";

// Re-export specific APIs for backward compatibility
export { authApi, userApi } from "./user/user.service";
export { csvApi } from "./csv/csv.service";
export { labelApi } from "./label/label.service";
