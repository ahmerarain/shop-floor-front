import { useMutation, useQuery } from "@tanstack/react-query";
import { csvApi, ExceptionCountResponse } from "../services/api";

// Hook for exporting invalid rows
export const useExportInvalidRows = () => {
  return useMutation({
    mutationFn: csvApi.exportInvalidRows,
    onSuccess: (response) => {
      // Create blob and trigger download
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invalid_rows_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error("Failed to export invalid rows:", error);
      alert("Failed to export invalid rows. Please try again.");
    },
  });
};

// Hook for exporting edited rows
export const useExportEditedRows = () => {
  return useMutation({
    mutationFn: csvApi.exportEditedRows,
    onSuccess: (response) => {
      // Create blob and trigger download
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `edited_rows_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error("Failed to export edited rows:", error);
      //   alert("Failed to export edited rows. Please try again.");
    },
  });
};

// Hook for getting invalid rows count
export const useInvalidRowsCount = () => {
  return useQuery<ExceptionCountResponse>({
    queryKey: ["invalidRowsCount"],
    queryFn: async () => (await csvApi.getInvalidRowsCount()).data,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Hook for getting edited rows count
export const useEditedRowsCount = () => {
  return useQuery<ExceptionCountResponse>({
    queryKey: ["editedRowsCount"],
    queryFn: async () => (await csvApi.getEditedRowsCount()).data,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
