// Firebase configuration - uses environment variables when available
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBE-eF2AWbN34wfSeoMc3JATUX0zWLQKhQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "sellaya-lba-02-52991340-1d0a3.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sellaya-lba-02-52991340-1d0a3",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "sellaya-lba-02-52991340-1d0a3.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "179293509698",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:179293509698:web:64c17a06d6f2496c8835db",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-1W10431S1V",
};
