import { ref, computed } from 'vue';
import type { ApiError } from '@/types';
import { AxiosError } from 'axios';

export function useFormError() {
  const error = ref<string | null>(null);
  const validationErrors = ref<Record<string, string[]>>({});

  const hasError = computed(() => !!error.value || Object.keys(validationErrors.value).length > 0);

  function handleError(err: unknown) {
    if (err instanceof AxiosError) {
      const apiError = err.response?.data as ApiError;
      
      if (apiError?.errors) {
        // Laravel validation errors (422)
        validationErrors.value = apiError.errors;
        error.value = apiError.message || 'Validation failed';
      } else {
        // Other errors
        error.value = apiError?.message || err.message || 'An error occurred';
        validationErrors.value = {};
      }
    } else if (err instanceof Error) {
      error.value = err.message;
      validationErrors.value = {};
    } else {
      error.value = 'An unexpected error occurred';
      validationErrors.value = {};
    }
  }

  function clearErrors() {
    error.value = null;
    validationErrors.value = {};
  }

  function getFieldError(field: string): string | null {
    return validationErrors.value[field]?.[0] || null;
  }

  function hasFieldError(field: string): boolean {
    return !!validationErrors.value[field];
  }

  return {
    error,
    validationErrors,
    hasError,
    handleError,
    clearErrors,
    getFieldError,
    hasFieldError,
  };
}
