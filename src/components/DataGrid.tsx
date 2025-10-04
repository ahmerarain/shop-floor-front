import React, { useState, useEffect } from "react";
import { CSVRow } from "../services/api";
import { useDeleteRows, useDelete } from "../hooks/useCSVData";
import { validateCSVContent, sanitizeCSVRow } from "../utils/csvSafety";
import { validateRowData } from "../utils/headerValidation";
import {
  useGenerateZPLLabel,
  useGeneratePDFLabel,
  useGenerateBulkLabels,
} from "../hooks/useLabels";

interface DataGridProps {
  data: CSVRow[];
  loading: boolean;
  onUpdateRow: (id: number, updatedData: Partial<CSVRow>) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isUpdating?: boolean;
}

export const DataGrid: React.FC<DataGridProps> = ({
  data,
  loading,
  onUpdateRow,
  currentPage,
  totalPages,
  onPageChange,
  isUpdating = false,
}) => {
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<CSVRow>>({});
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Delete hooks
  const deleteRowsMutation = useDeleteRows();
  const deleteRowMutation = useDelete();

  // Label generation hooks
  const generateZPLLabelMutation = useGenerateZPLLabel();
  const generatePDFLabelMutation = useGeneratePDFLabel();
  const generateBulkLabelsMutation = useGenerateBulkLabels();

  const handleEdit = (row: CSVRow) => {
    setEditingRow(row.id);
    setEditData({ ...row });
  };

  const handleSave = (id: number) => {
    // Validate required fields before saving
    const requiredFieldValidation = validateRowData(
      editData,
      Object.keys(editData)
    );

    if (!requiredFieldValidation.isValid) {
      const missingFields = requiredFieldValidation.missingFields;
      const emptyFields = requiredFieldValidation.emptyRequiredFields;

      let errorMessage = "Cannot save: ";
      if (missingFields.length > 0) {
        errorMessage += `Missing required fields: ${missingFields.join(
          ", "
        )}. `;
      }
      if (emptyFields.length > 0) {
        errorMessage += `Empty required fields: ${emptyFields.join(", ")}.`;
      }

      alert(errorMessage);
      return;
    }

    // Sanitize the edit data before sending to server
    const sanitizedData = sanitizeCSVRow(editData);
    onUpdateRow(id, sanitizedData);
    setEditingRow(null);
    setEditData({});
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditData({});
  };

  const handleInputChange = (field: keyof CSVRow, value: string | number) => {
    // For text fields, validate for formula injection
    if (
      typeof value === "string" &&
      field !== "id" &&
      field !== "created_at" &&
      field !== "updated_at"
    ) {
      const validation = validateCSVContent(value);
      if (!validation.isSafe) {
        // Show warning but allow editing (user can decide to keep or change)
        console.warn(
          `Security warning for field ${field}:`,
          validation.warnings
        );
      }
    }

    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(data.map((row) => row.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  // Delete handlers
  const handleDeleteRow = (id: number) => {
    if (window.confirm("Are you sure you want to delete this row?")) {
      deleteRowMutation.mutate(id);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedRows.size === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedRows.size} selected row(s)?`
      )
    ) {
      deleteRowsMutation.mutate(Array.from(selectedRows));
      setSelectedRows(new Set());
    }
  };

  // Label generation handlers
  const handleGenerateZPLLabel = (id: number) => {
    generateZPLLabelMutation.mutate(id);
  };

  const handleGeneratePDFLabel = (id: number) => {
    generatePDFLabelMutation.mutate(id);
  };

  const handleGenerateBulkLabels = () => {
    if (selectedRows.size === 0) return;
    generateBulkLabelsMutation.mutate(Array.from(selectedRows));
  };

  const isAllSelected = data.length > 0 && selectedRows.size === data.length;
  const isIndeterminate =
    selectedRows.size > 0 && selectedRows.size < data.length;

  // Helper function to safely display values with security indicators
  const renderSafeValue = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">-</span>;
    }

    const stringValue = String(value);
    const validation = validateCSVContent(stringValue);

    if (!validation.isSafe) {
      return (
        <div className="flex items-center gap-1">
          <span
            className="text-orange-600 font-medium"
            title={`Potentially unsafe content: ${validation.warnings.join(
              ", "
            )}`}
          >
            {stringValue}
          </span>
          <svg
            className="h-3 w-3 text-orange-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    }

    return <span>{stringValue}</span>;
  };

  // Clear selections when data changes (e.g., after delete, search, pagination)
  useEffect(() => {
    setSelectedRows(new Set());
  }, [data]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading data...</span>
        </div>
      </div>
    );
  }

  if (data?.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No data</h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload a CSV file to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Data Grid</h2>
            <p className="text-sm text-gray-600">
              Click on any cell to edit inline
            </p>
          </div>

          {selectedRows.size > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {selectedRows.size} row(s) selected
              </span>
              <button
                onClick={handleGenerateBulkLabels}
                disabled={generateBulkLabelsMutation.isPending}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {generateBulkLabelsMutation.isPending && (
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
                {generateBulkLabelsMutation.isPending
                  ? "Generating..."
                  : "Generate Labels"}
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={deleteRowsMutation.isPending}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {deleteRowsMutation.isPending && (
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
                {deleteRowsMutation.isPending
                  ? "Deleting..."
                  : "Delete Selected"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">id</div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">Part Mark</div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">Assembly Mark</div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">Material</div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">Thickness</div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Length
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Width
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Height
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Weight
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data &&
              data?.length > 0 &&
              data?.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={(e) =>
                        handleSelectRow(row.id, e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingRow === row.id ? (
                      <input
                        type="text"
                        value={editData.part_mark || ""}
                        onChange={(e) =>
                          handleInputChange("part_mark", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Required field"
                        required
                      />
                    ) : (
                      <span className="font-medium">
                        {renderSafeValue(row.part_mark)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingRow === row.id ? (
                      <input
                        type="text"
                        value={editData.assembly_mark || ""}
                        onChange={(e) =>
                          handleInputChange("assembly_mark", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Required field"
                        required
                      />
                    ) : (
                      renderSafeValue(row.assembly_mark)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingRow === row.id ? (
                      <input
                        type="text"
                        value={editData.material || ""}
                        onChange={(e) =>
                          handleInputChange("material", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Required field"
                        required
                      />
                    ) : (
                      renderSafeValue(row.material)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingRow === row.id ? (
                      <input
                        type="text"
                        value={editData.thickness || ""}
                        onChange={(e) =>
                          handleInputChange("thickness", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Required field"
                        required
                      />
                    ) : (
                      renderSafeValue(row.thickness)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingRow === row.id ? (
                      <input
                        type="number"
                        value={editData.quantity || 1}
                        onChange={(e) =>
                          handleInputChange(
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      renderSafeValue(row.quantity)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingRow === row.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editData.length || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "length",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      renderSafeValue(row.length)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingRow === row.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editData.width || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "width",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      renderSafeValue(row.width)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingRow === row.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editData.height || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "height",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      renderSafeValue(row.height)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingRow === row.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editData.weight || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "weight",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      renderSafeValue(row.weight)
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    {editingRow === row.id ? (
                      <input
                        type="text"
                        value={editData.notes || ""}
                        onChange={(e) =>
                          handleInputChange("notes", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="truncate block">
                        {renderSafeValue(row.notes)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingRow === row.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSave(row.id)}
                          disabled={isUpdating}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {isUpdating && (
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
                          {isUpdating ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={isUpdating}
                          className="text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-1">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(row)}
                            className="text-blue-600 hover:text-blue-900 text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRow(row.id)}
                            disabled={deleteRowMutation.isPending}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs"
                          >
                            {deleteRowMutation.isPending && (
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
                            {deleteRowMutation.isPending
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleGenerateZPLLabel(row.id)}
                            disabled={generateZPLLabelMutation.isPending}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs"
                          >
                            {generateZPLLabelMutation.isPending && (
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
                            ZPL
                          </button>
                          <button
                            onClick={() => handleGeneratePDFLabel(row.id)}
                            disabled={generatePDFLabelMutation.isPending}
                            className="text-purple-600 hover:text-purple-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs"
                          >
                            {generatePDFLabelMutation.isPending && (
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
                            PDF
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> of{" "}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
