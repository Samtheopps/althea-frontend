import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { ApiResponse, AuthTokens } from '@/types/api';
import { apiHealthMonitor } from '@/utils/apiHealthMonitor';

class ApiService {
  private api: AxiosInstance;
  private baseURL = 'https://api-pslt.matheovieilleville.fr/api/v1';
  private errorLogCache = new Map<string, number>(); // Cache pour éviter les logs répétitifs
  private maxRetries = 3;
  private retryDelay = 1000; // 1 seconde

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
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
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

  // Méthodes HTTP de base avec retry logic
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.requestWithRetry(() => this.api.get(url, config));
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.requestWithRetry(() => this.api.post(url, data, config));
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.requestWithRetry(() => this.api.put(url, data, config));
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.requestWithRetry(() => this.api.patch(url, data, config));
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.requestWithRetry(() => this.api.delete(url, config));
  }

  // Méthode de retry avec backoff exponentiel
  private async requestWithRetry<T>(requestFn: () => Promise<AxiosResponse<T>>, retryCount = 0): Promise<AxiosResponse<T>> {
    try {
      return await requestFn();
    } catch (error: any) {
      // Ne pas retry sur certaines erreurs
      if (
        error.response?.status === 401 || // Authentification
        error.response?.status === 403 || // Autorisation
        error.response?.status === 404 || // Non trouvé
        error.response?.status === 422 || // Validation
        retryCount >= this.maxRetries
      ) {
        throw error;
      }

      // Retry sur les erreurs réseau et serveur (5xx)
      if (
        !error.response || // Erreur réseau
        error.response.status >= 500 || // Erreur serveur
        error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT'
      ) {
        const delay = this.retryDelay * Math.pow(2, retryCount); // Backoff exponentiel
        console.warn(`Retry ${retryCount + 1}/${this.maxRetries} dans ${delay}ms:`, this.handleApiError(error));
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.requestWithRetry(requestFn, retryCount + 1);
      }

      throw error;
    }
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
    const endpoint = error.config?.url || '';
    const errorKey = `${endpoint}-${error.response?.status}`;
    const now = Date.now();
    
    // Utiliser le monitor de santé pour déterminer si on doit supprimer le log
    if (apiHealthMonitor.shouldSuppressErrorLog(endpoint, error)) {
      return this.getErrorMessage(error);
    }
    
    // Éviter les logs répétitifs (max 1 log par minute pour la même erreur)
    if (this.errorLogCache.has(errorKey)) {
      const lastLog = this.errorLogCache.get(errorKey)!;
      if (now - lastLog < 60000) { // 1 minute
        // Ne pas logger, juste retourner le message
        return this.getErrorMessage(error);
      }
    }
    
    this.errorLogCache.set(errorKey, now);
    
    // Logger seulement les vraies erreurs (pas les endpoints optionnels en 404)
    if (error.response?.status !== 404 || !apiHealthMonitor.isOptionalEndpoint(endpoint)) {
      console.warn('API Error:', {
        url: endpoint,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        isOptional: apiHealthMonitor.isOptionalEndpoint(endpoint)
      });
    }
    
    return this.getErrorMessage(error);
  }

  private getErrorMessage(error: any): string {
    // Messages personnalisés selon le type d'erreur
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      return 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
    }
    
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return 'Délai d\'attente dépassé. Le serveur met du temps à répondre.';
    }
    
    if (error.response?.status === 500) {
      return 'Erreur interne du serveur. Nos équipes ont été informées.';
    }
    
    if (error.response?.status === 502 || error.response?.status === 503) {
      return 'Service temporairement indisponible. Réessayez dans quelques minutes.';
    }
    
    if (error.response?.status === 429) {
      return 'Trop de requêtes. Veuillez patienter avant de réessayer.';
    }
    
    // Messages depuis l'API
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

  // Méthode pour tester la connexion API
  async testConnection(): Promise<boolean> {
    try {
      await this.api.get('/health', { timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Getter pour l'URL de base (pour construire des URLs d'images)
  get mediaBaseUrl(): string {
    return `${this.baseURL}/media`;
  }
}

// Instance singleton
const apiService = new ApiService();
export default apiService;