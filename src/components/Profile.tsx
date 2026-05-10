import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Award, 
  Crown, 
  History, 
  Settings, 
  LogOut,
  ChevronRight,
  TrendingUp,
  Fingerprint,
  Users,
  CheckCircle2,
  MapPin,
  Globe,
  IndianRupee,
  Briefcase,
  FileText,
  Upload,
  X,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, cn } from '../lib/utils';
import { guideService } from '../services/guideService';
import { motion, AnimatePresence } from 'motion/react';

export default function Profile() {
  const { user, profile, logout } = useAuth();
  const [showGuideForm, setShowGuideForm] = useState(false);
  const [showHostForm, setShowHostForm] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userListings, setUserListings] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  const [formData, setFormData] = useState({
    bio: '',
    experience: '',
    hourlyRate: 500,
    languages: 'Hindi, English',
    phoneNumber: '',
    cityName: 'Bhopal'
  });

  const [hostData, setHostData] = useState({
    name: '',
    type: 'PG',
    city: 'Bhopal',
    location: '',
    price_range: '',
    description: '',
    images: [] as string[],
    governmentIdUrl: '',
    propertyDocsUrl: ''
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  const addImage = () => {
    if (newImageUrl && newImageUrl.startsWith('http')) {
      setHostData(prev => ({ ...prev, images: [...prev.images, newImageUrl] }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setHostData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const generateSampleImages = () => {
    const samples = {
      'PG': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800',
      'Hotel': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
      'Hostel': 'https://images.unsplash.com/photo-1555854817-40e098e05130?auto=format&fit=crop&q=80&w=800',
      'Emergency Home Stay': 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=800'
    };
    const url = samples[hostData.type as keyof typeof samples] || samples['Hotel'];
    setHostData(prev => ({ ...prev, images: [...prev.images, url] }));
  };

  React.useEffect(() => {
    const fetchListings = async () => {
      if (!user) return;
      try {
        const { listingService } = await import('../lib/firestoreService');
        const listings = await listingService.getHostListings(user.uid);
        setUserListings(listings || []);
      } catch (err) {
        console.error("Error fetching listings:", err);
      } finally {
        setLoadingListings(false);
      }
    };
    fetchListings();
  }, [user]);

  const stats = [
    { label: 'Trust Score', value: profile?.trustScore || '70', icon: TrendingUp, color: 'text-green-500' },
    { label: 'Trips', value: '12', icon: History, color: 'text-blue-500' },
    { label: 'Status', value: profile?.premiumMember ? 'Premium' : 'Free', icon: Crown, color: 'text-orange-500' },
  ];

  const handleRegister = async () => {
    setIsSubmitting(true);
    try {
      await guideService.registerGuide({
        bio: formData.bio,
        experience: formData.experience,
        hourlyRate: Number(formData.hourlyRate),
        languages: formData.languages.split(',').map(l => l.trim()),
        phoneNumber: formData.phoneNumber,
        baseLocation: {
          lat: 23.2599, // Static for demo
          lng: 77.4126,
          cityName: formData.cityName
        }
      });
      setShowGuideForm(false);
      setStep(1);
      alert('Guide registration submitted successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHostRegister = async () => {
    setIsSubmitting(true);
    try {
      // Import listingService dynamically or define it if not available
      const { listingService } = await import('../lib/firestoreService');
      await listingService.createAccommodation(user!.uid, {
        ...hostData,
        gps: { lat: 0, lng: 0 } // Default for now
      });
      
      // Refresh listings
      const updatedListings = await listingService.getHostListings(user!.uid);
      setUserListings(updatedListings || []);

      setShowHostForm(false);
      setStep(1);
      alert('Accommodation listed successfully! It will be visible after verification.');
    } catch (err) {
      console.error(err);
      alert('Failed to list property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 pb-32">
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
            <span className="text-[10px] font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full uppercase tracking-widest border border-green-200">
              {profile?.isGuide ? 'Verified Local Guide' : 'Verified Traveler'}
            </span>
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

      {/* Local Guide Section */}
      {!profile?.isGuide ? (
        <div className="bg-white border-4 border-stone-100 rounded-[44px] p-10 mx-2 space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10 space-y-4">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-serif font-bold text-natural-text">Love your city?</h3>
              <p className="text-sm text-stone-500 font-medium italic">Share your local knowledge & start earning.</p>
            </div>
            <button 
              onClick={() => setShowGuideForm(true)}
              className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Become a Local Guide
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-primary/5 border border-primary/20 rounded-[44px] p-8 mx-2 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-natural-text">Guide Profile Active</h4>
                <p className="text-[10px] text-stone-400 font-bold uppercase">Average Rating: 5.0 ⭐</p>
              </div>
           </div>
           <button className="text-primary text-[10px] font-black uppercase underline tracking-widest">Manage Service</button>
        </div>
      )}
      
      {/* Host Section */}
      <div className="bg-stone-900 border-4 border-stone-800 rounded-[44px] p-10 mx-2 space-y-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
        <div className="relative z-10 space-y-4">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-bold text-white">Host on Ghoomo</h3>
            <p className="text-sm text-stone-400 font-medium italic">List your PG, Hostel or Hotel for verified travelers.</p>
          </div>
          <button 
            onClick={() => {
              setStep(1);
              setShowHostForm(true);
            }}
            className="w-full py-4 bg-white text-stone-900 rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            List Your Property
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* My Listings Section */}
      {userListings.length > 0 && (
        <div className="space-y-6 px-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <h3 className="text-2xl font-serif font-bold text-natural-text">My Properties</h3>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Active & Pending Accommodations</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {userListings.map(listing => (
              <div key={listing.id} className="bg-white rounded-[32px] overflow-hidden border border-stone-100 flex shadow-sm group">
                <div className="w-32 h-32 relative overflow-hidden flex-shrink-0">
                  <img 
                    src={listing.images?.[0] || 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=400'} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt={listing.name}
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase tracking-widest">
                    {listing.type}
                  </div>
                </div>
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-natural-text line-clamp-1">{listing.name}</h4>
                      {listing.isVerified ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <div className="px-2 py-0.5 bg-yellow-50 text-yellow-600 rounded-full text-[8px] font-black uppercase tracking-tighter">
                          Pending
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-stone-400 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span className="text-[10px] font-bold">{listing.location}, {listing.city}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-natural-text/60 uppercase tracking-widest">{listing.price_range}</span>
                    <button className="text-[10px] font-black text-primary uppercase underline tracking-widest">Edit</button>
                  </div>
                </div>
              </div>
            ))}
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
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">Status: {profile?.governmentIdVerified ? 'VERIFIED' : 'UNVERIFIED'}</span>
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
        <div className="bg-white rounded-[40px] overflow-hidden border border-natural-border shadow-sm divide-y divide-stone-50">
          <button className="w-full p-7 flex items-center justify-between group active:bg-stone-50 transition-colors">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-stone-50 rounded-[20px] group-hover:bg-primary/10 transition-colors">
                <Settings className="w-6 h-6 text-stone-600 group-hover:text-primary transition-colors" />
              </div>
              <span className="font-bold text-natural-text">App Settings</span>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-300" />
          </button>
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

      {/* Registration Modal */}
      <AnimatePresence>
        {showGuideForm && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
              onClick={() => setShowGuideForm(false)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative bg-white w-full max-w-lg rounded-[44px] overflow-hidden shadow-2xl p-8 max-h-[90vh] overflow-y-auto no-scrollbar pt-20"
            >
              <button 
                onClick={() => setShowGuideForm(false)}
                className="absolute top-6 left-6 z-20 w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 rounded-full hover:bg-white/40 transition-all text-stone-900 shadow-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex justify-between items-center mb-8">
                <div className="space-y-1">
                  <h2 className="text-2xl font-serif font-bold text-natural-text">Register as Guide</h2>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Step {step} of 3</p>
                </div>
              </div>

              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block px-1">Bio & Experience</label>
                    <textarea 
                      placeholder="Tell us about yourself and your guiding style..."
                      className="w-full bg-stone-50 border border-stone-100 rounded-3xl p-5 text-sm font-medium h-32 outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    />
                    <textarea 
                      placeholder="List your years of experience or any specific certifications..."
                      className="w-full bg-stone-50 border border-stone-100 rounded-3xl p-5 text-sm font-medium h-24 outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    />
                  </div>
                  <button 
                    onClick={() => setStep(2)}
                    disabled={!formData.bio || !formData.experience}
                    className="w-full py-5 bg-stone-900 text-white rounded-[24px] font-bold shadow-xl active:scale-95 transition-all text-sm disabled:opacity-50"
                  >
                    Continue to Details
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">Daily Rate (₹)</label>
                       <div className="relative">
                          <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                          <input 
                            type="number" 
                            className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 pl-10 pr-4 text-sm font-bold outline-none"
                            value={formData.hourlyRate}
                            onChange={(e) => setFormData({...formData, hourlyRate: Number(e.target.value)})}
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">Languages</label>
                       <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                          <input 
                            type="text" 
                            placeholder="Hindi, English..."
                            className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 pl-10 pr-4 text-sm font-bold outline-none"
                            value={formData.languages}
                            onChange={(e) => setFormData({...formData, languages: e.target.value})}
                          />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="+91 00000 00000"
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">Current Base City</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                      <input 
                        type="text" 
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 pl-10 pr-4 text-sm font-bold outline-none"
                        value={formData.cityName}
                        onChange={(e) => setFormData({...formData, cityName: e.target.value})}
                      />
                    </div>
                    <button className="text-[10px] font-black text-primary uppercase tracking-widest px-1 flex items-center gap-1 mt-2">
                      <Navigation2 className="w-3 h-3 rotate-45" /> Use GPS Location
                    </button>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button onClick={() => setStep(1)} className="flex-1 py-5 bg-stone-100 text-stone-600 rounded-[24px] font-bold text-sm">Back</button>
                    <button 
                      onClick={() => setStep(3)}
                      disabled={!formData.phoneNumber}
                      className="flex-[2] py-5 bg-stone-900 text-white rounded-[24px] font-bold shadow-xl text-sm disabled:opacity-50"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 text-center py-4">
                  <div className="w-24 h-24 bg-stone-50 rounded-[40px] mx-auto flex items-center justify-center relative">
                    <div className="absolute inset-0 border-4 border-dashed border-stone-200 rounded-[40px] animate-spin-slow" />
                    <Upload className="w-8 h-8 text-stone-300" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-serif font-bold text-natural-text">Document Upload</h3>
                    <p className="text-xs text-stone-500 max-w-xs mx-auto">Upload Govt ID (Aadhar/Voter ID) and any supporting certificates for a 'Verified' badge.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-6 bg-stone-50 rounded-3xl border border-dashed border-stone-200 flex flex-col items-center gap-3">
                      <FileText className="w-6 h-6 text-stone-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Govt ID</span>
                    </button>
                    <button className="p-6 bg-stone-50 rounded-3xl border border-dashed border-stone-200 flex flex-col items-center gap-3">
                      <Award className="w-6 h-6 text-stone-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Certificates</span>
                    </button>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setStep(2)} className="flex-1 py-5 bg-stone-100 text-stone-600 rounded-[24px] font-bold text-sm">Back</button>
                    <button 
                      onClick={handleRegister}
                      disabled={isSubmitting}
                      className="flex-[2] py-5 bg-primary text-white rounded-[24px] font-bold shadow-xl shadow-primary/20 text-sm disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Complete Registration'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Host Registration Modal */}
      <AnimatePresence>
        {showHostForm && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
              onClick={() => setShowHostForm(false)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative bg-white w-full max-w-lg rounded-[44px] overflow-hidden shadow-2xl p-8 max-h-[90vh] overflow-y-auto no-scrollbar pt-20"
            >
              <button 
                onClick={() => setShowHostForm(false)}
                className="absolute top-6 left-6 z-20 w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 rounded-full hover:bg-white/40 transition-all text-stone-900 shadow-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex justify-between items-center mb-8">
                <div className="space-y-1">
                  <h2 className="text-2xl font-serif font-bold text-natural-text">Host Property</h2>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Step {step} of 3</p>
                </div>
              </div>

              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">Property Name</label>
                       <input 
                         type="text" 
                         placeholder="e.g., Green Valley PG"
                         className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none"
                         value={hostData.name}
                         onChange={(e) => setHostData({...hostData, name: e.target.value})}
                       />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">Type</label>
                         <select 
                           className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none appearance-none cursor-pointer"
                           value={hostData.type}
                           onChange={(e) => setHostData({...hostData, type: e.target.value})}
                         >
                           <option value="PG">PG</option>
                           <option value="Hotel">Hotel</option>
                           <option value="Hostel">Hostel</option>
                           <option value="Emergency Home Stay">Emergency Stay</option>
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">City</label>
                         <select 
                           className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none appearance-none cursor-pointer"
                           value={hostData.city}
                           onChange={(e) => setHostData({...hostData, city: e.target.value})}
                         >
                           <option value="Bhopal">Bhopal</option>
                           <option value="Indore">Indore</option>
                           <option value="Vrindavan">Vrindavan</option>
                           <option value="Nainital">Nainital</option>
                           <option value="Varanasi">Varanasi</option>
                         </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">Price Range</label>
                       <div className="relative">
                          <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                          <input 
                            type="text" 
                            placeholder="e.g., ₹5000 - ₹8000"
                            className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 pl-10 pr-4 text-sm font-bold outline-none"
                            value={hostData.price_range}
                            onChange={(e) => setHostData({...hostData, price_range: e.target.value})}
                          />
                       </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setStep(2)}
                    disabled={!hostData.name || !hostData.price_range}
                    className="w-full py-5 bg-stone-900 text-white rounded-[24px] font-bold shadow-xl active:scale-95 transition-all text-sm disabled:opacity-50"
                  >
                    Next: Location
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">Area / Landmark</label>
                       <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                          <input 
                            type="text" 
                            placeholder="e.g., Near Mall Road"
                            className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 pl-10 pr-4 text-sm font-bold outline-none"
                            value={hostData.location}
                            onChange={(e) => setHostData({...hostData, location: e.target.value})}
                          />
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between items-center px-1">
                         <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Property Photos</label>
                         <button 
                           onClick={generateSampleImages}
                           className="text-[8px] font-black uppercase tracking-widest text-primary px-3 py-1 bg-primary/5 rounded-full"
                         >
                           Add Sample Photo
                         </button>
                       </div>
                       
                       <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                         {hostData.images.map((url, i) => (
                           <div key={i} className="relative w-24 h-24 flex-shrink-0 group">
                             <img src={url} className="w-full h-full object-cover rounded-2xl border border-stone-100" />
                             <button 
                               onClick={() => removeImage(i)}
                               className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                               <X className="w-3 h-3" />
                             </button>
                           </div>
                         ))}
                         <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-stone-100 flex items-center justify-center flex-shrink-0 p-2">
                           <div className="space-y-1 w-full">
                             <input 
                               type="text" 
                               placeholder="URL..." 
                               className="w-full text-[8px] border-b outline-none text-center"
                               value={newImageUrl}
                               onChange={(e) => setNewImageUrl(e.target.value)}
                               onKeyDown={(e) => e.key === 'Enter' && addImage()}
                             />
                             <button onClick={addImage} className="w-full text-[8px] font-bold text-primary">Add</button>
                           </div>
                         </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">Description</label>
                       <textarea 
                        placeholder="Tell travelers what makes your place special..."
                        className="w-full bg-stone-50 border border-stone-100 rounded-3xl p-5 text-sm font-medium h-32 outline-none"
                        value={hostData.description}
                        onChange={(e) => setHostData({...hostData, description: e.target.value})}
                       />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button onClick={() => setStep(1)} className="flex-1 py-5 bg-stone-100 text-stone-600 rounded-[24px] font-bold text-sm">Back</button>
                    <button 
                      onClick={() => setStep(3)}
                      disabled={!hostData.location || !hostData.description}
                      className="flex-[2] py-5 bg-stone-900 text-white rounded-[24px] font-bold shadow-xl text-sm disabled:opacity-50"
                    >
                      Next: Verification
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 text-center py-4">
                  <div className="w-24 h-24 bg-stone-50 rounded-[40px] mx-auto flex items-center justify-center relative">
                    <div className="absolute inset-0 border-4 border-dashed border-stone-200 rounded-[40px]" />
                    <Upload className="w-8 h-8 text-stone-300" />
                  </div>
                  
                  <div className="space-y-2 text-left">
                    <h3 className="text-xl font-serif font-bold text-natural-text text-center">Security & Ethics</h3>
                    <p className="text-xs text-stone-500 bg-stone-50 p-4 rounded-2xl leading-relaxed italic border border-stone-100">
                      "Ghoomo requires mandatory document verification to ensure traveler safety. Your data is encrypted and only visible to authorized verification admins."
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-6 bg-stone-50 rounded-3xl border border-dashed border-stone-200 flex flex-col items-center gap-3 active:bg-stone-100 transition-colors">
                      <ShieldCheck className="w-6 h-6 text-stone-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Govt ID Proof</span>
                    </button>
                    <button className="p-6 bg-stone-50 rounded-3xl border border-dashed border-stone-200 flex flex-col items-center gap-3 active:bg-stone-100 transition-colors">
                      <FileText className="w-6 h-6 text-stone-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Property Docs</span>
                    </button>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setStep(2)} className="flex-1 py-5 bg-stone-100 text-stone-600 rounded-[24px] font-bold text-sm">Back</button>
                    <button 
                      onClick={handleHostRegister}
                      disabled={isSubmitting}
                      className="flex-[2] py-5 bg-stone-900 text-white rounded-[24px] font-bold shadow-xl text-sm disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Complete Listing'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Add these Lucide icons that were missing in the imports or used in the new flow
function Navigation2(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polygon points="12 2 22 21 12 17 2 21 12 2" />
    </svg>
  );
}


