import { api } from "../api";

// Label generation API endpoints
export const labelApi = {
  // Generate ZPL label for single item
  generateZPLLabel: (id: number) => {
    return api.get(`/labels/${id}/zpl`, {
      responseType: "blob",
    });
  },

  // Generate PDF label for single item
  generatePDFLabel: (id: number) => {
    return api.get(`/labels/${id}/pdf`, {
      responseType: "blob",
    });
  },

  // Generate bulk labels
  generateBulkLabels: (ids: number[]) => {
    return api.post("/labels/bulk", { ids });
  },

  // Download ZPL file
  downloadZPLFile: (id: number) => {
    return api.get(`/labels/${id}/download/zpl`, {
      responseType: "blob",
    });
  },

  // Download PDF file
  downloadPDFFile: (id: number) => {
    return api.get(`/labels/${id}/download/pdf`, {
      responseType: "blob",
    });
  },
};
