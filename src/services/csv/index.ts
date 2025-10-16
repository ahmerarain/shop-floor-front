// CSV Data Types
export interface CSVRow {
  id: number;
  part_mark: string;
  assembly_mark: string;
  material: string;
  thickness: string;
  quantity: number;
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  total: number;
  page: number;
  limit: number;
}

export interface UploadResponse {
  success: boolean;
  validRows: number;
  invalidRows: number;
  hasErrorFile: boolean;
  error?: string;
}

export interface AuditLogEntry {
  id: number;
  timestamp: string;
  user: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "BULK_DELETE" | "CLEAR_ALL";
  row_id?: number;
  diff?: string;
  created_at: string;
  user_name: string;
  user_email: string;
}

export interface AuditLogResponse {
  success: boolean;
  data: AuditLogEntry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Exception export types
export interface ExceptionCountResponse {
  success: boolean;
  count: number;
}

export interface InvalidRowData {
  row_id: number;
  source_filename: string;
  line_no: number;
  uploaded_at: string;
  last_validated_at: string;
  is_valid: boolean;
  error_codes: string;
  error_messages: string;
  // Original data fields
  part_mark: string;
  assembly_mark: string;
  material: string;
  thickness: string;
  quantity: number;
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  notes?: string;
}

export interface EditedRowData {
  row_id: number;
  source_filename: string;
  line_no: number;
  uploaded_at: string;
  last_validated_at: string;
  is_valid: boolean;
  error_codes: string;
  error_messages: string;
  // Edit tracking fields
  edited_by: string;
  edited_at: string;
  fields_changed: string;
  // Original data fields with before/after values
  part_mark: string;
  part_mark_original?: string;
  part_mark_new?: string;
  assembly_mark: string;
  assembly_mark_original?: string;
  assembly_mark_new?: string;
  material: string;
  material_original?: string;
  material_new?: string;
  thickness: string;
  thickness_original?: string;
  thickness_new?: string;
  quantity: number;
  quantity_original?: number;
  quantity_new?: number;
  length?: number;
  length_original?: number;
  length_new?: number;
  width?: number;
  width_original?: number;
  width_new?: number;
  height?: number;
  height_original?: number;
  height_new?: number;
  weight?: number;
  weight_original?: number;
  weight_new?: number;
  notes?: string;
  notes_original?: string;
  notes_new?: string;
}
