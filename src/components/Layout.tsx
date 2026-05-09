import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Wallet, 
  Map as MapIcon, 
  ShieldAlert, 
  User as UserIcon,
  Search,
  Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const { user, login } = useAuth();

  const navItems = [
    { id: 'explore', label: 'Explore', icon: Home },
    { id: 'split', label: 'Split', icon: Wallet },
    { id: 'planner', label: 'Planner', icon: MapIcon },
    { id: 'sos', label: 'Safety', icon: ShieldAlert },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-natural-bg flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xs space-y-6"
        >
          <div className="w-20 h-20 bg-primary rounded-[32px] mx-auto flex items-center justify-center shadow-lg shadow-primary/20">
            <MapIcon className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-natural-text tracking-tight">Ghoomo</h1>
          <p className="text-natural-muted font-medium">Discover experiences, split costs, and travel safely with AI.</p>
          <button 
            onClick={login}
            className="w-full py-4 bg-natural-text text-white rounded-2xl font-bold shadow-xl active:scale-95 transition-transform"
          >
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-natural-bg pb-24 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-natural-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-md">
            <MapIcon className="text-white w-5 h-5" />
          </div>
          <span className="font-serif font-bold text-2xl tracking-tight text-natural-text">Ghoomo</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 bg-stone-100 rounded-full text-stone-600">
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full border-2 border-primary p-0.5 overflow-hidden shadow-sm">
            <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="Profile" className="w-full h-full rounded-full object-cover" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white/95 backdrop-blur-2xl border-t border-natural-border px-6 py-4 flex items-center justify-between z-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              activeTab === item.id ? "text-primary scale-110" : "text-stone-400"
            )}
          >
            <item.icon className={cn("w-6 h-6", activeTab === item.id ? "fill-primary/10" : "")} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

