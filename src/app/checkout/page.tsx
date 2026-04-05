'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { CreditCard, Truck, Shield, ArrowLeft, Check, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { addressSchema, checkoutSchema, type CheckoutInput, type AddressInput } from '@/lib/validations';
import { formatPrice } from '@/lib/utils';
import { stripePromise } from '@/lib/stripe';

interface CheckoutFormData {
  billingAddress: AddressInput;
  shippingAddress: AddressInput;
  paymentMethod: 'card' | 'transfer';
  sameAsShipping: boolean;
  terms: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CheckoutFormData>({
    // resolver: zodResolver(checkoutSchema),
    defaultValues: {
      billingAddress: {
        type: 'billing',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        country: 'FR',
      },
      shippingAddress: {
        type: 'shipping',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        country: 'FR',
      },
      paymentMethod: 'card',
      sameAsShipping: true,
      terms: false,
    },
  });

  const totalHT = getTotalPrice();
  const totalTVA = totalHT * 0.2;
  const totalTTC = totalHT + totalTVA;
  const shippingCost = totalHT >= 100 ? 0 : 15;

  // Redirection si panier vide
  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  const steps = [
    { id: 1, name: 'Livraison', icon: Truck },
    { id: 2, name: 'Paiement', icon: CreditCard },
    { id: 3, name: 'Confirmation', icon: Check },
  ];

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);

    try {
      if (data.paymentMethod === 'card') {
        // Simulation du paiement par carte
        toast.success('Redirection vers le paiement...');
        // TODO: Implémenter Stripe
        
        setTimeout(() => {
          clearCart();
          router.push('/account/orders');
        }, 2000);
      } else {
        // Paiement par virement
        // Créer la commande et afficher les informations de virement
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: items.map(item => ({
              id: item.product.id,
              quantity: item.quantity,
              price: item.selectedVariant?.price || item.product.price,
            })),
            shippingAddress: data.shippingAddress,
            billingAddress: sameAsShipping ? data.shippingAddress : data.billingAddress,
            paymentMethod: 'transfer',
            total: totalTTC + shippingCost,
          }),
        });

        const order = await response.json();
        
        if (order.error) {
          throw new Error(order.error);
        }

        // Vider le panier et rediriger
        clearCart();
        router.push(`/account/orders/${order.id}`);
        toast.success('Commande créée ! Informations de paiement envoyées par email.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du traitement de la commande');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">
        Adresse de livraison
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prénom *
          </label>
          <input
            {...register('shippingAddress.firstName')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
          />
          {errors.shippingAddress?.firstName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.shippingAddress.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom *
          </label>
          <input
            {...register('shippingAddress.lastName')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
          />
          {errors.shippingAddress?.lastName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.shippingAddress.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Entreprise (optionnel)
        </label>
        <input
          {...register('shippingAddress.company')}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Adresse *
        </label>
        <input
          {...register('shippingAddress.address')}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
        />
        {errors.shippingAddress?.address && (
          <p className="mt-1 text-sm text-red-600">
            {errors.shippingAddress.address.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Code postal *
          </label>
          <input
            {...register('shippingAddress.postalCode')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
          />
          {errors.shippingAddress?.postalCode && (
            <p className="mt-1 text-sm text-red-600">
              {errors.shippingAddress.postalCode.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ville *
          </label>
          <input
            {...register('shippingAddress.city')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
          />
          {errors.shippingAddress?.city && (
            <p className="mt-1 text-sm text-red-600">
              {errors.shippingAddress.city.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Téléphone (optionnel)
        </label>
        <input
          {...register('shippingAddress.phone')}
          type="tel"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>

      {/* Adresse de facturation */}
      <div className="border-t pt-6">
        <div className="flex items-center mb-4">
          <input
            id="sameAsShipping"
            type="checkbox"
            checked={sameAsShipping}
            onChange={(e) => setSameAsShipping(e.target.checked)}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="sameAsShipping" className="ml-3 text-sm text-gray-700">
            Utiliser la même adresse pour la facturation
          </label>
        </div>

        {!sameAsShipping && (
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">
              Adresse de facturation
            </h4>
            {/* Répéter les champs d'adresse pour billingAddress */}
            {/* Simplifié pour l'exemple */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                {...register('billingAddress.firstName')}
                placeholder="Prénom"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
              />
              <input
                {...register('billingAddress.lastName')}
                placeholder="Nom"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setCurrentStep(2)}
        className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors"
      >
        Continuer vers le paiement
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">
        Mode de paiement
      </h3>

      <div className="space-y-4">
        {/* Paiement par carte */}
        <label className="relative flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-primary">
          <input
            {...register('paymentMethod')}
            type="radio"
            value="card"
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
          />
          <div className="ml-3 flex-1">
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
              <span className="font-medium text-gray-900">Carte bancaire</span>
            </div>
            <p className="text-sm text-gray-600">
              Paiement sécurisé par Stripe (CB, Visa, Mastercard)
            </p>
          </div>
        </label>

        {/* Paiement par virement */}
        <label className="relative flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-primary">
          <input
            {...register('paymentMethod')}
            type="radio"
            value="transfer"
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
          />
          <div className="ml-3 flex-1">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-gray-400 mr-2" />
              <span className="font-medium text-gray-900">Virement bancaire</span>
            </div>
            <p className="text-sm text-gray-600">
              RIB envoyé par email après validation de la commande
            </p>
          </div>
        </label>
      </div>

      {/* Conditions d'utilisation */}
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            {...register('terms')}
            type="checkbox"
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label className="text-gray-700">
            J'accepte les{' '}
            <a href="/legal/cgu" className="text-primary hover:underline">
              conditions générales de vente
            </a>{' '}
            et la{' '}
            <a href="/legal/privacy" className="text-primary hover:underline">
              politique de confidentialité
            </a>
          </label>
        </div>
      </div>
      {errors.terms && (
        <p className="text-sm text-red-600">{errors.terms.message}</p>
      )}

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Retour
        </button>
        <button
          type="submit"
          disabled={isProcessing}
          className="flex-1 bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isProcessing ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Finaliser la commande
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Finaliser la commande
            </h1>
          </div>

          {/* Stepper */}
          <div className="mt-6">
            <nav className="flex justify-center">
              <ol className="flex items-center space-x-8">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = currentStep > step.id;
                  const isCurrent = currentStep === step.id;

                  return (
                    <li key={step.id} className="flex items-center">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                          isCompleted
                            ? 'bg-primary border-primary text-white'
                            : isCurrent
                            ? 'border-primary text-primary'
                            : 'border-gray-300 text-gray-400'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className={`ml-2 text-sm font-medium ${
                          isCurrent ? 'text-primary' : 'text-gray-500'
                        }`}
                      >
                        {step.name}
                      </span>
                      {index < steps.length - 1 && (
                        <div className="ml-8 w-16 h-px bg-gray-300" />
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Formulaire */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <form onSubmit={handleSubmit(onSubmit)}>
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                </motion.div>
              </form>
            </div>
          </div>

          {/* Résumé */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Récapitulatif
              </h3>

              {/* Produits */}
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.product.name}
                      </p>
                      <p className="text-gray-600">Qté: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {formatPrice(
                        (item.selectedVariant?.price || item.product.price) * item.quantity
                      )}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Sous-total</span>
                  <span>{formatPrice(totalHT)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Livraison</span>
                  <span>{shippingCost === 0 ? 'Gratuite' : formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>TVA</span>
                  <span>{formatPrice(totalTVA)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(totalTTC + shippingCost)}</span>
                  </div>
                </div>
              </div>

              {/* Sécurité */}
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <Shield className="h-4 w-4" />
                  <span>Paiement sécurisé SSL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}