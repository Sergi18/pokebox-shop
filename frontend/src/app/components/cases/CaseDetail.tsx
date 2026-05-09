import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ArrowLeft, Zap, Star, Gift, Loader2, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CaseOpeningModal } from './CaseOpeningModal';
import { generateRandomItem } from '../../utils/caseItems';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

// Los IDs de las cajas y sus imágenes visuales se mantienen, pero el precio vendrá de la DB
const CASE_VISUALS: Record<number, any> = {
  1: { color: 'yellow', icon: Zap, image: null },
  2: { color: 'red', icon: Star, image: null }, // Se cargará de la DB si existe
  3: { color: 'blue', icon: Gift, image: null },
};

export function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser, addToInventory, recordCaseOpening } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [caseItem, setCaseItem] = useState<any>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [openedItem, setOpenedItem] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCaseDetails();
  }, [id]);

  const fetchCaseDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('id', Number(id))
        .single();

      if (error) throw error;
      setCaseItem(data);
    } catch (error) {
      console.error('Error fetching case:', error);
      toast.error('No se pudo cargar la información de la caja');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--neon-blue)]" />
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <h2 className="mb-4">Caja no encontrada</h2>
          <Button onClick={() => navigate('/cases')}>Volver a Cajas</Button>
        </Card>
      </div>
    );
  }

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
      // 1. Descontar saldo
      await updateUser({ balance: user.balance - caseItem.price });

      // 2. Generar item aleatorio (lógica local por ahora)
      const item = generateRandomItem(caseItem.id);
      
      // 3. Guardar en inventario real de Supabase
      await addToInventory({
        name: item.name,
        rarity: item.rarity,
        value: item.value,
        caseId: caseItem.id,
      });

      // 4. Registrar en historial
      await recordCaseOpening(caseItem.id, caseItem.name, item);

      // 5. Mostrar modal
      setOpenedItem(item);
      setShowModal(true);
      
      toast.success(`¡Has abierto la caja ${caseItem.name}!`);
    } catch (error) {
      console.error('Error opening case:', error);
      toast.error('Fallo al abrir la caja. Inténtalo de nuevo.');
    } finally {
      setIsOpening(false);
    }
  };

  const visual = CASE_VISUALS[caseItem.id] || { color: 'blue', icon: Zap, image: null };

  return (
    <div className="min-h-screen py-20 bg-[#0a0e1a]">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/cases')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-12 uppercase font-black italic tracking-widest text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          VOLVER A LAS CAJAS
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column - Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-br from-[var(--neon-blue)] to-purple-600 rounded-[3rem] opacity-20 blur-2xl group-hover:opacity-30 transition-opacity" />
              <div className="relative bg-[#131829] border-2 border-white/5 rounded-[3rem] p-12 aspect-square flex items-center justify-center overflow-hidden">
                {caseItem.image_url ? (
                  <img src={caseItem.image_url} alt={caseItem.name} className="w-full h-full object-contain" />
                ) : (
                  <motion.div
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="w-48 h-48 text-[var(--neon-yellow)] opacity-40 blur-[1px]" />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-10"
          >
            <div>
              <div className="flex items-center gap-4 mb-6">
                <h1 className="text-6xl font-black italic uppercase text-white tracking-tighter leading-none">
                  {caseItem.name.split(' ')[0]} <br/>
                  <span className="text-[var(--neon-blue)]">{caseItem.name.split(' ').slice(1).join(' ')}</span>
                </h1>
                <span className="px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  {caseItem.category}
                </span>
              </div>
              <p className="text-gray-400 text-xl font-medium leading-relaxed">
                Desbloquea los secretos de la caja {caseItem.name}. Contiene objetos exclusivos con probabilidad garantizada.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#131829] border-2 border-white/5 p-8 rounded-[2rem] text-center group hover:border-[var(--neon-yellow)]/30 transition-all">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3">Coste de Apertura</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-black italic text-white tracking-tighter">{caseItem.price}</span>
                  <img src="/src/assets/Pokecoin.png" alt="Coin" className="w-8 h-8" />
                </div>
              </div>
              <div className="bg-[#131829] border-2 border-white/5 p-8 rounded-[2rem] text-center group hover:border-[var(--neon-blue)]/30 transition-all">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3">Prob. Drop Raro</div>
                <div className="text-4xl font-black italic text-[var(--neon-blue)] tracking-tighter">25%</div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {[
                { icon: Gift, text: 'Múltiples objetos raros garantizados' },
                { icon: Star, text: 'Posibilidad de drops Legendarios' },
                { icon: Zap, text: 'Animación de revelado instantáneo' }
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl group hover:bg-white/10 transition-colors">
                  <div className="p-2 bg-black/20 rounded-lg text-[var(--neon-yellow)]">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <span className="text-gray-300 font-bold uppercase italic text-sm tracking-tight">{f.text}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-6">
              <motion.button 
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0,212,255,0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOpenCase}
                disabled={isOpening || !isAuthenticated || (user && user.balance < caseItem.price)}
                className="flex-1 py-6 bg-[var(--neon-blue)] text-black font-black italic uppercase tracking-tighter text-2xl rounded-[2rem] transition-all disabled:opacity-50 disabled:grayscale"
              >
                {isOpening ? 'ABRIENDO...' : `ABRIR CAJA`}
              </motion.button>
              <Button 
                variant="outline"
                className="px-8 py-6 rounded-[2rem] border-white/5 hover:bg-white/5 font-black italic uppercase tracking-widest text-xs"
                onClick={() => toast.info('Vista previa próximamente')}
              >
                PREVIEW
              </Button>
            </div>

            {/* Warning */}
            <div className="p-6 bg-black/40 border border-white/5 rounded-2xl flex items-start gap-4">
              <Info className="w-5 h-5 text-gray-600 shrink-0 mt-1" />
              <p className="text-xs font-medium text-gray-600 leading-relaxed uppercase tracking-wider">
                <span className="text-gray-400 font-black">AVISO:</span> Todos los drops son aleatorios y se basan en un sistema Provably Fair. Los resultados pasados no garantizan resultados futuros.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <CaseOpeningModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        item={openedItem}
        caseName={caseItem.name}
      />
    </div>
  );
}
