import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Zap, ShoppingBag, Sword, Trophy, HeadphonesIcon, User, Truck, ArrowLeftRight } from 'lucide-react';
import { Button } from '../ui/Button';
import logo from 'figma:asset/6e863f4494a0b578dad3289d366d63fdcde5ae2f.png';
import pokecoinIcon from '../../../assets/Pokecoin.png';
import iconogengar from '../../../assets/iconogengar.webp';
import iconobatalla from '../../../assets/iconobatalla.webp';
import perfilIcon from '../../../assets/perfil.webp';
import '../../styles/gengar-style.css';
import { useAuth } from '../../context/AuthContext';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);
  
  const navItems = [
    { path: '/', label: 'Inicio', icon: Zap },
    { path: '/cases', label: 'Cajas', icon: ShoppingBag },
    { path: '/trade', label: 'Intercambio', icon: ArrowLeftRight },
    { path: '/delivery', label: 'Envío', icon: Truck, isSpecialBlue: true },
    { 
      path: '/battles', 
      label: 'Batallas', 
      customIcon: <img src={iconobatalla} className="w-4 h-4 object-contain" alt="Batallas" /> 
    },
    { path: '/rewards', label: 'Premios', icon: Trophy, isSpecialYellow: true },
    { 
      path: '/upgrade', 
      label: 'MEJORA', 
      isSpecial: true 
    },
    { 
      path: '/support', 
      label: 'Soporte', 
      isSpecialRed: true 
    },
  ];
  
  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };
  
  return (
    <header className="sticky top-0 z-50 bg-[#0a0e1a] border-b border-white/10 backdrop-blur-lg bg-opacity-95">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/">
            <motion.div className="flex items-center" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
              <img src={logo} alt="PokeBox Logo" className="h-12 w-auto" />
            </motion.div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  {item.isSpecial ? (
                    <div className="gengar-aura mx-1">
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="relative px-4 py-2 rounded-xl flex items-center gap-2 overflow-hidden bg-[#131829]/60 backdrop-blur-md border border-purple-500/30 text-white transition-all duration-300"
                      >
                        <img src={iconogengar} className="w-4 h-4 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)] relative z-10" alt="Gengar" />
                        <span className="font-bold text-[11px] uppercase tracking-wider relative z-10">{item.label}</span>
                      </motion.div>
                    </div>
                  ) : item.isSpecialRed ? (
                    <div className="gengar-aura-red mx-1">
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="relative px-4 py-2 rounded-xl flex items-center gap-2 overflow-hidden bg-[#131829]/60 backdrop-blur-md border border-red-500/30 text-white transition-all duration-300"
                      >
                        <img src={perfilIcon} className="w-4 h-4 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)] relative z-10" alt="Soporte" />
                        <span className="font-bold text-[11px] uppercase tracking-wider relative z-10">{item.label}</span>
                      </motion.div>
                    </div>
                  ) : item.isSpecialYellow ? (
                    <div className="gengar-aura-yellow mx-1">
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="relative px-4 py-2 rounded-xl flex items-center gap-2 overflow-hidden bg-[#131829]/60 backdrop-blur-md border border-yellow-500/30 text-white transition-all duration-300"
                      >
                        <Trophy className="w-4 h-4 text-yellow-400 drop-shadow-[0_0_5px_rgba(234,179,8,0.8)] relative z-10" />
                        <span className="font-bold text-[11px] uppercase tracking-wider relative z-10">{item.label}</span>
                      </motion.div>
                    </div>
                  ) : item.isSpecialBlue ? (
                    <div className="gengar-aura-blue mx-1">
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="relative px-4 py-2 rounded-xl flex items-center gap-2 overflow-hidden bg-[#131829]/60 backdrop-blur-md border border-blue-500/30 text-white transition-all duration-300"
                      >
                        <Truck className="w-4 h-4 text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)] relative z-10" />
                        <span className="font-bold text-[11px] uppercase tracking-wider relative z-10">{item.label}</span>
                      </motion.div>
                    </div>
                  ) : (
                    <motion.div
                      whileHover={{ y: -1 }}
                      className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 text-xs ${
                        isActive
                          ? 'bg-gradient-to-r from-[var(--neon-yellow)] to-[var(--neon-blue)] text-black font-black'
                          : 'text-gray-300 hover:text-white hover:bg-[#131829]'
                      }`}
                    >
                      {item.customIcon ? item.customIcon : <item.icon className="w-4 h-4" />}
                      <span className="truncate uppercase font-bold text-[11px] tracking-wider">{item.label}</span>
                    </motion.div>
                  )}
                </Link>
              );
            })}
          </nav>
          
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#131829] border border-white/5 rounded-lg">
                  <img src={pokecoinIcon} alt="PokéCoin" className="w-4 h-4 object-contain" />
                  <span className="text-white font-medium text-xs">{user.balance.toLocaleString()} <span className="text-[var(--neon-yellow)]">Coins</span></span>
                </div>
                <div className="relative" ref={menuRef}>
                  <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[var(--neon-yellow)] to-[var(--neon-blue)] text-black rounded-lg text-xs">
                    <img src={perfilIcon} className="w-4 h-4 rounded-full object-cover border border-black/20" alt="Profile" />
                    <span className="hidden sm:inline font-bold">{user.username}</span>
                  </motion.button>
                  {showUserMenu && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 mt-3 w-48 bg-[#131829] border border-white/10 rounded-2xl shadow-xl overflow-hidden text-xs">
                      <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="block px-5 py-4 text-white hover:bg-[#1a2238] font-bold">Panel</Link>
                      <button onClick={handleLogout} className="w-full text-left px-5 py-4 text-red-400 hover:bg-[#1a2238] border-t border-white/10 font-bold">Cerrar Sesión</button>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost" size="sm" className="text-xs">Login</Button></Link>
                <Link to="/register"><Button variant="default" size="sm" className="text-xs">Register</Button></Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
