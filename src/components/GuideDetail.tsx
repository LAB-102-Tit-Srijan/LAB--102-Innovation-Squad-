import React from 'react';
import { 
  ArrowLeft, 
  Star, 
  Navigation2, 
  ShieldCheck, 
  MessageSquare, 
  Phone, 
  MapPin, 
  Globe, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, cn } from '../lib/utils';
import { GuideProfile } from '../services/guideService';

interface GuideDetailProps {
  guide: GuideProfile & { name: string; photoURL: string };
  onClose: () => void;
}

export default function GuideDetail({ guide, onClose }: GuideDetailProps) {
  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="relative bg-white w-full max-w-lg rounded-[44px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 z-20 w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 rounded-full hover:bg-white/40 transition-all text-white shadow-xl"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="h-64 relative shrink-0">
          <img 
            src={`https://images.unsplash.com/photo-1539635278303-d4002c07dee3?auto=format&fit=crop&q=80&w=800`} 
            alt="City Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
          
          <div className="absolute -bottom-10 left-8">
            <div className="w-24 h-24 rounded-[32px] border-4 border-white shadow-2xl overflow-hidden bg-white">
              <img src={guide.photoURL} alt={guide.name} className="w-full h-full object-cover" />
            </div>
            {guide.isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-green-500 p-1.5 rounded-xl border-2 border-white shadow-lg">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pt-14 px-8 pb-32 space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-serif font-bold text-natural-text leading-tight">{guide.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-black text-sm">{guide.rating}</span>
                  <span className="text-stone-300 text-xs">•</span>
                  <span className="text-stone-400 text-xs font-bold uppercase tracking-widest">{guide.baseLocation.cityName}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-primary font-mono">{formatCurrency(guide.hourlyRate)}<span className="text-xs font-bold text-stone-300">/hr</span></p>
                <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em]">Base Price</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {guide.languages.map(lang => (
                <span key={lang} className="bg-stone-50 border border-stone-100 text-stone-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                  {lang}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">About Me</h4>
            <p className="text-stone-600 text-sm leading-relaxed font-medium italic">
              "{guide.bio}"
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Experience</h4>
            <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100 italic text-sm text-stone-500 leading-relaxed font-medium">
              {guide.experience}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-bold text-sm">Safety Reminder</span>
            </div>
            <p className="text-xs text-amber-600 leading-relaxed font-medium">
              We recommend meeting guides in well-lit, public locations for the first interview. Always inform a group member or use the SOS feature if you feel unsafe.
            </p>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-stone-100 flex gap-4">
          <button className="flex-[1] bg-stone-100 text-stone-900 p-5 rounded-[24px] font-bold text-sm flex items-center justify-center gap-3 active:scale-95 transition-transform">
            <MessageSquare className="w-5 h-5" />
            Chat
          </button>
          <a 
            href={`tel:${guide.phoneNumber}`}
            className="flex-[2] bg-stone-900 text-white p-5 rounded-[24px] font-bold text-sm flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-transform"
          >
            <Phone className="w-5 h-5" />
            Call Guide
          </a>
        </div>
      </motion.div>
    </div>
  );
}
