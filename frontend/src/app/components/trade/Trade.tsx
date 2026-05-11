import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import type { Item } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  ArrowLeftRight,
  Package,
  Search,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Filter,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Minus,
  ArrowRight,
  ArrowLeft,
  Zap,
  Star,
  Info,
  X
} from 'lucide-react';
import { getRarityColor, getRarityGlow } from '../../utils/caseItems';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import pokecoinIcon from '../../../assets/Pokecoin.png';

// ─── Componente de Imagen con Fallback ───
function SafeImage({ src, alt, rarity }: { src?: string; alt: string; rarity: string }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!src || error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black/20 rounded-xl">
        <span className="text-4xl grayscale opacity-20">💎</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center p-2">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5 rounded-xl">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-600" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setLoading(false)}
        onError={() => setError(true)}
      />
    </div>
  );
}

// ─── Catalog Logic ────────────────────────────────────────────────────────────

interface CatalogItem {
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  value: number;
  image?: string;
  caseId: number;
  catalogId: string;
}

const rarityEmoji: Record<string, string> = {
  Common: '⚪', Rare: '🔵', Epic: '🟣', Legendary: '🟡', Mythic: '🔴',
};

const rarityOrder: Record<string, number> = {
  Common: 0, Rare: 1, Epic: 2, Legendary: 3, Mythic: 4,
};

// ─── Components ───────────────────────────────────────────────────────────────

function ValueDiffBadge({ offered, received }: { offered: number; received: number }) {
  const diff = offered - received;
  if (Math.abs(diff) < 1) {
    return (
      <span className="flex items-center gap-1 text-gray-500 text-[10px] font-black uppercase tracking-widest">
        <Minus className="w-3 h-3" /> VALOR IGUAL
      </span>
    );
  }
  if (diff > 0) {
    return (
      <div className="flex flex-col items-center">
        <span className="flex items-center gap-1 text-emerald-400 text-[9px] font-black uppercase tracking-widest">
          <TrendingDown className="w-3 h-3" /> REEMBOLSO
        </span>
        <div className="flex items-center gap-1">
          <span className="text-emerald-400 font-black italic text-xs">+{diff.toFixed(0)}</span>
          <img src={pokecoinIcon} alt="PC" className="w-3 h-3" />
        </div>
      </div>
    );
  }
  return (
    <span className="flex items-center gap-1 text-red-500 text-[10px] font-black uppercase tracking-widest">
      <TrendingUp className="w-3 h-3" /> EXCESIVO
    </span>
  );
}

type TradeStep = 'select-offer' | 'select-receive' | 'confirm' | 'success';

export function Trade() {
  const { isAuthenticated, getInventory, tradeItem } = useAuth();
  const [inventory, setInventory] = useState<Item[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<TradeStep>('select-offer');
  const [offeredItem, setOfferedItem] = useState<Item | null>(null);
  const [receivedItem, setReceivedItem] = useState<CatalogItem | null>(null);
  const [trading, setTrading] = useState(false);
  
  // Filters
  const [inventoryFilter, setInventoryFilter] = useState('all');
  const [catalogFilter, setCatalogFilter] = useState('all');
  const [inventorySearch, setInventorySearch] = useState('');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [sortBy, setSortBy] = useState<'value-desc' | 'value-asc' | 'rarity'>('value-desc');

  useEffect(() => {
    if (isAuthenticated) {
      loadInventory();
      loadCatalog();
    }
  }, [isAuthenticated]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const items = await getInventory();
      setInventory(items);
    } finally {
      setLoading(false);
    }
  };

  const loadCatalog = async () => {
    try {
      const { data, error } = await supabase
        .from('pokemon_items')
        .select('*');
      
      if (error) throw error;
      
      const mappedCatalog: CatalogItem[] = data.map(item => ({
        name: item.name,
        rarity: item.rarity,
        value: parseFloat(item.price || item.value),
        image: item.image_url || item.image,
        caseId: 0,
        catalogId: item.id.toString()
      }));
      setCatalog(mappedCatalog);
    } catch (err) {
      console.error('Error loading catalog:', err);
    }
  };

  const filteredInventory = useMemo(() => {
    let items = inventory;
    if (inventoryFilter !== 'all') items = items.filter(i => i.rarity === inventoryFilter);
    if (inventorySearch) items = items.filter(i => i.name.toLowerCase().includes(inventorySearch.toLowerCase()));
    return [...items].sort((a, b) => {
      if (sortBy === 'value-asc') return a.value - b.value;
      if (sortBy === 'value-desc') return b.value - a.value;
      return rarityOrder[b.rarity] - rarityOrder[a.rarity];
    });
  }, [inventory, inventoryFilter, inventorySearch, sortBy]);

  const filteredCatalog = useMemo(() => {
    if (!offeredItem) return [];
    let items = catalog.filter(i => i.value <= offeredItem.value);
    if (catalogFilter !== 'all') items = items.filter(i => i.rarity === catalogFilter);
    if (catalogSearch) items = items.filter(i => i.name.toLowerCase().includes(catalogSearch.toLowerCase()));
    
    return [...items].sort((a, b) => {
      if (sortBy === 'value-asc') return a.value - b.value;
      if (sortBy === 'value-desc') return b.value - a.value;
      return rarityOrder[b.rarity] - rarityOrder[a.rarity];
    });
  }, [offeredItem, catalog, catalogFilter, catalogSearch, sortBy]);

  const handleSelectOffer = (item: Item) => {
    setOfferedItem(item);
    setReceivedItem(null);
    setStep('select-receive');
  };

  const handleSelectReceive = (item: CatalogItem) => {
    setReceivedItem(item);
    setStep('confirm');
  };

  const handleTrade = async () => {
    if (!offeredItem || !receivedItem) return;
    setTrading(true);
    try {
      const refund = Math.max(0, offeredItem.value - receivedItem.value);
      await tradeItem(offeredItem.id, {
        name: receivedItem.name,
        rarity: receivedItem.rarity,
        value: receivedItem.value,
        caseId: receivedItem.caseId,
      }, refund);
      setStep('success');
      toast.success('¡Intercambio completado!');
      await loadInventory();
    } catch {
      toast.error('Error al realizar el intercambio.');
    } finally {
      setTrading(false);
    }
  };

  const handleReset = () => {
    setOfferedItem(null);
    setReceivedItem(null);
    setStep('select-offer');
    setInventorySearch('');
  };

  const rarityFilters = ['all', 'Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0e1a]">
        <Card className="max-w-md w-full border-2 border-white/5">
          <div className="text-center py-12 px-6">
            <div className="w-20 h-20 bg-[var(--neon-yellow)]/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[var(--neon-yellow)]/20">
              <ArrowLeftRight className="w-10 h-10 text-[var(--neon-yellow)]" />
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-4 text-white">Intercambio Restringido</h2>
            <p className="text-gray-400 mb-8 font-medium">Inicia sesión para acceder al centro de trueques de PokeBox.</p>
            <Button variant="default" className="w-full py-6 text-lg font-black italic" onClick={() => window.location.href = '/login'}>
              INICIAR SESIÓN
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 bg-[#0a0e1a] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-600/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-[var(--neon-yellow)]/10 text-[var(--neon-yellow)] text-[10px] font-black uppercase tracking-widest border border-[var(--neon-yellow)]/30 rounded-full">
                Vault Exchange
              </span>
            </div>
            <h1 className="text-5xl font-black italic text-white uppercase tracking-tighter mb-3 leading-none">
              Centro de <span className="text-[var(--neon-yellow)]">Intercambio</span>
            </h1>
            <p className="text-gray-500 font-medium max-w-xl">
              Cambia tus cartas por nuevas piezas. Valor asegurado: si tu carta vale más, te devolvemos la diferencia en PokeCoins.
            </p>
          </motion.div>

          <div className="hidden lg:flex gap-4">
            <div className="bg-[#131829] border-2 border-white/5 p-4 rounded-2xl flex items-center gap-4">
              <div className="p-2 bg-white/5 rounded-xl text-[var(--neon-yellow)]">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Tu Inventario</div>
                <div className="text-sm font-black text-white uppercase italic">{inventory.length} Cartas</div>
              </div>
            </div>
          </div>
        </div>

        {step !== 'success' && (
          <div className="flex items-center justify-center gap-4 mb-12 overflow-x-auto pb-4">
            {[
              { id: 'select-offer', label: 'Entrega', icon: Package },
              { id: 'select-receive', label: 'Elección', icon: Sparkles },
              { id: 'confirm', label: 'Trato', icon: CheckCircle },
            ].map((s, idx) => {
              const stepOrder = ['select-offer', 'select-receive', 'confirm', 'success'];
              const current = stepOrder.indexOf(step);
              const thisStep = stepOrder.indexOf(s.id);
              const isDone = current > thisStep;
              const isActive = current === thisStep;
              const Icon = s.icon;
              return (
                <React.Fragment key={s.id}>
                  <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 border-2 ${
                    isActive
                      ? 'bg-[var(--neon-yellow)]/10 border-[var(--neon-yellow)] text-white shadow-[0_0_20px_rgba(255,215,0,0.15)]'
                      : isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-white/5 border-white/5 text-gray-600'
                  }`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--neon-yellow)]' : ''}`} />
                    <span className="text-sm font-black italic uppercase tracking-tight">{s.label}</span>
                  </div>
                  {idx < 2 && (
                    <ArrowRight className={`w-4 h-4 shrink-0 ${current > idx ? 'text-emerald-500' : 'text-gray-800'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 'select-offer' && (
            <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <Card className="border-2 border-white/5 p-6 rounded-[2rem] bg-[#131829]">
                    <div className="mb-8">
                      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Search className="w-3 h-3" /> Buscar
                      </h3>
                      <input
                        type="text"
                        placeholder="Nombre de carta..."
                        value={inventorySearch}
                        onChange={e => setInventorySearch(e.target.value)}
                        className="w-full bg-black/40 border-2 border-white/5 focus:border-[var(--neon-yellow)] rounded-xl py-3 px-4 text-white font-bold outline-none transition-all placeholder-gray-700"
                      />
                    </div>

                    <div className="mb-8">
                      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Filter className="w-3 h-3" /> Ordenar por Precio
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSortBy('value-desc')}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all border-2 ${
                            sortBy === 'value-desc'
                              ? 'bg-[var(--neon-yellow)]/10 border-[var(--neon-yellow)] text-white'
                              : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/10'
                          }`}
                        >
                          <TrendingUp className="w-4 h-4 mb-1" />
                          <span className="text-[9px] font-black uppercase italic">Mayor</span>
                        </button>
                        <button
                          onClick={() => setSortBy('value-asc')}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all border-2 ${
                            sortBy === 'value-asc'
                              ? 'bg-[var(--neon-yellow)]/10 border-[var(--neon-yellow)] text-white'
                              : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/10'
                          }`}
                        >
                          <TrendingDown className="w-4 h-4 mb-1" />
                          <span className="text-[9px] font-black uppercase italic">Menor</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Star className="w-3 h-3" /> Rareza
                      </h3>
                      <div className="flex flex-col gap-2">
                        {rarityFilters.map(r => (
                          <button
                            key={r}
                            onClick={() => setInventoryFilter(r)}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase italic transition-all border-2 ${
                              inventoryFilter === r
                                ? 'bg-[var(--neon-yellow)]/10 border-[var(--neon-yellow)] text-white'
                                : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/10'
                            }`}
                          >
                            <span>{r === 'all' ? 'Todas' : r}</span>
                            <span className="text-[10px] opacity-50">{r === 'all' ? inventory.length : inventory.filter(i => i.rarity === r).length}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </Card>

                  <div className="p-6 bg-blue-500/5 border-2 border-blue-500/10 rounded-[2rem]">
                    <div className="flex gap-3 mb-3">
                      <Info className="w-4 h-4 text-blue-400 shrink-0" />
                      <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">¿Cómo funciona?</h4>
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase">
                      Selecciona una carta de tu inventario para ofrecer. Podrás elegir cualquier carta del catálogo de igual o menor valor.
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-3">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <RefreshCw className="w-10 h-10 animate-spin text-[var(--neon-yellow)]" />
                      <p className="text-gray-500 font-black italic uppercase tracking-widest mt-6">Cargando Bóveda...</p>
                    </div>
                  ) : filteredInventory.length === 0 ? (
                    <div className="bg-[#131829] border-2 border-dashed border-white/5 rounded-[3rem] p-12 text-center">
                      <Package className="w-12 h-12 text-gray-800 mx-auto mb-6" />
                      <h3 className="text-xl font-black text-white uppercase italic mb-2">Sin Resultados</h3>
                      <p className="text-gray-500 font-medium mb-8 max-w-xs mx-auto">No tienes cartas que coincidan con los filtros.</p>
                      <Button variant="default" onClick={() => window.location.href = '/cases'}>ABRIR CAJAS</Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {filteredInventory.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.02 }}
                          whileHover={{ y: -5 }}
                          onClick={() => handleSelectOffer(item)}
                          className={`relative group cursor-pointer rounded-[1.5rem] border-2 transition-all duration-300 p-4 bg-[#131829] border-white/5 hover:border-[var(--neon-yellow)]/50`}
                        >
                          <div className="mb-3">
                            <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase italic ${getRarityColor(item.rarity)} text-white shadow-lg`}>
                              {item.rarity}
                            </span>
                          </div>
                          <div className={`w-full aspect-[3/4] rounded-2xl bg-gradient-to-br ${getRarityColor(item.rarity)} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-500 overflow-hidden relative ${getRarityGlow(item.rarity)}`}>
                            <div className="absolute inset-0 bg-black/20" />
                            <SafeImage src={item.image || (item as any).image_url} alt={item.name} rarity={item.rarity} />
                          </div>
                          <div className="text-[10px] font-black text-white uppercase italic tracking-tight truncate mb-1">{item.name}</div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-black text-[var(--neon-yellow)] italic">{item.value.toLocaleString()}</span>
                            <img src={pokecoinIcon} alt="Coin" className="w-3 h-3" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'select-receive' && offeredItem && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <Card className="border-2 border-[var(--neon-yellow)]/30 bg-[var(--neon-yellow)]/5 p-6 rounded-[2rem]">
                    <h3 className="text-[10px] font-black text-[var(--neon-yellow)] uppercase tracking-[0.2em] mb-4">Tu Oferta</h3>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center shrink-0 shadow-lg overflow-hidden ${getRarityGlow(offeredItem.rarity)}`}>
                        <SafeImage src={offeredItem.image || (offeredItem as any).image_url} alt={offeredItem.name} rarity={offeredItem.rarity} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-white uppercase italic truncate">{offeredItem.name}</div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-black text-[var(--neon-yellow)]">{offeredItem.value}</span>
                          <img src={pokecoinIcon} alt="PC" className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setStep('select-offer')} className="w-full text-[9px] font-black border-white/10">
                      CAMBIAR OFERTA
                    </Button>
                  </Card>

                  <Card className="border-2 border-white/5 p-6 rounded-[2rem] bg-[#131829]">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Filtrar Catálogo</h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Buscar en catálogo..."
                        value={catalogSearch}
                        onChange={e => setCatalogSearch(e.target.value)}
                        className="w-full bg-black/40 border-2 border-white/5 focus:border-[var(--neon-blue)] rounded-xl py-3 px-4 text-white font-bold outline-none text-xs"
                      />
                      
                      <div className="pt-2">
                        <h4 className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-3">Ordenar Precio</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setSortBy('value-desc')}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-[9px] font-black uppercase italic border-2 transition-all ${
                              sortBy === 'value-desc' ? 'bg-[var(--neon-blue)] border-[var(--neon-blue)] text-black' : 'bg-black/20 border-white/5 text-gray-500'
                            }`}
                          >
                            <TrendingUp className="w-3 h-3" /> Mayor
                          </button>
                          <button
                            onClick={() => setSortBy('value-asc')}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-[9px] font-black uppercase italic border-2 transition-all ${
                              sortBy === 'value-asc' ? 'bg-[var(--neon-blue)] border-[var(--neon-blue)] text-black' : 'bg-black/20 border-white/5 text-gray-500'
                            }`}
                          >
                            <TrendingDown className="w-3 h-3" /> Menor
                          </button>
                        </div>
                      </div>

                      <div className="pt-2">
                        <h4 className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-3">Rareza</h4>
                        <div className="flex flex-wrap gap-2">
                          {rarityFilters.map(r => (
                            <button
                              key={r}
                              onClick={() => setCatalogFilter(r)}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase italic border-2 transition-all ${
                                catalogFilter === r ? 'bg-[var(--neon-blue)] border-[var(--neon-blue)] text-black' : 'bg-black/20 border-white/5 text-gray-500'
                              }`}
                            >
                              {r === 'all' ? 'T' : r.charAt(0)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="lg:col-span-3">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-black italic uppercase text-white">Cartas Disponibles</h2>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Máx: {offeredItem.value} PC</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredCatalog.map((item, index) => {
                      const refund = offeredItem.value - item.value;
                      return (
                        <motion.div
                          key={item.catalogId}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.02 }}
                          whileHover={{ y: -5 }}
                          onClick={() => handleSelectReceive(item)}
                          className={`relative group cursor-pointer rounded-[1.5rem] border-2 transition-all duration-300 p-4 bg-[#131829] border-white/5 hover:border-[var(--neon-blue)]/50`}
                        >
                          {refund > 0 && (
                            <div className="absolute top-2 right-2 z-10 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase">
                              +{refund} PC
                            </div>
                          )}
                          <div className="mb-3">
                            <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase italic ${getRarityColor(item.rarity)} text-white`}>
                              {item.rarity}
                            </span>
                          </div>
                          <div className={`w-full aspect-[3/4] rounded-2xl bg-gradient-to-br ${getRarityColor(item.rarity)} flex items-center justify-center mb-4 overflow-hidden relative ${getRarityGlow(item.rarity)}`}>
                            <div className="absolute inset-0 bg-black/20" />
                            <SafeImage src={item.image || (item as any).image_url} alt={item.name} rarity={item.rarity} />
                          </div>
                          <div className="text-[10px] font-black text-white uppercase italic truncate mb-1">{item.name}</div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-black text-[var(--neon-blue)] italic">{item.value.toLocaleString()}</span>
                            <img src={pokecoinIcon} alt="Coin" className="w-3 h-3" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'confirm' && offeredItem && receivedItem && (
            <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="max-w-3xl mx-auto">
                <Card className="border-2 border-white/5 p-10 md:p-12 rounded-[3rem] overflow-hidden relative bg-[#131829]">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--neon-yellow)] via-white to-[var(--neon-blue)]" />
                  
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter mb-2">Confirmar Trato</h2>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Revisa los términos del intercambio</p>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12 relative">
                    <div className="flex-1 w-full text-center">
                      <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Tú Entregas</div>
                      <div className={`p-6 rounded-[2.5rem] border-2 border-red-500/20 bg-red-500/5 relative overflow-hidden group flex items-center justify-center flex-col`}>
                        <div className="w-32 h-32 mb-4 relative flex items-center justify-center">
                          <SafeImage src={offeredItem.image || (offeredItem as any).image_url} alt={offeredItem.name} rarity={offeredItem.rarity} />
                        </div>
                        <h4 className="text-sm font-black text-white uppercase italic mb-1">{offeredItem.name}</h4>
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-xs font-black text-gray-400">{offeredItem.value}</span>
                          <img src={pokecoinIcon} alt="PC" className="w-3 h-3 opacity-50" />
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="w-16 h-16 bg-white/5 text-white rounded-full flex items-center justify-center font-black italic text-xl border-2 border-white/10 z-20 relative">
                        <ArrowLeftRight className="w-6 h-6 text-[var(--neon-yellow)]" />
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-[2px] bg-white/5 md:w-[2px] md:h-48" />
                    </div>

                    <div className="flex-1 w-full text-center">
                      <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Tú Recibes</div>
                      <div className={`p-6 rounded-[2.5rem] border-2 border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group flex items-center justify-center flex-col`}>
                        <div className="w-32 h-32 mb-4 relative flex items-center justify-center">
                          <SafeImage src={receivedItem.image || (receivedItem as any).image_url} alt={receivedItem.name} rarity={receivedItem.rarity} />
                        </div>
                        <h4 className="text-sm font-black text-white uppercase italic mb-1">{receivedItem.name}</h4>
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-xs font-black text-[var(--neon-blue)]">{receivedItem.value}</span>
                          <img src={pokecoinIcon} alt="PC" className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/30 rounded-[2rem] border-2 border-white/5 p-8 mb-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-xl">
                          <ValueDiffBadge offered={offeredItem.value} received={receivedItem.value} />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Estado del Trato</div>
                        <div className="text-xs font-black text-emerald-400 uppercase italic">Beneficio Justo</div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-[var(--neon-yellow)] shrink-0 mt-0.5" />
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tight leading-relaxed">
                        Al confirmar, tu carta actual será retirada y la nueva se añadirá a tu inventario. Cualquier excedente de valor se abonará en PokeCoins automáticamente.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => setStep('select-receive')} className="flex-1 py-5 border-2 border-white/5 rounded-2xl text-gray-500 font-black italic uppercase tracking-wider hover:bg-white/5 transition-all">
                      ← REVISAR
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleTrade}
                      disabled={trading}
                      className="flex-[2] py-5 bg-[var(--neon-yellow)] rounded-2xl text-black font-black italic uppercase tracking-wider shadow-[0_0_30px_rgba(255,215,0,0.3)] flex items-center justify-center gap-3"
                    >
                      {trading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><ArrowLeftRight className="w-5 h-5" /> EJECUTAR INTERCAMBIO</>}
                    </motion.button>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="max-w-xl mx-auto">
              <Card className="border-2 border-[var(--neon-yellow)]/30 bg-[#131829] p-10 text-center rounded-[3rem] relative shadow-[0_0_50px_rgba(255,215,0,0.1)]">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 opacity-10 pointer-events-none"
                >
                  <Zap className="w-full h-full text-[var(--neon-yellow)]" />
                </motion.div>
                
                <div className="w-24 h-24 bg-gradient-to-br from-[var(--neon-yellow)] to-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(255,215,0,0.4)] relative z-10">
                  <Sparkles className="w-10 h-10 text-black" />
                </div>
                
                <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter mb-4 leading-none relative z-10">
                  ¡INTERCAMBIO <span className="text-[var(--neon-yellow)]">EXITOSO!</span>
                </h2>
                <p className="text-gray-400 font-bold text-sm mb-10 max-w-sm mx-auto relative z-10 uppercase tracking-widest">
                  La Bóveda se ha actualizado. Tu nueva carta ya está disponible en el inventario.
                </p>

                <div className="flex flex-col gap-4 relative z-10">
                  <Button variant="default" className="w-full py-6 rounded-2xl font-black italic uppercase tracking-wider" onClick={handleReset}>
                    NUEVO INTERCAMBIO
                  </Button>
                  <button
                    onClick={() => window.location.href = '/inventory'}
                    className="w-full py-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    VER MI COLECCIÓN
                  </button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
