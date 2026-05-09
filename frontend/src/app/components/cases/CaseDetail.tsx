import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ArrowLeft, Zap, Star, Gift, Loader2, Info, ChevronRight, ShieldCheck, Sparkles, Box, RefreshCw, X } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CaseOpeningModal } from './CaseOpeningModal';
import { generateRandomItem, getRarityColor, getRarityGlow } from '../../utils/caseItems';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import pokecoinIcon from '../../../assets/Pokecoin.png';

// ─── Funciones de Utilidad ───
function getRarityMeta(rarity: string) {
  switch (rarity) {
    case 'Mythic':    return { g: 'from-yellow-400 via-orange-300 to-amber-500', glow: 'rgba(251,191,36,0.6)',   tc: 'text-yellow-400', icon: '✺', border: 'rgba(251,191,36,0.4)'  };
    case 'Legendary': return { g: 'from-purple-500 via-fuchsia-400 to-pink-400', glow: 'rgba(168,85,247,0.6)',  tc: 'text-purple-400', icon: '❋', border: 'rgba(168,85,247,0.4)'  };
    case 'Epic':      return { g: 'from-blue-500 via-cyan-400 to-sky-400',       glow: 'rgba(56,189,248,0.6)',  tc: 'text-blue-400', icon: '◈', border: 'rgba(56,189,248,0.4)'  };
    case 'Rare':      return { g: 'from-rose-500 via-red-400 to-pink-400',       glow: 'rgba(251,113,133,0.6)', tc: 'text-rose-400', icon: '✦', border: 'rgba(251,113,133,0.4)' };
    default:          return { g: 'from-slate-400 to-slate-500',                 glow: 'rgba(148,163,184,0.3)', tc: 'text-slate-400', icon: '⬡', border: 'rgba(148,163,184,0.2)' };
  }
}

// ─── Componente de Imagen con Fallback ───
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

export function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser, addToInventory, recordCaseOpening } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [caseItem, setCaseItem] = useState<any>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [openedItem, setOpenedItem] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showProbModal, setShowProbModal] = useState(false);
  const [caseItems, setCaseItems] = useState<any[]>([]);

  const totalWeight = useMemo(() => {
    return caseItems.reduce((acc, item) => acc + (item.weight || 100), 0);
  }, [caseItems]);

  useEffect(() => {
    fetchCaseDetails();
  }, [id]);

  const fetchCaseDetails = async () => {
    setLoading(true);
    try {
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select('*')
        .eq('id', Number(id))
        .single();

      if (caseError) throw caseError;
      setCaseItem(caseData);

      const { data: contentsData, error: contentsError } = await supabase
        .from('case_contents')
        .select('*, pokemon_items(*)')
        .eq('case_id', Number(id));

      if (contentsError) throw contentsError;
      
      const items = (contentsData || []).map(c => ({
        ...c.pokemon_items,
        weight: c.weight
      }));
      setCaseItems(items);

    } catch (error) {
      console.error('Error fetching case:', error);
      toast.error('No se pudo cargar la información de la caja');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCase = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Inicia sesión para abrir cajas');
      navigate('/login');
      return;
    }

    if (user.balance < caseItem.price) {
      toast.error('Saldo insuficiente');
      return;
    }

    setIsOpening(true);

    try {
      await updateUser({ balance: user.balance - caseItem.price });

      let selected;
      if (caseItems.length > 0) {
        selected = caseItems[Math.floor(Math.random() * caseItems.length)];
      } else {
        selected = generateRandomItem(caseItem.id);
      }
      
      const resultItem = {
        name: selected.name,
        rarity: selected.rarity,
        value: parseFloat(selected.price || selected.value),
        image: selected.image_url || selected.image || ''
      };

      await addToInventory(resultItem);
      await recordCaseOpening(caseItem.id, caseItem.name, resultItem as any);

      setOpenedItem(resultItem);
      setShowModal(true);
      // toast.success removed to prevent premature message

    } catch (error) {
      console.error('Error opening case:', error);
      toast.error('Fallo técnico al abrir la caja.');
    } finally {
      setIsOpening(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0e1a]">
        <Loader2 className="w-16 h-16 animate-spin text-[var(--neon-blue)] mb-6" />
        <p className="text-gray-500 font-black italic uppercase tracking-[0.3em]">Preparando Arena...</p>
      </div>
    );
  }

  if (!caseItem) return null;

  return (
    <div className="min-h-screen py-24 bg-[#0a0e1a] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-6 max-w-[1600px] relative z-10 text-white">
        
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/cases')}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-12 uppercase font-black italic tracking-widest text-[10px]"
        >
          <ArrowLeft className="w-4 h-4" /> VOLVER AL CATÁLOGO
        </motion.button>

        <div className="mb-24 flex flex-col lg:flex-row items-center gap-20">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 w-full max-w-2xl relative"
          >
            <div className="absolute -inset-10 bg-gradient-to-b from-[var(--neon-blue)]/20 to-purple-600/20 blur-[100px] rounded-full opacity-30" />
            
            <div className="relative aspect-square bg-[#131829] border-2 border-white/5 rounded-[4rem] p-16 flex items-center justify-center shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--neon-blue)]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key="box-visual"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="relative z-10 w-full h-full flex items-center justify-center"
                >
                  {caseItem.image_url ? (
                    <motion.img 
                      src={caseItem.image_url} 
                      animate={isOpening ? { 
                        rotate: [0, -5, 5, -5, 5, 0],
                        scale: [1, 1.1, 0.9, 1.1, 1],
                      } : { 
                        y: [0, -15, 0],
                        rotate: [0, 2, -2, 0]
                      }}
                      transition={isOpening ? { duration: 0.5, repeat: Infinity } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(0,212,255,0.4)]"
                    />
                  ) : (
                    <div className="w-64 h-64 bg-white/5 rounded-full flex items-center justify-center border-2 border-dashed border-white/10">
                      <Box className="w-32 h-32 text-gray-800" />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="absolute bottom-10 w-2/3 h-6 bg-black/40 blur-xl rounded-full" />
            </div>

            <div className="absolute -top-6 -right-6 px-8 py-4 bg-[var(--neon-yellow)] text-black rounded-3xl font-black italic uppercase text-xl shadow-2xl border-4 border-[#0a0e1a]">
              {caseItem.price} <span className="text-xs">Coins</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 space-y-12"
          >
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  {caseItem.category || 'Mistery Box'}
                </span>
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verificado
                </div>
              </div>
              <h1 className="text-7xl font-black italic uppercase text-white tracking-tighter leading-[0.85] mb-6">
                {caseItem.name.split(' ')[0]} <br/>
                <span className="text-[var(--neon-blue)]">{caseItem.name.split(' ').slice(1).join(' ')}</span>
              </h1>
              <p className="text-gray-400 text-xl font-medium leading-relaxed max-w-xl">
                Esta caja de edición especial contiene objetos de rareza {caseItem.rarity}. 
                Las probabilidades han sido auditadas para garantizar una experiencia de juego justa.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 max-w-md">
              <div className="bg-[#131829] border-2 border-white/5 p-6 rounded-[2rem]">
                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 text-center">DROPS DISPONIBLES</div>
                <div className="text-3xl font-black text-white italic text-center leading-none">{caseItems.length || '--'}</div>
              </div>
              <div className="bg-[#131829] border-2 border-white/5 p-6 rounded-[2rem]">
                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 text-center">NIVEL REQUERIDO</div>
                <div className="text-3xl font-black text-[var(--neon-yellow)] italic text-center leading-none">Lv. 1</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
              <motion.button 
                whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(0,212,255,0.6)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOpenCase}
                disabled={isOpening || !isAuthenticated || (user && user.balance < caseItem.price)}
                className="flex-[2] py-8 bg-gradient-to-r from-[var(--neon-blue)] to-blue-600 text-black font-black italic uppercase tracking-tighter text-3xl rounded-[2.5rem] transition-all disabled:opacity-50 relative overflow-hidden group shadow-[0_0_20px_rgba(0,212,255,0.3)] border-b-4 border-blue-800"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative flex items-center justify-center gap-4">
                  {isOpening ? <RefreshCw className="w-8 h-8 animate-spin" /> : <img src={pokecoinIcon} alt="Coins" className="w-8 h-8 object-contain" />}
                  <div className="flex flex-col items-center">
                    <span>{isOpening ? 'ABRIENDO...' : 'ABRIR CAJA'}</span>
                    <span className="text-sm font-black text-black/70 italic tracking-widest">{caseItem.price} PkCoins</span>
                  </div>
                </div>
              </motion.button>
              
              <Button 
                variant="outline"
                className="flex-1 py-8 rounded-[2.5rem] border-white/5 hover:bg-white/5 font-black italic uppercase tracking-widest text-xs"
                onClick={() => setShowProbModal(true)}
              >
                PROBABILIDADES
              </Button>
            </div>

            <div className="p-6 bg-black/40 border border-white/5 rounded-2xl flex items-start gap-4">
              <Info className="w-5 h-5 text-gray-600 shrink-0 mt-1" />
              <p className="text-xs font-medium text-gray-600 leading-relaxed uppercase tracking-wider">
                <span className="text-gray-400 font-black">AVISO:</span> Todos los drops son aleatorios y se basan en un sistema Provably Fair. Los resultados pasados no garantizan resultados futuros.
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="pt-20 border-t border-white/5"
        >
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter flex items-center gap-4">
              <Sparkles className="w-8 h-8 text-[var(--neon-yellow)]" /> POSIBLES PREMIOS
            </h3>
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Mostrando {caseItems.length} objetos
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {caseItems.map((item, idx) => {
              const rarityMeta = getRarityMeta(item.rarity);
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="bg-[#131829] border-2 border-white/5 rounded-[2rem] p-5 group hover:border-[var(--neon-blue)]/30 transition-all text-white"
                >
                  <div className={`aspect-square bg-black/40 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden ${getRarityGlow(item.rarity)}`}>
                    <SafeImage src={item.image_url} alt={item.name} rarity={item.rarity} className="w-[80%] h-[80%] object-contain" rarityIcon={<div className="text-4xl">{rarityMeta.icon}</div>} />
                  </div>
                  <div className="text-[10px] font-black text-white uppercase italic truncate mb-1">{item.name}</div>
                  <div className={`text-[8px] font-black uppercase italic ${rarityMeta.tc} mb-3 tracking-widest`}>{item.rarity}</div>
                  
                  <div className="flex items-center gap-1 mt-auto text-white">
                    <span className="text-xs font-black text-[var(--neon-yellow)] italic">{parseFloat(item.price || item.value).toLocaleString()}</span>
                    <img src={pokecoinIcon} alt="Coin" className="w-3 h-3 opacity-60" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showProbModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProbModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-[#131829] border-2 border-white/5 rounded-[3rem] p-8 md:p-12 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">PROBABILIDADES</h2>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2">Caja: {caseItem.name}</p>
                </div>
                <button onClick={() => setShowProbModal(false)} className="p-2 text-gray-500 hover:text-white transition-all"><X className="w-6 h-6" /></button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {caseItems.length > 0 ? (
                  caseItems.sort((a, b) => (b.weight || 100) - (a.weight || 100)).map((item, idx) => {
                    const prob = ((item.weight || 100) / (totalWeight || 1) * 100).toFixed(2);
                    const meta = getRarityMeta(item.rarity);
                    return (
                      <div key={idx} className="bg-black/20 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-[var(--neon-blue)]/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.g} flex items-center justify-center shrink-0 shadow-lg`}>
                            <SafeImage src={item.image_url} alt={item.name} rarity={item.rarity} className="w-[80%] h-[80%] object-contain" rarityIcon={<div className="text-xl">{meta.icon}</div>} />
                          </div>
                          <div>
                            <div className="text-sm font-black text-white uppercase italic leading-none">{item.name}</div>
                            <div className={`text-[8px] font-black uppercase italic ${meta.tc} mt-1 tracking-widest`}>{item.rarity}</div>
                          </div>
                        </div>
                        <div className="text-right text-white">
                          <div className="text-xl font-black text-[var(--neon-blue)] italic leading-none">{prob}%</div>
                          <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1 text-white">Drop Rate</div>
                        </div>
                      </div>
                    );
                  })
                ) : <div className="text-center py-20 text-gray-600 font-black italic uppercase">No hay datos disponibles</div>}
              </div>
              <div className="mt-8 pt-8 border-t border-white/5">
                <Button variant="default" className="w-full py-5 rounded-2xl font-black italic uppercase" onClick={() => setShowProbModal(false)}>ENTENDIDO</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CaseOpeningModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        item={openedItem}
        caseName={caseItem.name}
        availableItems={caseItems}
      />
    </div>
  );
}
