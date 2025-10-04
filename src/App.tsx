import { useState } from "react";
import { CSVUpload } from "./components/CSVUpload";
import { DataGrid } from "./components/DataGrid";
import { Header } from "./components/Header";
import { AuditLog } from "./components/AuditLog";
import { useCSVData, useUpdateRow, useExportData } from "./hooks/useCSVData";
import { useDebounce } from "./hooks/useDebounce";
import {
  useExportInvalidRows,
  useExportEditedRows,
  useInvalidRowsCount,
  useEditedRowsCount,
} from "./hooks/useExceptionExports";
import { CSVRow } from "./services/api";

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAuditLog, setShowAuditLog] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // React Query hooks
  const {
    data: queryData,
    isLoading,
    isFetching,
  } = useCSVData(currentPage, debouncedSearchTerm);
  const updateRowMutation = useUpdateRow();
  const exportMutation = useExportData();

  // Exception export hooks
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

  const handleShowAuditLog = () => {
    setShowAuditLog(true);
  };

  const handleCloseAuditLog = () => {
    setShowAuditLog(false);
  };

  const handleExportInvalidRows = () => {
    exportInvalidRowsMutation.mutate();
  };

  const handleExportEditedRows = () => {
    exportEditedRowsMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onSearch={handleSearch}
        onExport={handleExport}
        onShowAuditLog={handleShowAuditLog}
        onExportInvalidRows={handleExportInvalidRows}
        onExportEditedRows={handleExportEditedRows}
        totalRows={total}
        invalidRowsCount={(invalidRowsCountData as any)?.count || 0}
        editedRowsCount={(editedRowsCountData as any)?.count || 0}
        isExporting={exportMutation.isPending}
        isExportingInvalid={exportInvalidRowsMutation.isPending}
        isExportingEdited={exportEditedRowsMutation.isPending}
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

      <AuditLog isOpen={showAuditLog} onClose={handleCloseAuditLog} />
    </div>
  );
}

export default App;
