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
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={uploadMutation.isPending}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />

          {(uploadMutation.isPending || isValidatingHeaders) && (
            <div className="flex items-center text-blue-600">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {isValidatingHeaders ? "Validating file..." : "Processing..."}
            </div>
          )}
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
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
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
                      {downloadErrorMutation.isPending && (
                        <svg
                          className="animate-spin h-3 w-3"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
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
              <svg
                className="h-5 w-5 text-red-400 mt-0.5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
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
