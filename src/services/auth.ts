import apiService from './api';
import { 
  LoginRequest, 
  RegisterRequest, 
  LoginResponse, 
  ApiResponse, 
  User 
} from '@/types/api';

export class AuthService {
  // Inscription
  async register(data: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginResponse>('/auth/register', data);
      
      // Sauvegarder les tokens si la réponse les contient
      if (response.data.data?.accessToken && response.data.data?.refreshToken) {
        apiService.setTokens({
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken
        });
        
        // Sauvegarder l'utilisateur dans localStorage pour accès rapide
        localStorage.setItem('user_data', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  // Connexion
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginResponse>('/auth/login', { 
        email, 
        password 
      });
      
      // Sauvegarder les tokens
      if (response.data.data?.accessToken && response.data.data?.refreshToken) {
        apiService.setTokens({
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken
        });
        
        // Sauvegarder l'utilisateur dans localStorage pour accès rapide
        localStorage.setItem('user_data', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  // Déconnexion
  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      // Continue même si l'API échoue
      console.warn('Erreur lors de la déconnexion API:', error);
    } finally {
      // Nettoyer les tokens et données locales
      apiService.clearTokens();
      localStorage.removeItem('user_data');
    }
  }

  // Récupérer le profil utilisateur
  async getProfile(): Promise<User | null> {
    try {
      // Essayer d'abord depuis localStorage pour performance
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        // Vérifier si les données sont récentes (moins de 5 minutes)
        const lastUpdate = new Date(user.updatedAt).getTime();
        const now = Date.now();
        if (now - lastUpdate < 5 * 60 * 1000) {
          return user;
        }
      }
      
      // Récupérer depuis l'API si pas en cache ou données anciennes
      const response = await apiService.get<ApiResponse<User>>('/auth/profile');
      const user = response.data.data;
      
      if (!user) {
        return null;
      }
      
      // Mettre à jour le cache
      localStorage.setItem('user_data', JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      // Si erreur 401, l'utilisateur n'est pas connecté
      if (error.response?.status === 401) {
        this.logout();
        return null;
      }
      
      // Pour autres erreurs, essayer le cache localStorage
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    }
  }

  // Mettre à jour le profil
  async updateProfile(data: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'company' | 'siret'>>): Promise<User> {
    try {
      const response = await apiService.patch<ApiResponse<User>>('/auth/profile', data);
      const updatedUser = response.data.data;
      
      if (!updatedUser) {
        throw new Error('Erreur lors de la mise à jour du profil');
      }
      
      // Mettre à jour le cache
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error: any) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  // Changer l'email
  async changeEmail(email: string, password: string): Promise<void> {
    try {
      await apiService.post('/auth/change-email', { email, password });
      
      // Mettre à jour l'email en cache
      const currentUser = await this.getProfile();
      if (currentUser) {
        const updatedUser = { 
          ...currentUser, 
          email,
          isEmailVerified: false,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
      }
    } catch (error: any) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  // Changer le mot de passe
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiService.post('/auth/change-password', { 
        currentPassword, 
        newPassword 
      });
    } catch (error: any) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  // Mot de passe oublié
  async forgotPassword(email: string): Promise<void> {
    try {
      await apiService.post('/auth/forgot-password', { email });
    } catch (error: any) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  // Réinitialiser le mot de passe
  async resetPassword(token: string, password: string): Promise<void> {
    try {
      await apiService.post('/auth/reset-password', { 
        token, 
        password 
      });
    } catch (error: any) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  // Vérifier l'email
  async verifyEmail(token: string): Promise<void> {
    try {
      await apiService.post('/auth/verify-email', { token });
      
      // Mettre à jour le statut de vérification en cache
      const currentUser = await this.getProfile();
      if (currentUser) {
        const updatedUser = { 
          ...currentUser, 
          isEmailVerified: true,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
      }
    } catch (error: any) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  // Renvoyer l'email de vérification
  async resendVerificationEmail(email?: string): Promise<void> {
    try {
      await apiService.post('/auth/resend-verification', email ? { email } : {});
    } catch (error: any) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return apiService.isAuthenticated();
  }

  // Vérifier le statut de connexion avec l'API
  async checkAuthStatus(): Promise<boolean> {
    try {
      const user = await this.getProfile();
      return !!user;
    } catch (error) {
      return false;
    }
  }

  // Récupérer les tokens (délégué au service API)
  getTokens() {
    // Utilise les méthodes publiques de l'API service pour accéder aux tokens
    return {
      accessToken: apiService.isAuthenticated() ? 'present' : null,
      refreshToken: 'managed_by_api_service'
    };
  }
}

export const authService = new AuthService();