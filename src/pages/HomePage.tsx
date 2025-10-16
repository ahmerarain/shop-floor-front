import React, { useState } from "react";
import { CSVUpload } from "../components/CSVUpload";
import { DataGrid } from "../components/DataGrid";
import { useCSVData, useUpdateRow, useExportData } from "../hooks/useCSVData";
import { useDebounce } from "../hooks/useDebounce";
import { CSVRow } from "../services/api";
import {
  useExportInvalidRows,
  useExportEditedRows,
  useInvalidRowsCount,
  useEditedRowsCount,
} from "../hooks/useExceptionExports";
import { Search, Loader2, AlertTriangle, Edit3, Download } from "lucide-react";

export const HomePage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // React Query hooks
  const {
    data: queryData,
    isLoading,
    isFetching,
  } = useCSVData(currentPage, debouncedSearchTerm);
  const updateRowMutation = useUpdateRow();

  // Export hooks
  const exportMutation = useExportData();
  const exportInvalidRowsMutation = useExportInvalidRows();
  const exportEditedRowsMutation = useExportEditedRows();
  const { data: invalidRowsCountData } = useInvalidRowsCount();
  const { data: editedRowsCountData } = useEditedRowsCount();

  // Extract data from query result
  const data = queryData?.data || [];
  const total = queryData?.total || 0;

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Reset to page 1 when searching to ensure results are shown from the beginning
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handleUpdateRow = (id: number, updatedData: Partial<CSVRow>) => {
    updateRowMutation.mutate({ id, data: updatedData });
  };

  const handleExport = () => {
    exportMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-2 flex flex-wrap gap-3 justify-end">
          {/* Exception Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => exportInvalidRowsMutation.mutate()}
              disabled={
                exportInvalidRowsMutation.isPending ||
                (invalidRowsCountData as any)?.count === 0
              }
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              title={`Export ${
                (invalidRowsCountData as any)?.count || 0
              } invalid rows`}
            >
              {exportInvalidRowsMutation.isPending && (
                <Loader2 className="animate-spin h-4 w-4" />
              )}
              <AlertTriangle className="h-4 w-4" />
              {exportInvalidRowsMutation.isPending
                ? "Exporting..."
                : `Invalid (${(invalidRowsCountData as any)?.count || 0})`}
            </button>

            <button
              onClick={() => exportEditedRowsMutation.mutate()}
              disabled={
                exportEditedRowsMutation.isPending ||
                (editedRowsCountData as any)?.count === 0
              }
              className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              title={`Export ${
                (editedRowsCountData as any)?.count || 0
              } edited rows`}
            >
              {exportEditedRowsMutation.isPending && (
                <Loader2 className="animate-spin h-4 w-4" />
              )}
              <Edit3 className="h-4 w-4" />
              {exportEditedRowsMutation.isPending
                ? "Exporting..."
                : `Edited (${(editedRowsCountData as any)?.count || 0})`}
            </button>
          </div>

          <button
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {exportMutation.isPending && (
              <Loader2 className="animate-spin h-4 w-4" />
            )}
            <Download className="h-4 w-4" />
            {exportMutation.isPending ? "Exporting..." : "Export CSV"}
          </button>
        </div>

        <div className="mb-8">
          <CSVUpload />
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by PartMark, AssemblyMark, or Material..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {isFetching && !isLoading ? (
                <Loader2 className="animate-spin h-5 w-5 text-blue-500" />
              ) : (
                <Search className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {/* Export Buttons */}

        <DataGrid
          data={data}
          loading={isLoading}
          onUpdateRow={handleUpdateRow}
          currentPage={currentPage}
          totalPages={Math.ceil(total / 100)}
          onPageChange={setCurrentPage}
          isUpdating={updateRowMutation.isPending}
        />
      </div>
    </div>
  );
};
