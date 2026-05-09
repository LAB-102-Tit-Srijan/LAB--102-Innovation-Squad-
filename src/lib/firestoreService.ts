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

  async addExpense(groupId: string, expenseData: any) {
    try {
      const expenseRef = doc(collection(db, `groups/${groupId}/expenses`));
      await setDoc(expenseRef, {
        ...expenseData,
        id: expenseRef.id,
        timestamp: Timestamp.now()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `groups/${groupId}/expenses`);
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
