import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { csvApi, CSVRow, ApiResponse, UploadResponse } from "../services/api";
import { toast } from "sonner";
// CSV safety utilities are available for future use
// import { sanitizeCSVRow, createSafeCSVRow, createCSVHeaders } from "../utils/csvSafety";

// Query keys
export const queryKeys = {
  csvData: (page: number, search: string) => ["csvData", page, search] as const,
};

// Hook for fetching CSV data
export const useCSVData = (page: number = 1, search: string = "") => {
  return useQuery({
    queryKey: queryKeys.csvData(page, search),
    queryFn: async () => {
      const response = await csvApi.getData(page, 40, search);
      return response.data as ApiResponse<CSVRow[]>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for uploading CSV file
export const useUploadCSV = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => csvApi.uploadFile(file),
    onSuccess: (response) => {
      const data = response.data as UploadResponse;
      if (data.success) {
        // Invalidate and refetch data
        queryClient.invalidateQueries({ queryKey: ["csvData"] });
        queryClient.invalidateQueries({ queryKey: ["invalidRowsCount"] });
        queryClient.invalidateQueries({ queryKey: ["editedRowsCount"] });
      }
    },
    onError: (error: any) => {
      toast.error("Upload failed", {
        description: error.response?.data?.error || "Please try again.",
      });
    },
  });
};

// Hook for downloading error file
export const useDownloadErrorFile = () => {
  return useMutation({
    mutationFn: () => csvApi.downloadErrorFile(),
    onSuccess: (response) => {
      console.log("response", response);
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `error-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Error file downloaded successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to download error file", {
        description: error.response?.data?.error || "Please try again.",
      });
    },
  });
};

// Hook for updating a row
export const useUpdateRow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CSVRow> }) =>
      csvApi.updateRow(id, data),
    onSuccess: () => {
      toast.success("Row updated successfully!");
      // Invalidate and refetch data
      queryClient.invalidateQueries({ queryKey: ["csvData"] });
      queryClient.invalidateQueries({ queryKey: ["invalidRowsCount"] });
      queryClient.invalidateQueries({ queryKey: ["editedRowsCount"] });
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] });
    },
    onError: (error: any) => {
      toast.error("Update failed", {
        description: error.response?.data?.error || "Please try again.",
      });
    },
  });
};

// Hook for exporting data
export const useExportData = () => {
  return useMutation({
    mutationFn: () => csvApi.exportData(),
    onSuccess: (response) => {
      // Create blob and download
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Data exported successfully with security protection!");
    },
    onError: (error: any) => {
      toast.error("Export failed", {
        description: error.response?.data?.error || "Please try again.",
      });
    },
  });
};

// Hook for deleting multiple rows
export const useDeleteRows = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => csvApi.deleteRows(ids),
    onSuccess: (_, ids) => {
      toast.success(`${ids.length} row(s) deleted successfully!`);
      // Invalidate and refetch data
      queryClient.invalidateQueries({ queryKey: ["csvData"] });
      queryClient.invalidateQueries({ queryKey: ["invalidRowsCount"] });
      queryClient.invalidateQueries({ queryKey: ["editedRowsCount"] });
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] });
    },
    onError: (error: any) => {
      toast.error("Bulk delete failed", {
        description: error.response?.data?.error || "Please try again.",
      });
    },
  });
};

export const useDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => csvApi.deleteRow(id),
    onSuccess: (_, id) => {
      toast.success(`${id} row(s) deleted successfully!`);
      queryClient.invalidateQueries({ queryKey: ["csvData"] });
      queryClient.invalidateQueries({ queryKey: ["invalidRowsCount"] });
      queryClient.invalidateQueries({ queryKey: ["editedRowsCount"] });
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] });
    },
    onError: (error: any) => {
      toast.error("Delete failed", {
        description: error.response?.data?.error || "Please try again.",
      });
    },
  });
};
