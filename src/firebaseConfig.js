// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration as provided
const firebaseConfig = {
  apiKey: "AIzaSyDminyfaFOmc3AjBjCfjcqrzesUcik9wfg",
  authDomain: "sids-mid-marks-result-portal.firebaseapp.com",
  projectId: "sids-mid-marks-result-portal",
  storageBucket: "sids-mid-marks-result-portal.firebasestorage.app",
  messagingSenderId: "183766513957",
  appId: "1:183766513957:web:bc36c95932c006a11542cc",
  measurementId: "G-ZG3R4EBEGF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore instance
const db = getFirestore(app);

export { db };
