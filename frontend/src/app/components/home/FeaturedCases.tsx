import { motion } from 'motion/react';
import { Button } from '../ui/Button';
import { ChevronLeft, ChevronRight, Zap, ArrowRight, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// Mapas visuales para las cajas (colores y etiquetas según ID)
const CASE_META: Record<number, any> = {
  1: { color: 'yellow', tag: 'BÁSICO' },
  2: { color: 'red', tag: 'HOT' },
  3: { color: 'blue', tag: 'POPULAR' },
  4: { color: 'purple', tag: 'OFERTA' },
  5: { color: 'yellow', tag: 'ELITE' },
  6: { color: 'blue', tag: 'NUEVO' },
};

export function FeaturedCases() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchFeaturedCases();
  }, []);

  const fetchFeaturedCases = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: true });

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Error fetching featured cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextCase = () => {
    if (cases.length <= 3) return;
    setCurrentIndex((prev) => (prev + 1) % (cases.length - 2));
  };
  
  const prevCase = () => {
    if (cases.length <= 3) return;
    setCurrentIndex((prev) => (prev - 1 + (cases.length - 2)) % (cases.length - 2));
  };
  
  const getVisibleCases = () => {
    if (cases.length <= 3) return cases;
    return cases.slice(currentIndex, currentIndex + 3);
  };
  
  if (loading) {
    return (
      <div className="py-32 flex items-center justify-center bg-[#0a0e1a]">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--neon-blue)]" />
      </div>
    );
  }

  if (cases.length === 0) return null;

  return (
    <section className="py-32 bg-[#0a0e1a] relative overflow-hidden">
      {/* Background Decorative Text */}
      <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none select-none opacity-[0.02]">
        <div className="text-[20rem] font-black italic whitespace-nowrap leading-none">
          POKEMON MYSTERY CASES COLLECT THEM ALL
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[var(--neon-yellow)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Drop de Temporada</span>
            </div>
            <h2 className="text-5xl font-black italic uppercase text-white tracking-tighter leading-none">
              CAJAS <span className="text-[var(--neon-blue)]">DESTACADAS</span>
            </h2>
          </motion.div>
          
          {cases.length > 3 && (
            <div className="flex gap-3">
              <button onClick={prevCase} className="p-4 bg-white/5 border-2 border-white/5 rounded-2xl text-white hover:border-[var(--neon-blue)] hover:bg-[var(--neon-blue)]/10 transition-all">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={nextCase} className="p-4 bg-white/5 border-2 border-white/5 rounded-2xl text-white hover:border-[var(--neon-blue)] hover:bg-[var(--neon-blue)]/10 transition-all">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {getVisibleCases().map((caseItem, index) => {
            const meta = CASE_META[caseItem.id] || { color: 'blue', tag: 'OFFICIAL' };
            return (
              <motion.div
                key={`${caseItem.id}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="relative bg-[#131829] border-2 border-white/5 rounded-[2.5rem] p-6 group transition-all duration-500 hover:border-[var(--neon-blue)]/50">
                  {/* Case Tag */}
                  <div className="absolute top-6 left-6 z-20">
                    <span className="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[9px] font-black text-white tracking-widest uppercase">
                      {meta.tag}
                    </span>
                  </div>

                  {/* Image Container */}
                  <div className="aspect-[4/5] rounded-[2rem] bg-black/40 mb-6 flex items-center justify-center relative overflow-hidden group-hover:bg-black/20 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#131829] via-transparent to-transparent opacity-60 z-10" />
                    
                    {caseItem.image_url ? (
                      <img 
                        src={caseItem.image_url} 
                        alt={caseItem.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 5, repeat: Infinity }}
                      >
                        <Zap className={`w-32 h-32 ${meta.color === 'yellow' ? 'text-yellow-400' : 'text-blue-400'} opacity-40 blur-[2px]`} />
                      </motion.div>
                    )}
                    
                    {/* Floating Price */}
                    <div className="absolute bottom-6 left-6 z-20">
                      <div className="flex items-center gap-2 px-4 py-2 bg-[var(--neon-blue)] rounded-xl shadow-2xl">
                        <span className="text-lg font-black italic text-black uppercase tracking-tighter">{caseItem.price}</span>
                        <img src="/src/assets/Pokecoin.png" alt="Coin" className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black italic text-white uppercase tracking-tight truncate">{caseItem.name}</h3>
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-[var(--neon-blue)]" />)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" /> 100% Fair
                      </div>
                      <div className="w-1 h-1 rounded-full bg-gray-800" />
                      <div className="uppercase">RARE DROP</div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/cases/${caseItem.id}`)}
                      className="w-full py-4 bg-white/5 border-2 border-white/10 hover:border-[var(--neon-blue)]/50 hover:bg-[var(--neon-blue)]/10 rounded-2xl text-white font-black italic uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 group/btn"
                    >
                      ABRIR CAJA
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-20 text-center">
          <Button 
            variant="outline" 
            size="lg" 
            className="px-12 py-8 rounded-[2rem] border-white/5 hover:bg-white/5 font-black italic uppercase text-lg tracking-widest"
            onClick={() => navigate('/cases')}
          >
            VER TODAS LAS CAJAS
          </Button>
        </div>
      </div>
    </section>
  );
}
