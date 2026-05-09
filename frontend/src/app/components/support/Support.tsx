import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Mail, MessageCircle, HelpCircle, FileText, Send } from 'lucide-react';
import { useState } from 'react';
import { useChat } from '../../context/ChatContext';

const faqs = [
  { question: '¿Cómo abro una caja?', answer: 'Ve a la página de Cajas, selecciona tu favorita y pulsa "ABRIR". ¡Asegúrate de tener suficientes monedas en tu cuenta!' },
  { question: '¿Cómo funcionan las batallas?', answer: 'Dos jugadores abren la misma caja. El que obtenga el objeto de mayor valor se lleva todo el botín.' },
  { question: '¿Cómo añado fondos?', answer: 'Visita tu Dashboard y selecciona "Añadir Monedas" para recargar tu saldo de forma segura.' },
  { question: '¿Puedo vender mis cartas?', answer: '¡Claro! Dirígete al Marketplace para listar tus cartas y obtener monedas al instante.' },
];

export function Support() {
  const { openChat } = useChat();
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    message: ''
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('¡Ticket recibido! Nuestro equipo de soporte técnico se pondrá en contacto pronto.');
    setFormData({ email: '', subject: '', message: '' });
  };
  
  return (
    <div className="min-h-screen py-24 bg-[#0a0e1a]">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="px-3 py-1 bg-[var(--neon-blue)]/10 text-[var(--neon-blue)] text-[10px] font-black uppercase tracking-widest border border-[var(--neon-blue)]/30 rounded-full mb-4 inline-block">
            SOPORTE PREMIUM
          </span>
          <h1 className="text-5xl font-black italic uppercase text-white tracking-tighter mb-4">
            CENTRO DE <span className="text-[var(--neon-blue)]">AYUDA</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-xl mx-auto">
            ¿Tienes alguna duda o problema? Estamos aquí las 24/7 para asistirte en todo lo que necesites.
          </p>
        </motion.div>
        
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {[
            { icon: HelpCircle, title: 'FAQ', desc: 'Preguntas Frecuentes', color: 'blue' },
            { icon: FileText, title: 'GUÍA', desc: 'Documentación Oficial', color: 'yellow' },
            { icon: MessageCircle, title: 'LIVE CHAT', desc: 'Asistencia en vivo', color: 'purple', action: openChat }
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              onClick={item.action}
              className="p-8 bg-[#131829] border-2 border-white/5 rounded-[2rem] hover:border-[var(--neon-blue)]/50 transition-all cursor-pointer group shadow-xl"
            >
              <div className={`w-16 h-16 bg-${item.color}-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-${item.color}-500/20 group-hover:shadow-[0_0_20px_rgba(var(--neon-${item.color}),0.3)]`}>
                <item.icon className={`w-8 h-8 text-${item.color}-400`} />
              </div>
              <h3 className="text-white font-black italic uppercase text-center">{item.title}</h3>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest text-center mt-2">{item.desc}</p>
            </motion.div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-2xl font-black italic uppercase text-white mb-8 flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-[var(--neon-blue)]" />
              PREGUNTAS FRECUENTES
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="p-6 bg-[#131829] border-2 border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                  <h3 className="text-white font-bold italic mb-2 uppercase text-sm">{faq.question}</h3>
                  <p className="text-gray-500 text-xs font-medium leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-2xl font-black italic uppercase text-white mb-8 flex items-center gap-3">
              <Mail className="w-6 h-6 text-[var(--neon-yellow)]" />
              CONTACTA CON EL EQUIPO
            </h2>
            <div className="p-8 bg-[#131829] border-2 border-white/5 rounded-[2rem]">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-black/40 border-2 border-white/5 rounded-xl px-4 py-4 text-white placeholder-gray-700 outline-none focus:border-[var(--neon-blue)] transition-all font-bold"
                    placeholder="ejemplo@pokebox.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Asunto</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-black/40 border-2 border-white/5 rounded-xl px-4 py-4 text-white placeholder-gray-700 outline-none focus:border-[var(--neon-blue)] transition-all font-bold"
                    placeholder="¿En qué podemos ayudarte?"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Mensaje</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-black/40 border-2 border-white/5 rounded-xl px-4 py-4 text-white placeholder-gray-700 outline-none focus:border-[var(--neon-blue)] transition-all resize-none font-bold"
                    placeholder="Escribe tu consulta detallada aquí..."
                    rows={6}
                    required
                  />
                </div>
                
                <Button type="submit" variant="default" size="lg" className="w-full py-7 rounded-2xl font-black italic uppercase text-lg shadow-[0_0_25px_rgba(0,212,255,0.2)]">
                  <Send className="w-5 h-5 mr-2" />
                  ENVIAR MENSAJE
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
