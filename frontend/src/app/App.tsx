import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider, useChat } from './context/ChatContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './components/home/Home';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { Dashboard } from './components/dashboard/Dashboard';
import { Cases } from './components/cases/Cases';
import { CaseDetail } from './components/cases/CaseDetail';
import { Battles } from './components/battles/Battles';
import { Upgrade } from './components/upgrade/Upgrade';
import { Rewards } from './components/rewards/Rewards';
import { Support } from './components/support/Support';
import { BoxCovers } from './components/boxes/BoxCovers';
import { Inventory } from './components/inventory/Inventory';
import { Trade } from './components/trade/Trade';
import { Delivery } from './components/delivery/Delivery';
import { PaymentSuccess } from './components/payment/PaymentSuccess';
import { Toaster } from './components/ui/sonner';
import { SupabaseStatus } from './components/debug/SupabaseStatus';
import { SupportChat } from './components/support/SupportChat';
import { MessageCircle } from 'lucide-react';

function GlobalChat() {
  const { isChatOpen, closeChat, toggleChat } = useChat();
  
  return (
    <>
      <SupportChat isOpen={isChatOpen} onClose={closeChat} />
      {!isChatOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-40 bg-[var(--neon-blue)] text-black p-4 rounded-full shadow-[0_0_15px_rgba(0,243,255,0.5)] hover:scale-110 transition-transform cursor-pointer"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <div className="min-h-screen bg-[var(--dark-bg)] text-white">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/cases" element={<Cases />} />
                <Route path="/cases/:id" element={<CaseDetail />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/trade" element={<Trade />} />
                <Route path="/delivery" element={<Delivery />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/battles" element={<Battles />} />
                <Route path="/upgrade" element={<Upgrade />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route path="/support" element={<Support />} />
                <Route path="/box-covers" element={<BoxCovers />} />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-right" theme="dark" />
            <SupabaseStatus />
            <GlobalChat />
          </div>
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}
