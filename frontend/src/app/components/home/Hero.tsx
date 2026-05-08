import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { Sparkles, TrendingUp, Shield, Zap, Target, Trophy, ChevronRight, Play, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import pokecoinIcon from '../../../assets/Pokecoin.png';
import promoImage1 from '../../../assets/cf34049cc11b36cdcad8ff7a5531e03368aaf7db.png';
import promoImage2 from '../../../assets/chzholo1s.png';
import backhome from '../../../assets/backhome.png';
import { useRef, useState, useEffect } from 'react';

export function Hero() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [promoImage1, promoImage2];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center pt-20 pb-32 overflow-hidden">
      {/* Background Image with Parallax & Overlays */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <img 
            src={backhome} 
            alt="Event Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a]/80 via-[#0a0e1a]/40 to-[#0a0e1a]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0e1a_100%)] opacity-60" />
        </motion.div>

        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full"
        />
      </div>

      <div className="absolute inset-0 z-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(var(--neon-blue) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--neon-blue)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--neon-blue)]"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                  Sistema Online 1.0 — Provably Fair
                </span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.9] mb-8">
                COLLECCIÓN <br />
                <span className="bg-gradient-to-r from-[var(--neon-yellow)] via-[var(--neon-blue)] to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,212,255,0.3)]">
                  ULTRA-RARE
                </span>
              </h1>
              
              <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                Desbloquea recompensas épicas, domina en batallas de cajas y colecciona los Pokémon más exclusivos del metaverso. La suerte está de tu lado.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0,212,255,0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/cases')}
                  className="px-10 py-5 bg-[var(--neon-blue)] text-black font-black uppercase italic rounded-2xl flex items-center gap-3 transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  ABRIR CAJAS
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05, background: "rgba(255,255,255,0.05)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/battles')}
                  className="px-10 py-5 bg-transparent border-2 border-white/10 text-white font-black uppercase italic rounded-2xl flex items-center gap-3 transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  VER BATALLAS
                </motion.button>
              </div>
            </motion.div>
          </div>

          <div className="flex-1 relative w-full max-w-2xl scale-110 lg:translate-x-10">
            <motion.div
              style={{ y: y1 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2 }}
              className="relative z-10"
            >
              <div className="aspect-[4/5] bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/10 rounded-[3rem] p-4 backdrop-blur-xl shadow-2xl relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--neon-blue)]/20 via-transparent to-[var(--neon-yellow)]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="w-full h-full border border-white/10 rounded-[2.5rem] flex flex-col items-center justify-end pb-12 pt-20 gap-6 relative overflow-hidden">
                  
                  {/* Image Carousel */}
                  <div className="relative w-full h-[280px] flex items-center justify-center -mb-4">
                    <AnimatePresence mode="wait">
                      <motion.img 
                        key={currentImageIndex}
                        src={images[currentImageIndex]} 
                        alt="Carta Exclusiva" 
                        initial={{ x: 60, opacity: 0, rotate: 3 }}
                        animate={{ x: 0, opacity: 1, rotate: 0 }}
                        exit={{ x: -60, opacity: 0, rotate: -3 }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                        className="w-[65%] h-auto object-contain drop-shadow-[0_0_40px_rgba(0,212,255,0.4)]"
                      />
                    </AnimatePresence>
                  </div>
                  
                  <div className="text-center px-4 relative z-10">
                    <div className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.5em] mb-2 animate-pulse">EVENTO LEGENDARIO</div>
                    <div className="text-5xl font-black italic text-white uppercase tracking-tighter leading-[0.85]">
                      DROPS <br/>
                      <span className="bg-gradient-to-r from-[var(--neon-blue)] via-purple-400 to-pink-500 bg-clip-text text-transparent">
                        IMPOSIBLES
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`w-5 h-5 fill-current drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] ${i <= 3 + currentImageIndex ? 'text-[var(--neon-yellow)]' : 'text-white/10'}`} />
                    ))}
                  </div>
                </div>
              </div>

              <motion.div
                style={{ y: y2 }}
                className="absolute -top-10 -right-10 p-6 bg-[#131829] border-2 border-[var(--neon-yellow)] rounded-3xl shadow-[0_0_30px_rgba(255,215,0,0.2)]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Zap className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-gray-500">Fast Drop</div>
                    <div className="text-xl font-black text-white italic">⚡ x2.5</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-10 -left-10 p-6 bg-[#131829] border-2 border-[var(--neon-blue)] rounded-3xl shadow-[0_0_30px_rgba(0,212,255,0.2)]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Trophy className="w-6 h-6 text-[var(--neon-blue)]" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-gray-500">Live Wins</div>
                    <div className="text-xl font-black text-white italic">+1,250</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
          
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Usuarios Activos', value: '45.2K', color: 'blue' },
            { label: 'Cajas Abiertas', value: '1.2M', color: 'yellow' },
            { label: 'Enviados', value: '12K+', color: 'purple' },
            { label: 'PokéCoins Generadas', value: '850M', color: 'red' },
          ].map((stat) => (
            <div key={stat.label} className="p-6 bg-white/5 border border-white/5 rounded-3xl backdrop-blur-sm group hover:border-white/10 transition-colors">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 group-hover:text-white transition-colors">{stat.label}</div>
              <div className="text-3xl font-black text-white italic tracking-tighter">{stat.value}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
