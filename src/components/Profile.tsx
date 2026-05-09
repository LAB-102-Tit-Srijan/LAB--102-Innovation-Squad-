import React from 'react';
import { 
  ShieldCheck, 
  Award, 
  Crown, 
  History, 
  Settings, 
  LogOut,
  ChevronRight,
  TrendingUp,
  Fingerprint
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, cn } from '../lib/utils';

export default function Profile() {
  const { user, profile, logout } = useAuth();

  const stats = [
    { label: 'Trust Score', value: profile?.trustScore || '70', icon: TrendingUp, color: 'text-green-500' },
    { label: 'Trips', value: '12', icon: History, color: 'text-blue-500' },
    { label: 'Status', value: profile?.premiumMember ? 'Premium' : 'Free', icon: Crown, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col items-center text-center space-y-6 px-4">
        <div className="relative">
          <div className="w-32 h-32 rounded-[40px] border-[6px] border-white shadow-2xl overflow-hidden ring-1 ring-stone-100 rotate-2 hover:rotate-0 transition-transform duration-500">
            <img 
              src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
              alt="Avatar" 
              className="w-full h-full object-cover scale-110"
            />
          </div>
          {profile?.isVerified && (
            <div className="absolute -bottom-3 -right-3 bg-green-500 p-2.5 rounded-2xl border-[3px] border-white shadow-xl shadow-green-100">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
        <div>
          <h1 className="text-4xl font-serif font-bold text-natural-text leading-tight">{profile?.name}</h1>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-[10px] font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full uppercase tracking-widest border border-green-200">Verified Traveler</span>
          </div>
        </div>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 px-2">
        {stats.map(s => (
          <div key={s.label} className="bg-white p-5 rounded-[28px] border border-natural-border flex flex-col items-center gap-2 shadow-sm group hover:shadow-lg transition-all">
            <div className={cn("p-2 rounded-xl bg-stone-50 group-hover:scale-110 transition-transform")}>
              <s.icon className={cn("w-5 h-5", s.color)} />
            </div>
            <span className="text-xl font-bold font-mono text-natural-text">{s.value}</span>
            <span className="text-[8px] font-bold uppercase text-stone-400 tracking-wider text-center">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Premium Membership Banner */}
      {!profile?.premiumMember && (
        <div className="bg-stone-900 rounded-[40px] p-8 text-white shadow-2xl shadow-stone-100 relative overflow-hidden group active:scale-[0.98] transition-all cursor-pointer mx-2">
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-bold leading-none">Go Premium</h3>
              <p className="text-xs text-stone-400 font-medium italic">Priority booking & 24/7 emergency support</p>
            </div>
            <Award className="w-12 h-12 text-primary opacity-80 group-hover:rotate-12 transition-transform" />
          </div>
          <div className="mt-6 flex items-center gap-3">
             <span className="text-lg font-bold font-mono">₹99</span>
             <span className="text-xs text-stone-500 uppercase font-bold tracking-widest">/ month</span>
          </div>
        </div>
      )}

      {/* Menu Sections */}
      <div className="space-y-4 px-2">
        <h4 className="text-[10px] font-bold uppercase text-stone-400 ml-6 tracking-[0.2em]">Safety & Identity</h4>
        <div className="bg-white rounded-[40px] overflow-hidden border border-natural-border shadow-sm divide-y divide-stone-50">
          <button className="w-full p-7 flex items-center justify-between group active:bg-stone-50 transition-colors">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-stone-50 rounded-[20px] group-hover:bg-primary/10 transition-colors">
                <ShieldCheck className="w-6 h-6 text-stone-600 group-hover:text-primary transition-colors" />
              </div>
              <div className="text-left">
                <span className="font-bold text-natural-text block">Government ID</span>
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">Status: UNVERIFIED</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-300" />
          </button>
          <button className="w-full p-7 flex items-center justify-between group active:bg-stone-50 transition-colors">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-stone-50 rounded-[20px] group-hover:bg-primary/10 transition-colors">
                <Fingerprint className="w-6 h-6 text-stone-600 group-hover:text-primary transition-colors" />
              </div>
              <span className="font-bold text-natural-text">Face ID Setup</span>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-300" />
          </button>
        </div>
      </div>

      <div className="space-y-4 px-2 pb-10">
        <h4 className="text-[10px] font-bold uppercase text-stone-400 ml-6 tracking-[0.2em]">System</h4>
        <div className="bg-white rounded-[40px] overflow-hidden border border-natural-border shadow-sm">
          <button onClick={logout} className="w-full p-7 flex items-center justify-between group active:bg-red-50 transition-colors">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-stone-50 rounded-[20px] group-hover:bg-red-500 transition-colors">
                <LogOut className="w-6 h-6 text-red-500 group-hover:text-white transition-colors" />
              </div>
              <span className="font-bold text-red-500">Logout</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

