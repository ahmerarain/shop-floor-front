import { api } from "../api";
import { CSVRow } from "./index";

// CSV API endpoints
export const csvApi = {
  // Get paginated data
  getData: (page: number = 1, limit: number = 100, search: string = "") => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: search,
    });
    return api.get(`/csv/data?${params}`);
  },

  // Upload CSV file
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append("csvFile", file);
    return api.post("/csv/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Update row
  updateRow: (id: number, data: Partial<CSVRow>) => {
    return api.put(`/csv/data/${id}`, data);
  },

  // Export data
  exportData: () => {
    return api.get("/csv/export", {
      responseType: "blob",
    });
  },

  // Download error file
  downloadErrorFile: () => {
    return api.get("/csv/error", {
      responseType: "blob",
    });
  },

  // Delete multiple rows
  deleteRows: (ids: number[]) => {
    return api.delete("/csv/data", {
      data: { ids },
    });
  },

  deleteRow: (id: number) => {
    return api.delete(`/csv/${id}`);
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
    return api.get(`/csv/audit?${params}`);
  },

  // Exception export endpoints
  exportInvalidRows: () => {
    return api.get("/csv/exceptions/invalid", {
      responseType: "blob",
    });
  },

  exportEditedRows: () => {
    return api.get("/csv/exceptions/edited", {
      responseType: "blob",
    });
  },

  getInvalidRowsCount: () => {
    return api.get("/csv/exceptions/invalid/count");
  },

  getEditedRowsCount: () => {
    return api.get("/csv/exceptions/edited/count");
  },
};
