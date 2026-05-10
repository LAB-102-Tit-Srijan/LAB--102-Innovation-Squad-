import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface GuideProfile {
  id?: string;
  userId: string;
  bio: string;
  experience: string;
  hourlyRate: number;
  dailyRate?: number;
  languages: string[];
  baseLocation: {
    lat: number;
    lng: number;
    cityName: string;
  };
  rating: number;
  isVerified: boolean;
  governmentIdUrl?: string;
  certificationUrl?: string;
  phoneNumber: string;
  createdAt: any;
}

export const guideService = {
  async registerGuide(data: Omit<GuideProfile, 'id' | 'userId' | 'rating' | 'isVerified' | 'createdAt'>) {
    if (!auth.currentUser) throw new Error('Not authenticated');

    const guideData: Omit<GuideProfile, 'id'> = {
      ...data,
      userId: auth.currentUser.uid,
      rating: 5.0, // Default for new guides
      isVerified: false,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'guides'), guideData);
    
    // Also update user profile to indicate they are a guide
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userRef, {
      role: 'host',
      isGuide: true
    });

    return docRef.id;
  },

  async getGuidesByCity(cityName: string): Promise<GuideProfile[]> {
    const q = query(
      collection(db, 'guides'), 
      where('baseLocation.cityName', '==', cityName)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as GuideProfile));
  },

  async getGuideByUserId(userId: string): Promise<GuideProfile | null> {
    const q = query(collection(db, 'guides'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as GuideProfile;
  }
};
