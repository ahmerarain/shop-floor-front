import axios from "axios";
/// <reference types="vite/client" />

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5004",
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

  // Download error file
  downloadErrorFile: () => {
    return api.get("/api/csv/error", {
      responseType: "blob",
    });
  },

  // Delete multiple rows
  deleteRows: (ids: number[]) => {
    return api.delete("/api/csv/data", {
      data: { ids },
    });
  },

  deleteRow: (id: number) => {
    return api.delete(`/api/csv/${id}`);
  },

  // Label generation endpoints
  generateZPLLabel: (id: number) => {
    return api.get(`/api/labels/${id}/zpl`, {
      responseType: "blob",
    });
  },

  generatePDFLabel: (id: number) => {
    return api.get(`/api/labels/${id}/pdf`, {
      responseType: "blob",
    });
  },

  generateBulkLabels: (ids: number[]) => {
    return api.post("/api/labels/bulk", { ids });
  },

  downloadZPLFile: (id: number) => {
    return api.get(`/api/labels/${id}/download/zpl`, {
      responseType: "blob",
    });
  },

  downloadPDFFile: (id: number) => {
    return api.get(`/api/labels/${id}/download/pdf`, {
      responseType: "blob",
    });
  },

  // Audit log endpoints
  getAuditLogs: (
    page: number = 1,
    limit: number = 100,
    action?: string,
    rowId?: number
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (action) params.append("action", action);
    if (rowId) params.append("rowId", rowId.toString());
    return api.get(`/api/csv/audit?${params}`);
  },

  // Exception export endpoints
  exportInvalidRows: () => {
    return api.get("/api/csv/exceptions/invalid", {
      responseType: "blob",
    });
  },

  exportEditedRows: () => {
    return api.get("/api/csv/exceptions/edited", {
      responseType: "blob",
    });
  },

  getInvalidRowsCount: () => {
    return api.get("/api/csv/exceptions/invalid/count");
  },

  getEditedRowsCount: () => {
    return api.get("/api/csv/exceptions/edited/count");
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

export interface AuditLogEntry {
  id: number;
  timestamp: string;
  user: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "BULK_DELETE" | "CLEAR_ALL";
  row_id?: number;
  diff?: string;
  created_at: string;
}

export interface AuditLogResponse {
  success: boolean;
  data: AuditLogEntry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BulkLabelResponse {
  success: boolean;
  message: string;
  zplFiles?: string[];
  pdfFiles?: string[];
  errors?: string[];
}

// Exception export types
export interface ExceptionCountResponse {
  success: boolean;
  count: number;
}

export interface InvalidRowData {
  row_id: number;
  source_filename: string;
  line_no: number;
  uploaded_at: string;
  last_validated_at: string;
  is_valid: boolean;
  error_codes: string;
  error_messages: string;
  // Original data fields
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
}

export interface EditedRowData {
  row_id: number;
  source_filename: string;
  line_no: number;
  uploaded_at: string;
  last_validated_at: string;
  is_valid: boolean;
  error_codes: string;
  error_messages: string;
  // Edit tracking fields
  edited_by: string;
  edited_at: string;
  fields_changed: string;
  // Original data fields with before/after values
  part_mark: string;
  part_mark_original?: string;
  part_mark_new?: string;
  assembly_mark: string;
  assembly_mark_original?: string;
  assembly_mark_new?: string;
  material: string;
  material_original?: string;
  material_new?: string;
  thickness: string;
  thickness_original?: string;
  thickness_new?: string;
  quantity: number;
  quantity_original?: number;
  quantity_new?: number;
  length?: number;
  length_original?: number;
  length_new?: number;
  width?: number;
  width_original?: number;
  width_new?: number;
  height?: number;
  height_original?: number;
  height_new?: number;
  weight?: number;
  weight_original?: number;
  weight_new?: number;
  notes?: string;
  notes_original?: string;
  notes_new?: string;
}
