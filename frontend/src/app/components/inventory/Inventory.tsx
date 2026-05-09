import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Package, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';
import { getRarityColor, getRarityGlow } from '../../utils/caseItems';
import type { Item } from '../../context/AuthContext';
import pokecoinIcon from '../../../assets/Pokecoin.png';

// ─── Componente de Imagen con Fallback ───
function SafeImage({ src, alt, rarity }: { src?: string; alt: string; rarity: string }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!src || error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black/20 rounded-xl">
        <span className="text-6xl grayscale opacity-20">💎</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5 rounded-xl">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-600" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-[85%] h-[85%] object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setLoading(false)}
        onError={() => setError(true)}
      />
    </div>
  );
}

export function Inventory() {
  const { user, isAuthenticated, getInventory } = useAuth();
  const [inventory, setInventory] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

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

  const filteredInventory = inventory.filter(item => {
    if (filter === 'all') return true;
    return item.rarity === filter;
  });

  const totalValue = inventory.reduce((sum, item) => sum + item.value, 0);
  const rarityFilters = ['all', 'Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
        <Card className="max-w-md w-full border-2 border-white/5 text-center p-12 rounded-[2.5rem]">
          <Package className="w-20 h-20 mx-auto mb-6 text-gray-800" />
          <h2 className="text-2xl font-black italic uppercase text-white mb-4">Acceso Restringido</h2>
          <p className="text-gray-500 font-medium mb-8">Inicia sesión para ver tu colección de cartas.</p>
          <Button variant="default" className="w-full py-6 font-black italic" onClick={() => window.location.href = '/login'}>
            INICIAR SESIÓN
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 bg-[#0a0e1a]">
      <div className="container mx-auto px-6 max-w-[1600px]">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-6xl font-black italic uppercase text-white tracking-tighter leading-none mb-3">
              MI <span className="text-[var(--neon-blue)]">INVENTARIO</span>
            </h1>
            <p className="text-gray-500 font-medium max-w-xl">
              Gestiona tu colección de cartas obtenidas. Vende, intercambia o solicita el envío físico de tus mejores piezas.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <div className="flex gap-4 flex-wrap">
            {[
              { icon: Package, label: 'Cartas', value: inventory.length, color: 'blue' },
              { icon: null, label: 'Valor Total', value: totalValue.toLocaleString(), color: 'yellow', custom: pokecoinIcon },
            ].map((stat, i) => (
              <div key={i} className="bg-[#131829] border-2 border-white/5 p-5 rounded-2xl flex items-center gap-4 min-w-[180px]">
                <div className="p-3 bg-white/5 rounded-xl">
                  {stat.icon ? <stat.icon className={`w-6 h-6 text-white`} /> : <img src={stat.custom} className="w-6 h-6" />}
                </div>
                <div>
                  <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</div>
                  <div className="text-xl font-black text-white italic tracking-tight">{stat.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 flex flex-wrap gap-2 p-1.5 bg-[#131829] border-2 border-white/5 rounded-2xl w-fit">
          {rarityFilters.map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`px-6 py-2.5 rounded-xl transition-all font-black italic uppercase text-xs tracking-wider ${
                filter === r
                  ? 'bg-[var(--neon-blue)] text-black shadow-[0_0_20px_rgba(0,212,255,0.2)]'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {r === 'all' ? 'Todas' : r}
            </button>
          ))}
        </motion.div>

        {/* Inventory Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <RefreshCw className="w-12 h-12 animate-spin text-[var(--neon-blue)]" />
            <p className="text-gray-500 font-black italic uppercase tracking-widest mt-6">Sincronizando Inventario...</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <Card className="border-2 border-dashed border-white/10 bg-transparent py-32 text-center rounded-[3rem]">
            <Sparkles className="w-16 h-16 text-gray-800 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-white uppercase italic mb-2">Colección Vacía</h3>
            <p className="text-gray-500 font-medium mb-10 max-w-xs mx-auto">No tienes cartas de esta rareza. ¡Prueba suerte con las cajas!</p>
            <Button variant="default" className="px-12 py-6 rounded-2xl" onClick={() => window.location.href = '/cases'}>TIENDA DE CAJAS</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredInventory.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ y: -10 }}
              >
                <div className="bg-[#131829] border-2 border-white/5 rounded-[2.5rem] p-6 group transition-all duration-500 hover:border-[var(--neon-blue)]/50 relative overflow-hidden">
                  <div className="absolute top-6 right-6 z-20">
                    <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase italic text-white shadow-lg ${getRarityColor(item.rarity)}`}>
                      {item.rarity}
                    </span>
                  </div>

                  {/* Card Visual */}
                  <div className={`aspect-square rounded-[2rem] bg-black/40 mb-6 flex items-center justify-center relative overflow-hidden group-hover:bg-black/20 transition-colors ${getRarityGlow(item.rarity)}`}>
                    <SafeImage src={item.image} alt={item.name} rarity={item.rarity} />
                    
                    {/* Value Badge Overlay */}
                    <div className="absolute bottom-4 left-4 z-20">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl">
                        <span className="text-sm font-black italic text-[var(--neon-yellow)]">{item.value.toLocaleString()}</span>
                        <img src={pokecoinIcon} alt="Coin" className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-black italic text-white uppercase tracking-tight truncate pr-10">{item.name}</h3>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="text-[9px] py-3 rounded-xl border-white/5 font-black uppercase italic tracking-widest hover:bg-[var(--neon-blue)]/10 hover:border-[var(--neon-blue)]/30 hover:text-[var(--neon-blue)]">
                        VENDER
                      </Button>
                      <Button variant="outline" className="text-[9px] py-3 rounded-xl border-white/5 font-black uppercase italic tracking-widest hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-400">
                        VISTA 3D
                      </Button>
                    </div>
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
