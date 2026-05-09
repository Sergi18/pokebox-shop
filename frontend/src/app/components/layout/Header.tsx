import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Zap, ShoppingBag, Sword, Trophy, HeadphonesIcon, User, LogOut, Package, ArrowLeftRight, Truck } from 'lucide-react';
import { Button } from '../ui/Button';
import logo from 'figma:asset/6e863f4494a0b578dad3289d366d63fdcde5ae2f.png';
import pokecoinIcon from '../../../assets/Pokecoin.png';
import iconogengar from '../../../assets/iconogengar.webp';
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
    { path: '/', label: 'Home', icon: Zap },
    { path: '/cases', label: 'Cases', icon: ShoppingBag },
    { path: '/trade', label: 'Intercambio', icon: ArrowLeftRight },
    { path: '/delivery', label: 'Envío', icon: Truck },
    { path: '/battles', label: 'Battles', icon: Sword },
    { path: '/rewards', label: 'Rewards', icon: Trophy },
    { path: '/upgrade', label: 'MEJORA FANTASMAL', isSpecial: true },
    { path: '/support', label: 'Support', icon: HeadphonesIcon },
  ];
  
  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };
  
  return (
    <header className="sticky top-0 z-50 bg-[#0a0e1a] border-b border-white/10 backdrop-blur-lg bg-opacity-90">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/">
            <motion.div className="flex items-center" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
              <img src={logo} alt="PokeBox Logo" className="h-12 w-auto" />
            </motion.div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  {item.isSpecial ? (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="relative px-5 py-2.5 rounded-2xl flex items-center gap-2 overflow-hidden group border border-purple-500/30 bg-[#131829]/50 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.2),transparent_70%)] animate-pulse opacity-50" />
                      <img src={iconogengar} className="w-5 h-5 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] relative z-10" alt="Gengar" />
                      <span className="font-black italic uppercase tracking-widest text-white/90 relative z-10 text-xs">{item.label}</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      whileHover={{ y: -2 }}
                      className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                        isActive
                          ? 'bg-gradient-to-r from-[var(--neon-yellow)] to-[var(--neon-blue)] text-black font-black'
                          : 'text-gray-300 hover:text-white hover:bg-[#131829]'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </motion.div>
                  )}
                </Link>
              );
            })}
          </nav>
          
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#131829] border border-white/5 rounded-lg">
                  <img src={pokecoinIcon} alt="PokéCoin" className="w-5 h-5 object-contain" />
                  <span className="text-white font-medium">{user.balance.toLocaleString()} <span className="text-[var(--neon-yellow)] text-xs">Coins</span></span>
                </div>
                <div className="relative" ref={menuRef}>
                  <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--neon-yellow)] to-[var(--neon-blue)] text-black rounded-lg">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user.username}</span>
                    <span className="text-xs bg-black/20 px-2 py-0.5 rounded">Lv.{user.level}</span>
                  </motion.button>
                  {showUserMenu && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 mt-2 w-48 bg-[#131829] border border-white/10 rounded-lg shadow-xl overflow-hidden">
                      <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="block px-4 py-3 text-white hover:bg-[#1a2238]">Dashboard</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-400 hover:bg-[#1a2238] border-t border-white/10">Logout</button>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
                <Link to="/register"><Button variant="default" size="sm">Register</Button></Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
