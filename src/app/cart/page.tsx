'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCartStore();

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const totalHT = getTotalPrice() - discount;
  const totalTVA = totalHT * 0.2;
  const totalTTC = totalHT + totalTVA;

  const handleApplyPromo = () => {
    // Simulation d'application de code promo
    if (promoCode.toLowerCase() === 'welcome10') {
      const discountAmount = getTotalPrice() * 0.1;
      setDiscount(discountAmount);
      toast.success('Code promo appliqué ! -10%');
    } else if (promoCode) {
      toast.error('Code promo invalide');
    }
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }
    updateQuantity(itemId, newQuantity);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Votre panier est vide
            </h2>
            <p className="text-gray-600 mb-8">
              Découvrez notre gamme complète d'équipements médicaux professionnels
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-primary-hover transition-colors"
            >
              Découvrir nos produits
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Panier ({getTotalItems()} article{getTotalItems() > 1 ? 's' : ''})
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Liste des produits */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">
                    Produits dans votre panier
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-700 transition-colors"
                  >
                    Vider le panier
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 py-6"
                    >
                      <div className="flex items-start space-x-4">
                        {/* Image */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 relative bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={item.product.images?.[0] || '/placeholder-product.jpg'}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
                        </div>

                        {/* Informations */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900 mb-1">
                                <Link
                                  href={`/products/${item.product.slug}`}
                                  className="hover:text-primary transition-colors"
                                >
                                  {item.product.name}
                                </Link>
                              </h3>
                              {item.product.brand && (
                                <p className="text-sm text-gray-600 mb-2">
                                  {item.product.brand}
                                </p>
                              )}
                              {item.selectedVariant && (
                                <p className="text-sm text-gray-600 mb-2">
                                  Variant: {item.selectedVariant.name}
                                </p>
                              )}
                            </div>

                            {/* Prix */}
                            <div className="text-right ml-4">
                              <p className="text-lg font-medium text-gray-900">
                                {formatPrice(
                                  (item.selectedVariant?.price || item.product.price) * item.quantity
                                )}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatPrice(item.selectedVariant?.price || item.product.price)} x {item.quantity}
                              </p>
                            </div>
                          </div>

                          {/* Contrôles quantité */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="p-1 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
                              >
                                <Minus className="h-4 w-4 text-gray-600" />
                              </button>
                              <span className="text-gray-900 font-medium min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="p-1 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
                              >
                                <Plus className="h-4 w-4 text-gray-600" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="text-sm">Supprimer</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Récapitulatif de commande
              </h2>

              {/* Code promo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code promotionnel
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Entrez votre code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Tag className="h-4 w-4" />
                  </button>
                </div>
                {discount > 0 && (
                  <p className="text-sm text-green-600 mt-2">
                    Code appliqué ! Réduction de {formatPrice(discount)}
                  </p>
                )}
              </div>

              {/* Détails */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total ({getTotalItems()} article{getTotalItems() > 1 ? 's' : ''})</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>TVA (20%)</span>
                  <span>{formatPrice(totalTVA)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-medium text-gray-900">
                    <span>Total TTC</span>
                    <span>{formatPrice(totalTTC)}</span>
                  </div>
                </div>
              </div>

              {/* Livraison */}
              <div className="mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    {totalHT >= 100 ? (
                      <span>✓ Livraison gratuite incluse</span>
                    ) : (
                      <span>
                        Ajoutez {formatPrice(100 - totalHT)} pour la livraison gratuite
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-primary-hover transition-colors"
                >
                  Procéder au paiement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/products"
                  className="w-full inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Continuer mes achats
                </Link>
              </div>

              {/* Sécurité */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Paiement sécurisé par Stripe
                </p>
                <div className="flex justify-center space-x-2 mt-2">
                  <div className="text-xs text-gray-400">🔒 SSL</div>
                  <div className="text-xs text-gray-400">💳 CB</div>
                  <div className="text-xs text-gray-400">🏦 Virement</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}