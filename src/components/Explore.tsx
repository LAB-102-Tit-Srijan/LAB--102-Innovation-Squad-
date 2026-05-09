import React, { useState, useEffect } from 'react';
import { Search, MapPin, Bike, Home, Coffee, Filter, Heart, Star, ShieldCheck, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency, cn } from '../lib/utils';
import { stayService, rentalService } from '../lib/firestoreService';

const CATEGORIES = [
  { id: 'all', name: 'All', icon: Search },
  { id: 'female-only', name: 'Female-only', icon: Star },
  { id: 'couples', name: 'Couples', icon: Heart },
  { id: 'students', name: 'Students', icon: Coffee },
  { id: 'families', name: 'Families', icon: Users },
];

const SEED_DATA = {
  "stays": [
    {
      "id": "bpl_stay_01",
      "city": "Bhopal",
      "name": "Lakeview Student Residency",
      "category": "Students",
      "price_per_night": 800,
      "hourly_rate": 150,
      "is_verified": true,
      "tags": ["Budget", "Near LNCT", "Wifi"],
      "safety_score": 4.8,
      "image": "https://images.unsplash.com/photo-1555854817-5b1746a86f9e?auto=format&fit=crop&q=80&w=800"
    },
    {
      "id": "bpl_stay_02",
      "city": "Bhopal",
      "name": "Sanskriti Mahila Niwas",
      "category": "Female-only",
      "price_per_night": 1200,
      "is_verified": true,
      "tags": ["Safe for Solo Women", "Homemade Food"],
      "safety_score": 5.0,
      "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800"
    },
    {
      "id": "vrn_stay_01",
      "city": "Vrindavan",
      "name": "Radhe Kripa Homestay",
      "category": "Families",
      "price_per_night": 2500,
      "is_verified": true,
      "tags": ["Jain Food", "Near Temple", "Peaceful"],
      "safety_score": 4.7,
      "image": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800"
    },
    {
      "id": "agr_stay_01",
      "city": "Agra",
      "name": "Taj Heritage View",
      "category": "Couples",
      "price_per_night": 3500,
      "is_verified": true,
      "tags": ["Premium", "View of Taj", "Verified Host"],
      "safety_score": 4.9,
      "image": "https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=800"
    },
    {
      "id": "drz_stay_01",
      "city": "Darjeeling",
      "name": "Tea Garden Cottage",
      "category": "Budget",
      "price_per_night": 600,
      "hourly_rate": 100,
      "is_verified": false,
      "tags": ["Budget", "Nature", "Trekking"],
      "safety_score": 4.2,
      "image": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800"
    }
  ],
  "rentals": [
    {
      "id": "bpl_bike_01",
      "city": "Bhopal",
      "vehicle_type": "Scooters",
      "model": "Activa 6G",
      "price_per_hour": 60,
      "full_day_price": 500,
      "fuel_included": false,
      "helmet_provided": true,
      "verification_required": "Aadhaar + License",
      "host_name": "Raja Bhoj Rentals",
      "image": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800"
    },
    {
      "id": "vrn_bike_01",
      "city": "Vrindavan",
      "vehicle_type": "Electric Bikes",
      "model": "Hero Electric",
      "price_per_hour": 40,
      "full_day_price": 350,
      "fuel_included": true,
      "helmet_provided": true,
      "verification_required": "Phone OTP",
      "host_name": "Bhakti Wheels",
      "image": "https://images.unsplash.com/photo-1591456019231-64157778939c?auto=format&fit=crop&q=80&w=800"
    },
    {
      "id": "agr_car_01",
      "city": "Agra",
      "vehicle_type": "Cars",
      "model": "Maruti Swift",
      "price_per_hour": 250,
      "full_day_price": 1800,
      "fuel_included": false,
      "helmet_provided": false,
      "verification_required": "ID + Face Verification",
      "host_name": "Agra Express",
      "image": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800"
    }
  ]
};

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [stays, setStays] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStays = async () => {
      let stayData = await stayService.getAllStays();
      let rentalData = await rentalService.getAllRentals();
      
      if (!stayData || stayData.length === 0) {
        await stayService.seedStays(SEED_DATA.stays);
        stayData = await stayService.getAllStays();
      }

      if (!rentalData || rentalData.length === 0) {
        await rentalService.seedRentals(SEED_DATA.rentals);
        rentalData = await rentalService.getAllRentals();
      }
      
      setStays(stayData || []);
      setRentals(rentalData || []);
      setLoading(false);
    };

    fetchStays();
  }, []);

  const filteredStays = stays.filter(s => {
    const matchesCat = activeCat === 'all' || s.category.toLowerCase().includes(activeCat.replace('-', ''));
    const matchesSearch = s.city.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredRentals = rentals.filter(r => {
    return r.city.toLowerCase().includes(searchQuery.toLowerCase()) || 
           r.model.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-stone-400 group-focus-within:text-primary transition-colors" />
        </div>
        <input 
          type="text" 
          placeholder="Search by city (e.g. Bhopal, Agra)" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-natural-border rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium outline-none"
        />
        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-stone-50 rounded-lg">
          <Filter className="w-4 h-4 text-stone-500" />
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar px-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap font-bold text-sm transition-all",
              activeCat === cat.id 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "bg-white text-stone-600 border border-natural-border hover:bg-stone-50"
            )}
          >
            <cat.icon className="w-4 h-4" />
            {cat.name}
          </button>
        ))}
      </div>

      {/* Stays Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-serif font-bold text-natural-text">
            {searchQuery ? `Stays in ${searchQuery}` : 'Featured Stays'}
          </h2>
          <button className="text-primary text-sm font-bold">View all</button>
        </div>

        {loading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-stone-100 animate-pulse h-64 rounded-[32px]"></div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredStays.length > 0 ? (
              filteredStays.map(stay => (
                <motion.div 
                  key={stay.id}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-natural-border group cursor-pointer"
                >
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <img src={stay.image} alt={stay.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {stay.is_verified && (
                        <div className="bg-white/90 backdrop-blur py-1.5 px-3 rounded-full flex items-center gap-1 shadow-sm border border-natural-border">
                          <ShieldCheck className="w-3 h-3 text-green-600" />
                          <span className="text-[10px] font-bold text-green-800 uppercase">Verified</span>
                        </div>
                      )}
                      {stay.hourly_rate && (
                        <div className="bg-primary/90 backdrop-blur py-1.5 px-3 rounded-full flex items-center gap-1 shadow-sm border border-primary/20 text-white">
                          <span className="text-[10px] font-bold uppercase tracking-wider">Hourly Available</span>
                        </div>
                      )}
                    </div>

                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur py-1.5 px-3 rounded-full flex items-center gap-1 shadow-sm border border-natural-border">
                      <Star className="w-3 h-3 text-primary fill-primary" />
                      <span className="text-xs font-bold">{stay.safety_score}</span>
                    </div>

                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                      {stay.tags?.map((tag: string) => (
                        <span key={tag} className="bg-black/60 backdrop-blur text-white text-[9px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 flex justify-between items-end">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-primary text-[10px] font-bold uppercase tracking-widest leading-none">{stay.category}</span>
                        <span className="text-stone-300 text-[10px] uppercase font-bold tracking-widest leading-none">•</span>
                        <span className="text-stone-400 text-[10px] font-bold uppercase tracking-widest leading-none">{stay.city}</span>
                      </div>
                      <h3 className="text-xl font-serif font-bold text-natural-text mt-2">{stay.name}</h3>
                      <p className="text-stone-500 text-sm mt-1 font-medium italic">Starting from <span className="text-natural-text font-bold font-mono">{formatCurrency(stay.price_per_night)}</span>/night</p>
                      {stay.hourly_rate && (
                        <p className="text-stone-400 text-[10px] font-bold uppercase tracking-tighter mt-1">Short stay: {formatCurrency(stay.hourly_rate)}/hr</p>
                      )}
                    </div>
                    <button className="bg-stone-900 text-white p-4 rounded-2xl active:scale-90 transition-transform shadow-lg">
                      <MapPin className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-white p-12 rounded-[32px] text-center border border-dashed border-stone-200">
                <p className="text-stone-400 font-serif text-lg italic">No stays found for this search.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Rentals Banner */}
      <div className="bg-stone-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-stone-200">
        <div className="relative z-10 w-2/3 space-y-4">
          <h3 className="text-3xl font-serif font-bold leading-tight">Explore on two wheels.</h3>
          <p className="text-stone-400 text-sm font-medium italic">Bikes & Scooters starting at ₹49/hour.</p>
          <button className="bg-primary text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-transform">
            Rent Now
          </button>
        </div>
        <Bike className="absolute -right-8 -bottom-8 w-44 h-44 text-stone-800 rotate-12 opacity-50" />
      </div>

      {/* Rentals Section */}
      <section className="space-y-4 pb-10">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-serif font-bold text-natural-text">Nearby Rentals</h2>
          <button className="text-primary text-sm font-bold">View all</button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-1">
          {filteredRentals.length > 0 ? (
            filteredRentals.map(rental => (
              <motion.div 
                key={rental.id}
                whileTap={{ scale: 0.98 }}
                className="min-w-[280px] bg-white rounded-[24px] overflow-hidden shadow-sm border border-natural-border group flex flex-col"
              >
                <div className="h-40 relative overflow-hidden">
                  <img src={rental.image} alt={rental.model} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur py-1 px-2 rounded-lg shadow-sm">
                    <span className="text-[10px] font-bold text-natural-text">{rental.vehicle_type}</span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-natural-text">{rental.model}</h4>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{rental.city}</p>
                    </div>
                    <span className="text-primary font-bold font-mono">{formatCurrency(rental.price_per_hour)}<span className="text-[10px] text-stone-400">/hr</span></span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-stone-50">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-tighter">{rental.verification_required}</span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="min-w-full bg-white p-8 rounded-[24px] text-center border border-dashed border-stone-200">
               <p className="text-stone-400 font-medium italic">No rentals available.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

