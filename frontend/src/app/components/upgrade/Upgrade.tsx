import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Check, X, Sparkles, Shuffle, ArrowUpRight, Zap,
  TrendingUp, Shield, Flame, Droplets, Wind, Cpu,
  ChevronRight, Target, AlertTriangle, ArrowBigDown, RefreshCw, Star, PlusCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import pokecoinIcon from '../../../assets/Pokecoin.png';

// ─── Funciones de Utilidad ───
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

function calcSuccessRate(inputValue: number, targetValue: number): number {
  if (!inputValue || !targetValue || inputValue <= 0 || targetValue <= 0) return 0;
  const ratio = targetValue / inputValue;
  const raw = 90 * Math.pow(1 / ratio, 0.8);
  return Math.round(Math.min(97, Math.max(1, raw)) * 1000) / 1000;
}

// ─── Componentes Visuales ───

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
        onError={() => {
          setError(true);
          setLoading(false);
        }}
      />
    </div>
  );
}

function EliteCardPreview({ item, type = 'sacrifice', index = 0, total = 1 }: { item: any; type?: 'sacrifice' | 'target'; index?: number; total?: number }) {
  const meta = getRarityMeta(item.rarity);
  const rotation = type === 'sacrifice' ? (index - (total - 1) / 2) * 15 : 0;
  const xOffset = type === 'sacrifice' ? (index - (total - 1) / 2) * 40 : 0;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1, rotate: rotation, x: xOffset }}
      exit={{ y: -100, opacity: 0, scale: 0.5 }}
      whileHover={{ y: -10, scale: 1.05, zIndex: 50 }}
      className="absolute"
      style={{ zIndex: index }}
    >
      <div className={`w-64 h-80 bg-[#131829] border-2 rounded-[2rem] p-4 relative overflow-hidden shadow-2xl transition-all duration-500 ${
        type === 'target' ? 'border-[var(--neon-blue)] shadow-[0_0_40px_rgba(0,212,255,0.3)]' : 'border-white/10'
      }`}>
        <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${meta.g}`} />
        <div className="relative z-10 h-full flex flex-col items-center">
          <div className="w-full flex justify-between items-start mb-4">
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase italic ${meta.g} text-white`}>
              {item.rarity}
            </span>
            <div className="text-white opacity-40">{meta.icon}</div>
          </div>
          <div className="flex-1 w-full flex items-center justify-center bg-black/40 rounded-2xl mb-4 relative overflow-hidden">
            <SafeImage 
              src={item.image} 
              alt={item.name} 
              className="w-[85%] h-[85%] object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
              rarityIcon={<div className="text-6xl">{meta.icon}</div>} 
            />
          </div>
          <div className="text-center w-full">
            <div className="text-sm font-black text-white uppercase italic truncate mb-1">{item.name}</div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-lg font-black text-[var(--neon-yellow)] italic">{item.value.toLocaleString()}</span>
              <img src={pokecoinIcon} alt="Coin" className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProbabilityDial({
  rate, isUpgrading, rollValue
}: { rate: number; isUpgrading: boolean; rollValue: number | null }) {
  const R    = 82;
  const circ = 2 * Math.PI * R;
  const dash = circ * (rate / 100);
  const col  = getDialColor(rate);

  return (
    <div className="relative flex flex-col items-center select-none text-white">
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
          <circle cx="100" cy="100" r={R} fill="none" stroke="#0c1228" strokeWidth="14" />
          <motion.circle cx="100" cy="100" r={R}
            fill="none" stroke="url(#arcG2)" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            transform="rotate(-90 100 100)"
            filter="url(#gF)"
            animate={{ strokeDasharray: `${dash} ${circ}` }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          />
          <circle cx="100" cy="100" r={56} fill="#0d1535" stroke="rgba(0,212,255,0.05)" strokeWidth="1" />
          <text x="100" y="105" textAnchor="middle" fill="white" fontSize="26" fontWeight="900" fontFamily="monospace" opacity="0.05">
            {rate.toFixed(1)}%
          </text>
          <motion.path
            d="M98 100 L100 35 L102 100 Z"
            fill="white"
            initial={{ rotate: -90 }}
            animate={isUpgrading ? { rotate: 3600 + (rollValue || 0) * 3.6 - 90 } : { rotate: (rollValue || 0) * 3.6 - 90 }}
            transition={isUpgrading ? { duration: 4.5, ease: [0.22, 1, 0.36, 1] } : { duration: 0.5 }}
            style={{ originX: 0.5, originY: 1 }}
            className="drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
          />
          <circle cx="100" cy="100" r={6} fill="white" stroke="#00d4ff" strokeWidth="2" />
          <circle cx="100" cy="100" r={12} fill="none" stroke="white" strokeWidth="1" opacity="0.1" />
        </svg>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-white">
          <ArrowBigDown className="w-8 h-8 fill-white animate-bounce" />
        </div>
      </div>
    </div>
  );
}

function ResultModal({ result, onClose }: { result: { success: boolean; item?: any } | null; onClose: () => void }) {
  if (!result) return null;
  const meta = result.item ? getRarityMeta(result.item.rarity) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6 text-white">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#131829] border-2 border-white/10 rounded-[3rem] p-10 max-w-sm w-full text-center relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-2 ${result.success ? 'bg-green-500' : 'bg-red-500'}`} />
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ${result.success ? 'bg-green-500/20 text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)]' : 'bg-red-500/20 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]'}`}>
          {result.success ? <Check className="w-12 h-12" /> : <X className="w-12 h-12" />}
        </div>
        <h2 className="text-3xl font-black italic uppercase text-white mb-2">{result.success ? '¡UPGRADE EXITOSO!' : 'MEJORA FALLIDA'}</h2>
        <p className="text-gray-500 text-sm mb-10 font-bold uppercase tracking-widest">{result.success ? 'Has obtenido un nuevo objeto' : 'Has perdido tus cartas'}</p>
        {result.success && result.item && (
          <div className="bg-black/40 border border-white/5 rounded-3xl p-6 mb-10">
            <div className={`w-20 h-24 bg-gradient-to-br ${meta?.g} rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-4xl shadow-xl overflow-hidden`}>
              <SafeImage src={result.item.image} alt={result.item.name} className="w-full h-full object-contain p-2" rarityIcon={meta?.icon} />
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

// ─── Main Component ───

interface TargetCard {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  value: number;
  image?: string;
}

export function Upgrade() {
  const { user, inventory, removeItems, addItem, refreshInventory } = useAuth();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [targetPool, setTargetPool] = useState<TargetCard[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<TargetCard | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeResult, setUpgradeResult] = useState<{ success: boolean; item?: any } | null>(null);
  const [rollValue, setRollValue] = useState<number | null>(null);
  const [loadingCatalog, setLoading] = useState(true);

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('pokemon_items').select('*').order('price', { ascending: true });
      if (error) throw error;
      const formatted: TargetCard[] = (data || []).map(item => ({
        id: item.id.toString(),
        name: item.name,
        rarity: item.rarity,
        value: parseFloat(item.price),
        image: item.image_url
      }));
      setTargetPool(formatted);
    } catch (error) {
      console.error('Error loading catalog:', error);
    } finally {
      setLoading(false);
    }
  };

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
    setTimeout(async () => {
      const success = finalRoll < successRate;
      try {
        if (success) {
          await addItem({ name: selectedTarget.name, rarity: selectedTarget.rarity, value: selectedTarget.value, caseId: 0 });
          setUpgradeResult({ success: true, item: selectedTarget });
        } else {
          setUpgradeResult({ success: false });
        }
        await refreshInventory();
      } catch (error) {
        toast.error('Error al procesar upgrade.');
      } finally {
        setIsUpgrading(false);
      }
    }, 4500); 
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] py-24 relative overflow-hidden text-white">
      <div className="container mx-auto px-6 max-w-[1600px] relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-black italic uppercase text-white tracking-tighter leading-none mb-4">
            SISTEMA DE <span className="text-[var(--neon-yellow)]">MEJORA</span>
          </h1>
        </div>

        {/* THE STAGE */}
        <div className="mb-20 relative h-[450px] w-full flex items-center justify-between px-12 lg:px-24">
          <div className="flex-1 flex items-center justify-center relative h-full">
            <div className="absolute bottom-0 w-64 h-8 bg-blue-500/10 blur-xl rounded-full" />
            <AnimatePresence>
              {selectedCards.length > 0 ? (
                <div className="relative w-full flex items-center justify-center">
                  {selectedCards.map((card, i) => (
                    <EliteCardPreview key={card.id} item={card} type="sacrifice" index={i} total={selectedCards.length} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 opacity-20">
                  <div className="w-64 h-80 border-2 border-dashed border-white/20 rounded-[2rem] flex items-center justify-center"><PlusCircle className="w-12 h-12" /></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Esperando Sacrificio</span>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="z-50 shrink-0 transform scale-110 px-12">
            <div className="bg-[#131829]/40 backdrop-blur-xl border-2 border-white/5 rounded-full p-2 shadow-2xl relative">
              <ProbabilityDial rate={successRate} isUpgrading={isUpgrading} rollValue={rollValue} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-32 w-full flex flex-col items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0,212,255,0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!canUpgrade}
                  onClick={handleUpgrade}
                  className={`px-12 py-5 rounded-2xl font-black italic uppercase text-lg tracking-tight transition-all flex items-center justify-center gap-3 ${canUpgrade ? 'bg-[var(--neon-blue)] text-black' : 'bg-white/5 text-gray-700 grayscale cursor-not-allowed'}`}
                >
                  {isUpgrading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                  {isUpgrading ? 'PROCESANDO' : 'MEJORAR'}
                </motion.button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center relative h-full">
            <div className="absolute bottom-0 w-64 h-8 bg-purple-500/10 blur-xl rounded-full" />
            <AnimatePresence mode="wait">
              {selectedTarget ? (
                <EliteCardPreview key={selectedTarget.id} item={selectedTarget} type="target" />
              ) : (
                <div className="flex flex-col items-center gap-4 opacity-20">
                  <div className="w-64 h-80 border-2 border-dashed border-white/20 rounded-[2rem] flex items-center justify-center"><Target className="w-12 h-12" /></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Selecciona Objetivo</span>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* SELECTION LISTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="bg-[#131829] border-2 border-white/5 rounded-[2.5rem] p-8 text-white">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center justify-between">
              Mi Inventario <span className="text-blue-400">{inventory.length} disponibles</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              {inventory.map(item => {
                const meta = getRarityMeta(item.rarity);
                const isSelected = selectedItems.includes(item.id);
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => toggleItem(item.id)}
                    className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative ${isSelected ? 'border-[var(--neon-blue)] bg-[var(--neon-blue)]/10 shadow-lg' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                  >
                    <div className="aspect-square bg-black/20 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                      <SafeImage src={item.image} alt={item.name} className="w-[80%] h-[85%] object-contain" rarityIcon={meta.icon} />
                    </div>
                    <div className="text-[10px] font-black text-white uppercase italic truncate">{item.name}</div>
                    <div className="flex items-center gap-1 mt-1 text-white">
                      <span className="text-[10px] font-bold text-[var(--neon-yellow)] italic">{item.value.toLocaleString()}</span>
                      <img src={pokecoinIcon} alt="Coin" className="w-3 h-3 opacity-60" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-500 uppercase">Valor Invertido:</span>
              <div className="flex items-center gap-2 text-white">
                <span className="text-2xl font-black text-[var(--neon-yellow)] italic">{totalValue.toLocaleString()}</span>
                <img src={pokecoinIcon} alt="Coin" className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-[#131829] border-2 border-white/5 rounded-[2.5rem] p-8 text-white">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center justify-between text-white">Catálogo de Premios</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar text-white">
              {loadingCatalog ? (
                <div className="col-span-full py-20 flex justify-center"><RefreshCw className="w-8 h-8 animate-spin text-blue-500" /></div>
              ) : targetPool.filter(card => totalValue === 0 || card.value >= totalValue).map(card => {
                  const meta = getRarityMeta(card.rarity);
                  const isSelected = selectedTarget?.id === card.id;
                  return (
                    <motion.button key={card.id} whileHover={{ scale: 1.05 }} onClick={() => setSelectedTarget(card)} className={`text-left rounded-2xl p-4 border-2 transition-all relative ${isSelected ? 'border-purple-500 bg-purple-500/10 shadow-lg' : 'border-white/5 bg-white/5 hover:border-white/10'}`}>
                      <div className="aspect-square bg-black/20 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                        <SafeImage src={card.image} alt={card.name} className="w-[80%] h-[85%] object-contain" rarityIcon={meta.icon} />
                      </div>
                      <div className="text-[10px] font-black text-white uppercase italic truncate">{card.name}</div>
                      <div className="flex items-center gap-1 mt-1 text-white">
                        <span className="text-[10px] font-bold text-[var(--neon-yellow)] italic">{card.value.toLocaleString()}</span>
                        <img src={pokecoinIcon} alt="Coin" className="w-3 h-3 opacity-60" />
                      </div>
                    </motion.button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
      <ResultModal result={upgradeResult} onClose={() => setUpgradeResult(null)} />
    </div>
  );
}
