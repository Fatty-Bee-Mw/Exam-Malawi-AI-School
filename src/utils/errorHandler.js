/**
 * Centralized error handling utility for API responses
 * Handles FastAPI validation errors, network errors, fetch failures, and nested Pydantic error arrays
 * Never returns an object - always returns a user-friendly string
 */

/**
 * Format API error into a user-friendly string
 * @param {Error|Object|string} error - The error to format
 * @returns {string} - User-friendly error message
 */
export function formatApiError(error) {
  // Handle null/undefined
  if (error === null || error === undefined) {
    return 'An unknown error occurred';
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle Error objects
  if (error instanceof Error) {
    // Check for FastAPI validation error in detail field
    if (error.detail) {
      return formatFastApiError(error.detail);
    }

    // Check for message field
    if (error.message) {
      return error.message;
    }

    // Fallback to error string representation
    return error.toString();
  }

  // Handle plain objects (FastAPI validation errors)
  if (typeof error === 'object') {
    // Check for FastAPI validation error structure
    if (error.detail) {
      return formatFastApiError(error.detail);
    }

    // Check for message field
    if (error.message) {
      return formatFastApiError(error.message);
    }

    // Check for nested validation errors (Pydantic)
    if (error.errors && Array.isArray(error.errors)) {
      return formatPydanticErrors(error.errors);
    }

    // Check for response object with data
    if (error.response) {
      return formatApiError(error.response);
    }

    // Fallback: stringify the object
    try {
      return JSON.stringify(error);
    } catch (e) {
      return 'An unknown error occurred';
    }
  }

  // Fallback for any other type
  return String(error);
}

/**
 * Format FastAPI validation error
 * @param {string|Object} detail - The detail field from FastAPI error
 * @returns {string} - Formatted error message
 */
function formatFastApiError(detail) {
  // Handle string detail
  if (typeof detail === 'string') {
    return detail;
  }

  // Handle object detail (nested validation errors)
  if (typeof detail === 'object') {
    // Check for errors array (Pydantic validation)
    if (detail.errors && Array.isArray(detail.errors)) {
      return formatPydanticErrors(detail.errors);
    }

    // Check for message field
    if (detail.message) {
      return detail.message;
    }

    // Fallback: stringify
    try {
      return JSON.stringify(detail);
    } catch (e) {
      return 'Validation error occurred';
    }
  }

  return 'Validation error occurred';
}

/**
 * Format Pydantic validation errors array
 * @param {Array} errors - Array of Pydantic validation errors
 * @returns {string} - Formatted error message
 */
function formatPydanticErrors(errors) {
  if (!Array.isArray(errors) || errors.length === 0) {
    return 'Validation error occurred';
  }

  // Extract first error for simplicity
  const firstError = errors[0];

  // Handle field-specific validation errors
  if (firstError.loc && Array.isArray(firstError.loc)) {
    const field = firstError.loc[firstError.loc.length - 1]; // Get the field name
    const message = firstError.msg || 'Invalid value';
    return `${field}: ${message}`;
  }

  // Handle simple message errors
  if (firstError.msg) {
    return firstError.msg;
  }

  // Fallback
  return 'Validation error occurred';
}

/**
 * Safe render helper for React components
 * Ensures the value is always a string, never an object
 * @param {any} value - The value to render
 * @param {string} fallback - Fallback string if value is invalid
 * @returns {string} - Safe string to render
 */
export function safeRender(value, fallback = '') {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object') {
    // Check for message field
    if (value.message) {
      return safeRender(value.message, fallback);
    }

    // Check for detail field (FastAPI)
    if (value.detail) {
      return safeRender(value.detail, fallback);
    }

    // Fallback: stringify
    try {
      return JSON.stringify(value);
    } catch (e) {
      return fallback;
    }
  }

  return String(value);
}
