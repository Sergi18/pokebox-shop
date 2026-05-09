import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Check, X, Sparkles, Shuffle, ArrowUpRight, Zap,
  TrendingUp, Shield, Flame, Droplets, Wind, Cpu,
  ChevronRight, Target, AlertTriangle, ArrowBigDown, RefreshCw, Star
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import pokecoinIcon from '../../../assets/Pokecoin.png';

// ─── Target Card Pool ─────────────────────────────────────────────────────────

interface TargetCard {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  value: number;
}

const TARGET_POOL: TargetCard[] = [
  // Common
  { id: 'tc_01', name: 'Thunder Stone',      rarity: 'Common',    value: 75    },
  { id: 'tc_02', name: 'Volt Badge',          rarity: 'Common',    value: 100   },
  { id: 'tc_03', name: 'Leaf Stone',          rarity: 'Common',    value: 150   },
  { id: 'tc_04', name: 'Water Drop',          rarity: 'Common',    value: 400   },
  // Rare
  { id: 'tc_05', name: 'Electric Crystal',   rarity: 'Rare',      value: 200   },
  { id: 'tc_06', name: 'Miracle Seed',        rarity: 'Rare',      value: 325   },
  { id: 'tc_07', name: 'Fire Stone',          rarity: 'Rare',      value: 375   },
  { id: 'tc_08', name: 'Ocean Pearl',         rarity: 'Rare',      value: 725   },
  { id: 'tc_09', name: 'Mind Shard',          rarity: 'Rare',      value: 1000  },
  // Epic
  { id: 'tc_10', name: 'Lightning Shard',    rarity: 'Epic',      value: 425   },
  { id: 'tc_11', name: 'Inferno Crystal',    rarity: 'Epic',      value: 800   },
  { id: 'tc_12', name: 'Psychic Orb',        rarity: 'Epic',      value: 1900  },
  { id: 'tc_13', name: 'Tidal Wave Charm',   rarity: 'Epic',      value: 1400  },
  { id: 'tc_14', name: 'Dragon Scale',       rarity: 'Epic',      value: 3000  },
  // Legendary
  { id: 'tc_15', name: 'Phoenix Feather',    rarity: 'Legendary', value: 1400  },
  { id: 'tc_16', name: 'Deep Sea Crystal',   rarity: 'Legendary', value: 1600  },
  { id: 'tc_17', name: 'Dragon Fang',        rarity: 'Legendary', value: 5750  },
  { id: 'tc_18', name: 'Third Eye Crystal',  rarity: 'Legendary', value: 3150  },
  { id: 'tc_19', name: 'Warrior\'s Spirit',  rarity: 'Legendary', value: 3000  },
  // Mythic
  { id: 'tc_20', name: 'Eternal Flame',      rarity: 'Mythic',    value: 2250  },
  { id: 'tc_21', name: 'Cosmic Brain',       rarity: 'Mythic',    value: 5250  },
  { id: 'tc_22', name: 'Neptune\'s Trident', rarity: 'Mythic',    value: 4000  },
  { id: 'tc_23', name: 'Dragon Soul Stone',  rarity: 'Mythic',    value: 12500 },
];

// ─── Probability Formula ──────────────────────────────────────────────────────
function calcSuccessRate(inputValue: number, targetValue: number): number {
  if (!inputValue || !targetValue || inputValue <= 0 || targetValue <= 0) return 0;
  const ratio = targetValue / inputValue;
  const raw = 90 * Math.pow(1 / ratio, 0.8);
  return Math.round(Math.min(97, Math.max(1, raw)) * 1000) / 1000;
}

function getDialColor(rate: number): string {
  if (rate >= 70) return '#4ade80';
  if (rate >= 50) return '#a3e635';
  if (rate >= 35) return '#facc15';
  if (rate >= 20) return '#fb923c';
  return '#f87171';
}

function getRarityMeta(rarity: string) {
  switch (rarity) {
    case 'Mythic':    return { g: 'from-yellow-400 via-orange-300 to-amber-500', glow: 'rgba(251,191,36,0.6)',   tc: '#fbbf24', icon: '✺', border: 'rgba(251,191,36,0.4)'  };
    case 'Legendary': return { g: 'from-purple-500 via-fuchsia-400 to-pink-400', glow: 'rgba(168,85,247,0.6)',  tc: '#c084fc', icon: '❋', border: 'rgba(168,85,247,0.4)'  };
    case 'Epic':      return { g: 'from-blue-500 via-cyan-400 to-sky-400',       glow: 'rgba(56,189,248,0.6)',  tc: '#38bdf8', icon: '◈', border: 'rgba(56,189,248,0.4)'  };
    case 'Rare':      return { g: 'from-rose-500 via-red-400 to-pink-400',       glow: 'rgba(251,113,133,0.6)', tc: '#fb7185', icon: '✦', border: 'rgba(251,113,133,0.4)' };
    default:          return { g: 'from-slate-400 to-slate-500',                 glow: 'rgba(148,163,184,0.3)', tc: '#94a3b8', icon: '⬡', border: 'rgba(148,163,184,0.2)' };
  }
}

function getCardTypeIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes('thunder') || n.includes('electric') || n.includes('volt') || n.includes('lightning') || n.includes('plasma'))
    return <Zap className="w-8 h-8" />;
  if (n.includes('fire') || n.includes('flame') || n.includes('inferno') || n.includes('phoenix') || n.includes('ember'))
    return <Flame className="w-8 h-8" />;
  if (n.includes('water') || n.includes('ocean') || n.includes('tidal') || n.includes('sea') || n.includes('neptune'))
    return <Droplets className="w-8 h-8" />;
  if (n.includes('leaf') || n.includes('nature') || n.includes('forest') || n.includes('miracle') || n.includes('seed'))
    return <Wind className="w-8 h-8" />;
  if (n.includes('psychic') || n.includes('mind') || n.includes('brain') || n.includes('cosmic') || n.includes('crystal'))
    return <Cpu className="w-8 h-8" />;
  if (n.includes('dragon') || n.includes('wyrm') || n.includes('elder') || n.includes('soul'))
    return <Shield className="w-8 h-8" />;
  return <TrendingUp className="w-8 h-8" />;
}

// ─── Probability Dial ─────────────────────────────────────────────────────────
function ProbabilityDial({
  rate, isUpgrading, rollValue
}: { rate: number; isUpgrading: boolean; rollValue: number | null }) {
  const R    = 82;
  const circ = 2 * Math.PI * R;
  const dash = circ * (rate / 100);
  const col  = getDialColor(rate);

  return (
    <div className="relative flex flex-col items-center select-none">
      <div style={{ width: 280, height: 280, position: 'relative' }}>
        <svg width="280" height="280" viewBox="0 0 200 200" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="arcG2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={col} />
              <stop offset="100%" stopColor="#00d4ff" />
            </linearGradient>
            <filter id="gF">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Track */}
          <circle cx="100" cy="100" r={R} fill="none" stroke="#0c1228" strokeWidth="14" />

          {/* Success Arc */}
          <motion.circle cx="100" cy="100" r={R}
            fill="none" stroke="url(#arcG2)" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            transform="rotate(-90 100 100)"
            filter="url(#gF)"
            animate={{ strokeDasharray: `${dash} ${circ}` }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          />

          {/* Center Info - Detrás de la aguja */}
          <circle cx="100" cy="100" r={56} fill="#0d1535" stroke="rgba(0,212,255,0.05)" strokeWidth="1" />
          <text x="100" y="105" textAnchor="middle" fill="white" fontSize="26" fontWeight="900" fontFamily="monospace" opacity="0.05">
            {rate.toFixed(1)}%
          </text>
          {/* Needle / Arrow Indicator - REDISEÑO PARA CENTRADO PERFECTO Y TAMAÑO EQUILIBRADO */}
          <motion.path
            d="M98 100 L100 35 L102 100 Z"
            fill="white"
            initial={{ rotate: -90 }}
            animate={isUpgrading ? { rotate: 3600 + (rollValue || 0) * 3.6 - 90 } : { rotate: (rollValue || 0) * 3.6 - 90 }}
            transition={isUpgrading ? { duration: 4.5, ease: [0.22, 1, 0.36, 1] } : { duration: 0.5 }}
            style={{ originX: 0.5, originY: 1 }}
            className="drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
          />

{/* Eje Central Decorativo (Fijo) */}
<circle cx="100" cy="100" r="6" fill="white" stroke="#00d4ff" strokeWidth="2" />
<circle cx="100" cy="100" r="12" fill="none" stroke="white" strokeWidth="1" opacity="0.1" />
</svg>
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-white">
          <ArrowBigDown className="w-8 h-8 fill-white animate-bounce" />
        </div>
      </div>
    </div>
  );
}

// ─── Result Modal ─────────────────────────────────────────────────────────────
function ResultModal({ result, onClose }: { result: { success: boolean; item?: any } | null; onClose: () => void }) {
  if (!result) return null;
  const meta = result.item ? getRarityMeta(result.item.rarity) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6 text-white">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#131829] border-2 border-white/10 rounded-[3rem] p-10 max-sm w-full text-center relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-2 ${result.success ? 'bg-green-500' : 'bg-red-500'}`} />
        
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ${result.success ? 'bg-green-500/20 text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)]' : 'bg-red-500/20 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]'}`}>
          {result.success ? <Check className="w-12 h-12" /> : <X className="w-12 h-12" />}
        </div>

        <h2 className="text-3xl font-black italic uppercase text-white mb-2">{result.success ? '¡UPGRADE EXITOSO!' : 'MEJORA FALLIDA'}</h2>
        <p className="text-gray-500 text-sm mb-10 font-bold uppercase tracking-widest">{result.success ? 'Has obtenido un nuevo objeto' : 'Has perdido tus cartas'}</p>

        {result.success && result.item && (
          <div className="bg-black/40 border border-white/5 rounded-3xl p-6 mb-10">
            <div className={`w-20 h-24 bg-gradient-to-br ${meta?.g} rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-4xl shadow-xl`}>
              {meta?.icon}
            </div>
            <div className="text-lg font-black text-white uppercase italic">{result.item.name}</div>
            <div className="text-[var(--neon-yellow)] font-black italic">{result.item.value} PokéCoins</div>
          </div>
        )}

        <Button variant="default" className="w-full py-6 rounded-2xl font-black italic uppercase" onClick={onClose}>
          {result.success ? 'CONTINUAR' : 'CERRAR'}
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function Upgrade() {
  const { user, inventory, removeItems, addItem, refreshInventory } = useAuth();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<TargetCard | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeResult, setUpgradeResult] = useState<{ success: boolean; item?: any } | null>(null);
  const [rollValue, setRollValue] = useState<number | null>(null);

  const selectedCards = useMemo(() => inventory.filter(i => selectedItems.includes(i.id)), [inventory, selectedItems]);
  const totalValue = useMemo(() => selectedCards.reduce((s, i) => s + i.value, 0), [selectedCards]);
  const successRate = useMemo(() => calcSuccessRate(totalValue, selectedTarget?.value ?? 0), [totalValue, selectedTarget]);
  const canUpgrade = selectedItems.length > 0 && selectedTarget !== null && totalValue > 0 && !isUpgrading;

  const toggleItem = (id: string) => setSelectedItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleUpgrade = async () => {
    if (!user || !canUpgrade || !selectedTarget) return;
    
    const itemsToSacrifice = [...selectedItems];
    setSelectedItems([]);
    await removeItems(itemsToSacrifice);

    const finalRoll = Math.random() * 100;
    setRollValue(finalRoll);
    setIsUpgrading(true);
    setUpgradeResult(null);

    setTimeout(async () => {
      const success = finalRoll < successRate;

      try {
        if (success) {
          await addItem({
            name: selectedTarget.name,
            rarity: selectedTarget.rarity,
            value: selectedTarget.value,
            caseId: 0,
          });
          setUpgradeResult({ success: true, item: selectedTarget });
          toast.success('¡Increíble! Has conseguido la mejora.');
        } else {
          setUpgradeResult({ success: false });
          toast.error('Lo sentimos, has perdido el upgrade.');
        }
        
        await refreshInventory();
      } catch (error) {
        console.error('Upgrade Error:', error);
        toast.error('Hubo un error al procesar el upgrade.');
      } finally {
        setIsUpgrading(false);
      }
    }, 4500); 
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] py-24 relative overflow-hidden text-white">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/5 border border-white/10 rounded-full mb-4">
            <TrendingUp className="w-3 h-3 text-[var(--neon-blue)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Upgrade Arena</span>
          </div>
          <h1 className="text-6xl font-black italic uppercase text-white tracking-tighter leading-none mb-4">
            SISTEMA DE <span className="text-[var(--neon-yellow)]">MEJORA</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-xl mx-auto">
            Sacrifica tus cartas comunes para obtener objetos legendarios. Riesgo real, recompensas reales.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px_1fr] gap-8 items-start text-white">
          
          <div className="bg-[#131829] border-2 border-white/5 rounded-[2.5rem] p-8">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center justify-between">
              Tus Cartas <span className="text-blue-400">{selectedItems.length} seleccionadas</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {inventory.map(item => {
                const meta = getRarityMeta(item.rarity);
                const isSelected = selectedItems.includes(item.id);
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => toggleItem(item.id)}
                    className={`cursor-pointer rounded-2xl p-4 border-2 transition-all ${isSelected ? 'border-[var(--neon-blue)] bg-[var(--neon-blue)]/10 shadow-lg' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                  >
                    <div className="text-2xl mb-2">{meta.icon}</div>
                    <div className="text-[10px] font-black text-white uppercase italic truncate">{item.name}</div>
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">${item.value}</div>
                  </motion.div>
                );
              })}
              {inventory.length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-600 font-bold italic uppercase">Inventario Vacío</div>
              )}
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-500 uppercase">Valor Invertido:</span>
              <div className="flex items-center gap-2 text-white">
                <span className="text-2xl font-black text-[var(--neon-yellow)] italic">{totalValue.toLocaleString()}</span>
                <img src={pokecoinIcon} alt="Coin" className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-8">
            <div className="bg-[#131829] border-2 border-white/5 rounded-[3rem] p-10 w-full flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--neon-blue)] to-transparent opacity-30" />
              <ProbabilityDial rate={successRate} isUpgrading={isUpgrading} rollValue={rollValue} />
              
              <div className="mt-10 w-full bg-black/40 rounded-3xl p-6 border border-white/5 text-white">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Multiplicador</span>
                  <span className="text-xl font-black text-[var(--neon-blue)] italic">x{(selectedTarget ? (selectedTarget.value / (totalValue || 1)).toFixed(2) : '0.00')}</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div animate={{ width: `${successRate}%` }} className="h-full bg-[var(--neon-blue)] shadow-[0_0_15px_rgba(0,212,255,0.5)]" />
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(0,212,255,0.3)" }}
              whileTap={{ scale: 0.98 }}
              disabled={!canUpgrade}
              onClick={handleUpgrade}
              className={`w-full py-8 rounded-[2rem] font-black italic uppercase text-2xl tracking-tighter transition-all flex items-center justify-center gap-3 ${canUpgrade ? 'bg-[var(--neon-blue)] text-black' : 'bg-white/5 text-gray-600 grayscale cursor-not-allowed'}`}
            >
              {isUpgrading ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" /> UPGRADEANDO...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6" /> INICIAR MEJORA
                </>
              )}
            </motion.button>
            
            {canUpgrade && (
              <div className="flex items-center gap-2 text-red-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" /> Peligro: Las cartas se pueden perder
              </div>
            )}
          </div>

          <div className="bg-[#131829] border-2 border-white/5 rounded-[2.5rem] p-8 text-white">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Carta Objetivo</h3>
            <div className="space-y-4">
              <div className={`h-40 rounded-3xl border-2 p-6 flex flex-col items-center justify-center gap-2 transition-all ${selectedTarget ? 'bg-[var(--neon-blue)]/5 border-[var(--neon-blue)]' : 'bg-black/20 border-white/5 border-dashed'}`}>
                {selectedTarget ? (
                  <>
                    <div className="text-4xl">{getRarityMeta(selectedTarget.rarity).icon}</div>
                    <div className="text-lg font-black text-white uppercase italic">{selectedTarget.name}</div>
                    <div className="flex items-center gap-1">
                      <span className="text-[var(--neon-yellow)] font-black italic">{selectedTarget.value}</span>
                      <img src={pokecoinIcon} alt="Coin" className="w-3 h-3" />
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600 font-bold italic uppercase text-xs">Selecciona un objetivo</p>
                )}
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar text-white">
                {TARGET_POOL
                  .filter(card => totalValue === 0 || card.value >= totalValue)
                  .map(card => {
                  const meta = getRarityMeta(card.rarity);
                  const isSelected = selectedTarget?.id === card.id;
                  return (
                    <button
                      key={card.id}
                      onClick={() => setSelectedTarget(card)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isSelected ? 'border-[var(--neon-blue)] bg-[var(--neon-blue)]/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-lg" style={{ color: meta.tc }}>{meta.icon}</div>
                        <div className="text-left">
                          <div className="text-xs font-black text-white uppercase italic leading-none">{card.name}</div>
                          <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{card.rarity}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <span className="text-2xl font-black text-[var(--neon-yellow)] italic">{totalValue.toLocaleString()}</span>
                        <img src={pokecoinIcon} alt="Coin" className="w-5 h-5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>

      <ResultModal result={upgradeResult} onClose={() => setUpgradeResult(null)} />
    </div>
  );
}
