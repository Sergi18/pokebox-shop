import { motion } from 'motion/react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Zap, Filter, Search, Loader2, Package, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import pokecoinIcon from '../../../assets/Pokecoin.png';

export function Cases() {
  const [selectedRarity, setSelectedRarity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const rarities = ['All', 'Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];
  
  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Error loading cases catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(caseItem => {
    const matchesRarity = selectedRarity === 'All' || caseItem.rarity === selectedRarity;
    const matchesSearch = caseItem.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRarity && matchesSearch;
  });
  
  return (
    <div className="min-h-screen py-24 bg-[#0a0e1a]">
      <div className="container mx-auto px-6 max-w-[1600px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/5 border border-white/10 rounded-full mb-4 text-[var(--neon-blue)]">
            <Package className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">Tienda Oficial</span>
          </div>
          <h1 className="text-6xl font-black italic uppercase text-white tracking-tighter leading-none mb-4">
            CATÁLOGO DE <span className="text-[var(--neon-blue)]">CAJAS</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-xl">
            Explora nuestra selección de cajas misteriosas. Consigue los Pokémon más raros y domina la arena de combate.
          </p>
        </motion.div>
        
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="bg-[#131829] border-2 border-white/5 p-6 rounded-[2.5rem] flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[var(--neon-blue)] transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar cajas por nombre..."
                  className="w-full bg-black/40 border-2 border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-[var(--neon-blue)] transition-all"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-1 bg-black/20 rounded-2xl border-2 border-white/5 overflow-x-auto no-scrollbar">
              {rarities.map((rarity) => (
                <button
                  key={rarity}
                  onClick={() => setSelectedRarity(rarity)}
                  className={`px-6 py-3 rounded-xl whitespace-nowrap transition-all font-black italic uppercase text-[10px] tracking-widest ${
                    selectedRarity === rarity
                      ? 'bg-[var(--neon-blue)] text-black shadow-[0_0_15px_rgba(0,212,255,0.3)]'
                      : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {rarity}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Cases Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="w-16 h-16 animate-spin text-[var(--neon-blue)] mb-6" />
            <p className="text-gray-500 font-black italic uppercase tracking-[0.3em]">Cargando Catálogo...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="py-40 text-center bg-[#131829] border-2 border-dashed border-white/5 rounded-[3rem]">
            <Package className="w-20 h-20 mx-auto mb-6 text-gray-800" />
            <h3 className="text-3xl font-black text-white uppercase italic mb-4">No se encontraron cajas</h3>
            <p className="text-gray-500 font-medium">Ajusta los filtros para encontrar lo que buscas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {filteredCases.map((caseItem, index) => (
              <motion.div
                key={caseItem.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -10 }}
              >
                <div 
                  className="bg-[#131829] border-2 border-white/5 rounded-[2.5rem] p-6 group transition-all duration-500 hover:border-[var(--neon-blue)]/50 relative overflow-hidden cursor-pointer h-full flex flex-col"
                  onClick={() => navigate(`/cases/${caseItem.id}`)}
                >
                  <div className="absolute top-6 left-6 z-20">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[8px] font-black text-white tracking-widest uppercase">
                      {caseItem.category || 'Official'}
                    </span>
                  </div>

                  <div className={`aspect-square rounded-[2rem] bg-black/40 mb-6 flex items-center justify-center relative overflow-hidden group-hover:bg-black/20 transition-colors shrink-0`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#131829] via-transparent to-transparent opacity-60 z-10" />
                    
                    {caseItem.image_url ? (
                      <img 
                        src={caseItem.image_url} 
                        alt={caseItem.name}
                        className="w-[85%] h-[85%] object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-[0_0_20px_rgba(0,212,255,0.3)]"
                      />
                    ) : (
                      <motion.div
                        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap className="w-24 h-24 text-[var(--neon-yellow)] opacity-40 blur-[1px]" />
                      </motion.div>
                    )}
                    
                    <div className="absolute bottom-6 left-6 z-20">
                      <div className="flex items-center gap-2 px-4 py-2 bg-[var(--neon-blue)] rounded-xl shadow-2xl border border-white/10">
                        <span className="text-lg font-black italic text-black uppercase tracking-tighter">{caseItem.price.toLocaleString()}</span>
                        <img src={pokecoinIcon} alt="Coin" className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-black italic text-white uppercase tracking-tight truncate leading-none">{caseItem.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase italic text-white shadow-md bg-gradient-to-r whitespace-nowrap ${
                        caseItem.rarity === 'Mythic' ? 'from-yellow-400 to-amber-600' :
                        caseItem.rarity === 'Legendary' ? 'from-purple-500 to-pink-500' :
                        'from-blue-500 to-cyan-500'
                      }`}>
                        {caseItem.rarity}
                      </span>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-white/5 border-2 border-white/10 hover:border-[var(--neon-blue)]/50 hover:bg-[var(--neon-blue)]/10 rounded-2xl text-white font-black italic uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 group/btn mt-auto"
                    >
                      DETALLES
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
