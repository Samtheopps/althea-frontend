import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, RegisterRequest } from '@/types/api';
import { authService } from '@/services/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  loadUserProfile: () => Promise<void>;
  updateProfile: (data: Partial<Pick<User, 'firstName' | 'lastName' | 'phone'>>) => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user 
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      login: async (email, password) => {
        try {
          set({ isLoading: true });
          
          const response = await authService.login(email, password);
          
          if (response.success && response.data) {
            set({ 
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false
            });
          } else {
            throw new Error(response.message || 'Erreur de connexion');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        try {
          set({ isLoading: true });
          
          const response = await authService.register(data);
          
          if (response.success && response.data) {
            set({ 
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false
            });
          } else {
            throw new Error(response.message || 'Erreur d\'inscription');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          await authService.logout();
        } catch (error) {
          console.warn('Erreur lors de la déconnexion:', error);
        } finally {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },

      loadUserProfile: async () => {
        try {
          if (!authService.isAuthenticated()) {
            return;
          }

          set({ isLoading: true });
          const user = await authService.getProfile();
          
          if (user) {
            set({ 
              user,
              isAuthenticated: true,
              isLoading: false
            });
          } else {
            // Token invalide ou expiré
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false 
            });
          }
        } catch (error) {
          console.warn('Erreur lors du chargement du profil:', error);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },

      updateProfile: async (data) => {
        try {
          set({ isLoading: true });
          const updatedUser = await authService.updateProfile(data);
          
          set({ 
            user: updatedUser,
            isLoading: false
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      checkAuth: async () => {
        const { loadUserProfile } = get();
        
        if (authService.isAuthenticated()) {
          await loadUserProfile();
        } else {
          set({ 
            user: null, 
            isAuthenticated: false 
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      // Persister seulement les données nécessaires
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);