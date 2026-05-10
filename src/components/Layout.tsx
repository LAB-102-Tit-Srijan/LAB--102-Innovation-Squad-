import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Receipt, 
  Map as MapIcon, 
  Shield, 
  User as UserIcon,
  Search,
  Bell,
  Menu as MenuIcon,
  X
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'split', label: 'Split Bills', icon: Receipt },
    { id: 'planner', label: 'AI Planner', icon: MapIcon },
    { id: 'sos', label: 'Safety Hub', icon: Shield },
    { id: 'profile', label: 'My Profile', icon: UserIcon },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Background Layer */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center brightness-[0.85] contrast-[1.1]"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=2000')`,
            filter: 'sepia(0.2) saturate(0.8)'
          }}
        />
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 z-1 opacity-20 pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/crumpled-paper.png')]" />
        
        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-sm space-y-8 bg-white/20 backdrop-blur-xl p-10 rounded-[44px] border border-white/30 shadow-2xl"
        >
          <div className="space-y-2">
            <div className="w-20 h-20 bg-primary rounded-[32px] mx-auto flex items-center justify-center shadow-2xl shadow-primary/40 transform rotate-3">
              <MapIcon className="text-white w-10 h-10" />
            </div>
            <div className="pt-4">
              <h1 className="text-5xl font-serif font-bold text-white tracking-tight drop-shadow-lg">Ghoomo</h1>
              <p className="text-white/90 font-bold text-xs uppercase tracking-[0.3em] mt-1 drop-shadow-md">Go Local, Ghoomo Better!!</p>
            </div>
          </div>
          
          <p className="text-white font-medium text-sm leading-relaxed drop-shadow-sm">
            Your spiritual and local travel companion. Discover sacred sites, split costs, and travel safely with AI guidance.
          </p>
          
          <button 
            onClick={login}
            className="w-full py-5 bg-white text-natural-text rounded-2xl font-bold shadow-2xl active:scale-95 transition-all hover:bg-stone-50 flex items-center justify-center gap-3 group"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Sign in with Google
          </button>
        </motion.div>

        {/* Faded Brand Text as Background/Texture */}
        <div className="absolute top-12 left-12 opacity-10 pointer-events-none select-none text-left">
          <h2 className="text-8xl font-serif font-black text-white italic leading-none">GHOOMO</h2>
          <p className="text-xl font-bold text-white uppercase tracking-[0.4em] mt-2 ml-2">GO LOCAL, GHOOMO BETTER!!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-6 font-sans relative">
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Side Menu Trigger */}
      <button 
        onClick={() => setIsMenuOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-natural-text text-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform group overflow-hidden"
      >
        <motion.div 
          whileHover={{ rotate: 90 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <MenuIcon className="w-7 h-7" />
        </motion.div>
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Side Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            
            <motion.nav 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xs bg-white h-screen shadow-2xl p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
                    <MapIcon className="text-white w-6 h-6" />
                  </div>
                  <span className="font-serif font-black text-2xl text-natural-text italic">Ghoomo</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-12 h-12 flex items-center justify-center bg-stone-100 rounded-full text-stone-600 hover:bg-stone-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 p-5 rounded-[24px] transition-all group relative overflow-hidden",
                      activeTab === item.id 
                        ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]" 
                        : "text-stone-400 hover:bg-stone-50 hover:text-stone-600"
                    )}
                  >
                    <item.icon className={cn(
                      "w-6 h-6 transition-transform group-hover:scale-110",
                      activeTab === item.id ? "stroke-[2.5px]" : "stroke-[1.5px]"
                    )} />
                    <span className="text-lg font-bold tracking-tight">
                      {item.label}
                    </span>
                    {activeTab === item.id && (
                      <motion.div 
                        layoutId="activeGlow"
                        className="absolute right-4 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-auto pt-8 border-t border-stone-100">
                <div className="flex items-center gap-4 p-4">
                  <img 
                    src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-stone-100" 
                    alt="User"
                  />
                  <div>
                    <p className="font-bold text-natural-text line-clamp-1">{user.displayName || 'Traveler'}</p>
                    <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Premium Member</p>
                  </div>
                </div>
              </div>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


