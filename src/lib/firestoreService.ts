import { auth, db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  Timestamp
} from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// User Services
export const userService = {
  async getProfile(uid: string) {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      return snap.exists() ? snap.data() : null;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `users/${uid}`);
    }
  },
  async updateProfile(uid: string, data: any) {
    try {
      await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: Timestamp.now() });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
    }
  }
};

// Stays & Listings Services
export const listingService = {
  async getAllListings() {
    try {
      const snap = await getDocs(collection(db, 'listings'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'listings');
    }
  },

  async seedListings(listings: any[]) {
    try {
      for (const listing of listings) {
        await setDoc(doc(db, 'listings', listing.id), {
          ...listing,
          createdAt: Timestamp.now(),
          status: listing.isVerified ? 'verified' : 'pending'
        });
      }
      console.log("Listings seeded successfully");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'listings/seed');
    }
  },

  async createAccommodation(hostId: string, data: any) {
    try {
      const listingRef = doc(collection(db, 'listings'));
      const listingData = {
        ...data,
        id: listingRef.id,
        hostId,
        isVerified: false,
        status: 'pending',
        createdAt: Timestamp.now()
      };
      await setDoc(listingRef, listingData);
      return listingData;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'listings');
    }
  },

  async getHostListings(hostId: string) {
    try {
      const q = query(collection(db, 'listings'), where('hostId', '==', hostId));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'listings/host');
    }
  }
};

export const stayService = {
  async getAllStays() {
    try {
      const snap = await getDocs(collection(db, 'stays'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'stays');
    }
  },

  async seedStays(stays: any[]) {
    try {
      for (const stay of stays) {
        await setDoc(doc(db, 'stays', stay.id), {
          ...stay,
          createdAt: Timestamp.now()
        });
      }
      console.log("Stays seeded successfully");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'stays/seed');
    }
  }
};

export const rentalService = {
  async getAllRentals() {
    try {
      const snap = await getDocs(collection(db, 'rentals'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'rentals');
    }
  },

  async seedRentals(rentals: any[]) {
    try {
      for (const rental of rentals) {
        await setDoc(doc(db, 'rentals', rental.id), {
          ...rental,
          createdAt: Timestamp.now()
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'rentals/seed');
    }
  }
};

// Travel Group & Split Bill Services
export const groupService = {
  async createGroup(name: string, destination: string, adminId: string, members: string[]) {
    try {
      const groupRef = doc(collection(db, 'groups'));
      const groupData = {
        id: groupRef.id,
        name,
        destination,
        adminId,
        members: [...new Set([adminId, ...members])],
        totalBudget: 50000, // Default budget
        inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        createdAt: Timestamp.now()
      };
      await setDoc(groupRef, groupData);
      return groupData;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'groups');
    }
  },

  async updateGroup(groupId: string, data: any) {
    try {
      await updateDoc(doc(db, 'groups', groupId), { ...data, updatedAt: Timestamp.now() });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `groups/${groupId}`);
    }
  },

  async deleteGroup(groupId: string) {
    try {
      // Note: Ideally we should delete sub-collections too, but Firestore doesn't do this automatically.
      // For this app, we'll just delete the group doc.
      await deleteDoc(doc(db, 'groups', groupId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `groups/${groupId}`);
    }
  },

  async joinByCode(userId: string, code: string) {
    try {
      const q = query(collection(db, 'groups'), where('inviteCode', '==', code.toUpperCase()));
      const snap = await getDocs(q);
      if (snap.empty) throw new Error("Invalid invite code");
      
      const groupDoc = snap.docs[0];
      const data = groupDoc.data();
      if (data.members.includes(userId)) return data;

      await updateDoc(groupDoc.ref, {
        members: [...data.members, userId],
        updatedAt: Timestamp.now()
      });
      return { ...data, members: [...data.members, userId] };
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'groups/join');
    }
  },

  async addExpense(groupId: string, expenseData: {
    amount: number;
    description: string;
    category: string;
    paidById: string;
    paidByName: string;
    splitMethod: 'equal' | 'percentage' | 'custom';
    splitData: Record<string, number>;
  }) {
    try {
      const expenseRef = doc(collection(db, `groups/${groupId}/expenses`));
      await setDoc(expenseRef, {
        ...expenseData,
        id: expenseRef.id,
        createdAt: Timestamp.now(), // Added for sorting/display
        timestamp: Timestamp.now()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `groups/${groupId}/expenses`);
    }
  },

  async updateExpense(groupId: string, expenseId: string, data: any) {
    try {
      await updateDoc(doc(db, `groups/${groupId}/expenses`, expenseId), {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `groups/${groupId}/expenses/${expenseId}`);
    }
  },

  async deleteExpense(groupId: string, expenseId: string) {
    try {
      await deleteDoc(doc(db, `groups/${groupId}/expenses`, expenseId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `groups/${groupId}/expenses/${expenseId}`);
    }
  },

  subscribeToGroups(userId: string, callback: (groups: any[]) => void) {
    const q = query(collection(db, 'groups'), where('members', 'array-contains', userId));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(doc => doc.data()));
    }, (e) => handleFirestoreError(e, OperationType.LIST, 'groups'));
  },

  subscribeToExpenses(groupId: string, callback: (expenses: any[]) => void) {
    return onSnapshot(collection(db, `groups/${groupId}/expenses`), (snap) => {
      callback(snap.docs.map(doc => doc.data()));
    }, (e) => handleFirestoreError(e, OperationType.LIST, `groups/${groupId}/expenses`));
  }
};
