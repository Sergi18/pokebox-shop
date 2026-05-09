import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, RefreshCw, Trophy, Zap, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Item } from '../../context/AuthContext';
import { getRarityColor, getRarityGlow } from '../../utils/caseItems';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import pokecoinIcon from '../../../assets/Pokecoin.png';

// ─── Componente de Imagen Segura ───
function SafeImage({ src, alt, className, rarityIcon }: { src?: string; alt: string; className?: string; rarityIcon: React.ReactNode }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!src || error) {
    return <div className="flex items-center justify-center w-full h-full opacity-20">{rarityIcon}</div>;
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5 rounded-xl">
          <RefreshCw className="w-5 h-5 animate-spin text-gray-600" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setLoading(false)}
        onError={() => setError(true)}
      />
    </div>
  );
}

// ─── Componente de Rareza Meta ───
function getRarityMeta(rarity: string) {
  switch (rarity) {
    case 'Mythic':    return { g: 'from-yellow-400 via-orange-300 to-amber-500', tc: 'text-yellow-400', icon: '✺' };
    case 'Legendary': return { g: 'from-purple-500 via-fuchsia-400 to-pink-400', tc: 'text-purple-400', icon: '❋' };
    case 'Epic':      return { g: 'from-blue-500 via-cyan-400 to-sky-400',       tc: 'text-blue-400', icon: '◈' };
    case 'Rare':      return { g: 'from-rose-500 via-red-400 to-pink-400',       tc: 'text-rose-400', icon: '✦' };
    default:          return { g: 'from-slate-400 to-slate-500',                 tc: 'text-slate-400', icon: '⬡' };
  }
}

interface CaseOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
  caseName: string;
}

export function CaseOpeningModal({ isOpen, onClose, item, caseName }: CaseOpeningModalProps) {
  const navigate = useNavigate();
  const [phase, setStep] = useState<'roulette' | 'result'>('roulette');
  const [rouletteItems, setRouletteItems] = useState<any[]>([]);
  const rouletteRef = useRef<HTMLDivElement>(null);

  // Generar items para la ruleta (el premio real estará en una posición específica)
  useEffect(() => {
    if (isOpen && item) {
      setStep('roulette');
      
      // Generar 50 items aleatorios + nuestro premio en la posición 45
      const rarities: ('Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic')[] = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];
      const items = Array.from({ length: 50 }, (_, i) => {
        if (i === 45) return item; // Nuestra carta premiada
        return {
          id: `fake_${i}`,
          name: '???',
          rarity: rarities[Math.floor(Math.random() * rarities.length)],
          image: null
        };
      });
      setRouletteItems(items);

      // Iniciar animación de ruleta
      const timer = setTimeout(() => {
        setStep('result');
      }, 5500); // 5.5 segundos de ruleta

      return () => clearTimeout(timer);
    }
  }, [isOpen, item]);

  if (!item) return null;

  return (
    <AnimatePresence shadow-overlay>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl px-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative w-full max-w-6xl bg-[#131829] border-2 border-white/5 rounded-[4rem] p-12 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]"
          >
            {/* Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] font-black italic text-white/[0.01] pointer-events-none select-none">
              UNBOXING
            </div>

            <div className="relative z-10">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/5 border border-white/10 rounded-full mb-4 text-[var(--neon-blue)]">
                  <Zap className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Apertura en Curso</span>
                </div>
                <h2 className="text-5xl font-black italic uppercase text-white tracking-tighter leading-none">
                  {caseName.split(' ')[0]} <span className="text-[var(--neon-blue)]">{caseName.split(' ').slice(1).join(' ')}</span>
                </h2>
              </div>

              <AnimatePresence mode="wait">
                {phase === 'roulette' ? (
                  <motion.div
                    key="roulette-phase"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="relative py-12"
                  >
                    {/* Roulette Container */}
                    <div className="relative w-full overflow-hidden rounded-[2rem] border-2 border-white/5 bg-black/40 p-4">
                      {/* Central Indicator */}
                      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-[var(--neon-yellow)] z-20 shadow-[0_0_20px_rgba(255,215,0,0.5)]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <ChevronDown className="w-8 h-8 text-[var(--neon-yellow)] fill-current" />
                        </div>
                      </div>

                      {/* Moving Strip */}
                      <motion.div
                        initial={{ x: 0 }}
                        animate={{ x: '-85%' }} // Se desplaza hacia la izquierda
                        transition={{ duration: 5, ease: [0.12, 0, 0.39, 0] }} // Curva de frenado dramática
                        className="flex gap-4 w-max"
                      >
                        {rouletteItems.map((rItem, idx) => {
                          const meta = getRarityMeta(rItem.rarity);
                          return (
                            <div 
                              key={idx}
                              className={`w-32 h-44 rounded-2xl border-2 bg-black/40 flex flex-col items-center justify-center p-3 shrink-0 transition-all ${
                                idx === 45 ? 'border-[var(--neon-blue)] bg-[var(--neon-blue)]/5' : 'border-white/5'
                              }`}
                            >
                              <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${meta.g} opacity-20 flex items-center justify-center mb-2 overflow-hidden`}>
                                <SafeImage src={rItem.image} alt={rItem.name} rarity={rItem.rarity} rarityIcon={<div className="text-3xl">{meta.icon}</div>} />
                              </div>
                              <div className={`text-[8px] font-black uppercase italic ${meta.tc} tracking-widest`}>{rItem.rarity}</div>
                            </div>
                          );
                        })}
                      </motion.div>
                    </div>
                    <p className="text-center mt-10 text-gray-500 font-black italic uppercase tracking-[0.3em] animate-pulse">Sintonizando Frecuencia de Drop...</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="result-phase"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center py-10"
                  >
                    {/* Final Card Stage */}
                    <div className="relative mb-12">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 2, -2, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className={`relative w-80 h-[450px] bg-[#131829] border-4 rounded-[3rem] p-8 shadow-[0_0_60px_rgba(0,212,255,0.3)] flex flex-col items-center ${getRarityGlow(item.rarity)} border-[var(--neon-blue)]`}
                      >
                        <div className="absolute top-8 right-8">
                           <span className={`px-4 py-1 rounded-full text-xs font-black uppercase italic text-white shadow-lg bg-gradient-to-r ${getRarityColor(item.rarity)}`}>
                             {item.rarity}
                           </span>
                        </div>

                        <div className="flex-1 w-full flex items-center justify-center bg-black/40 rounded-[2rem] mb-8 overflow-hidden relative group">
                          <SafeImage 
                            src={item.image} 
                            alt={item.name} 
                            className="w-[90%] h-[90%] object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]" 
                            rarityIcon={<div className="text-8xl">{getRarityMeta(item.rarity).icon}</div>} 
                          />
                        </div>

                        <div className="text-center">
                          <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter mb-2">{item.name}</h3>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-2xl font-black text-[var(--neon-yellow)] italic">{item.value.toLocaleString()}</span>
                            <img src={pokecoinIcon} alt="Coin" className="w-6 h-6" />
                          </div>
                        </div>
                      </motion.div>

                      {/* Sparkles Effect */}
                      <div className="absolute -inset-20 pointer-events-none">
                        <AnimatePresence>
                          {[...Array(10)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ 
                                scale: [0, 1.5, 0], 
                                opacity: [0, 1, 0],
                                x: (Math.random() - 0.5) * 300,
                                y: (Math.random() - 0.5) * 300,
                              }}
                              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                              className="absolute left-1/2 top-1/2"
                            >
                              <Sparkles className="w-6 h-6 text-[var(--neon-yellow)]" />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="flex gap-6 w-full max-w-md">
                      <Button
                        variant="default"
                        className="flex-1 py-7 rounded-2xl font-black italic uppercase text-lg shadow-[0_0_30px_rgba(0,212,255,0.2)]"
                        onClick={onClose}
                      >
                        COBRAR PREMIO
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 py-7 rounded-2xl border-white/10 hover:bg-white/5 font-black italic uppercase text-lg"
                        onClick={() => {
                          navigate('/inventory');
                          onClose();
                        }}
                      >
                        INVENTARIO
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
