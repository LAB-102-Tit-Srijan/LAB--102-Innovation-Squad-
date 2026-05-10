import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import { 
  Navigation2, 
  ChevronRight, 
  Star, 
  MapPin, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div ref={containerRef} className="bg-white overflow-x-hidden no-scrollbar">
      <HeroSection onStart={onStart} />
      <AdventureSection />
      <FoodSection />
      <StaySection onStart={onStart} />
      
      {/* Footer / Final CTA */}
      <footer className="py-20 px-8 bg-stone-900 text-center space-y-8">
        <h2 className="text-4xl font-serif font-bold text-white leading-tight">
          Ready to find the <span className="text-amber-500 italic">real</span> India?
        </h2>
        <button 
          onClick={onStart}
          className="px-12 py-5 bg-amber-500 text-stone-900 rounded-full font-black uppercase tracking-widest text-sm hover:bg-amber-400 transition-all active:scale-95 shadow-2xl shadow-amber-500/20"
        >
          Begin Your Journey
        </button>
      </footer>
    </div>
  );
}

function HeroSection({ onStart }: { onStart: () => void }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Parallax Background */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0 z-0"
      >
        <img 
          src="https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-[120%] object-cover brightness-[0.7]"
          alt="Varanasi Aarti"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-black/40" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 space-y-8">
        <motion.div
          initial={{ opacity: 0, filter: 'blur(20px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="space-y-4"
        >
          <span className="text-amber-400 font-black uppercase tracking-[0.4em] text-xs">Namaste / Discover</span>
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-white tracking-tighter leading-[0.9]">
            Explore the <br />
            <span className="italic text-amber-500 drop-shadow-2xl">Soul</span> of India
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex flex-col items-center gap-6"
        >
          <p className="text-white/70 max-w-md text-lg font-medium italic">
            From the spiritual ghats of Kashi to the rugged bike trails of Ladakh.
          </p>
          <button 
            onClick={onStart}
            className="group flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 rounded-full text-white font-bold hover:bg-white hover:text-stone-900 transition-all duration-500"
          >
            Start Exploring
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>

      <motion.div 
        style={{ opacity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className="w-px h-12 bg-gradient-to-b from-amber-500/0 via-amber-500 to-amber-500/0 animate-bounce" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Scroll Down</span>
      </motion.div>
    </section>
  );
}

function AdventureSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  return (
    <section ref={ref} className="bg-emerald-950 flex flex-col md:flex-row h-screen md:h-auto min-h-screen overflow-hidden">
      {/* Image Side */}
      <motion.div 
        initial={{ x: '-100%' }}
        animate={isInView ? { x: 0 } : { x: '-100%' }}
        transition={{ duration: 1, ease: 'circOut' }}
        className="flex-1 relative h-[50vh] md:h-screen"
      >
        <img 
          src="https://images.unsplash.com/photo-1544735032-6a686119339e?auto=format&fit=crop&q=80&w=1200" 
          className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
          alt="Biking in Himalayas"
        />
        <div className="absolute inset-0 bg-emerald-950/20" />
      </motion.div>

      {/* Content Side */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={isInView ? { x: 0 } : { x: '100%' }}
        transition={{ duration: 1, ease: 'circOut' }}
        className="flex-1 bg-emerald-900 p-12 md:p-24 flex flex-col justify-center space-y-8"
      >
        <div className="space-y-4">
          <div className="w-12 h-1 bg-emerald-400" />
          <span className="text-emerald-400 font-black uppercase tracking-widest text-[10px]">Adventure awaits</span>
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-white tracking-tighter leading-tight">
            Ride Through the <br />
            <span className="italic text-emerald-300">Wild Ridges</span>
          </h2>
        </div>
        
        <p className="text-emerald-100/70 text-lg leading-relaxed max-w-md">
          Discover unseen trails, mechanical serenity, and the raw power of the Indian mountains. Gear up for the ride of your life.
        </p>

        <div className="grid grid-cols-2 gap-8 pt-8">
          <div className="space-y-1">
            <p className="text-4xl font-black text-white font-mono">14K+</p>
            <p className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest">Alt (Feet)</p>
          </div>
          <div className="space-y-1">
            <p className="text-4xl font-black text-white font-mono">500+</p>
            <p className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest">Bike Trails</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function FoodSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const foods = [
    { name: 'Pani Puri', location: 'Sarafa, Indore', image: 'https://images.unsplash.com/photo-1626500155552-6f2946c65691?auto=format&fit=crop&q=80&w=400', color: 'bg-amber-500' },
    { name: 'Poha Jalebi', location: 'Itwara, Bhopal', image: 'https://images.unsplash.com/photo-1601050638917-3d8bc6148a0a?auto=format&fit=crop&q=80&w=400', color: 'bg-orange-500' },
    { name: 'Lassi', location: 'Kullad, Varanasi', image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed2bb4?auto=format&fit=crop&q=80&w=400', color: 'bg-stone-200' },
    { name: 'Momos', location: 'Mall Rd, Nainital', image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&q=80&w=400', color: 'bg-emerald-500' },
  ];

  return (
    <section ref={ref} className="py-32 px-4 md:px-8 bg-stone-50">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <span className="text-stone-400 font-black uppercase tracking-[0.3em] text-[10px]">Taste of India</span>
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-natural-text tracking-tighter">
              The Street <br />
              Food <span className="italic text-orange-500">Explorer</span>
            </h2>
          </div>
          <p className="text-stone-500 text-lg max-w-sm italic">
            From tang of the north to the spice of the south. We map the icons.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {foods.map((food, i) => (
            <motion.div
              key={food.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              whileHover={{ scale: 1.05 }}
              className="group relative h-[400px] rounded-[40px] overflow-hidden cursor-pointer shadow-xl"
            >
              <img src={food.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={food.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="absolute bottom-8 left-8 right-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1">Famous At</p>
                <h4 className="text-2xl font-bold text-white mb-2">{food.location}</h4>
                <div className="w-full h-1 bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                <p className="text-white/60 text-sm mt-4 font-medium">{food.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StaySection({ onStart }: { onStart: () => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="relative h-screen bg-stone-950 flex items-center overflow-hidden">
      {/* Background with Ken Burns Effect */}
      <motion.div 
        initial={{ scale: 1 }}
        whileInView={{ scale: 1.2 }}
        transition={{ duration: 20, ease: "linear" }}
        className="absolute inset-0 z-0"
      >
        <img 
          src="https://images.unsplash.com/photo-1578683062331-1596cbe4f603?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover brightness-[0.4]"
          alt="Luxury Stay"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/40 to-transparent" />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 1 }}
          className="max-w-2xl space-y-8"
        >
          <div className="space-y-4">
            <span className="text-amber-500 font-black uppercase tracking-[0.4em] text-[10px]">Luxury Accommodations</span>
            <h2 className="text-5xl md:text-8xl font-serif font-bold text-white tracking-tighter leading-[0.9]">
              Live the <span className="italic text-amber-500">Royal</span> <br /> Heritage
            </h2>
          </div>
          
          <p className="text-white/60 text-xl font-medium leading-relaxed italic">
            "Experience Indian hospitality that treats you like a Maharaja. From heritage palaces to modern skyline suites."
          </p>

          <div className="flex items-center gap-8 py-4">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-2 border-stone-900 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="user" />
                </div>
              ))}
            </div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Joined by 12K+ verified hosts</p>
          </div>

          <button 
            onClick={onStart}
            className="group px-10 py-5 bg-white text-stone-900 rounded-full font-black uppercase tracking-widest text-sm flex items-center gap-3 hover:bg-amber-500 transition-all duration-500 shadow-2xl"
          >
            Find Your Palace
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
