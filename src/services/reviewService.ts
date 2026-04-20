import apiService from './api';
import { Review, ApiResponse } from '@/types/api';
import { errorHandler } from './errorHandler';
import { isValidId, validateId, validateNonEmptyString, validateNumberRange } from '@/utils/validation';

interface ReviewsResponse {
  reviews: Review[];
  total: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}

interface CreateReviewRequest {
  productId: string;
  rating: number;
  title: string;
  comment: string;
}

export class ReviewService {
  // Cache pour éviter les appels répétés aux endpoints qui échouent
  private endpointFailureCache = new Map<string, { failureTime: number; attempts: number }>();
  private maxFailureAge = 5 * 60 * 1000; // 5 minutes
  private maxAttempts = 3;

  // Vérifier si un endpoint a récemment échoué
  private shouldSkipEndpoint(endpoint: string): boolean {
    const failure = this.endpointFailureCache.get(endpoint);
    if (!failure) return false;
    
    const now = Date.now();
    if (now - failure.failureTime > this.maxFailureAge) {
      // Nettoyer l'entrée expirée
      this.endpointFailureCache.delete(endpoint);
      return false;
    }
    
    return failure.attempts >= this.maxAttempts;
  }

  // Marquer un endpoint comme ayant échoué
  private markEndpointFailure(endpoint: string): void {
    const existing = this.endpointFailureCache.get(endpoint);
    if (existing) {
      existing.attempts++;
      existing.failureTime = Date.now();
    } else {
      this.endpointFailureCache.set(endpoint, {
        failureTime: Date.now(),
        attempts: 1
      });
    }
  }

  // Récupérer les avis d'un produit
  async getProductReviews(productId: string, page: number = 1, limit: number = 10): Promise<ReviewsResponse> {
    // Validation de productId
    if (!isValidId(productId, 'getProductReviews')) {
      return this.getEmptyReviewsResponse();
    }

    const endpoint = `/products/${productId}/reviews`;
    
    // Vérifier si l'endpoint a récemment échoué
    if (this.shouldSkipEndpoint(endpoint)) {
      console.log(`📋 Endpoint reviews temporairement désactivé pour éviter le spam d'erreurs`);
      return this.getEmptyReviewsResponse();
    }

    try {
      const response = await apiService.get<ApiResponse<ReviewsResponse>>(
        `${endpoint}?page=${page}&limit=${limit}`
      );
      
      if (!response.data.data) {
        throw new Error('Aucune donnée reçue de l\'API');
      }
      
      // Réinitialiser le cache d'échec en cas de succès
      this.endpointFailureCache.delete(endpoint);
      
      return response.data.data;
    } catch (error: any) {
      // Si c'est une erreur 404, marquer l'endpoint comme non disponible
      if (error.response?.status === 404) {
        this.markEndpointFailure(endpoint);
        console.warn('📋 Endpoint des avis non disponible pour ce produit, utilisation du fallback.');
      } else {
        // Pour les autres erreurs, utiliser le handler normal
        errorHandler.handleError(error, `Chargement des avis du produit ${productId}`, false);
      }
      
      // En cas d'erreur, toujours retourner une structure vide
      return this.getEmptyReviewsResponse();
    }
  }

  // Méthode helper pour retourner une structure d'avis vide
  private getEmptyReviewsResponse(): ReviewsResponse {
    return {
      reviews: [],
      total: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  // Créer un nouvel avis
  async createReview(reviewData: CreateReviewRequest): Promise<Review> {
    // Validation des données d'avis
    try {
      validateId(reviewData.productId, 'ID de produit', 'createReview');
      validateNonEmptyString(reviewData.title, 'Titre de l\'avis', 'createReview');
      validateNonEmptyString(reviewData.comment, 'Commentaire', 'createReview');
      validateNumberRange(reviewData.rating, 1, 5, 'Note', 'createReview');
    } catch (validationError: any) {
      throw new Error(validationError.message);
    }

    const endpoint = '/reviews';
    
    try {
      const response = await apiService.post<ApiResponse<Review>>(
        endpoint,
        reviewData
      );
      
      if (!response.data.data) {
        throw new Error('Erreur lors de la création de l\'avis');
      }

      errorHandler.showSuccessToast('Votre avis a été publié avec succès !');
      
      return response.data.data;
    } catch (error: any) {
      // Si l'endpoint de création n'existe pas
      if (error.response?.status === 404) {
        errorHandler.showInfoToast('La fonctionnalité d\'avis n\'est pas encore disponible.', 6000);
        throw new Error('Fonctionnalité d\'avis temporairement indisponible');
      }
      
      const errorDetails = errorHandler.handleError(error, 'Création d\'un avis');
      throw new Error(errorDetails.message);
    }
  }

  // Marquer un avis comme utile
  async markReviewHelpful(reviewId: string): Promise<void> {
    // Validation de reviewId
    try {
      validateId(reviewId, 'ID d\'avis', 'markReviewHelpful');
    } catch (validationError: any) {
      throw new Error(validationError.message);
    }

    const endpoint = `/reviews/${reviewId}/helpful`;

    try {
      await apiService.post(endpoint);
      errorHandler.showSuccessToast('Merci pour votre retour !', 2000);
    } catch (error: any) {
      if (error.response?.status === 404) {
        errorHandler.showInfoToast('Cette fonctionnalité n\'est pas encore disponible.', 4000);
        return; // Ne pas lancer d'erreur pour éviter de casser l'UX
      }
      
      const errorDetails = errorHandler.handleError(error, 'Marquage de l\'avis comme utile');
      throw new Error(errorDetails.message);
    }
  }

  // Récupérer les statistiques des avis pour un produit
  async getReviewStats(productId: string): Promise<{ averageRating: number; totalReviews: number; distribution: Record<number, number> }> {
    // Validation de productId
    if (!isValidId(productId, 'getReviewStats')) {
      return this.getEmptyStatsResponse();
    }

    const endpoint = `/products/${productId}/reviews/stats`;
    
    // Vérifier si l'endpoint a récemment échoué
    if (this.shouldSkipEndpoint(endpoint)) {
      return this.getEmptyStatsResponse();
    }

    try {
      const response = await apiService.get<ApiResponse<any>>(endpoint);
      
      if (!response.data.data) {
        return this.getEmptyStatsResponse();
      }
      
      // Réinitialiser le cache d'échec en cas de succès
      this.endpointFailureCache.delete(endpoint);
      
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        this.markEndpointFailure(endpoint);
      } else {
        errorHandler.handleError(error, 'Chargement des statistiques des avis', false);
      }
      
      return this.getEmptyStatsResponse();
    }
  }

  // Méthode helper pour retourner des stats vides
  private getEmptyStatsResponse(): { averageRating: number; totalReviews: number; distribution: Record<number, number> } {
    return { 
      averageRating: 0, 
      totalReviews: 0, 
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } 
    };
  }

  // Méthode de nettoyage pour le cache des échecs
  cleanup(): void {
    const now = Date.now();
    for (const [endpoint, failure] of this.endpointFailureCache.entries()) {
      if (now - failure.failureTime > this.maxFailureAge) {
        this.endpointFailureCache.delete(endpoint);
      }
    }
  }

  // Vérifier si les avis sont disponibles pour un produit (méthode publique)
  async areReviewsAvailable(productId: string): Promise<boolean> {
    if (!isValidId(productId, 'areReviewsAvailable')) {
      return false;
    }

    const endpoint = `/products/${productId}/reviews`;
    return !this.shouldSkipEndpoint(endpoint);
  }
}

export const reviewService = new ReviewService();

// Nettoyage automatique du cache d'échecs toutes les 2 minutes
if (typeof window !== 'undefined') {
  setInterval(() => reviewService.cleanup(), 2 * 60 * 1000);
}