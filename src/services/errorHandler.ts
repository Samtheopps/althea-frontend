import toast from 'react-hot-toast';

export type ErrorType = 'api' | 'network' | 'auth' | 'timeout' | 'server' | 'validation' | 'generic';

interface ErrorDetails {
  type: ErrorType;
  message: string;
  code?: string;
  statusCode?: number;
  context?: string;
}

class ErrorHandlerService {
  private errorCount = new Map<string, { count: number; lastTime: number }>();
  private maxDuplicates = 3;
  private duplicateWindow = 10000; // 10 secondes

  // Déterminer le type d'erreur
  categorizeError(error: any): ErrorType {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return 'auth';
    }
    
    if (error.response?.status === 422 || error.response?.status === 400) {
      return 'validation';
    }
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
      return 'network';
    }
    
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return 'timeout';
    }
    
    if (error.response?.status >= 500) {
      return 'server';
    }
    
    if (error.response?.status === 404) {
      return 'api';
    }
    
    return 'generic';
  }

  // Créer un objet ErrorDetails
  createErrorDetails(error: any, context?: string): ErrorDetails {
    const type = this.categorizeError(error);
    
    return {
      type,
      message: this.getErrorMessage(error, type),
      code: error.code,
      statusCode: error.response?.status,
      context
    };
  }

  // Obtenir un message d'erreur utilisateur-friendly
  private getErrorMessage(error: any, type: ErrorType): string {
    const apiMessage = error.response?.data?.message || error.response?.data?.error;
    
    switch (type) {
      case 'network':
        return 'Problème de connexion internet. Vérifiez votre réseau et réessayez.';
      case 'timeout':
        return 'Le serveur met du temps à répondre. Veuillez patienter et réessayer.';
      case 'server':
        return apiMessage || 'Problème temporaire sur nos serveurs. Nous travaillons à le résoudre.';
      case 'auth':
        return 'Vous devez vous reconnecter pour continuer.';
      case 'validation':
        return apiMessage || 'Les données saisies ne sont pas valides.';
      case 'api':
        return apiMessage || 'Ressource non trouvée ou indisponible.';
      default:
        return apiMessage || 'Une erreur inattendue s\'est produite.';
    }
  }

  // Afficher un toast d'erreur avec gestion des doublons
  showErrorToast(errorDetails: ErrorDetails): void {
    const errorKey = `${errorDetails.type}-${errorDetails.message}`;
    const now = Date.now();
    
    // Vérifier les doublons
    const existing = this.errorCount.get(errorKey);
    if (existing && now - existing.lastTime < this.duplicateWindow) {
      existing.count++;
      existing.lastTime = now;
      
      if (existing.count <= this.maxDuplicates) {
        this.showToast(errorDetails);
      }
    } else {
      this.errorCount.set(errorKey, { count: 1, lastTime: now });
      this.showToast(errorDetails);
    }
  }

  private showToast(errorDetails: ErrorDetails): void {
    // Vérifier que nous sommes côté client et que toast est disponible
    if (typeof window === 'undefined' || !toast) {
      console.warn('Toast non disponible:', errorDetails.message);
      return;
    }

    const options = {
      duration: this.getToastDuration(errorDetails.type),
      icon: this.getToastIcon(errorDetails.type),
    };

    try {
      // Utiliser toast.error pour les erreurs avec l'icône personnalisée
      toast.error(errorDetails.message, options);
    } catch (toastError) {
      console.error('Erreur lors de l\'affichage du toast:', toastError);
      // Fallback : essayer un toast basique
      try {
        toast(errorDetails.message, { duration: options.duration });
      } catch (fallbackError) {
        console.error('Impossible d\'afficher le toast:', fallbackError);
      }
    }
  }

  private getToastDuration(type: ErrorType): number {
    switch (type) {
      case 'auth':
        return 8000; // Plus long pour l'auth
      case 'network':
      case 'timeout':
      case 'server':
        return 6000;
      case 'validation':
        return 5000;
      default:
        return 4000;
    }
  }

  private getToastIcon(type: ErrorType): string {
    switch (type) {
      case 'network':
        return '📡';
      case 'timeout':
        return '⏱️';
      case 'server':
        return '🔧';
      case 'auth':
        return '🔐';
      case 'validation':
        return '⚠️';
      default:
        return '❌';
    }
  }

  // Afficher un toast de succès
  showSuccessToast(message: string, duration = 3000): void {
    if (typeof window === 'undefined' || !toast) {
      console.warn('Toast non disponible:', message);
      return;
    }

    try {
      toast.success(message, { duration });
    } catch (toastError) {
      console.error('Erreur lors de l\'affichage du toast de succès:', toastError);
    }
  }

  // Afficher un toast d'info
  showInfoToast(message: string, duration = 4000): void {
    if (typeof window === 'undefined' || !toast) {
      console.warn('Toast non disponible:', message);
      return;
    }

    try {
      toast(message, { duration, icon: 'ℹ️' });
    } catch (toastError) {
      console.error('Erreur lors de l\'affichage du toast d\'info:', toastError);
    }
  }

  // Gérer une erreur avec log et toast
  handleError(error: any, context?: string, showToast = true): ErrorDetails {
    const errorDetails = this.createErrorDetails(error, context);
    
    // Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${errorDetails.type.toUpperCase()}] ${context || 'Error'}:`, {
        message: errorDetails.message,
        code: errorDetails.code,
        statusCode: errorDetails.statusCode,
        error
      });
    }
    
    // Afficher le toast si demandé
    if (showToast) {
      this.showErrorToast(errorDetails);
    }
    
    return errorDetails;
  }

  // Nettoyer le cache des erreurs (à appeler périodiquement)
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.errorCount.entries()) {
      if (now - value.lastTime > this.duplicateWindow * 2) {
        this.errorCount.delete(key);
      }
    }
  }

  // Méthode de test pour vérifier le bon fonctionnement
  testToasts(): void {
    if (typeof window === 'undefined') {
      console.log('Test des toasts uniquement côté client');
      return;
    }

    console.log('🧪 Test des toasts ErrorHandler...');
    
    // Test toast d'erreur
    setTimeout(() => {
      this.showErrorToast({
        type: 'validation',
        message: '🧪 Test toast d\'erreur - validation',
        context: 'Test'
      });
    }, 500);

    // Test toast de succès
    setTimeout(() => {
      this.showSuccessToast('🧪 Test toast de succès');
    }, 1500);

    // Test toast d'info
    setTimeout(() => {
      this.showInfoToast('🧪 Test toast d\'information');
    }, 2500);

    console.log('✅ Tests des toasts lancés');
  }
}

// Instance singleton
export const errorHandler = new ErrorHandlerService();

// Nettoyage automatique toutes les 30 secondes
if (typeof window !== 'undefined') {
  setInterval(() => errorHandler.cleanup(), 30000);
}