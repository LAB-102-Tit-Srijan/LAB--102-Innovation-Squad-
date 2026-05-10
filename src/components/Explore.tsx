import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Bike, 
  Compass,
  Home, 
  Coffee, 
  Filter, 
  Heart, 
  Star, 
  ShieldCheck, 
  Users,
  Church,
  Hotel,
  Building,
  Utensils,
  ShieldAlert,
  Bus,
  Laptop,
  Library,
  Trees,
  ShoppingBag,
  CreditCard,
  Camera,
  Martini,
  Stethoscope,
  ChevronRight,
  RotateCcw,
  Clock,
  Navigation2,
  CheckCircle2,
  Phone,
  MessageSquare,
  Award,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, cn } from '../lib/utils';
import { stayService, rentalService, listingService } from '../lib/firestoreService';
import { guideService, GuideProfile } from '../services/guideService';
import { MOCK_PLACES } from '../data/mockPlaces';
import { MOCK_GUIDES } from '../data/mockGuides';
import GuideDetail from './GuideDetail';
import ChatWindow from './ChatWindow';

const CATEGORIES = [
  { id: 'cat_000', name: 'All', icon: Search },
  { id: 'cat_001', name: 'Temples', icon: Church, keywords: ["Temple", "Mandir", "Religious", "Spiritual", "Ghat"] },
  { id: 'cat_002', name: 'Hotels', icon: Hotel, keywords: ["Luxury", "Stay", "Suites", "Resorts"] },
  { id: 'cat_003', name: 'Hostels', icon: Users, keywords: ["Backpackers", "Bunk", "Dorm", "Hostel"] },
  { id: 'cat_004', name: 'PG', icon: Home, keywords: ["Paying Guest", "Monthly", "Student"] },
  { id: 'cat_005', name: 'Bike Rentals', icon: Bike, keywords: ["Rentals", "Bike", "Scooter", "Cycle"] },
  { id: 'cat_006', name: 'Street Food', icon: Utensils, keywords: ["Chaat", "Fast food", "Local eats"] },
  { id: 'cat_007', name: 'Emergency', icon: ShieldAlert, keywords: ["Hospital", "Police", "Pharmacy", "Medical"] }
];

const POPULAR_DESTINATIONS = [
  { name: 'Varanasi', icon: '🛕', color: 'bg-orange-50' },
  { name: 'Indore', icon: '🍕', color: 'bg-amber-50' },
  { name: 'Jaipur', icon: '🏰', color: 'bg-rose-50' },
  { name: 'Bhopal', icon: '🏛️', color: 'bg-blue-50' },
  { name: 'Manali', icon: '🏔️', color: 'bg-emerald-50' },
  { name: 'Vrindavan', icon: '🕉️', color: 'bg-yellow-50' },
  { name: 'Darjeeling', icon: '☕', color: 'bg-stone-100' },
];

export default function Explore() {
  const [selectedCity, setSelectedCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCats, setActiveCats] = useState<string[]>([]);
  const [stays, setStays] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [guides, setGuides] = useState<GuideProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [guideFilter, setGuideFilter] = useState<'closest' | 'cheapest' | 'top'>('closest');
  const [selectedGuide, setSelectedGuide] = useState<any>(null);
  const [activeChat, setActiveChat] = useState<{ isOpen: boolean; provider: any } | null>(null);

  const cities = ['Bhopal', 'Indore', 'Vrindavan', 'Manali', 'Darjeeling', 'Varanasi', 'Jaipur'];

  useEffect(() => {
    const fetchData = async () => {
      let listingData = await listingService.getAllListings();
      
      // Auto-seed if empty or missing street food
      const hasStreetFood = listingData?.some((l: any) => l.category === 'Street Food');
      if (!listingData || listingData.length === 0 || !hasStreetFood) {
        await listingService.seedListings(MOCK_PLACES);
        listingData = await listingService.getAllListings();
      }

      let rentalData = await rentalService.getAllRentals();
      setStays(listingData || []);
      setRentals(rentalData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      const fetchGuides = async () => {
        const cityGuides = await guideService.getGuidesByCity(selectedCity);
        // Map mock guides to fit GuideProfile if needed, but for now filtering works
        const relevantMockGuides = (MOCK_GUIDES as any[]).filter(g => g.baseLocation.cityName.toLowerCase() === selectedCity.toLowerCase());
        setGuides(cityGuides.length > 0 ? cityGuides : relevantMockGuides);
      };
      fetchGuides();
    } else {
      setGuides([]);
    }
  }, [selectedCity]);

  const toggleCategory = (catId: string) => {
    setActiveCats(prev => 
      prev.includes(catId) 
        ? prev.filter(id => id !== catId) 
        : [...prev, catId]
    );
  };

  const filteredStays = stays.filter(s => {
    const matchesCity = !selectedCity || s.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesCat = activeCats.length === 0 || activeCats.some(catId => {
      if (catId === 'cat_000') return true;
      // Strict matching by cat_id if available, otherwise fallback to name mapping
      if (s.cat_id) return s.cat_id === catId;
      
      const cat = CATEGORIES.find(c => c.id === catId);
      if (!cat) return false;
      return s.category.toLowerCase().includes(cat.name.toLowerCase()) ||
             cat.keywords?.some(k => s.name.toLowerCase().includes(k.toLowerCase()) || s.category.toLowerCase().includes(k.toLowerCase()));
    });

    const matchesSearch = !searchQuery || 
                          s.city.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCity && matchesCat && matchesSearch;
  });

  const filteredRentals = rentals.filter(r => {
    const matchesCity = !selectedCity || r.city.toLowerCase() === selectedCity.toLowerCase();
    const isTransportSelected = activeCats.includes('cat_008');
    const matchesCat = activeCats.length === 0 || isTransportSelected;
    const matchesSearch = !searchQuery || 
                          r.city.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesCat && matchesSearch;
  });

  const sortedGuides = [...guides].sort((a, b) => {
    if (guideFilter === 'cheapest') return a.hourlyRate - b.hourlyRate;
    if (guideFilter === 'top') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="space-y-8 relative">
      <AnimatePresence>
        {selectedCity && (
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => setSelectedCity('')}
            className="fixed top-6 left-6 z-[60] w-12 h-12 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-xl border border-white/30 text-stone-900 shadow-xl transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Step 1: City Selection */}
      <div className={cn("space-y-4", selectedCity && "pt-16")}>
        <div className="bg-white/60 backdrop-blur-xl border border-natural-border p-6 rounded-[40px] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-3 block px-1">1. Pick a City</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <select 
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setActiveCats([]);
                setSearchQuery('');
              }}
              className="w-full bg-white border border-natural-border rounded-2xl py-4 pl-12 pr-10 shadow-sm focus:ring-4 focus:ring-primary/10 transition-all font-bold appearance-none text-natural-text outline-none text-lg"
            >
              <option value="">Where are we going?</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-300">
              <ChevronRight className="w-6 h-6 rotate-90" />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selectedCity && (
            <motion.div 
              initial={{ height: 0, opacity: 0, scale: 0.95 }}
              animate={{ height: 'auto', opacity: 1, scale: 1 }}
              exit={{ height: 0, opacity: 0, scale: 0.95 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-end px-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">2. Refine Your Search</label>
                  </div>
                  {activeCats.length > 0 && (
                    <button onClick={() => setActiveCats([])} className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-full">Reset All</button>
                  )}
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-stone-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    placeholder={`Search specifically within ${selectedCity}...`} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/40 backdrop-blur-md border border-natural-border rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold outline-none placeholder:text-stone-300"
                  />
                </div>

                <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar -mx-2 px-2 items-center">
                  {CATEGORIES.slice(1).map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 min-w-[70px] transition-all shrink-0",
                        activeCats.includes(cat.id) ? "scale-105" : "scale-100"
                      )}
                    >
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm border relative",
                        activeCats.includes(cat.id) ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" : "bg-white border-natural-border text-stone-500"
                      )}>
                        <cat.icon className="w-6 h-6" />
                      </div>
                      <span className={cn("text-[9px] font-bold uppercase tracking-widest text-center", activeCats.includes(cat.id) ? "text-primary" : "text-stone-400")}>
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!selectedCity ? (
        <div className="py-12 space-y-8">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-stone-100/50 backdrop-blur-md rounded-full mx-auto flex items-center justify-center mb-6 border-4 border-white shadow-inner relative">
              <Compass className="text-stone-300 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-natural-text tracking-tight">India Awaits</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {POPULAR_DESTINATIONS.map(dest => (
              <button key={dest.name} onClick={() => setSelectedCity(dest.name)} className={cn("px-6 py-3 rounded-2xl flex items-center gap-3 transition-all font-bold text-natural-text", dest.color)}>
                <span className="text-xl">{dest.icon}</span>
                <span className="text-sm">{dest.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Find Nearby Guides Section */}
          <section className="space-y-6 pt-4">
            <div className="flex items-center justify-between px-2">
              <div className="space-y-1">
                <h2 className="text-2xl font-serif font-bold text-natural-text">Find Nearby Guides</h2>
                <div className="flex gap-2">
                  {['closest', 'cheapest', 'top'].map((filter) => (
                    <button 
                      key={filter}
                      onClick={() => setGuideFilter(filter as any)}
                      className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border", 
                        guideFilter === filter ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-400 border-stone-200")}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
              {sortedGuides.map(guide => (
                <div 
                  key={guide.id}
                  className="min-w-[240px] bg-white rounded-[40px] p-6 border border-natural-border shadow-xl shadow-stone-100/50 space-y-4 cursor-pointer relative group"
                >
                  <div onClick={() => setSelectedGuide(guide)}>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-inner">
                          <img src={(guide as any).photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${guide.id}`} className="w-full h-full object-cover" />
                        </div>
                        {guide.isVerified && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 p-1 rounded-lg border-2 border-white shadow-lg">
                            <ShieldCheck className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-natural-text">{(guide as any).name || 'Verified Guide'}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-black">{guide.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-stone-400">
                      <div className="flex items-center gap-1.5">
                        <Navigation2 className="w-3 h-3 rotate-45" />
                        <span>1.2 km away</span>
                      </div>
                      <p className="text-primary">{formatCurrency(guide.hourlyRate)}/hr</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveChat({ 
                        isOpen: true, 
                        provider: { 
                          id: guide.id, 
                          name: (guide as any).name || 'Guide', 
                          type: 'Local Expert', 
                          photoURL: (guide as any).photoURL,
                          isVerified: guide.isVerified 
                        } 
                      });
                    }}
                    className="w-full py-3 bg-stone-50 hover:bg-stone-100 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-natural-text transition-all active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Chat with Guide
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Stays Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-natural-text px-2">{selectedCity} Experiences</h2>
            <div className="grid gap-8">
              {filteredStays.map(stay => (
                <div key={stay.id} className="bg-white rounded-[44px] overflow-hidden shadow-xl border border-natural-border">
                  <div className="aspect-[16/10] relative">
                    <img src={stay.image} className="w-full h-full object-cover" />
                    <div className="absolute top-6 left-6 bg-white/90 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2">
                       <span className="text-[10px] font-black uppercase tracking-widest">{stay.category}</span>
                       <span className="text-stone-300">|</span>
                       <div className="flex items-center gap-0.5">
                         <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                         <span className="text-[10px] font-black">{stay.rating || '4.5'}</span>
                       </div>
                    </div>
                  </div>
                  <div className="p-8 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-serif font-bold text-natural-text">{stay.name}</h3>
                        {stay.category === 'Street Food' && (
                          <div className="flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-widest">
                            <MapPin className="w-3 h-3" />
                            <span>Famous @ {stay.location}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-400 text-[10px] font-black uppercase tracking-tighter pt-2">
                        <Navigation2 className="w-3 h-3 rotate-45" />
                        <span>{stay.distance || '1.0 km'}</span>
                      </div>
                    </div>
                    {stay.description && (
                      <p className="text-sm text-stone-500 font-medium italic border-l-2 border-stone-100 pl-4">{stay.description}</p>
                    )}
                    <div className="flex justify-between items-center border-t border-stone-50 pt-4 gap-4">
                       <div className="flex-1">
                          <span className="text-stone-400 text-[10px] font-black uppercase tracking-widest block">
                            {stay.price_range ? 'Expected Price' : (stay.price_per_night > 0 ? 'Starting from' : 'Estimated Cost')}
                          </span>
                          <p className="text-xl font-black text-natural-text font-mono">
                            {stay.price_range ? stay.price_range : (stay.price_per_night > 0 ? `${formatCurrency(stay.price_per_night)}` : 'Entry Free')}
                          </p>
                       </div>
                       <button 
                         onClick={() => setActiveChat({ 
                           isOpen: true, 
                           provider: { 
                             id: stay.id, 
                             name: stay.name, 
                             type: stay.category, 
                             photoURL: stay.image,
                             isVerified: stay.isVerified 
                           } 
                         })}
                         className="px-6 py-4 bg-primary text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all"
                       >
                         <MessageSquare className="w-4 h-4" />
                         Chat
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Rentals Section */}
          <section className="space-y-4 pb-10">
            <h2 className="text-2xl font-serif font-bold text-natural-text px-2">Nearby Rentals</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-1">
              {filteredRentals.map(rental => (
                <div key={rental.id} className="min-w-[280px] bg-white rounded-[24px] overflow-hidden shadow-sm border border-natural-border p-4">
                  <img src={rental.image} className="w-full h-40 object-cover rounded-xl mb-4" />
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                       <h4 className="font-bold text-natural-text">{rental.model}</h4>
                       <p className="text-primary font-bold">{formatCurrency(rental.daily_rate || 500)}/hr</p>
                    </div>
                    <button 
                      onClick={() => setActiveChat({ 
                        isOpen: true, 
                        provider: { 
                          id: rental.id, 
                          name: rental.model, 
                          type: 'Vehicle Partner', 
                          photoURL: rental.image,
                          isVerified: true 
                        } 
                      })}
                      className="p-3 bg-stone-100 hover:bg-primary hover:text-white text-stone-500 rounded-xl transition-all active:scale-95"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <AnimatePresence>
        {selectedGuide && (
          <GuideDetail 
            guide={{
              ...selectedGuide,
              name: (selectedGuide as any).name || 'Verified Guide',
              photoURL: (selectedGuide as any).photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedGuide.id}`
            }} 
            onClose={() => setSelectedGuide(null)} 
          />
        )}
      </AnimatePresence>

      {/* Chat Window */}
      {activeChat && (
        <ChatWindow 
          isOpen={activeChat.isOpen}
          provider={activeChat.provider}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}
