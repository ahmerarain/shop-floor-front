import React, { useRef } from "react";
import { useUploadCSV, useDownloadErrorFile } from "../hooks/useCSVData";
import { toast } from "sonner";

export const CSVUpload: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadCSV();
  const downloadErrorMutation = useDownloadErrorFile();

  const uploadResult = uploadMutation.data?.data;

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please select a CSV file");
      return;
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    uploadMutation.mutate(file);
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

          {uploadMutation.isPending && (
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
              Processing...
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

        <div className="text-sm text-gray-600">
          <p>
            <strong>Required fields:</strong> PartMark, AssemblyMark, Material,
            Thickness
          </p>
          <p>
            Invalid rows will be exported to error.csv with validation reasons.
          </p>
        </div>
      </div>
    </div>
  );
};
