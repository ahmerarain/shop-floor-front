/**
 * Header Validation Utilities
 * Provides validation for required CSV headers and field enforcement
 */

// Required headers that must be present in CSV files
export const REQUIRED_HEADERS = [
  "PartMark",
  "AssemblyMark",
  "Material",
  "Thickness",
] as const;

// Alternative header names that are also acceptable
export const HEADER_ALIASES: Record<string, string> = {
  part_mark: "PartMark",
  partmark: "PartMark",
  "part-mark": "PartMark",
  "part mark": "PartMark",

  assembly_mark: "AssemblyMark",
  assemblymark: "AssemblyMark",
  "assembly-mark": "AssemblyMark",
  "assembly mark": "AssemblyMark",

  material: "Material",
  materials: "Material",

  thickness: "Thickness",
  thick: "Thickness",
  thicknes: "Thickness", // Common typo
};

// Optional headers that are commonly used
export const OPTIONAL_HEADERS = [
  "Quantity",
  "Length",
  "Width",
  "Height",
  "Weight",
  "Notes",
] as const;

export type RequiredHeader = (typeof REQUIRED_HEADERS)[number];
export type OptionalHeader = (typeof OPTIONAL_HEADERS)[number];

/**
 * Normalizes a header name by checking against aliases and standardizing case
 * @param header - The header name to normalize
 * @returns Normalized header name or original if no match found
 */
export const normalizeHeader = (header: string): string => {
  const trimmed = header.trim();
  const lower = trimmed.toLowerCase();

  // Check if it's already a required header (case-insensitive)
  const requiredMatch = REQUIRED_HEADERS.find(
    (req) => req.toLowerCase() === lower
  );
  if (requiredMatch) {
    return requiredMatch;
  }

  // Check against aliases
  if (HEADER_ALIASES[lower]) {
    return HEADER_ALIASES[lower];
  }

  // Return original if no match found
  return trimmed;
};

/**
 * Validates if all required headers are present in the CSV
 * @param headers - Array of header names from the CSV
 * @returns Validation result with missing headers and normalized headers
 */
export const validateRequiredHeaders = (
  headers: string[]
): {
  isValid: boolean;
  missingHeaders: string[];
  normalizedHeaders: string[];
  warnings: string[];
} => {
  const warnings: string[] = [];
  const missingHeaders: string[] = [];
  const normalizedHeaders: string[] = [];

  // Normalize all headers
  const normalized = headers.map((header) => normalizeHeader(header));
  normalizedHeaders.push(...normalized);

  // Check for each required header
  for (const required of REQUIRED_HEADERS) {
    const found = normalized.some((header) => header === required);
    if (!found) {
      missingHeaders.push(required);
    }
  }

  // Check for duplicate headers
  const duplicates = normalized.filter(
    (header, index) => normalized.indexOf(header) !== index
  );
  if (duplicates.length > 0) {
    warnings.push(`Duplicate headers found: ${duplicates.join(", ")}`);
  }

  // Check for empty headers
  const emptyHeaders = headers.filter((header) => !header.trim());
  if (emptyHeaders.length > 0) {
    warnings.push(`${emptyHeaders.length} empty header(s) found`);
  }

  return {
    isValid: missingHeaders.length === 0,
    missingHeaders,
    normalizedHeaders,
    warnings,
  };
};

/**
 * Validates a single row against required headers
 * @param row - The data row to validate
 * @param headers - The headers for the row
 * @returns Validation result for the row
 */
export const validateRowData = (
  row: Record<string, any>,
  headers: string[]
): {
  isValid: boolean;
  missingFields: string[];
  emptyRequiredFields: string[];
} => {
  const missingFields: string[] = [];
  const emptyRequiredFields: string[] = [];

  // Check each required header
  for (const required of REQUIRED_HEADERS) {
    const headerIndex = headers.findIndex(
      (h) => normalizeHeader(h) === required
    );

    if (headerIndex === -1) {
      missingFields.push(required);
    } else {
      const value = row[headers[headerIndex]];
      if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
      ) {
        emptyRequiredFields.push(required);
      }
    }
  }

  return {
    isValid: missingFields.length === 0 && emptyRequiredFields.length === 0,
    missingFields,
    emptyRequiredFields,
  };
};

/**
 * Creates a user-friendly error message for missing headers
 * @param missingHeaders - Array of missing header names
 * @returns Formatted error message
 */
export const createMissingHeadersMessage = (
  missingHeaders: string[]
): string => {
  if (missingHeaders.length === 0) {
    return "";
  }

  if (missingHeaders.length === 1) {
    return `Missing required header: ${missingHeaders[0]}`;
  }

  const lastHeader = missingHeaders[missingHeaders.length - 1];
  const otherHeaders = missingHeaders.slice(0, -1);

  return `Missing required headers: ${otherHeaders.join(
    ", "
  )} and ${lastHeader}`;
};

/**
 * Gets the expected header format for display
 * @returns Formatted string showing required headers
 */
export const getRequiredHeadersDisplay = (): string => {
  return `Required headers: ${REQUIRED_HEADERS.join(", ")}`;
};

/**
 * Validates if a header name looks like a required header (fuzzy matching)
 * @param header - The header name to check
 * @returns Object with match information
 */
export const fuzzyMatchHeader = (
  header: string
): {
  isMatch: boolean;
  suggestedHeader: string | null;
  confidence: number;
} => {
  const normalized = normalizeHeader(header);
  const lower = header.toLowerCase();

  // Exact match
  if (REQUIRED_HEADERS.includes(normalized as RequiredHeader)) {
    return {
      isMatch: true,
      suggestedHeader: normalized,
      confidence: 1.0,
    };
  }

  // Check for partial matches
  for (const required of REQUIRED_HEADERS) {
    const requiredLower = required.toLowerCase();

    // Check if header contains required or vice versa
    if (lower.includes(requiredLower) || requiredLower.includes(lower)) {
      return {
        isMatch: false,
        suggestedHeader: required,
        confidence: 0.7,
      };
    }

    // Check for similar words
    const requiredWords = requiredLower.split(/\s+/);
    const headerWords = lower.split(/\s+/);

    const commonWords = requiredWords.filter((word) =>
      headerWords.some((hWord) => hWord.includes(word) || word.includes(hWord))
    );

    if (commonWords.length > 0) {
      return {
        isMatch: false,
        suggestedHeader: required,
        confidence: 0.5,
      };
    }
  }

  return {
    isMatch: false,
    suggestedHeader: null,
    confidence: 0,
  };
};

/**
 * Validates CSV data rows for empty required values
 * @param csvData - Array of CSV rows (objects with header keys)
 * @param headers - Array of header names
 * @returns Validation result with empty value details
 */
export const validateCSVDataRows = (
  csvData: Record<string, any>[],
  headers: string[]
): {
  isValid: boolean;
  emptyValueErrors: Array<{
    rowNumber: number;
    field: string;
    value: any;
  }>;
  totalErrors: number;
  warnings: string[];
} => {
  const emptyValueErrors: Array<{
    rowNumber: number;
    field: string;
    value: any;
  }> = [];
  const warnings: string[] = [];

  // Check each row
  csvData.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because CSV rows start at 2 (1 is header)

    // Check each required header
    for (const required of REQUIRED_HEADERS) {
      const headerIndex = headers.findIndex(
        (h) => normalizeHeader(h) === required
      );

      if (headerIndex !== -1) {
        const headerName = headers[headerIndex];
        const value = row[headerName];

        // Check if value is empty, null, undefined, or just whitespace
        if (
          value === null ||
          value === undefined ||
          String(value).trim() === ""
        ) {
          emptyValueErrors.push({
            rowNumber,
            field: required,
            value: value,
          });
        }
      }
    }
  });

  // Generate warnings
  if (emptyValueErrors.length > 0) {
    warnings.push(
      `${emptyValueErrors.length} empty required value(s) found in data rows`
    );
  }

  return {
    isValid: emptyValueErrors.length === 0,
    emptyValueErrors,
    totalErrors: emptyValueErrors.length,
    warnings,
  };
};

/**
 * Creates a detailed error message for empty required values
 * @param emptyValueErrors - Array of empty value errors
 * @returns Formatted error message
 */
export const createEmptyValuesMessage = (
  emptyValueErrors: Array<{
    rowNumber: number;
    field: string;
    value: any;
  }>
): string => {
  if (emptyValueErrors.length === 0) {
    return "";
  }

  // Group errors by row number for better readability
  const errorsByRow = emptyValueErrors.reduce((acc, error) => {
    if (!acc[error.rowNumber]) {
      acc[error.rowNumber] = [];
    }
    acc[error.rowNumber].push(error.field);
    return acc;
  }, {} as Record<number, string[]>);

  const errorMessages = Object.entries(errorsByRow).map(
    ([rowNumber, fields]) => {
      if (fields.length === 1) {
        return `Row ${rowNumber}: Missing ${fields[0]}`;
      }
      return `Row ${rowNumber}: Missing ${fields.join(", ")}`;
    }
  );

  if (errorMessages.length <= 3) {
    return errorMessages.join("; ");
  }

  return `${errorMessages.slice(0, 3).join("; ")} and ${
    errorMessages.length - 3
  } more row(s)`;
};

/**
 * Parses CSV data from text content
 * @param csvText - The CSV text content
 * @returns Object with headers and data rows
 */
export const parseCSVData = (
  csvText: string
): {
  headers: string[];
  data: Record<string, any>[];
  errors: string[];
} => {
  const errors: string[] = [];
  const lines = csvText.split("\n").filter((line) => line.trim() !== "");

  if (lines.length < 2) {
    errors.push("CSV file must contain at least a header row and one data row");
    return { headers: [], data: [], errors };
  }

  // Parse headers
  const headerLine = lines[0].trim();
  const headers = headerLine
    .split(",")
    .map((header) => header.trim().replace(/^["']|["']$/g, ""));

  // Parse data rows
  const data: Record<string, any>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") continue; // Skip empty lines

    const values = line.split(",").map((value) => {
      const trimmed = value.trim();
      // Remove quotes if present
      return trimmed.replace(/^["']|["']$/g, "");
    });

    // Create row object
    const row: Record<string, any> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    data.push(row);
  }

  return { headers, data, errors };
};
