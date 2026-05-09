import { motion, AnimatePresence } from 'motion/react';
import { User, Package, Trophy, TrendingUp, Wallet, Zap, Target, PlusCircle, ArrowUpRight, ShieldCheck, RefreshCw, ShoppingBag, Sword } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PaymentModal } from '../payment/PaymentModal';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import pokecoinIcon from '../../../assets/Pokecoin.png';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  if (!user) return null;
  
  const stats = [
    { icon: Package, label: 'Cajas Abiertas', value: '12', color: 'blue' },
    { icon: Trophy, label: 'Victorias', value: '4', color: 'yellow' },
    { icon: TrendingUp, label: 'Nivel Actual', value: `Lv. ${user.level}`, color: 'purple' },
    { icon: null, label: 'Ganancias', value: '1,450', color: 'emerald', customIcon: pokecoinIcon }
  ];
  
  return (
    <div className="min-h-screen py-24 pb-40 relative overflow-hidden text-white">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/src/assets/fondopanel.webp)' }}
      />
      <div className="absolute inset-0 z-0 bg-[#0a0e1a]/70 backdrop-blur-sm" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="bg-[#131829] border-2 border-purple-500/20 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            {/* Fondo Ambiental del Perfil */}
            <div 
              className="absolute inset-0 z-0 bg-cover bg-right bg-no-repeat opacity-40"
              style={{ backgroundImage: 'url(/src/assets/fondoperfil.webp)' }}
            />
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#131829]/80 via-[#131829]/50 to-transparent" />

            {/* Decoration */}
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none z-10">
              <User className="w-64 h-64 text-white" />
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
              {/* Avatar Section */}
              <div className="relative">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4 border-2 border-dashed border-[var(--electric-purple)] opacity-30 rounded-full"
                />
                <div className="w-40 h-40 bg-gradient-to-br from-purple-400 via-indigo-500 to-purple-800 rounded-full p-1 shadow-[0_0_40px_rgba(168,85,247,0.3)]">
                  <div className="w-full h-full bg-[#0a0e1a] rounded-full flex items-center justify-center overflow-hidden">
                    <span className="text-6xl font-black italic text-white">{user.username.charAt(0).toUpperCase()}</span>
                  </div>
                </div>
                <div className="absolute -bottom-2 right-0 bg-[var(--electric-purple)] text-white px-4 py-1 rounded-full font-black text-xs italic border-4 border-[#131829] uppercase">
                  Nivel {user.level}
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
                  <h2 className="text-5xl font-black italic uppercase text-white tracking-tighter leading-none">{user.username}</h2>
                  <span className="px-3 py-1 bg-white/5 border border-purple-500/20 rounded-lg text-[10px] font-black text-purple-300 uppercase tracking-widest">Entrenador Élite</span>
                </div>
                
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
                  <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4 text-purple-400" /> Cuenta Verificada
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-800 self-center" />
                  <div className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                    Miembro desde 2026
                  </div>
                </div>

                <div className="max-w-md mx-auto lg:mx-0">
                  <div className="flex justify-between items-end mb-2 px-1">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Progreso de Nivel</span>
                    <span className="text-xs font-black text-purple-400 uppercase italic">850 / 1000 XP</span>
                  </div>
                  <div className="h-3 w-full bg-black/40 border border-purple-500/10 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-400 relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Wallet Section */}
              <div className="lg:w-80 w-full">
                <div className="bg-black/40 border-2 border-purple-500/10 rounded-[2.5rem] p-8 text-center relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[var(--electric-purple)] opacity-50" />
                  
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 flex items-center justify-center gap-2">
                    <img src={pokecoinIcon} alt="Coin" className="w-3 h-3" /> Balance Total
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <img src={pokecoinIcon} alt="PokéCoin" className="w-12 h-12 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)] group-hover:scale-110 transition-transform" />
                    <div className="text-5xl font-black italic text-white tracking-tighter">{user.balance.toLocaleString()}</div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full py-5 bg-purple-600 text-white font-black uppercase italic tracking-tighter text-xl rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center gap-3"
                  >
                    RECARGAR
                    <ArrowUpRight className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {showPaymentModal && (
          <Elements stripe={stripePromise}>
            <PaymentModal userId={user.id} email={user.email} onClose={() => setShowPaymentModal(false)} />
          </Elements>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5 }}>
                <div className="bg-[#131829] border-2 border-purple-500/10 rounded-[2rem] p-8 flex items-center justify-between group hover:border-purple-500/30 transition-all">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-black text-white italic tracking-tighter">{stat.value}</h3>
                  </div>
                  <div className="p-4 bg-purple-900/10 rounded-2xl group-hover:bg-purple-500/20 transition-colors border border-purple-500/10">
                    {Icon ? <Icon className="w-8 h-8 text-purple-400 opacity-60 group-hover:opacity-100 transition-opacity" /> : <img src={stat.customIcon} alt="Icon" className="w-8 h-8 opacity-40 group-hover:opacity-100 transition-opacity object-contain" />}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {[
              { label: 'Cajas', icon: ShoppingBag, path: '/cases', desc: 'Prueba tu suerte ahora' },
              { label: 'Inventario', icon: Package, path: '/inventory', desc: 'Gestiona tu colección' },
              { label: 'Batallas', icon: Sword, path: '/battles', desc: 'Compite contra otros' },
              { label: 'Recompensas', icon: Trophy, path: '/rewards', desc: 'Misiones diarias' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="bg-[#131829] border-2 border-purple-500/10 rounded-[2rem] p-6 text-left hover:border-purple-500/50 hover:bg-white/5 transition-all group flex flex-col items-center text-center"
              >
                <div className={`p-4 bg-purple-900/10 rounded-2xl border border-purple-500/10 mb-4 group-hover:border-purple-500/50`}>
                  <action.icon className="w-8 h-8 text-purple-300" />
                </div>
                <span className="text-lg font-black italic text-white uppercase mb-2">{action.label}</span>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
