import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, RefreshCw, Trophy, Zap, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Item } from '../../context/AuthContext';
import { getRarityColor, getRarityGlow } from '../../utils/caseItems';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import pokecoinIcon from '../../../assets/Pokecoin.png';
import { ImageWithFallback } from '../figma/ImageWithFallback';

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
  availableItems: Item[];
}

export function CaseOpeningModal({ isOpen, onClose, item, caseName, availableItems }: CaseOpeningModalProps) {
  const navigate = useNavigate();
  const [phase, setStep] = useState<'roulette' | 'result'>('roulette');
  const [rouletteItems, setRouletteItems] = useState<any[]>([]);
  // Posición fija: 45 ítems (cada uno 192px + 16px gap = 208px) = 9360px.
  // Ajuste para centrar el icono: necesitamos desplazar hasta el centro de la carta 45 (9360 + 96 = 9456px).
  const finalOffset = -9456;

  // Generar items para la ruleta
  useEffect(() => {
    if (isOpen && item) {
      setStep('roulette');
      
      const items = Array.from({ length: 50 }, (_, i) => {
        if (i === 45) return item; // Usamos el item real pasado por props
        const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
        return {
          id: `fake_${i}`,
          name: randomItem?.name || '?',
          rarity: randomItem?.rarity || 'Common',
          image: randomItem?.image || randomItem?.image_url || ''
        };
      });
      setRouletteItems(items);

      const timer = setTimeout(() => {
        setStep('result');
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, item, availableItems]);

  if (!item) return null;

  return (
    <AnimatePresence>
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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] font-black italic text-white/[0.01] pointer-events-none select-none">
              UNBOXING
            </div>

            <div className="relative z-10">
              <div className="text-center mb-12">
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
                    <div className="relative w-full overflow-hidden rounded-[2rem] border-2 border-white/5 bg-black/40 p-4">
                      {/* Central Indicator */}
                      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-[var(--neon-yellow)] z-20 shadow-[0_0_20px_rgba(255,215,0,0.5)]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2">
                          <ChevronDown className="w-8 h-8 text-[var(--neon-yellow)] fill-current" />
                        </div>
                      </div>

                      {/* Moving Strip */}
                      <motion.div
                        initial={{ x: 0 }}
                        animate={{ x: `${finalOffset}px` }}
                        transition={{ duration: 7, ease: [0.1, 0.7, 0.2, 1] }}
                        className="flex gap-4 w-max px-[50%]"
                      >
                        {rouletteItems.map((rItem, idx) => {
                          const meta = getRarityMeta(rItem.rarity);
                          return (
                            <div 
                              key={idx}
                              className={`w-48 h-64 rounded-3xl border-2 bg-black/40 flex flex-col items-center justify-center p-4 shrink-0 transition-all border-white/10`}
                            >
                              <div className={`w-full aspect-square rounded-2xl bg-gradient-to-br ${meta.g} opacity-40 flex items-center justify-center mb-4 overflow-hidden`}>
                                <ImageWithFallback src={rItem.image || ''} alt={rItem.name} className="w-full h-full object-contain" />
                              </div>
                              <div className={`text-[12px] font-black uppercase italic ${meta.tc} tracking-widest`}>{rItem.rarity}</div>
                            </div>
                          );
                        })}
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="result-phase"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center py-10"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.05, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`relative w-80 h-[450px] bg-[#131829] border-4 rounded-[3rem] p-8 shadow-[0_0_60px_rgba(0,212,255,0.3)] flex flex-col items-center ${getRarityGlow(item.rarity)} border-[var(--neon-blue)]`}
                    >
                      <div className="absolute top-8 right-8">
                         <span className={`px-4 py-1 rounded-full text-xs font-black uppercase italic text-white shadow-lg bg-gradient-to-r ${getRarityColor(item.rarity)}`}>
                           {item.rarity}
                         </span>
                      </div>

                      <div className="flex-1 w-full flex items-center justify-center bg-black/40 rounded-[2rem] mb-8 overflow-hidden">
                        <ImageWithFallback 
                          src={item.image || ''} 
                          alt={item.name} 
                          className="w-[90%] h-[90%] object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]" 
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

                    <div className="flex gap-6 w-full max-w-md mt-12">
                      <Button
                        variant="default"
                        className="flex-1 py-7 rounded-2xl font-black italic uppercase text-lg"
                        onClick={onClose}
                      >
                        COBRAR PREMIO
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
