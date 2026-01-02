import type { ApiError } from '@/types';
import { AxiosError } from 'axios';

/**
 * Extract error message from API error response
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;
    return apiError?.message || error.message || 'An unexpected error occurred';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Extract validation errors from API error response
 */
export function getValidationErrors(error: unknown): Record<string, string[]> {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;
    return apiError?.errors || {};
  }
  
  return {};
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 422;
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 401;
  }
  return false;
}

/**
 * Format validation errors for display
 */
export function formatValidationError(errors: Record<string, string[]>): string {
  const messages = Object.values(errors).flat();
  return messages.join(', ');
}
