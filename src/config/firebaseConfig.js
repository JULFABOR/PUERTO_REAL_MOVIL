import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAeb5Z1GrKNeMlG8E_buTmlpy3xzmKQDtA",
  authDomain: "puertorealmobile.firebaseapp.com",
  projectId: "puertorealmobile",
  storageBucket: "puertorealmobile.firebasestorage.app",
  messagingSenderId: "35576249240",
  appId: "1:35576249240:web:9c37276043fd8d442689ed",
  measurementId: "G-Z3XQC7VDCD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
export { auth, db };

