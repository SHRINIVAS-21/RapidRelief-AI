import { 
  signInWithPopup, 
  signInWithRedirect,
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User,
  Auth 
} from 'firebase/auth';
import { auth, db } from './firebaseService';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const googleProvider = new GoogleAuthProvider();
// Add custom parameters for Google OAuth
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const authService = {
  getAuth(): Auth {
    return auth;
  },
  
  async signInWithGoogle() {
    try {
      console.log('Starting Google sign-in...');
      
      // Try popup first, fall back to redirect
      let result;
      try {
        result = await signInWithPopup(auth, googleProvider);
      } catch (popupError: any) {
        console.log('Popup failed, trying redirect:', popupError.code);
        // Fall back to redirect
        await signInWithRedirect(auth, googleProvider);
        return null; // Redirect will reload the page
      }
      
      const user = result.user;
      console.log('Signed in user:', user.displayName);
      
      // Ensure user profile exists in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          id: user.uid,
          name: user.displayName || 'Anonymous User',
          email: user.email || '',
          role: 'citizen',
          createdAt: serverTimestamp()
        });
      }
      
      return user;
    } catch (error: any) {
      console.error("Auth Error:", error);
      // Provide more helpful error message
      if (error.code === 'auth/unauthorized-domain') {
        alert('Please add localhost to your Firebase authorized domains: Firebase Console → Authentication → Settings → Authorized domains');
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log('Sign-in popup was closed');
      } else {
        alert('Sign-in error: ' + error.message);
      }
      throw error;
    }
  },

  async logout() {
    await signOut(auth);
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
};
