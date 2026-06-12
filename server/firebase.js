import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDpzl2TW4vtQ3LC7c6ZYXYasJ64wSLP8aQ",
  authDomain: "smartstockanalyzer-22680.firebaseapp.com",
  projectId: "smartstockanalyzer-22680",
  storageBucket: "smartstockanalyzer-22680.firebasestorage.app",
  messagingSenderId: "240320939824",
  appId: "1:240320939824:web:da760e4640d46526abeaf5",
  measurementId: "G-WY7735ZQZ7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
