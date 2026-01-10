import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, LoginCredentials, RegisterData, ApiError } from '@/types';
import { authService } from '@/services/auth.service';
import { TOKEN_KEY, USER_KEY } from '@/utils/constants';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const validationErrors = ref<Record<string, string[]>>({});

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  // Initialize from localStorage
  function initialize() {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      token.value = storedToken;
      user.value = JSON.parse(storedUser);
    }
  }

  async function login(credentials: LoginCredentials) {
    try {
      loading.value = true;
      error.value = null;
      validationErrors.value = {};

      const response = await authService.login(credentials);

      token.value = response.token;
      user.value = response.user;

      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));

      router.push('/dashboard');
    } catch (err: any) {
      const apiError = err.response?.data as ApiError;

      if (apiError?.errors) {
        // Laravel validation errors
        validationErrors.value = apiError.errors;
        error.value = apiError.message || 'Validation failed';
      } else {
        error.value = apiError?.message || err.message || 'Login failed';
      }
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function register(userData: RegisterData) {
    try {
      loading.value = true;
      error.value = null;
      validationErrors.value = {};

      const response = await authService.register(userData);

      token.value = response.token;
      user.value = response.user;

      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));

      router.push('/dashboard');
    } catch (err: any) {
      const apiError = err.response?.data as ApiError;

      if (apiError?.errors) {
        // Laravel validation errors
        validationErrors.value = apiError.errors;
        error.value = apiError.message || 'Validation failed';
      } else {
        error.value = apiError?.message || err.message || 'Registration failed';
      }
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchUser() {
    try {
      loading.value = true;
      const response = await authService.me();
      user.value = response.user;
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    } catch (err) {
      logout();
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      await authService.logout();
    } catch {
      // Ignore API errors (token may already be invalid)
    } finally {
      clearAuth();
      router.push('/login');
    }
  }

  function clearAuth() {
    token.value = null;
    user.value = null;

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function clearErrors() {
    error.value = null;
    validationErrors.value = {};
  }

  return {
    user,
    token,
    loading,
    error,
    validationErrors,
    isAuthenticated,
    initialize,
    login,
    register,
    fetchUser,
    logout,
    clearErrors,
    clearAuth,
  };
});
