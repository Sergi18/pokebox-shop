import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../ui/Card';
import { User, Package, Trophy, TrendingUp, Clock, Wallet, ChevronRight, Zap, Target, Star, History, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';
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
  
  const recentActivity = [
    { id: 1, action: 'Caja Abierta', item: 'Charizard GX', value: '500', time: 'hace 2 min', type: 'rare' },
    { id: 2, action: 'Batalla Ganada', item: 'vs Trainer_Red', value: '1,200', time: 'hace 15 min', type: 'win' },
    { id: 3, action: 'Recarga', item: 'Stripe Payment', value: '2,000', time: 'hace 1 hora', type: 'deposit' },
  ];
  
  return (
    <div className="min-h-screen bg-[#0a0e1a] py-24 pb-40 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Profile Elite Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="bg-[#131829] border-2 border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <User className="w-64 h-64 text-white" />
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
              {/* Avatar Section */}
              <div className="relative">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4 border-2 border-dashed border-[var(--neon-blue)] opacity-30 rounded-full"
                />
                <div className="w-40 h-40 bg-gradient-to-br from-[var(--neon-yellow)] via-[var(--neon-blue)] to-purple-500 rounded-full p-1 shadow-[0_0_40px_rgba(0,212,255,0.3)]">
                  <div className="w-full h-full bg-[#0a0e1a] rounded-full flex items-center justify-center overflow-hidden">
                    <span className="text-6xl font-black italic text-white">{user.username.charAt(0).toUpperCase()}</span>
                  </div>
                </div>
                <div className="absolute -bottom-2 right-0 bg-[var(--neon-yellow)] text-black px-4 py-1 rounded-full font-black text-xs italic border-4 border-[#131829] uppercase">
                  Nivel {user.level}
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
                  <h2 className="text-5xl font-black italic uppercase text-white tracking-tighter leading-none">{user.username}</h2>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest">Entrenador Élite</span>
                </div>
                
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
                  <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Cuenta Verificada
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-800 self-center" />
                  <div className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                    Miembro desde 2026
                  </div>
                </div>

                {/* Level Progress */}
                <div className="max-w-md mx-auto lg:mx-0">
                  <div className="flex justify-between items-end mb-2 px-1">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Progreso de Nivel</span>
                    <span className="text-xs font-black text-[var(--neon-blue)] uppercase italic">850 / 1000 XP</span>
                  </div>
                  <div className="h-3 w-full bg-black/40 border border-white/5 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-600 via-[var(--neon-blue)] to-cyan-400 relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Wallet Section */}
              <div className="lg:w-80 w-full">
                <div className="bg-black/40 border-2 border-white/5 rounded-[2.5rem] p-8 text-center relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[var(--neon-yellow)] opacity-50" />
                  
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 flex items-center justify-center gap-2">
                    <img src={pokecoinIcon} alt="Coin" className="w-3 h-3" /> Balance Total
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <img src={pokecoinIcon} alt="PokéCoin" className="w-12 h-12 drop-shadow-[0_0_15px_rgba(255,215,0,0.3)] group-hover:scale-110 transition-transform" />
                    <div className="text-5xl font-black italic text-white tracking-tighter">{user.balance.toLocaleString()}</div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full py-5 bg-[var(--neon-blue)] text-black font-black uppercase italic tracking-tighter text-xl rounded-2xl shadow-[0_0_20px_rgba(0,212,255,0.2)] flex items-center justify-center gap-3"
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
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="bg-[#131829] border-2 border-white/5 rounded-[2rem] p-8 flex items-center justify-between group hover:border-white/10 transition-all">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-black text-white italic tracking-tighter">{stat.value}</h3>
                  </div>
                  <div className="p-4 bg-black/20 rounded-2xl group-hover:bg-white/5 transition-colors border border-white/5">
                    {Icon ? (
                      <Icon className="w-8 h-8 text-white opacity-40 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <img src={stat.customIcon} alt="Icon" className="w-8 h-8 opacity-40 group-hover:opacity-100 transition-opacity object-contain" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-8 px-4">
              <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter flex items-center gap-3">
                <History className="w-6 h-6 text-[var(--neon-blue)]" /> Historial Reciente
              </h3>
              <button className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors">Ver Todo</button>
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div 
                  key={activity.id}
                  className="bg-[#131829] border-2 border-white/5 rounded-[1.5rem] p-6 flex items-center justify-between hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-2xl ${
                      activity.type === 'win' ? 'bg-emerald-500/10 text-emerald-400' :
                      activity.type === 'rare' ? 'bg-purple-500/10 text-purple-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {activity.type === 'win' ? <Trophy className="w-6 h-6" /> : 
                       activity.type === 'rare' ? <Sparkles className="w-6 h-6" /> : 
                       <Wallet className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase text-gray-500 tracking-widest mb-1">{activity.action}</div>
                      <div className="text-lg font-black text-white italic leading-none uppercase">{activity.item}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <span className="text-xl font-black text-[var(--neon-yellow)]">+{activity.value}</span>
                      <img src={pokecoinIcon} alt="Coin" className="w-4 h-4" />
                    </div>
                    <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter mb-8 px-4">Accesos Rápidos</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Abrir Cajas', icon: Package, path: '/cases', desc: 'Prueba tu suerte ahora', color: 'blue' },
                { label: 'Batalla Ninja', icon: Target, path: '/battles', desc: 'Compite contra otros', color: 'red' },
                { label: 'Inventario', icon: ShieldCheck, path: '/inventory', desc: 'Gestiona tu colección', color: 'purple' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="bg-[#131829] border-2 border-white/5 rounded-[2rem] p-6 text-left hover:border-white/20 hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`p-3 bg-white/5 rounded-xl border border-white/5`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-black italic text-white uppercase">{action.label}</span>
                  </div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">{action.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
