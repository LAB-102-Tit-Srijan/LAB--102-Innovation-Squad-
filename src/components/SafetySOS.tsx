import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  PhoneCall, 
  Users, 
  HeartPulse,
  Navigation,
  Share2,
  ShieldCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function SafetySOS() {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (isSOSActive) {
      if ("geolocation" in navigator) {
        watchId.current = navigator.geolocation.watchPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setLocationError(null);
            console.log("Live location updated:", position.coords.latitude, position.coords.longitude);
          },
          (error) => {
            console.error("Error accessing location:", error);
            setLocationError("Unable to access location. Please check permissions.");
          },
          { enableHighAccuracy: true }
        );
      } else {
        setLocationError("Geolocation is not supported by your browser.");
      }
    } else {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      setLocation(null);
    }

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [isSOSActive]);

  return (
    <div className="space-y-12 flex flex-col items-center">
      <header className="space-y-1 text-center w-full px-4">
        <h1 className="text-3xl font-serif font-bold text-natural-text">Safety Center</h1>
        <p className="text-stone-400 font-medium italic tracking-tight uppercase text-[10px] tracking-[0.2em] mt-2">One tap to get help, anytime.</p>
      </header>

      {/* SOS Button */}
      <div className="relative py-8 flex flex-col items-center">
        <AnimatePresence>
          {isSOSActive && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.6, opacity: 0.2 }}
              exit={{ scale: 2.2, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 bg-red-500 rounded-full"
            />
          )}
        </AnimatePresence>
        
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSOSActive(!isSOSActive)}
          className={cn(
            "relative z-10 w-52 h-52 rounded-full flex flex-col items-center justify-center gap-3 shadow-2xl transition-all duration-500 border-[12px]",
            isSOSActive 
              ? "bg-red-600 border-red-500/30 scale-105 shadow-red-200" 
              : "bg-white border-stone-50 shadow-stone-200 shadow-xl"
          )}
        >
          <div className={cn(
            "p-5 rounded-[2rem] transition-colors",
            isSOSActive ? "bg-white/10" : "bg-red-50"
          )}>
            <ShieldAlert className={cn("w-16 h-16", isSOSActive ? "text-white" : "text-red-500")} />
          </div>
          <span className={cn("font-bold tracking-[0.2em] text-lg uppercase", isSOSActive ? "text-white" : "text-red-600")}>
            {isSOSActive ? 'SOS ACTIVE' : 'SOS'}
          </span>
        </motion.button>

        <AnimatePresence>
          {isSOSActive && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-8 text-center"
            >
              <div className="flex items-center gap-2 text-red-600 font-bold animate-pulse text-sm">
                <Share2 className="w-4 h-4" />
                <span>Sharing Live Location with Emergency Contacts</span>
              </div>
              {location ? (
                <div className="text-[10px] text-stone-400 font-mono mt-1">
                  Coords: {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-center mt-1 text-[10px] text-stone-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Fetching current coordinates...</span>
                </div>
              )}
              {locationError && (
                <p className="text-red-500 text-[10px] mt-1 font-bold">{locationError}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-5 w-full">
        <button className="bg-white p-8 rounded-[40px] shadow-sm border border-natural-border flex flex-col gap-4 items-center text-center group active:scale-95 transition-all">
          <div className="p-4 bg-stone-50 rounded-[20px] group-hover:bg-stone-900 group-hover:text-white transition-all shadow-inner">
            <Users className="w-7 h-7 text-stone-500 group-hover:text-white" />
          </div>
          <span className="text-xs font-bold text-natural-text uppercase tracking-widest leading-relaxed">Notify Trusted Contacts</span>
        </button>
        <button className="bg-white p-8 rounded-[40px] shadow-sm border border-natural-border flex flex-col gap-4 items-center text-center group active:scale-95 transition-all">
          <div className="p-4 bg-stone-50 rounded-[20px] group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
            <HeartPulse className="w-7 h-7 text-primary group-hover:text-white" />
          </div>
          <span className="text-xs font-bold text-natural-text uppercase tracking-widest leading-relaxed">Nearby Hospitals</span>
        </button>
      </div>

      {/* Safety Shield Info */}
      <section className="bg-stone-900 rounded-[48px] p-10 w-full text-white relative overflow-hidden shadow-2xl shadow-stone-200">
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500 rounded-2xl shadow-lg shadow-green-900/40">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-serif font-bold tracking-tight">AI Safety Shield</h3>
          </div>
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-green-400 mt-2 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
              <p className="text-sm text-stone-300 leading-relaxed font-medium">Real-time threat detection based on travel patterns and suspicious events.</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-green-400 mt-2 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
              <p className="text-sm text-stone-300 leading-relaxed font-medium">Every host is vetted with zero-trust multi-level ID & Face verification.</p>
            </div>
          </div>
          <button className="w-full bg-white text-stone-900 py-5 rounded-[20px] font-bold shadow-xl active:scale-95 transition-transform">
            Verify Your ID
          </button>
        </div>
        <AlertCircle className="absolute -right-12 -bottom-12 w-64 h-64 opacity-5 rotate-12" />
      </section>

      {/* Quick Actions */}
      <div className="flex justify-around w-full max-w-xs pt-4">
        <div className="flex flex-col items-center gap-2 opacity-50">
          <PhoneCall className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Police</span>
        </div>
        <div className="flex flex-col items-center gap-2 opacity-50">
          <Share2 className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Live Loc</span>
        </div>
        <div className="flex flex-col items-center gap-2 opacity-50">
          <Navigation className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Safe Path</span>
        </div>
      </div>
    </div>
  );
}

