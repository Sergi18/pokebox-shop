import { motion } from 'motion/react';
import { Button } from '../ui/Button';
import { Package, Sparkles, RefreshCw, Eye, X } from 'lucide-react';
import { getRarityColor, getRarityGlow } from '../../utils/caseItems';
import type { Item } from '../../context/AuthContext';
import pokecoinIcon from '../../../assets/Pokecoin.png';
import '../../styles/gengar-style.css';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { AnimatePresence } from 'motion/react';

// ─── Componente de Imagen con Fallback ───
function SafeImage({ src, alt, rarity }: { src?: string; alt: string; rarity: string }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!src || error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black/20 rounded-xl">
        <span className="text-6xl grayscale opacity-20">✺</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5 rounded-xl">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-[85%] h-[85%] object-contain drop-shadow-[0_0_20px_rgba(168,85,247,0.3)] ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setLoading(false)}
        onError={() => setError(true)}
      />
    </div>
  );
}

export function Inventory() {
  const { user, isAuthenticated, getInventory, removeItems } = useAuth();
  const [inventory, setInventory] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDetail, setSelectedDetail] = useState<Item | null>(null);

  useEffect(() => {
    if (isAuthenticated) loadInventory();
  }, [isAuthenticated]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const items = await getInventory();
      setInventory(items);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = useMemo(() => {
    let items = [...inventory];
    if (filter !== 'all') {
      items = items.filter(item => item.rarity.toLowerCase() === filter.toLowerCase());
    }
    items.sort((a, b) => sortOrder === 'desc' ? b.value - a.value : a.value - b.value);
    return items;
  }, [inventory, filter, sortOrder]);

  const totalValue = inventory.reduce((sum, item) => sum + item.value, 0);
  const rarityFilters = ['all', 'common', 'rare', 'epic', 'legendary', 'mythic'];

  const handleSell = async (item: Item) => {
    try {
      await removeItems([item.id]);
      toast.success(`Has vendido ${item.name} por ${item.value} monedas`);
      loadInventory();
    } catch (error) {
      toast.error('Error al vender la carta');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a] text-white">
        <div className="max-w-md w-full border-2 border-purple-500/20 bg-[#131829] text-center p-12 rounded-[2.5rem] shadow-2xl">
          <Package className="w-20 h-20 mx-auto mb-6 text-purple-500/20" />
          <h2 className="text-2xl font-black italic uppercase text-white mb-4">Acceso Restringido</h2>
          <p className="text-gray-500 font-medium mb-8 uppercase tracking-widest text-[10px]">Inicia sesión para ver tu colección.</p>
          <Button variant="default" className="w-full py-6 font-black italic rounded-xl bg-purple-600 hover:bg-purple-700" onClick={() => window.location.href = '/login'}>
            INICIAR SESIÓN
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 bg-[#0a0e1a] relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.1),transparent_50%)]" />
        <div className="container mx-auto px-6 max-w-[1600px] relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-6xl font-black italic uppercase text-white tracking-tighter leading-none mb-3">
              MI <span className="text-purple-400">COLECCIÓN</span>
            </h1>
            <p className="text-gray-500 font-medium max-w-xl italic uppercase tracking-widest text-xs">
              Tu arsenal espectral de cartas legendarias.
            </p>
          </motion.div>

          <div className="flex gap-4 flex-wrap">
            {[
              { icon: Package, label: 'Cartas', value: inventory.length },
              { icon: null, label: 'Valor Total', value: totalValue.toLocaleString(), custom: pokecoinIcon },
            ].map((stat, i) => (
              <div key={i} className="bg-[#131829] border-2 border-purple-500/20 p-5 rounded-2xl flex items-center gap-4 min-w-[180px] shadow-lg">
                <div className="p-3 bg-purple-900/20 rounded-xl border border-purple-500/20">
                  {stat.icon ? <stat.icon className="w-6 h-6 text-purple-400" /> : <img src={stat.custom} className="w-6 h-6" />}
                </div>
                <div>
                  <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</div>
                  <div className="text-xl font-black text-white italic tracking-tight">{stat.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 flex flex-wrap gap-4 items-center">
            <div className="flex flex-wrap gap-2 p-1.5 bg-[#131829] border-2 border-purple-500/20 rounded-2xl w-fit">
              {rarityFilters.map((r) => (
                <button
                  key={r}
                  onClick={() => setFilter(r)}
                  className={`px-6 py-2.5 rounded-xl transition-all font-black italic uppercase text-xs tracking-wider ${
                    filter === r
                      ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                      : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {r === 'all' ? 'Todas' : r}
                </button>
              ))}
            </div>
            
            <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="px-6 py-4 bg-[#131829] border-2 border-purple-500/20 rounded-2xl text-purple-400 font-black italic uppercase text-xs hover:border-purple-500/50 transition-all"
            >
                Precio: {sortOrder === 'desc' ? 'Mayor a Menor' : 'Menor a Mayor'}
            </button>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <RefreshCw className="w-12 h-12 animate-spin text-purple-500" />
            <p className="text-gray-500 font-black italic uppercase tracking-widest mt-6">Sincronizando colección...</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="border-2 border-dashed border-purple-500/20 bg-[#131829]/50 py-32 text-center rounded-[3rem]">
            <Sparkles className="w-16 h-16 text-purple-500/20 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-white uppercase italic mb-2">Colección Vacía</h3>
            <p className="text-gray-500 font-medium mb-10 max-w-xs mx-auto text-xs uppercase tracking-widest">No tienes cartas de esta rareza.</p>
            <Button variant="default" className="px-12 py-6 rounded-2xl font-black italic uppercase bg-purple-600 hover:bg-purple-700" onClick={() => window.location.href = '/cases'}>TIENDA DE CAJAS</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredInventory.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className="flex flex-col"
              >
                <div className="gengar-aura bg-[#131829] border-2 border-purple-500/20 rounded-[2.5rem] p-6 transition-all duration-500 hover:border-purple-400/50 relative overflow-hidden flex-1">
                  <div className="absolute top-6 right-6 z-20">
                    <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase italic text-white shadow-lg ${getRarityColor(item.rarity)}`}>
                      {item.rarity}
                    </span>
                  </div>

                  <div className={`aspect-square rounded-[2rem] bg-black/40 mb-6 flex items-center justify-center relative overflow-hidden transition-colors ${getRarityGlow(item.rarity)}`}>
                    <SafeImage src={item.image} alt={item.name} rarity={item.rarity} />
                    
                    <div className="absolute bottom-4 left-4 z-20">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md rounded-xl border border-purple-500/20 shadow-2xl">
                        <span className="text-sm font-black italic text-fuchsia-300">{item.value.toLocaleString()}</span>
                        <img src={pokecoinIcon} alt="Coin" className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-black italic text-white uppercase tracking-tight truncate mb-4">{item.name}</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button variant="outline" className="text-[9px] py-3 rounded-xl border-purple-500/20 font-black uppercase italic tracking-widest hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400" onClick={() => handleSell(item)}>
                        VENDER
                    </Button>
                    <Button variant="outline" className="text-[9px] py-3 rounded-xl border-purple-500/20 font-black uppercase italic tracking-widest hover:bg-purple-500/10 hover:border-purple-500/50 hover:text-purple-300" onClick={() => setSelectedDetail(item)}>
                        <Eye className="w-3 h-3" /> DETALLES
                    </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {selectedDetail && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[#131829] border-2 border-purple-500/30 p-12 rounded-[3rem] max-w-lg w-full relative">
                    <Button variant="ghost" className="absolute top-6 right-6" onClick={() => setSelectedDetail(null)}><X /></Button>
                    <div className="text-center">
                        <h2 className="text-3xl font-black italic uppercase text-white mb-8">{selectedDetail.name}</h2>
                        <div className="w-64 h-64 mx-auto bg-purple-900/20 rounded-3xl flex items-center justify-center mb-8 border border-purple-500/20">
                            <img src={selectedDetail.image} alt={selectedDetail.name} className="w-48 h-48 object-contain" />
                        </div>
                        <div className="text-fuchsia-300 font-black italic text-3xl mb-3">{selectedDetail.value.toLocaleString()} PkCoins</div>
                        <div className="text-gray-500 font-black uppercase tracking-widest text-sm">{selectedDetail.rarity}</div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
