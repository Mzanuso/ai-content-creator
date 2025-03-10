import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
// Note: In a real project, these values should come from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCT0BFTRljnsrbcT1SxwsWEEyrgca952cg",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "video-content-creator-4bb16.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "video-content-creator-4bb16",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "video-content-creator-4bb16.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "1050991356651",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:1050991356651:web:47b42676c06e732b6eecae",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-FYXH1BGLFB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;