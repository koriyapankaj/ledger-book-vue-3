import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { API_BASE_URL, TOKEN_KEY } from '@/utils/constants';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor - Add token to requests
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors globally
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear auth and redirect to login
          const authStore = useAuthStore();
          authStore.logout();
          router.push('/login');
        }
        return Promise.reject(error);
      }
    );
  }

  public get instance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export const api = new ApiService().instance;