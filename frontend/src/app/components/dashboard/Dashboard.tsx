import { motion } from 'motion/react';
import { Card } from '../ui/Card';
import { User, Package, Trophy, TrendingUp, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PaymentModal } from '../payment/PaymentModal';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import pokecoinIcon from '../../../assets/Pokecoin.png';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  if (!user) {
    return null;
  }
  
  // Datos reales (o iniciales) en lugar de hardcoded
  const stats = [
    { icon: Package, label: 'Cases Opened', value: '0', color: 'yellow' },
    { icon: Trophy, label: 'Battle Wins', value: '0', color: 'blue' },
    { icon: TrendingUp, label: 'Items Obtained', value: '0', color: 'purple' },
    { icon: null, label: 'Total Earnings', value: '0', color: 'red', customIcon: pokecoinIcon }
  ];
  
  // Lista vacía por defecto
  const recentActivity: any[] = [];
  
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-[var(--neon-yellow)] to-[var(--neon-blue)] rounded-full flex items-center justify-center text-black font-bold text-4xl shadow-[0_0_20px_rgba(0,212,255,0.3)]">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-white mb-2">{user.username}</h2>
                <p className="text-gray-400 mb-4">
                  Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className="px-4 py-2 bg-[var(--dark-hover)] rounded-lg border border-[var(--neon-yellow)]">
                    Level {user.level}
                  </span>
                  <span className="px-4 py-2 bg-[var(--dark-hover)] rounded-lg border border-[var(--neon-blue)]">
                    {user.level >= 20 ? 'Elite Trainer' : user.level >= 10 ? 'Advanced Trainer' : 'Novice Trainer'}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-[var(--neon-yellow)] mb-2 flex items-center justify-center gap-2">
                  <img src={pokecoinIcon} alt="PokéCoin" className="w-4 h-4 object-contain" />
                  Balance
                </div>
                <div className="text-white mb-4 text-2xl font-bold">{user.balance.toLocaleString()} <span className="text-sm text-[var(--neon-yellow)]">PokéCoins</span></div>
                <Button variant="default" size="sm" onClick={() => setShowPaymentModal(true)}>
                  <img src={pokecoinIcon} alt="PokéCoin" className="w-4 h-4 object-contain mr-2" />
                  Add PokéCoins
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
        
        {/* Payment Modal */}
        {showPaymentModal && (
          <Elements stripe={stripePromise}>
            <PaymentModal 
              userId={user.id} 
              email={user.email} 
              onClose={() => setShowPaymentModal(false)} 
            />
          </Elements>
        )}
        
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} hover={true} glow={stat.color as any}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-400 mb-2">{stat.label}</div>
                    <div className="text-white">{stat.value}</div>
                  </div>
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                    stat.color === 'yellow' ? 'bg-yellow-500/20' :
                    stat.color === 'blue' ? 'bg-blue-500/20' :
                    stat.color === 'purple' ? 'bg-purple-500/20' :
                    'bg-red-500/20'
                  }`}>
                    {Icon ? (
                      <Icon className={`w-7 h-7 ${
                        stat.color === 'yellow' ? 'text-yellow-400' :
                        stat.color === 'blue' ? 'text-blue-400' :
                        stat.color === 'purple' ? 'text-purple-400' :
                        'text-red-400'
                      }`} />
                    ) : (
                      <img src={stat.customIcon} alt="Icon" className="w-8 h-8 object-contain" />
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </motion.div>
        
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-white mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-[var(--neon-blue)]" />
            Recent Activity
          </h2>
          <Card>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-center justify-between p-4 bg-[var(--dark-hover)] rounded-lg border border-gray-800 hover:border-[var(--neon-blue)] transition-all duration-300"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs ${
                          activity.action === 'Opened' ? 'bg-yellow-500/20 text-yellow-400' :
                          activity.action === 'Won Battle' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {activity.action}
                        </span>
                        <span className="text-white">{activity.item}</span>
                      </div>
                      {activity.won && (
                        <div className="text-gray-400">
                          Won: <span className="text-[var(--neon-yellow)]">{activity.won}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-[var(--neon-yellow)] mb-1">{activity.value} PokéCoins</div>
                      <div className="text-gray-400">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 italic">
                No recent activity to show. Open your first case!
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
