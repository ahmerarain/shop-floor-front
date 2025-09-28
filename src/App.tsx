import { useState } from "react";
import { CSVUpload } from "./components/CSVUpload";
import { DataGrid } from "./components/DataGrid";
import { Header } from "./components/Header";
import { useCSVData, useUpdateRow, useExportData } from "./hooks/useCSVData";
import { useDebounce } from "./hooks/useDebounce";
import { CSVRow } from "./services/api";

function App() {
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
  const exportMutation = useExportData();

  // Extract data from query result
  const data = queryData?.data || [];
  const total = queryData?.total || 0;

  const handleUpdateRow = (id: number, updatedData: Partial<CSVRow>) => {
    updateRowMutation.mutate({ id, data: updatedData });
  };

  const handleExport = () => {
    exportMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onSearch={setSearchTerm}
        onExport={handleExport}
        totalRows={total}
        isExporting={exportMutation.isPending}
        isSearching={isFetching && !isLoading}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <CSVUpload />
        </div>

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
}

export default App;
