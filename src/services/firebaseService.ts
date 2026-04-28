import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  doc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  doc as firestoreDoc,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Incident } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

// Verification log
async function testConnection() {
  try {
    await getDocFromServer(firestoreDoc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

function handleFirestoreError(error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null = null) {
  if (error.code === 'permission-denied') {
    const user = auth.currentUser;
    const errorInfo: FirestoreErrorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: {
        userId: user?.uid || 'anonymous',
        email: user?.email || '',
        emailVerified: user?.emailVerified || false,
        isAnonymous: user?.isAnonymous || true,
        providerInfo: user?.providerData.map(p => ({
          providerId: p.providerId,
          displayName: p.displayName || '',
          email: p.email || ''
        })) || []
      }
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
}

export const firebaseService = {
  async createIncident(incidentData: Omit<Incident, 'id' | 'timestamp' | 'reportCount'>) {
    try {
      const docRef = await addDoc(collection(db, 'incidents'), {
        ...incidentData,
        timestamp: serverTimestamp(),
        reportCount: 1,
        status: 'pending'
      });
      return docRef.id;
    } catch (error) {
      return handleFirestoreError(error, 'create', 'incidents');
    }
  },

  listenToIncidents(callback: (incidents: Incident[]) => void) {
    const q = query(collection(db, 'incidents'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const incidents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Incident[];
      callback(incidents);
    }, (error) => {
      handleFirestoreError(error, 'list', 'incidents');
    });
  },

  async getIncident(id: string) {
    try {
      const docRef = doc(db, 'incidents', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Incident;
      }
      return null;
    } catch (error) {
      return handleFirestoreError(error, 'get', `incidents/${id}`);
    }
  },

  async updateIncident(id: string, data: Partial<Incident>) {
    try {
      const docRef = doc(db, 'incidents', id);
      await updateDoc(docRef, data);
    } catch (error) {
      return handleFirestoreError(error, 'update', `incidents/${id}`);
    }
  }
};
