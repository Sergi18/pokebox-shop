import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, CreditCard, Zap, TrendingUp } from 'lucide-react';
import pokecoinIcon from '../../../assets/Pokecoin.png';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PRESETS = [
  { amount: 5, label: 'Básico', color: 'blue' },
  { amount: 10, label: 'Popular', color: 'yellow', popular: true },
  { amount: 25, label: 'Pro', color: 'purple' },
  { amount: 50, label: 'Elite', color: 'red' },
  { amount: 100, label: 'Maestro', color: 'cyan' },
  { amount: 250, label: 'Leyenda', color: 'emerald' },
];

export function PaymentModal({ userId, email, onClose }: {
  userId: string;
  email: string;
  onClose: () => void;
}) {
  const [eurAmount, setEurAmount] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Escala 1:1 -> 1€ = 1 PokéCoin
  const pokecoins = eurAmount;

  const handleCheckout = async () => {
    if (eurAmount < 1) {
      setError('Mínimo 1€ de compra');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.floor(eurAmount),
          userId,
          email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Fallo al crear la sesión de pago');
      }

      const { sessionId } = await response.json();

      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          setError(error.message || 'Error en la pasarela de pago');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error en el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] backdrop-blur-md overflow-y-auto py-10">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-[#0a0e1a] border-2 border-white/10 rounded-[2.5rem] p-1 w-full max-w-2xl mx-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* Glow Background Effect */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative bg-[#131829] rounded-[2.3rem] p-8 md:p-12 overflow-hidden">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1] 
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-block mb-4"
            >
              <img src={pokecoinIcon} alt="PokéCoin" className="w-20 h-20 drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]" />
            </motion.div>
            <h2 className="text-4xl font-black text-white tracking-tighter mb-2 italic text-center">
              RECARGA DE <span className="text-[var(--neon-yellow)]">POKÉCOINS</span>
            </h2>
            <p className="text-gray-400 font-medium text-center">Elige tu pack o introduce una cantidad personalizada</p>
          </div>

          {/* Presets Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            {PRESETS.map((item) => (
              <motion.button
                key={item.amount}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEurAmount(item.amount)}
                className={`relative group p-4 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                  eurAmount === item.amount 
                    ? 'border-[var(--neon-blue)] bg-[var(--neon-blue)]/10 shadow-[0_0_20px_rgba(0,212,255,0.2)]' 
                    : 'border-white/5 bg-white/5 hover:border-white/20'
                }`}
              >
                {item.popular && (
                  <div className="absolute top-0 right-0 bg-[var(--neon-yellow)] text-black text-[10px] font-black px-2 py-0.5 rounded-bl-lg uppercase">
                    Popular
                  </div>
                )}
                <div className={`text-xl font-black mb-1 ${eurAmount === item.amount ? 'text-[var(--neon-blue)]' : 'text-white'}`}>
                  {item.amount}€
                </div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  {item.label}
                </div>
                
                {/* Background Sparkle Effect */}
                {eurAmount === item.amount && (
                  <motion.div 
                    layoutId="activeGlow"
                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Custom Amount Input */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3 px-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3 h-3 text-[var(--neon-yellow)]" />
                Cantidad Personalizada
              </label>
              <span className="text-[10px] text-blue-400 font-bold">1€ = 1 Coin</span>
            </div>
            <div className="relative group">
              <input
                type="number"
                value={eurAmount}
                onChange={(e) => setEurAmount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-black/40 border-2 border-white/5 group-focus-within:border-[var(--neon-blue)] rounded-2xl py-5 px-6 text-3xl font-black text-white outline-none transition-all"
                placeholder="0"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <span className="text-gray-500 font-black text-xl italic text-center">EUR</span>
                <div className="h-8 w-[2px] bg-white/10" />
                <CreditCard className="w-6 h-6 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Result Terminal */}
          <div className="relative p-6 rounded-3xl bg-black/60 border-2 border-[var(--neon-blue)]/20 mb-10 overflow-hidden">
            <div className="absolute top-0 right-0 p-2">
              <div className="w-2 h-2 rounded-full bg-[var(--neon-blue)] animate-pulse" />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Confirmación de Canje</p>
                <h3 className="text-white text-lg font-bold">Resumen del Pedido</h3>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <span className="text-3xl font-black text-white">{pokecoins.toLocaleString()}</span>
                  <img src={pokecoinIcon} alt="Coin" className="w-8 h-8" />
                </div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">PokéCoins a recibir</p>
              </div>
            </div>
            
            {/* Animated line */}
            <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="h-full w-1/3 bg-gradient-to-r from-transparent via-[var(--neon-blue)] to-transparent"
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-8 text-sm font-bold text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={onClose}
              className="order-2 md:order-1 flex-1 py-4 px-8 border-2 border-white/5 rounded-2xl text-gray-500 font-bold hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest text-sm"
            >
              Cancelar
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              disabled={loading}
              className="order-1 md:order-2 flex-[2] relative group overflow-hidden py-4 px-8 bg-[var(--neon-blue)] rounded-2xl transition-all disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="relative flex items-center justify-center gap-3">
                {loading ? (
                  <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="text-black font-black uppercase tracking-tighter text-xl italic">PROCESAR PAGO</span>
                    <TrendingUp className="w-6 h-6 text-black" />
                  </>
                )}
              </div>
            </motion.button>
          </div>
        </div>
      </motion.div>
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
