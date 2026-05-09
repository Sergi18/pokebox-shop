import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Bot } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function SupportChat({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, inventory, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inicializar mensajes cuando el usuario cambia
  useEffect(() => {
    const greeting = isAuthenticated && user
      ? `¡Hola ${user.username}! Soy el asistente de PokeBox Shop. ¿En qué puedo ayudarte con tu cuenta hoy?`
      : '¡Hola! Soy el asistente de PokeBox Shop. ¿En qué puedo ayudarte hoy?';
    
    setMessages([
      {
        id: '1',
        text: greeting,
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  }, [user, isAuthenticated]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    // Respuestas dinámicas basadas en la base de datos (Contexto del usuario)
    if (lowerInput.includes('mi balance') || lowerInput.includes('cuanto dinero tengo') || lowerInput.includes('cuánto dinero tengo')) {
      if (!isAuthenticated) return 'Necesitas iniciar sesión para ver tu balance.';
      return `Tienes un balance actual de $${user?.balance?.toFixed(2)}. ¡Puedes usarlo en la sección de "Cases" para abrir nuevas cajas!`;
    }

    if (lowerInput.includes('mis cartas') || lowerInput.includes('mi inventario') || lowerInput.includes('cuantas cartas tengo') || lowerInput.includes('cuántas cartas tengo')) {
      if (!isAuthenticated) return 'Necesitas iniciar sesión para ver tus cartas.';
      const count = inventory.length;
      if (count === 0) return 'Tu inventario está vacío actualmente. ¡Ve a la sección de "Cases" para conseguir tu primera carta!';
      
      const sortedInventory = [...inventory].sort((a, b) => 
        new Date(b.obtainedAt).getTime() - new Date(a.obtainedAt).getTime()
      );
      const lastItem = sortedInventory[0];
      return `Tienes ${count} cartas en tu inventario. Tu adquisición más reciente es: ${lastItem.name} (${lastItem.rarity}).`;
    }

    if (lowerInput.includes('vender') || lowerInput.includes('vende')) {
      return 'Para vender tus cartas, debes ir a tu perfil de usuario. Allí podrás ver tu inventario personal y seleccionar las cartas que deseas poner a la venta.';
    }

    // Respuestas sobre secciones reales de la página
    if (lowerInput.includes('intercambio') || lowerInput.includes('cambiar') || lowerInput.includes('trade')) {
      return 'En la sección de "Intercambio" puedes realizar trueques con otros usuarios para conseguir las cartas que te faltan.';
    }

    if (lowerInput.includes('envio') || lowerInput.includes('envío') || lowerInput.includes('mandar') || lowerInput.includes('casa')) {
      return 'Si quieres recibir tus cartas físicas, dirígete a la sección de "Envío" para gestionar el transporte de tus tesoros Pokémon.';
    }

    if (lowerInput.includes('batalla') || lowerInput.includes('battle') || lowerInput.includes('competir')) {
      return 'En "Battles" puedes enfrentarte a otros jugadores abriendo cajas en tiempo real. ¡El que saque el mejor drop gana!';
    }

    if (lowerInput.includes('reward') || lowerInput.includes('recompensa') || lowerInput.includes('premio')) {
      return 'No olvides visitar la sección de "Rewards" para reclamar tus bonos diarios y premios por actividad.';
    }

    if (lowerInput.includes('upgrade') || lowerInput.includes('mejorar') || lowerInput.includes('subir')) {
      return 'En la sección "Upgrade" puedes intentar mejorar tus cartas actuales por otras de mayor rareza y valor.';
    }

    if (lowerInput.includes('donde') || lowerInput.includes('abrir') || lowerInput.includes('caja')) {
      return 'La acción principal está en "Cases". Allí encontrarás todas nuestras cajas disponibles para abrir.';
    }

    if (lowerInput.includes('mi nivel') || lowerInput.includes('que nivel soy')) {
      if (!isAuthenticated) return 'Necesitas iniciar sesión para ver tu nivel.';
      return `Actualmente eres nivel ${user?.level}. ¡Ganarás experiencia abriendo cajas y participando en batallas!`;
    }

    if (lowerInput.includes('hola') || lowerInput.includes('buenas')) {
      return isAuthenticated ? `¡Hola de nuevo, ${user?.username}! ¿En qué sección te gustaría que te ayude hoy?` : '¡Hola! Soy el asistente de PokeBox. ¿En qué puedo ayudarte hoy?';
    }

    if (lowerInput.includes('pago') || lowerInput.includes('crédito') || lowerInput.includes('dinero')) {
      return 'Aceptamos pagos seguros a través de Stripe. Puedes añadir créditos desde tu Dashboard personal.';
    }

    return 'Lo siento, no entiendo tu pregunta. ¿Puedes intentar reformularla? También puedes contactarnos por email en el formulario de soporte si necesitas ayuda humana.';
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    setTimeout(() => {
      const responseText = getBotResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 100 }}
          className="fixed bottom-6 right-6 z-50 w-80 md:w-96"
        >
          <Card className="flex flex-col h-[500px] border-[var(--neon-blue)] border-2 shadow-[0_0_15px_rgba(0,243,255,0.3)] bg-[var(--dark-bg)]">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-[var(--dark-hover)] rounded-t-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[var(--neon-blue)]/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[var(--neon-blue)]" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold">PokeBox Assistant</h4>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-gray-400">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.sender === 'user' ? 'bg-[var(--neon-blue)] text-black font-medium rounded-tr-none' : 'bg-gray-800 text-gray-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-800 bg-[var(--dark-hover)] rounded-b-lg">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--neon-blue)] transition-colors"
                />
                <Button size="icon" onClick={handleSend} className="bg-[var(--neon-blue)] hover:bg-[var(--neon-blue)]/80 text-black">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
