'use client';

import { useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Lock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface StripePaymentFormProps {
  onBack: () => void;
  onSuccess: (paymentIntentId: string) => Promise<void>;
  onStripeError: (message: string) => void;
  amountLabel: string;
  termsAgreed: boolean;
}

export default function StripePaymentForm({
  onBack,
  onSuccess,
  onStripeError,
  amountLabel,
  termsAgreed,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || isProcessing) return;

    if (!termsAgreed) {
      onStripeError('Vous devez accepter les conditions générales de vente.');
      return;
    }

    setIsProcessing(true);

    try {
      // Étape 6 : confirmer le paiement côté Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        // Erreur Stripe : message déjà localisé par Stripe
        onStripeError(error.message ?? 'Le paiement a échoué.');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded' && paymentIntent.id) {
        // Étape 7 : confirm order (polling géré en amont)
        await onSuccess(paymentIntent.id);
        // Ne pas reset isProcessing : la page va naviguer
        return;
      }

      // Cas non-succeeded (requires_action, processing…)
      onStripeError(
        'Le paiement nécessite une action supplémentaire. Merci de réessayer.',
      );
      setIsProcessing(false);
    } catch (err) {
      onStripeError(err instanceof Error ? err.message : 'Erreur inattendue.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="p-5 rounded-xl border border-slate-200 bg-white">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Lock className="w-3.5 h-3.5 flex-shrink-0" />
        Paiement sécurisé Stripe — vos données bancaires ne transitent jamais par nos serveurs.
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          className="btn btn-ghost btn-lg flex-shrink-0 border border-slate-200 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <motion.button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          whileHover={!isProcessing ? { scale: 1.01 } : {}}
          whileTap={!isProcessing ? { scale: 0.99 } : {}}
          className="btn btn-lg flex-1 justify-center"
          style={
            isProcessing || !stripe
              ? { background: '#e2e8f0', color: '#94a3b8', cursor: 'not-allowed', border: 'none' }
              : {
                  background: 'linear-gradient(135deg, #00a8b5 0%, #0098a4 100%)',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px 0 rgba(0,168,181,.3)',
                  border: 'none',
                }
          }
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              Traitement…
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Payer {amountLabel}
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
}
