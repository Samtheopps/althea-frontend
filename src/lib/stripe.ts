import { loadStripe } from '@stripe/stripe-js';

// Configuration Stripe
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Types pour Stripe
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
  payment_status: string;
}

// Configuration des produits Stripe
export const createCheckoutSession = async (items: any[]) => {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la création de la session de paiement');
  }

  return response.json();
};