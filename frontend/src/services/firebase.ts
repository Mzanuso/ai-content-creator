import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration from the provided configuration
const firebaseConfig = {
  apiKey: "AIzaSyAh6QO0rj3Fipyoc1pJ5UTWeS_S-HLzftM",
  authDomain: "ai-content-creator-f7d53.firebaseapp.com",
  projectId: "ai-content-creator-f7d53",
  storageBucket: "ai-content-creator-f7d53.firebasestorage.app",
  messagingSenderId: "608058888070",
  appId: "1:608058888070:web:c9ff5462de964fa84a2607",
  measurementId: "G-BL3NB5HWQ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;