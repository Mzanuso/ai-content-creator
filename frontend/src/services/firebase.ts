import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration from the provided configuration
const firebaseConfig = {
  apiKey: "AIzaSyCT0BFTRljnsrbcT1SxwsWEEyrgca952cg",
  authDomain: "video-content-creator-4bb16.firebaseapp.com",
  projectId: "video-content-creator-4bb16",
  storageBucket: "video-content-creator-4bb16.firebasestorage.app",
  messagingSenderId: "1050991356651",
  appId: "1:1050991356651:web:47b42676c06e732b6eecae",
  measurementId: "G-FYXH1BGLFB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;