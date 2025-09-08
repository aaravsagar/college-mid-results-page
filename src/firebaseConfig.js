// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration as provided
const firebaseConfig = {
  apiKey: "AIzaSyCyBmUwkhQcE6W8is7-6FeiMTtKkGj0vfE",
  authDomain: "portfolio-75f1f.firebaseapp.com",
  projectId: "portfolio-75f1f",
  storageBucket: "portfolio-75f1f.firebasestorage.app",
  messagingSenderId: "167491625034",
  appId: "1:167491625034:web:84521a6db170b9bd92c6b3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore instance
const db = getFirestore(app);

export { db };
