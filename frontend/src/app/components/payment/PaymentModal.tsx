import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const POKECOIN_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Pack',
    pokecoins: 1000,
    price: 9.99,
  },
  {
    id: 'popular',
    name: 'Popular Pack',
    pokecoins: 5000,
    price: 49.99,
    bonus: 500,
    badge: 'Popular',
  },
  {
    id: 'ultimate',
    name: 'Ultimate Pack',
    pokecoins: 10000,
    price: 89.99,
    bonus: 2000,
    badge: 'Best Value',
  },
];

export function PaymentModal({ userId, email, onClose }: {
  userId: string;
  email: string;
  onClose: () => void;
}) {
  const [selectedPackage, setSelectedPackage] = useState('popular');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // Crear sesión de checkout
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage,
          userId,
          email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Redirigir a Stripe Checkout
      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          setError(error.message || 'Checkout failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Payment error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div className="bg-[#131829] border border-gray-800 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-white bg-gradient-to-r from-[var(--neon-yellow)] to-[var(--neon-blue)] bg-clip-text text-transparent">
          Buy PokéCoins
        </h2>

        {/* Paquetes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {POKECOIN_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg.id)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                selectedPackage === pkg.id
                  ? 'border-[var(--neon-blue)] bg-[var(--dark-hover)] shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                  : 'border-gray-800 bg-[var(--dark-card)] hover:border-gray-700'
              }`}
            >
              {pkg.badge && (
                <div className="text-[10px] bg-[var(--neon-yellow)] text-black font-bold px-2 py-0.5 rounded-full mb-2 inline-block uppercase tracking-wider">
                  {pkg.badge}
                </div>
              )}
              <h3 className="font-semibold mb-1 text-white">{pkg.name}</h3>
              <p className="text-2xl font-bold text-[var(--neon-yellow)] mb-1">
                ${pkg.price}
              </p>
              <p className="text-sm text-gray-400">
                {pkg.pokecoins} Coins
              </p>
              {pkg.bonus && (
                <p className="text-xs text-green-400 font-semibold mt-1">
                  +{pkg.bonus} Bonus
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-800 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-[var(--neon-blue)] text-black font-bold rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Continue to Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Payment() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentModal userId="user123" email="user@example.com" onClose={() => {}} />
    </Elements>
  );
}
