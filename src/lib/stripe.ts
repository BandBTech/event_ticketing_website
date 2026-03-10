import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Returns a singleton Stripe instance (lazy-loaded).
 * Uses NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY from .env.local.
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error(
        "[Stripe] Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable",
      );
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

export const redirectToCheckout = async (sessionId: string) => {
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error("Stripe not initialized");
  }

  const response = await stripe.initCheckout({
    clientSecret: sessionId,
  });

  console.log(response);
};