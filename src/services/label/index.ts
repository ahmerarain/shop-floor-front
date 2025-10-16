// Label Generation Types
export interface BulkLabelResponse {
  success: boolean;
  message: string;
  zplFiles?: string[];
  pdfFiles?: string[];
  errors?: string[];
}

export interface LabelGenerationRequest {
  ids: number[];
}

export interface LabelGenerationResponse {
  success: boolean;
  message: string;
  fileUrl?: string;
  fileName?: string;
}
