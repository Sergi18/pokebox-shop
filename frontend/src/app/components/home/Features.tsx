import { motion } from 'motion/react';
import { Shield, Zap, Trophy, TrendingUp, Users, Lock } from 'lucide-react';

const features = [
  { icon: Shield, title: 'Provably Fair', description: 'Resultados verificables mediante tecnología blockchain.', color: 'border-blue-500' },
  { icon: Zap, title: 'Apertura Instantánea', description: 'Animaciones fluidas y recompensas en tiempo real.', color: 'border-yellow-500' },
  { icon: Trophy, title: 'Premios Épicos', description: 'Colecciona cartas raras y legendarias únicas.', color: 'border-purple-500' },
  { icon: TrendingUp, title: 'Batallas Intensas', description: 'Desafía a otros entrenadores por el botín.', color: 'border-red-500' },
  { icon: Users, title: 'Comunidad Activa', description: 'Únete a miles de entrenadores en el mercado.', color: 'border-blue-400' },
  { icon: Lock, title: 'Plataforma Segura', description: 'Protección de nivel bancario para tu cuenta.', color: 'border-emerald-500' }
];

export function Features() {
  return (
    <section className="py-24 bg-[#0a0e1a] border-t border-white/5">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-6xl font-black italic uppercase text-white tracking-tighter mb-6"
          >
            ¿Por qué <span className="text-[var(--electric-purple)]">PokeBox?</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 font-medium uppercase tracking-widest text-xs max-w-xl mx-auto"
          >
            LA EXPERIENCIA DEFINITIVA DE APERTURA DE CARTAS FANTASMALES
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className={`bg-[#131829] border-2 ${feature.color} rounded-[2.5rem] p-10 relative overflow-hidden group hover:bg-[#1a2238] transition-all`}
              >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Icon className="w-32 h-32" />
                </div>
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-3xl bg-black/40 flex items-center justify-center mb-8 border border-white/5`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black italic text-white uppercase tracking-tight mb-4">{feature.title}</h3>
                  <p className="text-gray-400 font-medium leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
