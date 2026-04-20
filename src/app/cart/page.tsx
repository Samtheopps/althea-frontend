'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag, AlertTriangle, LogIn, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { formatPrice } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

export default function CartPage() {
  const { tr } = useI18n();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isHydrated,
    setHydrated,
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const unavailableItems = items.filter(
    (item) => item.product.stock !== undefined && item.product.stock === 0
  );

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Gérer l'hydratation côté client
  useEffect(() => {
    setHydrated(true);
  }, [setHydrated]);

  // Éviter les calculs avant l'hydratation
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

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
               <ShoppingBag className="h-12 w-12 text-black" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-4">
              {tr.cart.empty}
            </h2>
            <p className="text-black mb-8">
              Découvrez notre gamme complète d'équipements médicaux professionnels
            </p>
            <Link href="/products" className="btn btn-primary btn-lg">
              Découvrir nos produits
              <ArrowRight className="w-5 h-5" />
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
          <h1 className="text-3xl font-bold text-black">
            {tr.cart.title} ({getTotalItems()} article{getTotalItems() > 1 ? 's' : ''})
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Banner produits indisponibles */}
        {unavailableItems.length > 0 && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800">
                {unavailableItems.length} {tr.cart.unavailableItems}
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                {unavailableItems.map(i => i.product.name).join(', ')} — Ces produits sont en rupture de stock et ne peuvent pas être commandés.
              </p>
            </div>
            <button
              onClick={() => unavailableItems.forEach(i => removeItem(i.id))}
              className="text-xs font-medium text-red-700 hover:text-red-900 whitespace-nowrap"
            >
              {tr.cart.removeAll}
            </button>
          </div>
        )}

        {/* Banner rappel connexion */}
        {!isAuthenticated && (
          <div className="mb-6 flex items-center gap-4 p-4 rounded-xl border"
            style={{ background: '#e0f7f9', borderColor: '#00a8b5' }}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: '#003d5c' }}>
                {tr.cart.loginReminder}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition-colors"
                style={{ background: '#003d5c' }}
              >
                <LogIn className="w-3.5 h-3.5" />
                {tr.nav.login}
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
                style={{ background: '#00a8b5', color: '#fff' }}
              >
                <UserPlus className="w-3.5 h-3.5" />
                {tr.nav.createAccount}
              </Link>
            </div>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Liste des produits */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-black">
                    {tr.cart.itemsInCart}
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-700 transition-colors"
                  >
                    {tr.cart.clearCart}
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                <AnimatePresence>
                  {items.map((item) => {
                    const isUnavailable = item.product.stock !== undefined && item.product.stock === 0;
                    return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.2 }}
                      className={`px-6 py-6 ${isUnavailable ? 'bg-red-50' : ''}`}
                    >
                      {isUnavailable && (
                        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-red-700">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Produit indisponible — en rupture de stock
                        </div>
                      )}
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
                              <h3 className="text-lg font-medium text-black mb-1">
                                <Link
                                  href={`/products/${item.product.slug}`}
                                  className="hover:text-primary transition-colors"
                                >
                                  {item.product.name}
                                </Link>
                              </h3>
                              {item.product.brand && (
                                <p className="text-sm text-black mb-2">
                                  {item.product.brand}
                                </p>
                              )}
                              {item.selectedVariant && (
                                <p className="text-sm text-black mb-2">
                                  Variant: {item.selectedVariant.name}
                                </p>
                              )}
                            </div>

                            {/* Prix */}
                            <div className="text-right ml-4">
                              <p className="text-lg font-medium text-black">
                                {formatPrice(
                                  (item.selectedVariant?.price || item.product.price) * item.quantity
                                )}
                              </p>
                              <p className="text-sm text-black">
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
                                <Minus className="h-4 w-4 text-black" />
                              </button>
                              <span className="text-black font-medium min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="p-1 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
                              >
                                <Plus className="h-4 w-4 text-black" />
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
                  );})}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-8">
              <h2 className="text-lg font-medium text-black mb-6">
                Récapitulatif de commande
              </h2>

              {/* Code promo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-black mb-2">
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
                    className="px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors"
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
                <div className="flex justify-between text-black">
                  <span>Sous-total ({getTotalItems()} article{getTotalItems() > 1 ? 's' : ''})</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-black">
                  <span>TVA (20%)</span>
                  <span>{formatPrice(totalTVA)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-medium text-black">
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
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Livraison gratuite incluse
                      </span>
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
                <Link href="/checkout" className="btn btn-primary btn-lg w-full justify-center">
                  {tr.cart.checkout}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/products" className="btn btn-ghost btn-lg w-full justify-center border border-slate-200">
                  Continuer mes achats
                </Link>
              </div>

              {/* Sécurité */}
              <div className="mt-6 text-center">
                <p className="text-xs text-black">
                  Paiement sécurisé par Stripe
                </p>
                <div className="flex justify-center space-x-4 mt-2">
                  <div className="text-xs text-black font-medium">SSL</div>
                  <div className="text-xs text-black font-medium">CB</div>
                  <div className="text-xs text-black font-medium">Virement</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}