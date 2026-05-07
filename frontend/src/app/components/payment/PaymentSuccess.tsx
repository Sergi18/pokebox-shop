import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshInventory } = useAuth();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [pokecoins, setPokecoins] = useState(0);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
          throw new Error('No session ID provided');
        }

        // Verificar estado del pago en el backend
        const response = await fetch(`/api/payments/session/${sessionId}`);
        if (!response.ok) {
          throw new Error('Failed to verify payment');
        }

        const session = await response.json();
        
        if (session.status === 'paid') {
          setSuccess(true);
          setPokecoins(parseInt(session.metadata?.pokecoins || '0'));
          
          // Forzar actualización del usuario para que el balance se refresque
          // Nota: El webhook ya debería haber actualizado la BD, 
          // pero el frontend necesita recargar los datos del usuario.
          if (typeof window !== 'undefined') {
            // Un pequeño delay para dar tiempo al webhook a procesar
            setTimeout(() => {
              window.location.reload(); 
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--dark-bg)]">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-[var(--neon-blue)]" />
          <p className="text-gray-400">Verificando tu pago con Stripe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--dark-bg)] p-4">
      <div className="bg-[var(--dark-card)] border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        {success ? (
          <>
            <div className="relative mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </motion.div>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-[var(--neon-yellow)] to-[var(--neon-blue)] bg-clip-text text-transparent">
              ¡Pago Exitoso!
            </h1>
            
            <p className="text-gray-300 mb-6 text-lg">
              Has recibido <span className="font-bold text-[var(--neon-yellow)]">{pokecoins} PokéCoins</span>
            </p>
            
            <div className="bg-[var(--dark-hover)] border border-[var(--neon-blue)]/30 rounded-xl p-4 mb-8 text-left">
              <p className="text-sm text-gray-300 leading-relaxed">
                Tus monedas se han añadido a tu cuenta. El balance se actualizará en unos segundos.
              </p>
            </div>
            
            <Button
              variant="default"
              size="lg"
              className="w-full"
              onClick={() => navigate('/dashboard')}
            >
              Ir al Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-red-500">×</span>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">
              Error de Verificación
            </h1>
            
            <p className="text-gray-400 mb-8">
              No hemos podido confirmar tu pago. Si el cargo se ha realizado, contacta con soporte.
            </p>
            
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => navigate('/')}
            >
              Volver al Inicio
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// Necesitamos importar motion para la animación del éxito
import { motion } from 'motion/react';
