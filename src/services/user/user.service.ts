import { api } from "../api";
import { CreateUserRequest, UpdateUserRequest } from "./index";

// Authentication API endpoints
export const authApi = {
  // Login
  login: (email: string, password: string) => {
    return api.post("/auth/login", { email, password });
  },

  // Forgot password
  forgotPassword: (email: string) => {
    return api.post("/auth/forgot-password", { email });
  },

  // Reset password
  resetPassword: (token: string, newPassword: string) => {
    return api.post("/auth/reset-password", {
      token,
      new_password: newPassword,
    });
  },

  // Update password
  updatePassword: (currentPassword: string, newPassword: string) => {
    return api.post("/auth/update-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  // Get profile
  getProfile: () => {
    return api.get("/auth/profile");
  },

  // Logout (client-side only, no API call needed)
  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },
};

// User Management API endpoints
export const userApi = {
  // Create user
  createUser: (userData: CreateUserRequest) => {
    return api.post("/users", userData);
  },

  // Get all users
  getUsers: (page: number = 1, limit: number = 100, search: string = "") => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: search,
    });
    return api.get(`/users?${params}`);
  },

  // Get user by ID
  getUserById: (id: number) => {
    return api.get(`/users/${id}`);
  },

  // Update user
  updateUser: (id: number, userData: UpdateUserRequest) => {
    return api.put(`/users/${id}`, userData);
  },

  // Delete user
  deleteUser: (id: number) => {
    return api.delete(`/users/${id}`);
  },
};
