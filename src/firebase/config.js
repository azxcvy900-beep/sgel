// Import Firebase modules
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyAmYBWtpdOhiJ1In1qBG4C2g2Q5QA-IheQ",
  authDomain: "sjel-58f26.firebaseapp.com",
  databaseURL: "https://sjel-58f26-default-rtdb.firebaseio.com",
  projectId: "sjel-58f26",
  storageBucket: "sjel-58f26.firebasestorage.app",
  messagingSenderId: "569278373461",
  appId: "1:569278373461:web:ac04ef2acd08ba801f7edc",
  measurementId: "G-HX7XSTJZHE"
};

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Realtime Database (from databaseURL)
export const rtdb = getDatabase(app);

// Initialize Firestore
export const firestore = getFirestore(app);

// Initialize Analytics conditionally (only in browser environment)
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}
