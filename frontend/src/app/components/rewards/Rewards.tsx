import { motion } from 'motion/react';
import { Button } from '../ui/Button';
import { Gift, Target, Calendar, Trophy, Star, Zap, CheckCircle } from 'lucide-react';

const dailyTasks = [
  { id: 1, title: 'Abrir 3 cajas', progress: 2, total: 3, reward: 50, completed: false },
  { id: 2, title: 'Ganar 1 batalla', progress: 0, total: 1, reward: 100, completed: false },
  { id: 3, title: 'Conexión diaria', progress: 1, total: 1, reward: 25, completed: true },
  { id: 4, title: 'Vender 1 carta', progress: 0, total: 1, reward: 75, completed: false },
];

const weeklyRewards = [
  { tier: 'Bronce', requirement: '10 cajas', reward: '500 PkCoins', unlocked: true },
  { tier: 'Plata', requirement: '25 cajas', reward: '1,500 PkCoins', unlocked: true },
  { tier: 'Oro', requirement: '50 cajas', reward: '5,000 PkCoins', unlocked: false },
  { tier: 'Platino', requirement: '100 cajas', reward: '15,000 PkCoins', unlocked: false },
];

export function Rewards() {
  return (
    <div className="min-h-screen py-24 bg-[#0a0e1a]">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="px-3 py-1 bg-[var(--neon-yellow)]/10 text-[var(--neon-yellow)] text-[10px] font-black uppercase tracking-widest border border-[var(--neon-yellow)]/30 rounded-full mb-4 inline-block">
            SISTEMA DE RECOMPENSAS
          </span>
          <h1 className="text-5xl font-black italic uppercase text-white tracking-tighter mb-4">
            CENTRO DE <span className="text-[var(--neon-yellow)]">RECOMPENSAS</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-xl mx-auto">
            Completa misiones épicas, mantén tu racha de victorias y desbloquea tesoros legendarios.
          </p>
        </motion.div>
        
        {/* Daily Bonus */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-20">
          <div className="bg-[#131829] border-2 border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--neon-yellow)]/5 via-transparent to-transparent opacity-50" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[var(--neon-yellow)] to-[var(--neon-blue)] rounded-2xl flex items-center justify-center shadow-lg">
                  <Gift className="w-10 h-10 text-black" />
                </div>
                <div>
                  <h2 className="text-2xl font-black italic uppercase text-white tracking-tight">Bonus Diario</h2>
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Reclama tu regalo de entrenador</p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black italic text-[var(--neon-yellow)] mb-3 tracking-tighter">+200 PkCoins</div>
                <Button className="py-6 px-10 rounded-xl font-black italic uppercase bg-[var(--neon-yellow)] text-black hover:scale-105 transition-transform">
                  RECLAMAR BONUS
                </Button>
              </div>
            </div>
            
            <div className="mt-10 pt-8 border-t border-white/5">
              <div className="flex items-center justify-between mb-6">
                <span className="text-white font-black italic uppercase text-sm tracking-widest">Racha de conexión</span>
                <span className="text-[var(--neon-yellow)] font-black italic text-lg tracking-tighter">7 DÍAS</span>
              </div>
              <div className="grid grid-cols-7 gap-4">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <div key={day} className={`aspect-[4/5] rounded-2xl flex flex-col items-center justify-center border-2 ${day <= 7 ? 'bg-[var(--neon-yellow)]/10 border-[var(--neon-yellow)] text-[var(--neon-yellow)]' : 'bg-black/40 border-white/5 text-gray-700'}`}>
                    {day <= 7 ? <CheckCircle className="w-6 h-6 mb-2" /> : <Calendar className="w-6 h-6 mb-2" />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Daily Tasks */}
        <div className="mb-20">
          <h2 className="text-2xl font-black italic uppercase text-white mb-10 flex items-center gap-3">
            <Target className="w-6 h-6 text-[var(--neon-blue)]" />
            MISIONES DIARIAS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dailyTasks.map((task) => (
              <div key={task.id} className="p-8 bg-[#131829] border-2 border-white/5 rounded-[2rem] hover:border-white/10 transition-all">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-black italic uppercase text-lg">{task.title}</h3>
                  <span className="text-[var(--neon-yellow)] font-black text-sm">+{task.reward} PkCoins</span>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Progreso</span>
                    <span className="text-white font-black">{task.progress}/{task.total}</span>
                  </div>
                  <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden border border-white/5">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(task.progress / task.total) * 100}%` }} className="h-full bg-gradient-to-r from-[var(--neon-yellow)] to-[var(--neon-blue)]" />
                  </div>
                </div>
                
                <Button className={`w-full py-5 rounded-xl font-black italic uppercase ${task.completed ? 'bg-[var(--neon-blue)] text-black' : 'bg-black/40 text-gray-500 border-2 border-white/5'}`} disabled={!task.completed}>
                  {task.completed ? 'RECLAMAR RECOMPENSA' : 'EN PROGRESO...'}
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Weekly Rewards */}
        <div className="mb-20">
          <h2 className="text-2xl font-black italic uppercase text-white mb-10 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-[var(--electric-purple)]" />
            NIVELES SEMANALES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {weeklyRewards.map((tier, index) => (
              <div key={index} className={`p-8 bg-[#131829] border-2 rounded-[2rem] text-center ${tier.unlocked ? 'border-[var(--neon-yellow)] shadow-[0_0_20px_rgba(255,215,0,0.1)]' : 'border-white/5 opacity-70'}`}>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 ${tier.unlocked ? 'bg-gradient-to-br from-[var(--neon-yellow)]/20 to-[var(--neon-blue)]/20 border-[var(--neon-yellow)]' : 'bg-black/40 border-white/5'}`}>
                  <Trophy className={`w-10 h-10 ${tier.unlocked ? 'text-[var(--neon-yellow)]' : 'text-gray-700'}`} />
                </div>
                <h3 className="text-white font-black italic uppercase text-lg mb-1">{tier.tier}</h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4">{tier.requirement}</p>
                <div className="text-[var(--neon-yellow)] font-black text-sm mb-6">{tier.reward}</div>
                <Button className={`w-full py-4 rounded-xl font-black italic uppercase ${tier.unlocked ? 'bg-[var(--neon-yellow)] text-black' : 'bg-black/40 text-gray-500 border-2 border-white/5'}`} disabled={!tier.unlocked}>
                  {tier.unlocked ? 'RECLAMAR' : 'BLOQUEADO'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
