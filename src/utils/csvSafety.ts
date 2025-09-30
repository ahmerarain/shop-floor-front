/**
 * CSV Safety Utilities
 * Provides protection against CSV formula injection attacks and other security concerns
 */

// Characters that can trigger formula injection in CSV files
const FORMULA_INJECTION_PREFIXES = ["=", "+", "-", "@", "\t", "\r"];

/**
 * Sanitizes a string to prevent CSV formula injection attacks
 * @param value - The string value to sanitize
 * @returns Sanitized string with formula injection protection
 */
export const sanitizeCSVValue = (
  value: string | number | null | undefined
): string => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // If the value starts with a formula injection character, prefix with single quote
  if (
    FORMULA_INJECTION_PREFIXES.some((prefix) => stringValue.startsWith(prefix))
  ) {
    return `'${stringValue}`;
  }

  return stringValue;
};

/**
 * Sanitizes an entire CSV row object to prevent formula injection
 * @param row - The CSV row object to sanitize
 * @returns Sanitized row object
 */
export const sanitizeCSVRow = (
  row: Record<string, any>
): Record<string, any> => {
  const sanitizedRow: Record<string, any> = {};

  for (const [key, value] of Object.entries(row)) {
    // Skip system fields that shouldn't be sanitized
    if (key === "id" || key === "created_at" || key === "updated_at") {
      sanitizedRow[key] = value;
    } else {
      sanitizedRow[key] = sanitizeCSVValue(value);
    }
  }

  return sanitizedRow;
};

/**
 * Escapes CSV field values to prevent injection and handle special characters
 * @param value - The value to escape
 * @returns Properly escaped CSV field value
 */
export const escapeCSVField = (
  value: string | number | null | undefined
): string => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // First apply formula injection protection
  const sanitized = sanitizeCSVValue(stringValue);

  // Escape double quotes by doubling them
  const escaped = sanitized.replace(/"/g, '""');

  // If the field contains commas, newlines, or quotes, wrap in double quotes
  if (
    escaped.includes(",") ||
    escaped.includes("\n") ||
    escaped.includes("\r") ||
    escaped.includes('"')
  ) {
    return `"${escaped}"`;
  }

  return escaped;
};

/**
 * Validates if a string contains potentially dangerous content
 * @param value - The string to validate
 * @returns Object with validation result and details
 */
export const validateCSVContent = (
  value: string
): {
  isSafe: boolean;
  warnings: string[];
  sanitized: string;
} => {
  const warnings: string[] = [];
  let isSafe = true;

  // Check for formula injection patterns
  if (FORMULA_INJECTION_PREFIXES.some((prefix) => value.startsWith(prefix))) {
    warnings.push(
      `Value starts with '${value[0]}' - will be prefixed with single quote for safety`
    );
    isSafe = false;
  }

  // Check for other potentially dangerous patterns
  if (
    value.includes("=HYPERLINK(") ||
    value.includes("=IMPORTXML(") ||
    value.includes("=WEBSERVICE(")
  ) {
    warnings.push("Value contains potentially dangerous Excel functions");
    isSafe = false;
  }

  // Check for extremely long values that might cause issues
  if (value.length > 10000) {
    warnings.push("Value is very long and may cause performance issues");
  }

  return {
    isSafe,
    warnings,
    sanitized: sanitizeCSVValue(value),
  };
};

/**
 * Creates a safe CSV row with proper escaping
 * @param row - The row data to convert to CSV
 * @param headers - The column headers
 * @returns CSV-formatted row string
 */
export const createSafeCSVRow = (
  row: Record<string, any>,
  headers: string[]
): string => {
  return headers.map((header) => escapeCSVField(row[header])).join(",");
};

/**
 * Creates CSV headers with proper escaping
 * @param headers - Array of header names
 * @returns CSV-formatted header string
 */
export const createCSVHeaders = (headers: string[]): string => {
  return headers.map((header) => escapeCSVField(header)).join(",");
};
