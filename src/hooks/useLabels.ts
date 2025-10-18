import { useMutation } from "@tanstack/react-query";
import { labelApi } from "../services/label/label.service";
import { BulkLabelResponse } from "../services/label";

// Hook for generating ZPL label
export const useGenerateZPLLabel = () => {
  return useMutation({
    mutationFn: (id: number) => labelApi.generateZPLLabel(id),
    onSuccess: (response, id) => {
      // Create blob and trigger download
      const blob = new Blob([response.data], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `label_${id}.zpl`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};

// Hook for generating PDF label
export const useGeneratePDFLabel = () => {
  return useMutation({
    mutationFn: (id: number) => labelApi.generatePDFLabel(id),
    onSuccess: (response, id) => {
      // Create blob and trigger download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `label_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};

// Hook for generating bulk labels
export const useGenerateBulkLabels = () => {
  return useMutation({
    mutationFn: (ids: number[]) => labelApi.generateBulkLabels(ids),
    onSuccess: (response: { data: BulkLabelResponse }) => {
      // Handle bulk label generation response
      console.log("Bulk labels generated:", response.data);
    },
  });
};

// Hook for downloading ZPL file
export const useDownloadZPLFile = () => {
  return useMutation({
    mutationFn: (id: number) => labelApi.downloadZPLFile(id),
    onSuccess: (response, id) => {
      const blob = new Blob([response.data], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `label_${id}.zpl`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};

// Hook for downloading PDF file
export const useDownloadPDFFile = () => {
  return useMutation({
    mutationFn: (id: number) => labelApi.downloadPDFFile(id),
    onSuccess: (response, id) => {
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `label_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};
