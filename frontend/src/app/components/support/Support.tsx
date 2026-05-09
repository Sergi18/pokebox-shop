import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Mail, MessageCircle, HelpCircle, FileText, Send } from 'lucide-react';
import { useState } from 'react';
import { useChat } from '../../context/ChatContext';

const faqs = [
  { question: 'How do I open a case?', answer: 'Navigate to the Cases page, select a case, and click the "Open Case" button. Make sure you have enough credits in your balance.' },
  { question: 'How do battles work?', answer: 'In battles, you and your opponent open the same case simultaneously. The player who wins the higher value item wins the battle.' },
  { question: 'How can I add credits?', answer: 'Click on "Add Credits" in your dashboard to purchase credits using various payment methods.' },
  { question: 'Can I sell my items?', answer: 'Yes! Go to the Marketplace and list your items for sale. Other players can purchase them.' },
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
    alert('Support ticket submitted! We\'ll get back to you soon.');
    setFormData({ email: '', subject: '', message: '' });
  };
  
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="mb-4 bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-yellow)] bg-clip-text text-transparent">
            Support Center
          </h1>
          <p className="text-gray-400">
            How can we help you today?
          </p>
        </motion.div>
        
        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <Card className="hover:border-[var(--neon-blue)] transition-all cursor-pointer group" onClick={() => {}}>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <HelpCircle className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-white mb-2 font-bold">FAQ</h3>
              <p className="text-gray-400">Find quick answers</p>
            </div>
          </Card>
          
          <Card className="hover:border-[var(--neon-yellow)] transition-all cursor-pointer group" onClick={() => {}}>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-white mb-2 font-bold">Documentation</h3>
              <p className="text-gray-400">Learn how it works</p>
            </div>
          </Card>
          
          <Card 
            className="hover:border-purple-500 transition-all cursor-pointer group" 
            onClick={openChat}
          >
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-white mb-2 font-bold">Live Chat</h3>
              <p className="text-gray-400">Chat with support</p>
            </div>
          </Card>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-white mb-6 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-[var(--neon-blue)]" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="p-6">
                  <h3 className="text-white mb-2 font-bold">{faq.question}</h3>
                  <p className="text-gray-400">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </motion.div>
          
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-white mb-6 flex items-center gap-2">
              <Mail className="w-6 h-6 text-[var(--neon-yellow)]" />
              Contact Us
            </h2>
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-white mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[var(--dark-hover)] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--neon-blue)] transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white mb-2">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[var(--dark-hover)] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--neon-blue)] transition-colors"
                    placeholder="How can we help?"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[var(--dark-hover)] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--neon-blue)] transition-colors resize-none"
                    placeholder="Describe your issue..."
                    rows={6}
                    required
                  />
                </div>
                
                <Button type="submit" variant="default" size="lg" className="w-full">
                  <Send className="w-5 h-5" />
                  Send Message
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
