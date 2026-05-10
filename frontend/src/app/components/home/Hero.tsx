import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Play } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import '../../styles/gengar-style.css';
import backhome from '../../../assets/backhome.png';

export function Hero() {
  const navigate = useNavigate();
  const [highValueCards, setHighValueCards] = useState<any[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadHighValueCards();
  }, []);

  const loadHighValueCards = async () => {
    try {
      const { data, error } = await supabase
        .from('pokemon_items')
        .select('*')
        .gte('price', 500); // Filtrado >= 500 PkCoins

      if (error) throw error;
      setHighValueCards(data || []);
    } catch (error) {
      console.error('Error fetching hero cards:', error);
    }
  };

  useEffect(() => {
    if (highValueCards.length === 0) return;
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % highValueCards.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [highValueCards]);

  return (
    <section className="relative min-h-[85vh] flex items-center pt-20 pb-10 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={backhome} 
          alt="Event Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a]/80 via-[#0a0e1a]/40 to-[#0a0e1a]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1),transparent_70%)]" />
      </div>

      <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left Side: Content */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-[0.9] mb-8">
              DROPS <br />
              <span className="text-white">IMPOSIBLES</span> <br />
              <span className="bg-gradient-to-r from-[var(--neon-yellow)] to-amber-500 bg-clip-text text-transparent italic">
                EVENTO LEGENDARIO
              </span>
            </h1>
            <p className="text-gray-400 text-lg font-medium max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              Descubre las cartas más raras del multiverso Pokémon. Solo los mejores entrenadores logran reclamar estos tesoros ocultos.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Button onClick={() => navigate('/cases')} className="px-10 py-6 text-lg font-black italic uppercase rounded-2xl bg-[var(--neon-blue)] hover:bg-blue-500 shadow-[0_0_30px_rgba(0,212,255,0.3)]">
                Abrir Cajas
              </Button>
              <Button onClick={() => navigate('/battles')} variant="outline" className="px-10 py-6 text-lg font-black italic uppercase rounded-2xl border-white/10">
                Ver Batallas
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Hero Showcase */}
        <div className="flex-1 w-full max-w-lg">
          <AnimatePresence mode="wait">
            {highValueCards.length > 0 && (
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative group"
              >
                {/* Glow ambiental */}
                <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full scale-75 group-hover:scale-100 transition-transform duration-700" />
                
                {/* Card Container */}
                <div className="relative bg-[#131829]/80 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 shadow-2xl">
                  {/* Hero Image */}
                  <div className="h-96 flex items-center justify-center mb-8 relative">
                    <img 
                      src={highValueCards[currentImageIndex].image_url} 
                      alt="Hero Card"
                      className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    />
                  </div>

                  {/* Info */}
                  <div className="text-center">
                    <h3 className="text-3xl font-black italic text-white uppercase tracking-tight mb-2">
                      {highValueCards[currentImageIndex].name}
                    </h3>
                    <div className="text-fuchsia-400 font-black italic text-xl uppercase tracking-widest">
                      {highValueCards[currentImageIndex].price} PkCoins
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
