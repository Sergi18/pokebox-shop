import { motion } from 'motion/react';
import { ArrowRight, Zap, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import pokecoinIcon from '../../../assets/Pokecoin.png';

const CASE_META: any = {
  'default': { color: 'blue', tag: 'OFFICIAL' }
};

export function FeaturedCases() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*');
      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Error fetching featured cases:', error);
    } finally {
      setLoading(false);
    }
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
    <section className="py-24 bg-[#0a0e1a]">
      <div className="container mx-auto px-6 max-w-[1600px]">
        <div className="mb-12">
          <h2 className="text-5xl font-black italic uppercase text-white tracking-tighter mb-2">CAJAS DESTACADAS</h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">LAS MÁS POPULARES DE LA SEMANA</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cases.slice(0, 3).map((caseItem: any, index: number) => {
            const meta = CASE_META[caseItem.id] || CASE_META['default'];
            return (
              <motion.div
                key={caseItem.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="relative bg-[#131829] border-2 border-white/5 rounded-[2.5rem] p-8 group transition-all duration-500 hover:border-[var(--neon-blue)]/50 hover:bg-[#1a2238]/50 shadow-xl">
                  <div className="flex justify-between items-start mb-6 z-20">
                      <span className="px-4 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black text-white tracking-widest uppercase">
                        {meta.tag}
                      </span>
                      <div className="flex items-center gap-2 px-4 py-2 bg-[var(--neon-blue)] rounded-xl shadow-[0_0_15px_rgba(0,212,255,0.3)]">
                        <span className="text-lg font-black italic text-black uppercase tracking-tighter">{caseItem.price}</span>
                        <img src={pokecoinIcon} alt="Coin" className="w-4 h-4" />
                      </div>
                  </div>

                  <div className="relative h-64 mb-8 flex items-center justify-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.15),transparent_70%)]" />
                    {caseItem.image_url ? (
                      <motion.img 
                        src={caseItem.image_url} 
                        alt={caseItem.name}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] relative z-10"
                      />
                    ) : (
                      <Zap className={`w-32 h-32 ${meta.color === 'yellow' ? 'text-yellow-400' : 'text-blue-400'} opacity-40 blur-[2px]`} />
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl font-black italic text-white uppercase tracking-tight truncate text-center">{caseItem.name}</h3>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/cases/${caseItem.id}`)}
                      className="w-full py-5 bg-white/5 border-2 border-white/10 hover:border-[var(--neon-blue)]/50 hover:bg-[var(--neon-blue)]/10 rounded-2xl text-white font-black italic uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 group/btn"
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
      </div>
    </section>
  );
}
