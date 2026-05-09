import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import type { Item } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { getRarityColor, getRarityGlow } from '../../utils/caseItems';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import {
  Truck, Home, Package, CheckCircle, Clock, MapPin,
  Phone, Mail, User, Search, ChevronDown, Star,
  ArrowRight, RefreshCw, Box, ShieldCheck, Globe,
  Sparkles, History, PlusCircle, Info, ArrowLeft,
  BadgeCheck, ExternalLink, Timer, X
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface DeliveryOrder {
  id: string;
  userId: string;
  cards: Item[];
  address: ShippingAddress;
  status: 'processing' | 'preparing' | 'shipped' | 'delivered';
  trackingNumber: string;
  orderNumber: string;
  createdAt: string;
  estimatedDelivery: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const rarityEmoji: Record<string, string> = {
  Common: '⚪', Rare: '🔵', Epic: '🟣', Legendary: '🟡', Mythic: '🔴',
};

const COUNTRIES = [
  'España', 'México', 'Argentina', 'Colombia', 'Chile', 'Perú', 'Venezuela',
  'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay', 'Costa Rica', 'Guatemala',
  'Estados Unidos', 'Reino Unido', 'Francia', 'Alemania', 'Italia', 'Otro',
];

function generateOrderNumber() {
  return `PB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

function generateTracking() {
  return `PKB${Math.random().toString(36).substr(2, 12).toUpperCase()}ES`;
}

function estimatedDate() {
  const d = new Date();
  d.setDate(d.getDate() + 10 + Math.floor(Math.random() * 5));
  return d.toISOString();
}

function getStatusInfo(status: DeliveryOrder['status']) {
  switch (status) {
    case 'processing':
      return { label: 'Procesando', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', icon: Clock };
    case 'preparing':
      return { label: 'Preparando', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30', icon: Box };
    case 'shipped':
      return { label: 'Enviado', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/30', icon: Truck };
    case 'delivered':
      return { label: 'Entregado', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30', icon: CheckCircle };
    default:
      return { label: 'Desconocido', color: 'text-gray-400', bg: 'bg-gray-400/10 border-gray-400/30', icon: Info };
  }
}

// ─── Input Field ──────────────────────────────────────────────────────────────

function Field({
  label, icon: Icon, type = 'text', value, onChange, placeholder, required = false, error,
}: {
  label: string; icon: any; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; required?: boolean; error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
        {label} {required && <span className="text-[var(--neon-yellow)]">*</span>}
      </label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-white/5 rounded-lg border border-white/5 group-focus-within:border-[var(--neon-blue)]/50 transition-colors">
          <Icon className="w-3.5 h-3.5 text-gray-500 group-focus-within:text-[var(--neon-blue)]" />
        </div>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-12 pr-4 py-3 bg-black/20 border-2 rounded-xl text-white placeholder-gray-600 font-medium
            focus:outline-none transition-all ${error
              ? 'border-red-500/50 focus:border-red-500'
              : 'border-white/5 focus:border-[var(--neon-blue)]'}`}
        />
      </div>
      {error && (
        <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-red-400 text-[10px] font-bold ml-1 uppercase">
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

type DeliveryStep = 'select-cards' | 'shipping-info' | 'review' | 'success';

const MAX_CARDS = 5;

export function Delivery() {
  const { user, isAuthenticated, getInventory, removeItems } = useAuth();

  const [activeTab, setActiveTab] = useState<'new' | 'orders'>('new');
  const [inventory, setInventory] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<DeliveryStep>('select-cards');
  const [selectedCards, setSelectedCards] = useState<Item[]>([]);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [lastOrder, setLastOrder] = useState<DeliveryOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState('all');

  // Address form
  const [form, setForm] = useState<ShippingAddress>({
    fullName: user?.username || '',
    email: user?.email || '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'España',
  });
  const [errors, setErrors] = useState<Partial<ShippingAddress>>({});

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await getInventory();
      setInventory(items);
      if (user) await fetchOrders();
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!user || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOrders: DeliveryOrder[] = (data || []).map(o => ({
        id: o.id,
        userId: o.user_id,
        orderNumber: o.order_number,
        status: o.status as any,
        trackingNumber: o.tracking_number,
        address: {
          fullName: o.full_name,
          email: o.email,
          phone: o.phone,
          address1: o.address1,
          address2: o.address2,
          city: o.city,
          state: o.state,
          postalCode: o.postal_code,
          country: o.country
        },
        cards: o.items as Item[],
        createdAt: o.created_at,
        estimatedDelivery: o.estimated_delivery ? new Date(o.estimated_delivery).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Pendiente'
      }));

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const filteredInventory = useMemo(() => {
    let items = inventory;
    if (rarityFilter !== 'all') items = items.filter(i => i.rarity === rarityFilter);
    if (search) items = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    return items;
  }, [inventory, rarityFilter, search]);

  const toggleCard = (item: Item) => {
    setSelectedCards(prev => {
      const exists = prev.find(c => c.id === item.id);
      if (exists) return prev.filter(c => c.id !== item.id);
      if (prev.length >= MAX_CARDS) {
        toast.error(`Máximo ${MAX_CARDS} cartas por pedido`);
        return prev;
      }
      return [...prev, item];
    });
  };

  const updateForm = (field: keyof ShippingAddress) => (value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingAddress> = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Nombre requerido';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email válido requerido';
    if (!form.phone.trim()) newErrors.phone = 'Teléfono requerido';
    if (!form.address1.trim()) newErrors.address1 = 'Dirección requerida';
    if (!form.city.trim()) newErrors.city = 'Ciudad requerida';
    if (!form.state.trim()) newErrors.state = 'Provincia/Estado requerido';
    if (!form.postalCode.trim()) newErrors.postalCode = 'Código postal requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async () => {
    if (!user || !supabase) return;
    setSubmitting(true);
    
    try {
      const orderNumber = generateOrderNumber();
      const trackingNumber = generateTracking();
      const estDate = estimatedDate();

      // 1. Guardar el pedido en Supabase
      const { data: orderData, error: orderError } = await supabase
        .from('deliveries')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          status: 'processing',
          tracking_number: trackingNumber,
          full_name: form.fullName,
          email: form.email,
          phone: form.phone,
          address1: form.address1,
          address2: form.address2,
          city: form.city,
          state: form.state,
          postal_code: form.postalCode,
          country: form.country,
          items: selectedCards,
          estimated_delivery: estDate
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Retirar los items del inventario (marcar como 'withdrawn')
      // En lugar de borrar, actualizamos su estado para auditoría
      const itemIds = selectedCards.map(c => c.id);
      const { error: inventoryError } = await supabase
        .from('user_inventory')
        .update({ status: 'withdrawn' })
        .in('id', itemIds);

      if (inventoryError) throw inventoryError;

      // 3. Actualizar estado local
      const newOrder: DeliveryOrder = {
        id: orderData.id,
        userId: user.id,
        cards: selectedCards,
        address: form,
        status: 'processing',
        trackingNumber: trackingNumber,
        orderNumber: orderNumber,
        createdAt: orderData.created_at,
        estimatedDelivery: new Date(estDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
      };

      setLastOrder(newOrder);
      setOrders(prev => [newOrder, ...prev]);
      setStep('success');
      toast.success('¡Solicitud de envío confirmada!');
      
      // Limpiar inventario local
      await removeItems(itemIds); 
      
    } catch (error: any) {
      console.error('Error submitting order:', error);
      toast.error(`Error al procesar el envío: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewOrder = () => {
    setStep('select-cards');
    setSelectedCards([]);
    setLastOrder(null);
    setErrors({});
  };

  const rarityFilters = ['all', 'Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-2 border-white/5">
          <div className="text-center py-12 px-6">
            <div className="w-20 h-20 bg-[var(--neon-blue)]/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[var(--neon-blue)]/20">
              <User className="w-10 h-10 text-[var(--neon-blue)]" />
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-4 text-white">Acceso Restringido</h2>
            <p className="text-gray-400 mb-8 font-medium">Inicia sesión con tu cuenta de Entrenador para solicitar el envío de tus cartas físicas.</p>
            <Button variant="default" className="w-full py-6 text-lg font-black italic" onClick={() => window.location.href = '/login'}>
              INICIAR SESIÓN
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 bg-[#0a0e1a]">
      <div className="container mx-auto px-6 max-w-7xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-[var(--neon-blue)]/10 text-[var(--neon-blue)] text-[10px] font-black uppercase tracking-widest border border-[var(--neon-blue)]/30 rounded-full">
                Premium Shipping
              </span>
            </div>
            <h1 className="text-5xl font-black italic text-white uppercase tracking-tighter mb-3 leading-none">
              Envío a <span className="text-[var(--neon-blue)]">Domicilio</span>
            </h1>
            <p className="text-gray-500 font-medium max-w-xl">
              Convierte tu colección digital en tesoros reales. Imprimimos tus cartas en calidad profesional y las enviamos a cualquier parte del mundo.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-2 p-1.5 bg-[#131829] border-2 border-white/5 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('new')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-black italic uppercase text-xs tracking-wider ${
                activeTab === 'new'
                  ? 'bg-[var(--neon-blue)] text-black shadow-[0_0_20px_rgba(0,212,255,0.3)]'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <PlusCircle className="w-4 h-4" /> Nueva Solicitud
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-black italic uppercase text-xs tracking-wider ${
                activeTab === 'orders'
                  ? 'bg-[var(--neon-blue)] text-black shadow-[0_0_20px_rgba(0,212,255,0.3)]'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="w-4 h-4" /> Mis Pedidos
              {orders.length > 0 && (
                <span className={`ml-1 px-2 py-0.5 rounded-lg text-[10px] ${activeTab === 'orders' ? 'bg-black/20' : 'bg-[var(--neon-blue)]/20 text-[var(--neon-blue)]'}`}>
                  {orders.length}
                </span>
              )}
            </button>
          </motion.div>
        </div>

        {/* Info Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { icon: ShieldCheck, label: 'Calidad Premium', desc: 'Papel holográfico de 350g' },
            { icon: Truck, label: 'Envío Express', desc: 'Embalaje ultra-protegido' },
            { icon: Globe, label: 'Global Delivery', desc: 'Envíos a todo el mundo' },
            { icon: Timer, label: 'Trackeable', desc: 'Seguimiento en tiempo real' },
          ].map(({ icon: Icon, label, desc }) => (
            <motion.div 
              key={label}
              whileHover={{ y: -5 }}
              className="p-5 bg-[#131829] border-2 border-white/5 rounded-[1.5rem] flex items-center gap-4 group"
            >
              <div className={`p-3 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors border border-white/5`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-black text-white uppercase italic tracking-tight">{label}</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{desc}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CONTENT AREA */}
        <AnimatePresence mode="wait">
          {activeTab === 'orders' && (
            <motion.div key="orders-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {loading ? (
                <div className="flex justify-center py-20">
                  <RefreshCw className="w-8 h-8 animate-spin text-[var(--neon-blue)]" />
                </div>
              ) : orders.length === 0 ? (
                <Card className="border-2 border-dashed border-white/10 bg-transparent py-20">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Box className="w-10 h-10 text-gray-700" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase italic mb-2">No hay historial</h3>
                    <p className="text-gray-500 font-medium mb-8 max-w-xs mx-auto">Todavía no has realizado ninguna solicitud de envío.</p>
                    <Button variant="outline" className="px-8 border-2 border-white/10 font-black italic uppercase" onClick={() => setActiveTab('new')}>
                      CREAR MI PRIMER PEDIDO
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {orders.map((order, idx) => {
                    const statusInfo = getStatusInfo(order.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className="p-0 border-2 border-white/5 overflow-hidden">
                          <div className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center gap-8">
                            {/* Order Main Info */}
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-3 mb-6">
                                <span className="text-lg font-black text-white italic tracking-tighter">{order.orderNumber}</span>
                                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border-2 font-black uppercase italic text-[10px] tracking-widest ${statusInfo.bg} ${statusInfo.color}`}>
                                  <StatusIcon className="w-3.5 h-3.5" />
                                  {statusInfo.label}
                                </div>
                                <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                                  Registrado: {new Date(order.createdAt).toLocaleDateString('es-ES')}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Cards */}
                                <div>
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Cartas en este envío</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(order.cards || []).map(card => (
                                      <div
                                        key={card.id}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-default group`}
                                      >
                                        <span className="text-sm">{rarityEmoji[card.rarity]}</span>
                                        <span className="text-[10px] font-bold text-white uppercase tracking-tight group-hover:text-[var(--neon-blue)] transition-colors">{card.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Destination */}
                                <div>
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Destino</p>
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 bg-white/5 rounded-lg border border-white/5 shrink-0">
                                      <MapPin className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-white leading-tight mb-1">{order.address.fullName}</p>
                                      <p className="text-[10px] font-medium text-gray-500 leading-tight">
                                        {order.address.address1}, {order.address.city}<br />
                                        {order.address.state}, {order.address.country}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Tracking & Actions */}
                            <div className="lg:w-64 shrink-0 flex flex-col gap-4">
                              <div className="p-6 bg-black/30 rounded-3xl border-2 border-white/5">
                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                                  Tracking Number
                                  <ExternalLink className="w-3 h-3 text-[var(--neon-blue)]" />
                                </div>
                                <div className="font-mono text-sm font-black text-[var(--neon-blue)] mb-3 bg-[var(--neon-blue)]/5 p-2 rounded-lg text-center border border-[var(--neon-blue)]/20">
                                  {order.trackingNumber}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                  <Timer className="w-3.5 h-3.5" />
                                  <span>Entrega: {order.estimatedDelivery}</span>
                                </div>
                              </div>
                              <Button variant="outline" className="w-full rounded-2xl border-white/5 hover:bg-white/5 py-4 text-[10px] font-black uppercase italic tracking-widest">
                                SOPORTE DE ENVÍO
                              </Button>
                            </div>
                          </div>

                          {/* Progress Line */}
                          <div className="px-6 md:px-8 pb-8">
                            <div className="relative pt-6 border-t border-white/5">
                              <div className="flex items-center justify-between">
                                {(['processing', 'preparing', 'shipped', 'delivered'] as const).map((s, i) => {
                                  const si = getStatusInfo(s);
                                  const SI = si.icon;
                                  const steps = ['processing', 'preparing', 'shipped', 'delivered'];
                                  const currentIdx = steps.indexOf(order.status);
                                  const active = i <= currentIdx;
                                  
                                  return (
                                    <div key={s} className="relative flex flex-col items-center flex-1 group">
                                      {/* Bar */}
                                      {i < 3 && (
                                        <div className="absolute left-1/2 top-4 w-full h-[2px] bg-white/5 overflow-hidden">
                                          <motion.div 
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: i < currentIdx ? 1 : 0 }}
                                            style={{ originX: 0 }}
                                            className="h-full bg-[var(--neon-blue)] shadow-[0_0_10px_rgba(0,212,255,0.5)]"
                                          />
                                        </div>
                                      )}
                                      
                                      {/* Circle */}
                                      <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                                        active 
                                          ? 'border-[var(--neon-blue)] bg-[#0a0e1a] text-[var(--neon-blue)] shadow-[0_0_15px_rgba(0,212,255,0.3)]' 
                                          : 'border-white/5 bg-white/5 text-gray-700'
                                      }`}>
                                        <SI className="w-4 h-4" />
                                      </div>
                                      
                                      {/* Label */}
                                      <span className={`mt-3 text-[9px] font-black uppercase tracking-widest transition-colors duration-500 ${
                                        active ? 'text-white' : 'text-gray-700'
                                      }`}>
                                        {si.label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* NEW ORDER TAB */}
          {activeTab === 'new' && (
            <motion.div key="new-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

              {/* Step indicator */}
              {step !== 'success' && (
                <div className="flex items-center justify-center gap-4 mb-12 overflow-x-auto pb-4">
                  {[
                    { id: 'select-cards', label: 'Cartas', icon: Sparkles },
                    { id: 'shipping-info', label: 'Dirección', icon: MapPin },
                    { id: 'review', label: 'Confirmar', icon: BadgeCheck },
                  ].map((s, idx) => {
                    const stepOrder = ['select-cards', 'shipping-info', 'review', 'success'];
                    const current = stepOrder.indexOf(step);
                    const thisStep = stepOrder.indexOf(s.id);
                    const isDone = current > thisStep;
                    const isActive = current === thisStep;
                    const Icon = s.icon;
                    return (
                      <React.Fragment key={s.id}>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 border-2 ${
                            isActive
                              ? 'bg-[var(--neon-blue)]/10 border-[var(--neon-blue)] text-white shadow-[0_0_20px_rgba(0,212,255,0.15)]'
                              : isDone
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-white/5 border-white/5 text-gray-600'
                          }`}>
                            <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--neon-blue)]' : ''}`} />
                            <span className="text-sm font-black italic uppercase tracking-tight leading-none">{s.label}</span>
                          </div>
                        </div>
                        {idx < 2 && (
                          <ArrowRight className={`w-4 h-4 shrink-0 ${current > idx ? 'text-emerald-500' : 'text-gray-800'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              {/* STEP 1: Select Cards */}
              <AnimatePresence mode="wait">
                {step === 'select-cards' && (
                  <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                      {/* Sidebar Filters */}
                      <div className="lg:col-span-1 space-y-6">
                        <Card className="border-2 border-white/5 p-6 rounded-[2rem]">
                          <div className="mb-8">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                              <Search className="w-3 h-3" /> Buscar Carta
                            </h3>
                            <div className="relative group">
                              <input
                                type="text"
                                placeholder="Pikachu..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-black/40 border-2 border-white/5 focus:border-[var(--neon-blue)] rounded-xl py-3 px-4 text-white font-bold outline-none transition-all placeholder-gray-700"
                              />
                            </div>
                          </div>

                          <div>
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                              <Star className="w-3 h-3" /> Rareza
                            </h3>
                            <div className="flex flex-col gap-2">
                              {rarityFilters.map(r => (
                                <button
                                  key={r}
                                  onClick={() => setRarityFilter(r)}
                                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase italic transition-all border-2 ${
                                    rarityFilter === r
                                      ? 'bg-[var(--neon-blue)]/10 border-[var(--neon-blue)] text-white'
                                      : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/10'
                                  }`}
                                >
                                  <span>{r === 'all' ? 'Todas' : r}</span>
                                  <span className="text-[10px] opacity-50">{r === 'all' ? inventory.length : inventory.filter(i => i.rarity === r).length}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </Card>

                        {/* Selected Preview */}
                        {selectedCards.length > 0 && (
                          <Card className="border-2 border-[var(--neon-blue)]/30 bg-[var(--neon-blue)]/5 p-6 rounded-[2rem]">
                            <h3 className="text-[10px] font-black text-[var(--neon-blue)] uppercase tracking-[0.2em] mb-4">Selección actual</h3>
                            <div className="space-y-2 mb-6">
                              {selectedCards.map(card => (
                                <div key={card.id} className="flex items-center justify-between group">
                                  <span className="text-xs font-bold text-white truncate max-w-[120px]">{card.name}</span>
                                  <button onClick={() => toggleCard(card)} className="text-gray-500 hover:text-red-400 p-1">
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="pt-4 border-t border-[var(--neon-blue)]/20">
                              <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black text-[var(--neon-blue)] uppercase italic">Capacidad</span>
                                <span className="text-xl font-black text-white italic">{selectedCards.length}<span className="text-gray-600 text-xs not-italic">/{MAX_CARDS}</span></span>
                              </div>
                            </div>
                          </Card>
                        )}
                      </div>

                      {/* Inventory Grid */}
                      <div className="lg:col-span-3">
                        {loading ? (
                          <div className="flex flex-col items-center justify-center py-20">
                            <RefreshCw className="w-10 h-10 animate-spin text-[var(--neon-blue)]" />
                            <p className="text-gray-500 font-black italic uppercase tracking-widest mt-6">Escaneando Inventario...</p>
                          </div>
                        ) : filteredInventory.length === 0 ? (
                          <div className="bg-[#131829] border-2 border-dashed border-white/5 rounded-[3rem] p-12 text-center">
                            <Package className="w-12 h-12 text-gray-800 mx-auto mb-6" />
                            <h3 className="text-xl font-black text-white uppercase italic mb-2">Inventario Vacío</h3>
                            <p className="text-gray-500 font-medium mb-8 max-w-xs mx-auto">No tienes cartas de esta categoría disponibles para envío.</p>
                            <Button variant="default" onClick={() => window.location.href = '/cases'}>ABRIR CAJAS AHORA</Button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-10">
                            {filteredInventory.map((item, index) => {
                              const isSelected = selectedCards.some(c => c.id === item.id);
                              return (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: index * 0.02 }}
                                  whileHover={{ y: -5 }}
                                  onClick={() => toggleCard(item)}
                                  className={`relative group cursor-pointer rounded-[1.5rem] border-2 transition-all duration-300 p-4 ${
                                    isSelected
                                      ? 'bg-[var(--neon-blue)]/10 border-[var(--neon-blue)] shadow-[0_0_25px_rgba(0,212,255,0.2)]'
                                      : 'bg-[#131829] border-white/5 hover:border-white/20'
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-[var(--neon-blue)] rounded-full flex items-center justify-center shadow-lg border-2 border-[#0a0e1a]">
                                      <CheckCircle className="w-4 h-4 text-black" />
                                    </div>
                                  )}
                                  <div className="mb-3">
                                    <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase italic ${getRarityColor(item.rarity)} text-white shadow-lg`}>
                                      {item.rarity}
                                    </span>
                                  </div>
                                  <div className={`w-full aspect-[3/4] rounded-2xl bg-gradient-to-br ${getRarityColor(item.rarity)} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-500 overflow-hidden relative ${getRarityGlow(item.rarity)}`}>
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                    <span className="text-4xl relative z-10 group-hover:scale-125 transition-transform duration-500">{rarityEmoji[item.rarity]}</span>
                                  </div>
                                  <div className="text-[10px] font-black text-white uppercase italic tracking-tight truncate mb-1">{item.name}</div>
                                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">${item.value.toLocaleString()}</div>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}

                        <div className="flex justify-end sticky bottom-8 z-20">
                          <Button
                            variant="default"
                            onClick={() => setStep('shipping-info')}
                            disabled={selectedCards.length === 0}
                            className={`px-10 py-7 text-lg font-black italic uppercase rounded-2xl shadow-2xl transition-all ${
                              selectedCards.length === 0 ? 'opacity-50 grayscale' : 'hover:scale-105 active:scale-95'
                            }`}
                          >
                            CONFIGURAR ENVÍO <ArrowRight className="w-5 h-5 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Shipping Info */}
                {step === 'shipping-info' && (
                  <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                      {/* Form */}
                      <div className="lg:col-span-2">
                        <Card className="border-2 border-white/5 p-8 md:p-10 rounded-[2.5rem]">
                          <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-white">
                              <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-black italic uppercase text-white leading-none">Dirección de Entrega</h2>
                              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Completa los datos para el envío físico</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="sm:col-span-2">
                              <Field label="Nombre completo" icon={User} value={form.fullName}
                                onChange={updateForm('fullName')} placeholder="Ash Ketchum" required error={errors.fullName} />
                            </div>
                            <Field label="Email de contacto" icon={Mail} type="email" value={form.email}
                              onChange={updateForm('email')} placeholder="entrenador@paleta.com" required error={errors.email} />
                            <Field label="Teléfono móvil" icon={Phone} type="tel" value={form.phone}
                              onChange={updateForm('phone')} placeholder="+34 600 000 000" required error={errors.phone} />
                            <div className="sm:col-span-2">
                              <Field label="Dirección de envío" icon={Home} value={form.address1}
                                onChange={updateForm('address1')} placeholder="Calle Victoria, Nº 151" required error={errors.address1} />
                            </div>
                            <div className="sm:col-span-2">
                              <Field label="Complemento (Opcional)" icon={Info} value={form.address2}
                                onChange={updateForm('address2')} placeholder="Edificio Silph Co, Piso 7" />
                            </div>
                            <Field label="Ciudad" icon={Globe} value={form.city}
                              onChange={updateForm('city')} placeholder="Ciudad Azafrán" required error={errors.city} />
                            <Field label="Provincia / Estado" icon={MapPin} value={form.state}
                              onChange={updateForm('state')} placeholder="Kanto" required error={errors.state} />
                            <Field label="Código Postal" icon={MapPin} value={form.postalCode}
                              onChange={updateForm('postalCode')} placeholder="28001" required error={errors.postalCode} />
                            
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">País</label>
                              <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-white/5 rounded-lg border border-white/5">
                                  <Globe className="w-3.5 h-3.5 text-gray-500" />
                                </div>
                                <select
                                  value={form.country}
                                  onChange={e => updateForm('country')(e.target.value)}
                                  className="w-full pl-12 pr-10 py-3 bg-black/20 border-2 border-white/5 rounded-xl text-white font-bold outline-none transition-all appearance-none cursor-pointer focus:border-[var(--neon-blue)]"
                                >
                                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                              </div>
                            </div>
                          </div>

                          <div className="mt-10 p-5 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-4">
                            <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                              <ShieldCheck className="w-5 h-5 text-[var(--neon-blue)]" />
                            </div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-normal">
                              Tus datos están protegidos bajo encriptación AES-256. Solo los usaremos para gestionar el transporte de tus cartas.
                            </p>
                          </div>
                        </Card>
                      </div>

                      {/* Order Summary Sidebar */}
                      <div className="space-y-6">
                        <Card className="border-2 border-white/5 p-8 rounded-[2.5rem] bg-[#131829]">
                          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6">Detalles del Envío</h3>
                          <div className="space-y-4 mb-8">
                            {selectedCards.map(card => (
                              <div key={card.id} className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getRarityColor(card.rarity)} flex items-center justify-center shrink-0 shadow-lg`}>
                                  <span className="text-lg">{rarityEmoji[card.rarity]}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-black text-white uppercase italic truncate">{card.name}</div>
                                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{card.rarity}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="space-y-3 pt-6 border-t border-white/5">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                              <span className="text-gray-500">Cartas</span>
                              <span className="text-white">{selectedCards.length} unid.</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                              <span className="text-gray-500">Envío</span>
                              <span className="text-emerald-400">Gratis (Premium)</span>
                            </div>
                            <div className="flex justify-between items-end pt-4 border-t border-white/5">
                              <span className="text-[10px] font-black text-[var(--neon-blue)] uppercase italic">Total</span>
                              <span className="text-2xl font-black text-white italic tracking-tighter">GRATIS</span>
                            </div>
                          </div>
                        </Card>

                        <div className="flex flex-col gap-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              if (validateForm()) setStep('review');
                              else toast.error('Por favor, completa todos los campos requeridos');
                            }}
                            className="w-full py-5 bg-[var(--neon-blue)] rounded-2xl text-black font-black italic uppercase tracking-wider shadow-[0_0_25px_rgba(0,212,255,0.2)]"
                          >
                            REVISAR PEDIDO
                          </motion.button>
                          <button
                            onClick={() => setStep('select-cards')}
                            className="w-full py-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center justify-center gap-2"
                          >
                            <ArrowLeft className="w-3 h-3" /> VOLVER A LA SELECCIÓN
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Review & Confirm */}
                {step === 'review' && (
                  <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                    <div className="max-w-3xl mx-auto">
                      <Card className="border-2 border-white/5 p-10 md:p-12 rounded-[3rem] overflow-hidden relative bg-[#131829]">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-[var(--neon-blue)] to-purple-500" />
                        
                        <div className="text-center mb-12">
                          <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter mb-2">Finalizar Solicitud</h2>
                          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Confirma que todos los datos son correctos</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-8">
                            <section>
                              <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Package className="w-3 h-3" /> Cartas a Imprimir ({selectedCards.length})
                              </h3>
                              <div className="grid grid-cols-2 gap-3">
                                {selectedCards.map(card => (
                                  <div key={card.id} className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getRarityColor(card.rarity)} flex items-center justify-center shrink-0`}>
                                      <span className="text-xs">{rarityEmoji[card.rarity]}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-white uppercase italic truncate leading-none">{card.name}</span>
                                  </div>
                                ))}
                              </div>
                            </section>

                            <section className="p-6 bg-black/30 rounded-[1.5rem] border border-white/5">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                                  <Truck className="w-6 h-6" />
                                </div>
                                <div>
                                  <p className="text-xs font-black text-white uppercase italic tracking-tight">Método de Envío</p>
                                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Premium Courier (10-15 días)</p>
                                  <p className="text-[10px] font-black text-emerald-400 uppercase italic mt-1">Suscripción Activa: 0,00€</p>
                                </div>
                              </div>
                            </section>
                          </div>

                          <div>
                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <MapPin className="w-3 h-3" /> Datos de Recepción
                            </h3>
                            <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-4">
                              <div>
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Destinatario</p>
                                <p className="text-sm font-black text-white uppercase italic leading-none">{form.fullName}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Dirección</p>
                                <p className="text-xs font-bold text-white leading-relaxed">
                                  {form.address1}<br />
                                  {form.address2 && <>{form.address2}<br /></>}
                                  {form.postalCode} – {form.city}<br />
                                  {form.state}, {form.country}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Contacto</p>
                                <p className="text-xs font-medium text-gray-400">{form.email} · {form.phone}</p>
                              </div>
                              <button
                                onClick={() => setStep('shipping-info')}
                                className="text-[10px] font-black text-[var(--neon-blue)] uppercase tracking-widest hover:underline pt-2"
                              >
                                EDITAR DIRECCIÓN
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="mt-12 flex flex-col sm:flex-row gap-4">
                          <button
                            onClick={() => setStep('shipping-info')}
                            className="flex-1 py-5 border-2 border-white/5 rounded-2xl text-gray-500 font-black italic uppercase tracking-wider hover:bg-white/5 hover:text-white transition-all"
                          >
                            ← ATRÁS
                          </button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmitOrder}
                            disabled={submitting}
                            className="flex-[2] py-5 bg-[var(--neon-blue)] rounded-2xl text-black font-black italic uppercase tracking-wider shadow-[0_0_30px_rgba(0,212,255,0.3)] flex items-center justify-center gap-3 overflow-hidden relative group"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            {submitting ? (
                              <><RefreshCw className="w-5 h-5 animate-spin" /> PROCESANDO...</>
                            ) : (
                              <><CheckCircle className="w-5 h-5" /> CONFIRMAR Y ENVIAR</>
                            )}
                          </motion.button>
                        </div>
                      </Card>
                    </div>
                  </motion.div>
                )}

                {/* SUCCESS */}
                {step === 'success' && lastOrder && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="max-w-xl mx-auto"
                  >
                    <Card className="border-2 border-[var(--neon-blue)]/30 bg-[#131829] p-10 text-center rounded-[3rem] relative shadow-[0_0_50px_rgba(0,212,255,0.1)]">
                      <motion.div
                        animate={{ 
                          y: [0, -15, 0],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                        className="w-24 h-24 bg-[var(--neon-blue)]/10 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-[var(--neon-blue)] shadow-[0_0_30px_rgba(0,212,255,0.4)]"
                      >
                        <Box className="w-10 h-10 text-[var(--neon-blue)]" />
                      </motion.div>
                      
                      <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter mb-4 leading-none">
                        ¡SOLICITUD <span className="text-[var(--neon-blue)]">CONFIRMADA!</span>
                      </h2>
                      <p className="text-gray-400 font-bold text-sm mb-10 max-w-sm mx-auto">
                        Tus cartas han sido enviadas a producción. El equipo de PokeBox ya está preparando tu paquete premium.
                      </p>

                      <div className="grid grid-cols-2 gap-4 text-left mb-10">
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                          <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">ID Pedido</div>
                          <div className="text-xs font-black text-white italic">{lastOrder.orderNumber}</div>
                        </div>
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                          <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Estado</div>
                          <div className="text-xs font-black text-yellow-400 italic flex items-center gap-1">
                            <Clock className="w-3 h-3" /> PROCESANDO
                          </div>
                        </div>
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                          <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Tracking</div>
                          <div className="text-xs font-mono font-black text-[var(--neon-blue)] tracking-tight">{lastOrder.trackingNumber}</div>
                        </div>
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                          <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Estimación</div>
                          <div className="text-xs font-black text-white italic">{lastOrder.estimatedDelivery}</div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        <Button variant="default" className="w-full py-6 rounded-2xl font-black italic uppercase tracking-wider" onClick={handleNewOrder}>
                          SOLICITAR OTRO ENVÍO
                        </Button>
                        <button
                          onClick={() => { setActiveTab('orders'); handleNewOrder(); }}
                          className="w-full py-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                          <History className="w-3.5 h-3.5" /> VER MI HISTORIAL DE ENVIOS
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
