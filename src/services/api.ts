import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { ApiResponse, AuthTokens } from '@/types/api';

class ApiService {
  private api: AxiosInstance;
  private baseURL = 'https://api-pslt.matheovieilleville.fr/api/v1';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token d'authentification
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Intercepteur pour gérer le renouvellement automatique du token
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshAccessToken(refreshToken);
              const { accessToken, refreshToken: newRefreshToken } = response.data;

              // Sauvegarder les nouveaux tokens
              this.setTokens({ accessToken, refreshToken: newRefreshToken });

              // Rejouer la requête originale
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Le refresh a échoué, déconnecter l'utilisateur
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Gestion des tokens
  private getAccessToken(): string | undefined {
    return Cookies.get('accessToken');
  }

  private getRefreshToken(): string | undefined {
    return Cookies.get('refreshToken');
  }

  setTokens(tokens: AuthTokens): void {
    Cookies.set('accessToken', tokens.accessToken, { 
      expires: 1/24, // 1 heure
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    Cookies.set('refreshToken', tokens.refreshToken, { 
      expires: 7, // 7 jours
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }

  clearTokens(): void {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Renouvellement du token
  private async refreshAccessToken(refreshToken: string): Promise<AxiosResponse<AuthTokens>> {
    return axios.post(`${this.baseURL}/auth/refresh-token`, { refreshToken });
  }

  // Méthodes HTTP de base
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.put(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.patch(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete(url, config);
  }

  // Méthodes pour l'upload de fichiers
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<AxiosResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  // Méthodes pour gérer les erreurs API
  handleApiError(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.errors?.length) {
      return error.response.data.errors.join(', ');
    }
    if (error.message) {
      return error.message;
    }
    return 'Une erreur inattendue s\'est produite';
  }

  // Getter pour l'URL de base (pour construire des URLs d'images)
  get mediaBaseUrl(): string {
    return `${this.baseURL}/media`;
  }
}

// Instance singleton
const apiService = new ApiService();
export default apiService;