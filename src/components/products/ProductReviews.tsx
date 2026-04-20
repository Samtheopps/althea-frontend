'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, User, AlertCircle } from 'lucide-react';
import { reviewService } from '@/services/reviewService';
import { isValidId } from '@/utils/validation';
import { useI18n } from '@/lib/i18n';

interface ProductReviewsProps {
  productId: string;
}

interface Review {
  id: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  helpful: number;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface ReviewsData {
  reviews: Review[];
  total: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { tr } = useI18n();
  const [reviewsData, setReviewsData] = useState<ReviewsData>({
    reviews: [],
    total: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFeatureAvailable, setIsFeatureAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    // Vérifier que productId est valide avant de charger les avis
    if (isValidId(productId, 'ProductReviews useEffect')) {
      checkFeatureAvailability();
    } else {
      setLoading(false);
      setIsFeatureAvailable(false);
    }
  }, [productId]);

  const checkFeatureAvailability = async () => {
    try {
      const available = await reviewService.areReviewsAvailable(productId);
      setIsFeatureAvailable(available);
      
      if (available) {
        loadReviews();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité des avis:', error);
      setIsFeatureAvailable(false);
      setLoading(false);
    }
  };

  const loadReviews = async (pageNumber: number = 1, append: boolean = false) => {
    // Validation supplémentaire avant l'appel API
    if (!isValidId(productId, 'ProductReviews.loadReviews')) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      if (!append) setLoading(true);

      const data = await reviewService.getProductReviews(productId, pageNumber, 10);
      
      if (append) {
        setReviewsData(prev => ({
          ...data,
          reviews: [...prev.reviews, ...data.reviews]
        }));
      } else {
        setReviewsData(data);
      }
      
      setHasMore(data.reviews.length === 10 && data.total > pageNumber * 10);
      
    } catch (error: any) {
      console.warn('Avis indisponibles pour ce produit:', error.message);
      
      // Si c'est un problème d'endpoint indisponible, ne pas afficher d'erreur
      if (error.message.includes('indisponible') || error.message.includes('404')) {
        setIsFeatureAvailable(false);
        setError(null);
      } else {
        setError('Impossible de charger les avis. Veuillez réessayer plus tard.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMoreReviews = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadReviews(nextPage, true);
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await reviewService.markReviewHelpful(reviewId);
      
      // Mettre à jour localement
      setReviewsData(prev => ({
        ...prev,
        reviews: prev.reviews.map(review =>
          review.id === reviewId
            ? { ...review, helpful: review.helpful + 1 }
            : review
        )
      }));
    } catch (error) {
      console.error('Erreur lors du marquage comme utile:', error);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${sizeClass} ${
               i < Math.floor(rating)
                 ? 'text-yellow-400 fill-current'
                 : 'text-gray-700'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatUserName = (user: { firstName: string; lastName: string }) => {
    return `${user.firstName} ${user.lastName.charAt(0).toUpperCase()}.`;
  };

  // Si la fonctionnalité n'est pas disponible
  if (isFeatureAvailable === false) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-black mb-2">
            {tr.product.reviews}
          </h3>
          <p className="text-black mb-1">
            {tr.product.noReviews}
          </p>
          <p className="text-sm text-black">
            {tr.product.beFirst}
          </p>
        </div>
      </div>
    );
  }

  if (loading && reviewsData.reviews.length === 0) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-gray-300 rounded-lg p-4">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-16 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-6">
        <div className="flex items-center justify-center space-x-3 text-red-600">
          <AlertCircle className="h-6 w-6" />
          <div className="text-center">
            <p className="font-medium">Erreur de chargement</p>
            <p className="text-sm text-red-500 mt-1">{error}</p>
            <button
              onClick={() => loadReviews()}
              className="mt-3 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
      {/* En-tête */}
      <div className="px-6 py-4 border-b border-gray-300">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-black">
            {tr.product.reviews} ({reviewsData.total})
          </h3>
          {reviewsData.total > 0 && (
            <div className="flex items-center space-x-2">
              {renderStars(reviewsData.averageRating, 'md')}
              <span className="text-lg font-medium text-black">
                {reviewsData.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Statistiques des notes */}
      {reviewsData.total > 0 && (
        <div className="px-6 py-4 bg-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviewsData.ratingDistribution[stars] || 0;
              const percentage = reviewsData.total > 0 ? (count / reviewsData.total) * 100 : 0;
              
              return (
                <div key={stars} className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-black w-3">
                    {stars}
                  </span>
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <div className="flex-1 bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-black w-8">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Liste des avis */}
      <div className="divide-y divide-gray-300">
        {reviewsData.reviews.length === 0 ? (
          <div className="px-6 py-12 text-center">
           <MessageSquare className="h-12 w-12 text-black mx-auto mb-4" />
            <p className="text-black">{tr.product.noReviews}</p>
            <p className="text-sm text-black mt-2">
              {tr.product.beFirst}
            </p>
          </div>
        ) : (
          <>
            {reviewsData.reviews.map((review) => (
              <div key={review.id} className="px-6 py-6">
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-black" />
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-black">
                          {formatUserName(review.user)}
                          {review.isVerified && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {tr.product.verifiedPurchase}
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-black">
                          {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      {renderStars(review.rating)}
                    </div>

                    <h5 className="font-medium text-black mb-2">
                      {review.title}
                    </h5>

                    <p className="text-black leading-relaxed mb-3">
                      {review.comment}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => handleMarkHelpful(review.id)}
                        className="flex items-center space-x-1 text-sm text-black hover:text-black transition-colors"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{tr.product.helpful(review.helpful)}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Bouton charger plus */}
            {hasMore && (
              <div className="px-6 py-4 bg-gray-100 border-t border-gray-300 text-center">
                <button
                  onClick={loadMoreReviews}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-gray-400 text-sm font-medium rounded-lg text-black bg-white hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {loading ? tr.common.loading : tr.product.loadMoreReviews}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bouton pour ajouter un avis */}
      {isFeatureAvailable && (
        <div className="px-6 py-4 bg-gray-100 border-t border-gray-300">
          <button className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-primary text-sm font-medium rounded-lg text-primary bg-white hover:bg-primary hover:text-white transition-colors">
            <MessageSquare className="mr-2 h-4 w-4" />
            {tr.product.writeReview}
          </button>
        </div>
      )}
    </div>
  );
}