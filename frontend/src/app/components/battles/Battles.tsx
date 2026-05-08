import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Sword, Users, Plus, Trophy, Zap, ShieldCheck, Flame, Info, Timer, ArrowRight, X } from 'lucide-react';
import pokecoinIcon from '../../../assets/Pokecoin.png';

const activeBattles = [
  { id: 1, host: 'Marti', mode: '1v1', caseName: 'Fire Legend', casePrice: 499, slots: { filled: 1, total: 2 }, prize: 998, status: 'waiting' },
  { id: 2, host: 'ChampionSarah', mode: '1v1', caseName: 'Electric Starter', casePrice: 199, slots: { filled: 1, total: 2 }, prize: 398, status: 'waiting' },
  { id: 3, host: 'EliteJordan', mode: '2v2', caseName: 'Water Champion', casePrice: 999, slots: { filled: 3, total: 4 }, prize: 3996, status: 'waiting' },
];

export function Battles() {
  const [selectedMode, setSelectedMode] = useState<'1v1' | '2v2'>('1v1');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBattleModal, setShowBattleModal] = useState(false);
  const [currentBattle, setCurrentBattle] = useState<any>(null);
  
  const handleJoinBattle = (battle: any) => {
    setCurrentBattle(battle);
    setShowBattleModal(true);
    
    // Simulación de batalla premium
    setTimeout(() => {
      setShowBattleModal(false);
      setCurrentBattle(null);
    }, 6000);
  };
  
  return (
    <div className="min-h-screen bg-[#0a0e1a] py-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/30 rounded-full flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Arena de Duelo
              </span>
            </div>
            <h1 className="text-6xl font-black italic uppercase text-white tracking-tighter leading-none mb-3">
              BATALLAS DE <span className="text-[var(--neon-blue)]">CAJAS</span>
            </h1>
            <p className="text-gray-500 font-medium max-w-xl">
              Desafía a otros entrenadores en tiempo real. El que obtenga el Pokémon más valioso se lleva todo el botín. ¡Doble o nada!
            </p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(239,68,68,0.2)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-10 py-5 bg-gradient-to-r from-red-600 to-purple-600 text-white font-black uppercase italic rounded-2xl flex items-center gap-3 transition-all shadow-xl"
          >
            <Plus className="w-5 h-5" />
            CREAR NUEVA BATALLA
          </motion.button>
        </div>

        {/* Filters & Stats Bar */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12">
          {/* Mode Selector */}
          <div className="flex gap-2 p-1.5 bg-[#131829] border-2 border-white/5 rounded-2xl w-fit">
            <button
              onClick={() => setSelectedMode('1v1')}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl transition-all font-black italic uppercase text-xs tracking-wider ${
                selectedMode === '1v1'
                  ? 'bg-[var(--neon-blue)] text-black shadow-[0_0_20px_rgba(0,212,255,0.3)]'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" /> 1vs1
            </button>
            <button
              onClick={() => setSelectedMode('2v2')}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl transition-all font-black italic uppercase text-xs tracking-wider ${
                selectedMode === '2v2'
                  ? 'bg-[var(--neon-blue)] text-black shadow-[0_0_20px_rgba(0,212,255,0.3)]'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" /> 2vs2
            </button>
          </div>

          {/* Quick Info */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: Flame, label: 'En Vivo', value: '24 Batallas', color: 'red' },
              { icon: Trophy, label: 'Total Premiado', value: '45.2K', color: 'yellow' },
              { icon: ShieldCheck, label: 'Seguridad', value: '100% Fair', color: 'blue', hideMobile: true },
            ].map((stat, i) => (
              <div key={i} className={`bg-[#131829] border-2 border-white/5 p-4 rounded-2xl flex items-center gap-4 ${stat.hideMobile ? 'hidden md:flex' : ''}`}>
                <div className="p-2 bg-white/5 rounded-xl">
                  <stat.icon className={`w-5 h-5 ${stat.color === 'red' ? 'text-red-500' : stat.color === 'yellow' ? 'text-yellow-400' : 'text-blue-400'}`} />
                </div>
                <div>
                  <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</div>
                  <div className="text-sm font-black text-white uppercase italic">{stat.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Active Battles Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {activeBattles
                .filter(battle => battle.mode === selectedMode)
                .map((battle) => (
                  <motion.div
                    key={battle.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -10 }}
                  >
                    <div className="bg-[#131829] border-2 border-white/5 rounded-[2.5rem] p-6 relative overflow-hidden group hover:border-red-500/50 transition-all duration-500">
                      {/* Background VS Logo */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl font-black italic text-white/[0.02] pointer-events-none italic">VS</div>
                      
                      <div className="relative z-10">
                        {/* Host & Status */}
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-purple-600 rounded-full p-0.5 shadow-lg">
                              <div className="w-full h-full bg-[#0a0e1a] rounded-full flex items-center justify-center font-black italic text-white">
                                {battle.host.charAt(0)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Host</div>
                              <div className="text-sm font-black text-white uppercase italic">{battle.host}</div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-500/20 mb-1">
                              Esperando
                            </span>
                            <span className="text-[9px] font-bold text-gray-600 uppercase">id: {battle.id}024</span>
                          </div>
                        </div>
                        
                        {/* Battle Content */}
                        <div className="bg-black/30 rounded-3xl border border-white/5 p-6 mb-8">
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-center flex-1">
                              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Caja</div>
                              <div className="text-xs font-black text-white uppercase italic truncate">{battle.caseName}</div>
                            </div>
                            <div className="h-8 w-px bg-white/10 mx-4" />
                            <div className="text-center flex-1">
                              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Coste</div>
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-sm font-black text-[var(--neon-yellow)] italic">{battle.casePrice}</span>
                                <img src={pokecoinIcon} alt="Coin" className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Premio Total</div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xl font-black text-white italic tracking-tighter">{battle.prize.toLocaleString()}</span>
                              <img src={pokecoinIcon} alt="Coin" className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Slots & Action */}
                        <div className="flex items-center gap-4">
                          <div className="flex-1 flex items-center gap-2">
                            {[...Array(battle.slots.total)].map((_, i) => (
                              <div key={i} className={`h-2 flex-1 rounded-full ${i < battle.slots.filled ? 'bg-red-500' : 'bg-white/5'}`} />
                            ))}
                          </div>
                          <span className="text-[10px] font-black text-white italic">{battle.slots.filled}/{battle.slots.total}</span>
                        </div>

                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full mt-6 py-4 bg-white/5 border-2 border-white/10 hover:border-red-500/50 hover:bg-red-500/10 rounded-2xl text-white font-black italic uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 group/btn"
                          onClick={() => handleJoinBattle(battle)}
                        >
                          ENTRAR AL DUELO
                          <Sword className="w-4 h-4 group-hover/btn:rotate-45 transition-transform" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* Battle Modal (Duelo en vivo) */}
        <AnimatePresence>
          {showBattleModal && currentBattle && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/95 backdrop-blur-xl"
              />
              
              <motion.div
                initial={{ scale: 0.8, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.8, y: 50, opacity: 0 }}
                className="relative bg-[#131829] border-2 border-red-500/30 rounded-[3rem] p-10 md:p-16 max-w-5xl w-full overflow-hidden"
              >
                {/* Visual Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-black italic text-white/[0.01] pointer-events-none">FIGHT</div>

                <div className="text-center mb-16 relative z-10">
                  <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter mb-2">Combate en Curso</h2>
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Abriendo Cajas...</p>
                </div>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-16 relative z-10">
                  {/* Player 1 */}
                  <div className="flex-1 w-full max-w-xs">
                    <Card className="bg-black/40 border-2 border-[var(--neon-blue)]/20 p-8 rounded-[2.5rem] text-center relative overflow-hidden group">
                      <div className="w-24 h-24 bg-gradient-to-br from-[var(--neon-blue)] to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,212,255,0.2)]">
                        <span className="text-4xl font-black italic text-white">{currentBattle.host.charAt(0)}</span>
                      </div>
                      <h3 className="text-xl font-black italic text-white uppercase tracking-tight mb-6">{currentBattle.host}</h3>
                      
                      <div className="aspect-square bg-white/5 rounded-2xl flex items-center justify-center relative overflow-hidden">
                        <motion.div
                          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <Zap className="w-16 h-16 text-[var(--neon-yellow)] opacity-40 blur-[1px]" />
                        </motion.div>
                      </div>
                      <div className="mt-6 text-[10px] font-black text-blue-400 uppercase tracking-widest">Procesando Caja...</div>
                    </Card>
                  </div>

                  {/* VS Divider */}
                  <div className="relative">
                    <div className="w-20 h-20 bg-red-600 text-white rounded-full flex items-center justify-center font-black italic text-3xl shadow-[0_0_40px_rgba(239,68,68,0.5)] z-20 relative">VS</div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent md:w-[2px] md:h-64" />
                  </div>

                  {/* Player 2 (You) */}
                  <div className="flex-1 w-full max-w-xs">
                    <Card className="bg-black/40 border-2 border-red-500/20 p-8 rounded-[2.5rem] text-center relative overflow-hidden group">
                      <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                        <span className="text-4xl font-black italic text-white">Y</span>
                      </div>
                      <h3 className="text-xl font-black italic text-white uppercase tracking-tight mb-6">TÚ (Invitado)</h3>
                      
                      <div className="aspect-square bg-white/5 rounded-2xl flex items-center justify-center relative overflow-hidden">
                        <motion.div
                          animate={{ rotate: -360, scale: [1, 1.1, 1] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <Zap className="w-16 h-16 text-[var(--neon-blue)] opacity-40 blur-[1px]" />
                        </motion.div>
                      </div>
                      <div className="mt-6 text-[10px] font-black text-red-500 uppercase tracking-widest">Procesando Caja...</div>
                    </Card>
                  </div>
                </div>
                
                <div className="text-center relative z-10">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Trophy className="w-16 h-16 text-[var(--neon-yellow)] mx-auto mb-4 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
                  </motion.div>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">El ganador será revelado en segundos...</p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        {/* Create Battle Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCreateModal(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
              />
              
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-[#131829] border-2 border-white/5 rounded-[3rem] p-10 max-w-2xl w-full overflow-hidden"
              >
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl font-black italic uppercase text-white italic tracking-tighter">Nueva Batalla</h2>
                  <button onClick={() => setShowCreateModal(false)} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-10">
                  {/* Mode */}
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 block">Modo de Combate</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="py-4 bg-[var(--neon-blue)]/10 border-2 border-[var(--neon-blue)] rounded-2xl text-white font-black italic uppercase text-xs">1v1 DUELO</button>
                      <button className="py-4 bg-white/5 border-2 border-white/5 rounded-2xl text-gray-600 font-black italic uppercase text-xs hover:border-white/10 transition-all">2v2 EQUIPO</button>
                    </div>
                  </div>
                  
                  {/* Case Selection */}
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 block">Seleccionar Caja de Batalla</label>
                    <div className="grid grid-cols-1 gap-3">
                      {['Electric Starter', 'Fire Legend', 'Water Champion'].map((name, i) => (
                        <button key={i} className={`p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${i === 1 ? 'bg-white/5 border-red-500/50' : 'bg-black/20 border-white/5'}`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${i === 1 ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-gray-500'}`}>
                              <Package className="w-5 h-5" />
                            </div>
                            <span className={`font-black italic uppercase text-sm ${i === 1 ? 'text-white' : 'text-gray-500'}`}>{name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-black italic ${i === 1 ? 'text-[var(--neon-yellow)]' : 'text-gray-600'}`}>{i === 0 ? '199' : i === 1 ? '499' : '999'}</span>
                            <img src={pokecoinIcon} alt="Coin" className="w-4 h-4" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <Button variant="danger" size="lg" className="flex-1 py-7 text-lg font-black italic uppercase" onClick={() => setShowCreateModal(false)}>
                      DESPLEGAR BATALLA
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
