import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAc_YZQC4oZogmszEduxU6Ws7Xqi3CmT5c",
  authDomain: "chatapp-6cbd0.firebaseapp.com",
  projectId: "chatapp-6cbd0",
  storageBucket: "chatapp-6cbd0.appspot.com",
  messagingSenderId: "193413819138",
  appId: "1:193413819138:web:cd13b4993cdb9190afb01b",
  measurementId: "G-7GN6Y004EL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };