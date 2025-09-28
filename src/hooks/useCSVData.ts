import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { csvApi, CSVRow, ApiResponse, UploadResponse } from "../services/api";
import { toast } from "sonner";

// Query keys
export const queryKeys = {
  csvData: (page: number, search: string) => ["csvData", page, search] as const,
};

// Hook for fetching CSV data
export const useCSVData = (page: number = 1, search: string = "") => {
  return useQuery({
    queryKey: queryKeys.csvData(page, search),
    queryFn: async () => {
      const response = await csvApi.getData(page, 100, search);
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
        toast.success("File uploaded successfully!", {
          description: `Valid rows: ${data.validRows}, Invalid rows: ${data.invalidRows}`,
        });

        // Invalidate and refetch data
        queryClient.invalidateQueries({ queryKey: ["csvData"] });
      } else {
        toast.error("Upload failed", {
          description: data.error || "Please check your file and try again.",
        });
      }
    },
    onError: (error: any) => {
      toast.error("Upload failed", {
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

      toast.success("Data exported successfully!");
    },
    onError: (error: any) => {
      toast.error("Export failed", {
        description: error.response?.data?.error || "Please try again.",
      });
    },
  });
};
