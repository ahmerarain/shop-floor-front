import React, { useRef, useState } from "react";
import { useUploadCSV, useDownloadErrorFile } from "../hooks/useCSVData";
import { toast } from "sonner";
import {
  validateRequiredHeaders,
  createMissingHeadersMessage,
  getRequiredHeadersDisplay,
  parseCSVData,
  validateCSVDataRows,
  createEmptyValuesMessage,
} from "../utils/headerValidation";
import {
  Upload,
  Loader2,
  CheckCircle,
  XCircle,
  Download,
  AlertTriangle,
} from "lucide-react";

// CSV Safety Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ALLOWED_MIME_TYPES = [
  "text/csv",
  "application/csv",
  "text/plain",
  "application/vnd.ms-excel",
];
const ALLOWED_EXTENSIONS = [".csv"];

// File validation functions
const validateFileSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE;
};

const validateFileType = (file: File): boolean => {
  // Check MIME type
  const mimeValid = ALLOWED_MIME_TYPES.includes(file.type);

  // Check file extension as fallback
  const extensionValid = ALLOWED_EXTENSIONS.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  );

  return mimeValid || extensionValid;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const CSVUpload: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadCSV();
  const downloadErrorMutation = useDownloadErrorFile();
  const [isValidatingHeaders, setIsValidatingHeaders] = useState(false);
  const [headerValidationError, setHeaderValidationError] = useState<
    string | null
  >(null);

  const uploadResult = uploadMutation.data?.data;

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear previous validation errors
    setHeaderValidationError(null);

    // Validate file size
    if (!validateFileSize(file)) {
      toast.error(
        `File too large. Maximum size is ${formatFileSize(
          MAX_FILE_SIZE
        )}. Your file is ${formatFileSize(file.size)}.`
      );
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Validate file type (MIME type and extension)
    if (!validateFileType(file)) {
      toast.error(
        "Invalid file type. Please select a CSV file (.csv extension required)."
      );
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Validate CSV headers and data
    setIsValidatingHeaders(true);
    try {
      // First, read the entire file to validate both headers and data
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(file);
      });

      // Parse CSV data
      const { headers, data, errors: parseErrors } = parseCSVData(fileContent);

      if (parseErrors.length > 0) {
        const errorMessage = parseErrors.join("; ");
        setHeaderValidationError(errorMessage);
        toast.error(`CSV parsing failed: ${errorMessage}`);

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Validate headers
      const headerValidation = validateRequiredHeaders(headers);
      if (!headerValidation.isValid) {
        const errorMessage = createMissingHeadersMessage(
          headerValidation.missingHeaders
        );
        setHeaderValidationError(errorMessage);
        toast.error(`Header validation failed: ${errorMessage}`);

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Validate data rows for empty required values
      const dataValidation = validateCSVDataRows(data, headers);
      if (!dataValidation.isValid) {
        const errorMessage = createEmptyValuesMessage(
          dataValidation.emptyValueErrors
        );
        setHeaderValidationError(errorMessage);
        toast.error(`Data validation failed: ${errorMessage}`);

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Show warnings if any
      const allWarnings = [
        ...headerValidation.warnings,
        ...dataValidation.warnings,
      ];
      if (allWarnings.length > 0) {
        allWarnings.forEach((warning) => {
          toast.warning(warning);
        });
      }

      // All validations passed, proceed with upload
      uploadMutation.mutate(file);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to validate CSV file";
      setHeaderValidationError(errorMessage);
      toast.error(`Validation failed: ${errorMessage}`);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsValidatingHeaders(false);
    }
  };

  const handleDownloadErrorFile = () => {
    downloadErrorMutation.mutate();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Upload CSV File
      </h2>

      <div className="space-y-4">
        {/* Upload Area */}
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={uploadMutation.isPending || isValidatingHeaders}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              uploadMutation.isPending || isValidatingHeaders
                ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploadMutation.isPending || isValidatingHeaders ? (
                <Loader2 className="w-8 h-8 mb-4 text-blue-600 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 mb-4 text-gray-400" />
              )}
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">
                  {isValidatingHeaders
                    ? "Validating file..."
                    : uploadMutation.isPending
                    ? "Processing..."
                    : "Click to upload CSV file"}
                </span>
              </p>
              <p className="text-xs text-gray-500">
                {uploadMutation.isPending || isValidatingHeaders
                  ? "Please wait..."
                  : "or drag and drop"}
              </p>
            </div>
          </label>
        </div>

        {uploadResult && (
          <div
            className={`p-4 rounded-lg ${
              uploadResult.success
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {uploadResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <h3
                  className={`text-sm font-medium ${
                    uploadResult.success ? "text-green-800" : "text-red-800"
                  }`}
                >
                  Upload Complete
                </h3>
                <div
                  className={`mt-2 text-sm ${
                    uploadResult.success ? "text-green-700" : "text-red-700"
                  }`}
                >
                  <p>Valid rows: {uploadResult.validRows}</p>
                  <p>Invalid rows: {uploadResult.invalidRows}</p>
                  {uploadResult.hasErrorFile && (
                    <button
                      onClick={handleDownloadErrorFile}
                      disabled={downloadErrorMutation.isPending}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-500 underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {downloadErrorMutation.isPending ? (
                        <Loader2 className="animate-spin h-3 w-3" />
                      ) : (
                        <Download className="h-3 w-3" />
                      )}
                      {downloadErrorMutation.isPending
                        ? "Downloading..."
                        : "Download error.csv file"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {headerValidationError && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  File Validation Failed
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {headerValidationError}
                </p>
                <p className="mt-2 text-sm text-red-600">
                  Please ensure your CSV file contains all required headers and
                  that all required fields have values.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600 space-y-2">
          <div className="space-y-1">
            <p>
              <strong>{getRequiredHeadersDisplay()}</strong>
            </p>
            <p>
              <strong>File requirements:</strong> CSV format, max{" "}
              {formatFileSize(MAX_FILE_SIZE)}
            </p>

            <p>
              <strong>Data validation:</strong> All required headers must be
              present and all required fields must have values
            </p>
            <p>
              Invalid rows will be exported to error.csv with validation
              reasons.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
