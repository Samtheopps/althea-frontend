'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, User } from 'lucide-react';

interface ProductReviewsProps {
  productId: string;
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      // Simulation de données - remplacer par un vrai appel API
      setTimeout(() => {
        const mockReviews: Review[] = [
          {
            id: '1',
            userId: 'user1',
            userName: 'Dr. Martin Dupont',
            rating: 5,
            title: 'Excellent équipement',
            comment: 'Très satisfait de cet achat. La qualité est au rendez-vous et la précision exceptionnelle.',
            date: '2024-03-15',
            helpful: 8,
            verified: true,
          },
          {
            id: '2',
            userId: 'user2',
            userName: 'Sophie Bernard',
            rating: 4,
            title: 'Bon rapport qualité-prix',
            comment: 'Produit conforme à nos attentes. Livraison rapide et service client réactif.',
            date: '2024-03-10',
            helpful: 5,
            verified: true,
          },
          {
            id: '3',
            userId: 'user3',
            userName: 'Pierre Moreau',
            rating: 5,
            title: 'Recommandé',
            comment: 'Utilisation quotidienne depuis 6 mois, aucun problème. Je recommande vivement.',
            date: '2024-03-05',
            helpful: 12,
            verified: false,
          },
        ];

        setReviews(mockReviews);
        setTotalReviews(mockReviews.length);
        setAverageRating(
          mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length
        );
        setLoading(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
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
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* En-tête */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            Avis clients ({totalReviews})
          </h3>
          <div className="flex items-center space-x-2">
            {renderStars(averageRating, 'md')}
            <span className="text-lg font-medium text-gray-900">
              {averageRating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Statistiques des notes */}
      <div className="px-6 py-4 bg-gray-50">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = reviews.filter(r => Math.floor(r.rating) === stars).length;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            
            return (
              <div key={stars} className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 w-3">
                  {stars}
                </span>
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Liste des avis */}
      <div className="divide-y divide-gray-200">
        {reviews.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Aucun avis pour ce produit.</p>
            <p className="text-sm text-gray-500 mt-2">
              Soyez le premier à donner votre avis !
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="px-6 py-6">
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                </div>

                {/* Contenu */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {review.userName}
                        {review.verified && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Achat vérifié
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    {renderStars(review.rating)}
                  </div>

                  <h5 className="font-medium text-gray-900 mb-2">
                    {review.title}
                  </h5>

                  <p className="text-gray-700 leading-relaxed mb-3">
                    {review.comment}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                      <ThumbsUp className="h-4 w-4" />
                      <span>Utile ({review.helpful})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bouton pour ajouter un avis */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <button className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-primary text-sm font-medium rounded-lg text-primary bg-white hover:bg-primary hover:text-white transition-colors">
          <MessageSquare className="mr-2 h-4 w-4" />
          Donner mon avis
        </button>
      </div>
    </div>
  );
}