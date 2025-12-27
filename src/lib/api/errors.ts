import { ApiError } from './client';

// Type guard for ApiError
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

// Parse error to user-friendly message
export function parseApiError(error: unknown): string {
  if (isApiError(error)) {
    return getErrorMessage(error);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

// Get user-friendly error message based on error code or status
export function getErrorMessage(error: ApiError): string {
  // Check for specific error codes first
  switch (error.code) {
    case 'INVALID_CREDENTIALS':
      return 'Invalid email or password';
    case 'EMAIL_EXISTS':
      return 'This email is already registered';
    case 'USERNAME_EXISTS':
      return 'This username is already taken';
    case 'INVALID_TOKEN':
      return 'Your session has expired. Please sign in again.';
    case 'EMAIL_NOT_VERIFIED':
      return 'Please verify your email before signing in';
    case 'ACCOUNT_DISABLED':
      return 'Your account has been disabled';
    case 'RATE_LIMITED':
      return 'Too many requests. Please wait a moment.';
    case 'VALIDATION_ERROR':
      return formatValidationErrors(error.details);
    case 'NETWORK_ERROR':
      return 'Unable to connect to the server. Please check your connection.';
    case 'TIMEOUT':
      return 'The request timed out. Please try again.';
    case 'SESSION_EXPIRED':
      return 'Your session has expired. Please sign in again.';
  }

  // Check status code
  switch (error.status) {
    case 400:
      return error.message || 'Invalid request';
    case 401:
      return 'Please sign in to continue';
    case 403:
      return 'You do not have permission to perform this action';
    case 404:
      return 'The requested resource was not found';
    case 409:
      return error.message || 'This operation conflicts with existing data';
    case 413:
      return 'The file is too large';
    case 422:
      return error.message || 'The provided data is invalid';
    case 429:
      return 'Too many requests. Please slow down.';
    case 500:
      return 'An internal server error occurred. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'The server is temporarily unavailable. Please try again later.';
    default:
      return error.message || 'An error occurred';
  }
}

// Format validation errors from API response
function formatValidationErrors(details: unknown): string {
  if (!details) {
    return 'Please check your input and try again';
  }

  if (Array.isArray(details)) {
    return details
      .map((error) => {
        if (typeof error === 'string') return error;
        if (typeof error === 'object' && error !== null) {
          return (error as { message?: string }).message || String(error);
        }
        return String(error);
      })
      .join('. ');
  }

  if (typeof details === 'object') {
    const errors = Object.entries(details as Record<string, unknown>)
      .map(([field, message]) => {
        if (Array.isArray(message)) {
          return `${capitalize(field)}: ${message.join(', ')}`;
        }
        return `${capitalize(field)}: ${message}`;
      })
      .join('. ');
    return errors || 'Please check your input and try again';
  }

  return String(details);
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Check if error is a network error
export function isNetworkError(error: unknown): boolean {
  if (isApiError(error)) {
    return error.code === 'NETWORK_ERROR';
  }
  return false;
}

// Check if error requires re-authentication
export function isAuthError(error: unknown): boolean {
  if (isApiError(error)) {
    return (
      error.status === 401 ||
      error.code === 'INVALID_TOKEN' ||
      error.code === 'SESSION_EXPIRED'
    );
  }
  return false;
}

// Check if error is a validation error
export function isValidationError(error: unknown): boolean {
  if (isApiError(error)) {
    return error.status === 400 || error.status === 422;
  }
  return false;
}

// Check if error is a server error
export function isServerError(error: unknown): boolean {
  if (isApiError(error)) {
    return error.status >= 500;
  }
  return false;
}

// Check if error is retryable
export function isRetryableError(error: unknown): boolean {
  if (isApiError(error)) {
    // Retry on timeout, network errors, and server errors
    return (
      error.status === 408 ||
      error.status >= 500 ||
      error.code === 'NETWORK_ERROR' ||
      error.code === 'TIMEOUT'
    );
  }
  return false;
}

// Create a standardized error response
export function createErrorResponse(error: unknown) {
  const apiError = isApiError(error)
    ? error
    : new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        'UNKNOWN_ERROR'
      );

  return {
    message: getErrorMessage(apiError),
    code: apiError.code,
    status: apiError.status,
    isRetryable: isRetryableError(apiError),
    isAuth: isAuthError(apiError),
    isValidation: isValidationError(apiError),
    isServer: isServerError(apiError),
    isNetwork: isNetworkError(apiError),
  };
}
