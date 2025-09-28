import axios from "axios";
/// <reference types="vite/client" />

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5008",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
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
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error("Unauthorized access");
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error("Server error:", error.response.data);
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const csvApi = {
  // Get paginated data
  getData: (page: number = 1, limit: number = 100, search: string = "") => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: search,
    });
    return api.get(`/api/csv/data?${params}`);
  },

  // Upload CSV file
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append("csvFile", file);
    return api.post("/api/csv/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Update row
  updateRow: (id: number, data: Partial<CSVRow>) => {
    return api.put(`/api/csv/data/${id}`, data);
  },

  // Export data
  exportData: () => {
    return api.get("/api/csv/export", {
      responseType: "blob",
    });
  },
};

// Types
export interface CSVRow {
  id: number;
  part_mark: string;
  assembly_mark: string;
  material: string;
  thickness: string;
  quantity: number;
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  total: number;
  page: number;
  limit: number;
}

export interface UploadResponse {
  success: boolean;
  validRows: number;
  invalidRows: number;
  hasErrorFile: boolean;
  error?: string;
}
