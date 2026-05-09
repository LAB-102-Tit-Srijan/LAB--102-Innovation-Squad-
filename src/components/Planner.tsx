import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Wallet, 
  ArrowRight,
  Utensils,
  Camera,
  Compass
} from 'lucide-react';
import { motion } from 'motion/react';
import { geminiService } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export default function Planner() {
  const { user } = useAuth();
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState({ min: 5000, max: 20000 });
  const [category, setCategory] = useState('Student');
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<any>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const result = await geminiService.generateItinerary(destination, budget, category, days);
      setItinerary(result.itinerary);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1 px-2">
        <h1 className="text-3xl font-serif font-bold text-natural-text flex items-center gap-3">
          AI Planner
          <div className="bg-primary rounded-full p-2 shadow-lg shadow-primary/20">
            <Sparkles className="w-4 h-4 text-white fill-white" />
          </div>
        </h1>
        <p className="text-stone-400 font-medium italic tracking-tight">Personalized trips crafted for you.</p>
      </header>

      {!itinerary ? (
        <div className="bg-white p-10 rounded-[32px] shadow-sm border border-natural-border space-y-8">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase text-stone-400 mb-3 block tracking-widest">Destination</label>
              <input 
                type="text" 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Where to next?" 
                className="w-full bg-stone-50 border border-natural-border rounded-[20px] p-5 font-bold text-natural-text focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold uppercase text-stone-400 mb-3 block tracking-widest">Days</label>
                <div className="flex items-center justify-between bg-stone-50 border border-natural-border rounded-[20px] px-6 py-3">
                  <button onClick={() => setDays(Math.max(1, days-1))} className="text-xl font-bold text-stone-400 hover:text-primary transition-colors">-</button>
                  <span className="font-bold text-lg font-mono">{days}</span>
                  <button onClick={() => setDays(days+1)} className="text-xl font-bold text-stone-400 hover:text-primary transition-colors">+</button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-stone-400 mb-3 block tracking-widest">Budget (Range)</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-stone-400">₹</span>
                    <input 
                      type="number"
                      value={budget.min}
                      onChange={(e) => setBudget({ ...budget, min: Number(e.target.value) })}
                      className="w-full bg-stone-50 border border-natural-border rounded-xl py-3 pl-6 pr-2 font-bold text-xs text-natural-text focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Min"
                    />
                  </div>
                  <span className="text-stone-300">—</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-stone-400">₹</span>
                    <input 
                      type="number"
                      value={budget.max}
                      onChange={(e) => setBudget({ ...budget, max: Number(e.target.value) })}
                      className="w-full bg-stone-50 border border-natural-border rounded-xl py-3 pl-6 pr-2 font-bold text-xs text-natural-text focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-stone-400 mb-3 block tracking-widest">Traveling style</label>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {['Student', 'Couple', 'Family', 'Solo'].map(c => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={cn(
                      "px-8 py-3.5 rounded-[20px] text-sm font-bold transition-all border",
                      category === c ? "bg-stone-900 border-stone-900 text-white shadow-xl" : "bg-white border-natural-border text-stone-400"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={generate}
            disabled={loading || !destination}
            className="w-full py-5 bg-primary text-white rounded-[24px] font-bold text-lg shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 transition-transform"
          >
            {loading ? 'Thinking...' : (
              <>
                Create Magic Plan <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <button onClick={() => setItinerary(null)} className="text-orange-500 font-bold border-b-2 border-orange-500">Plan New Trip</button>
            <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-3 py-1 rounded-full uppercase">AI Optimized</span>
          </div>

          <div className="space-y-8">
            {itinerary.map((day: any) => (
              <motion.div 
                key={day.day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative pl-8 border-l border-gray-100"
              >
                <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-orange-500 ring-4 ring-orange-100" />
                <h3 className="text-2xl font-black text-gray-900">Day {day.day}</h3>
                
                <div className="mt-4 space-y-4">
                  <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <Compass className="w-4 h-4 text-orange-500" />
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Activities</span>
                    </div>
                    <ul className="space-y-2">
                      {day.activities.map((act: string, i: number) => (
                        <li key={i} className="text-sm font-bold text-gray-600 flex items-center gap-2 leading-relaxed">
                          <div className="w-1 h-1 rounded-full bg-gray-300" /> {act}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-orange-50 p-5 rounded-[2rem] border border-orange-100/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Utensils className="w-4 h-4 text-orange-500" />
                      <span className="text-[10px] font-black uppercase text-orange-400 tracking-widest">Local Eats</span>
                    </div>
                    <p className="text-sm font-bold text-orange-700/80 leading-relaxed italic">
                      “{day.food.join(', ')}”
                    </p>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="w-4 h-4 text-gray-400" />
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Pro Budget Tip</span>
                    </div>
                    <p className="text-xs font-medium text-gray-500">{day.budgetTip}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

