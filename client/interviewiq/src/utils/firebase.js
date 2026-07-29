import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API,
  authDomain: "interviewiq-e7b0e.firebaseapp.com",
  projectId: "interviewiq-e7b0e",
  storageBucket: "interviewiq-e7b0e.firebasestorage.app",
  messagingSenderId: "1020059269361",
  appId: "1:1020059269361:web:b460cff51091f26bb19150",
  measurementId: "G-J5NT9WF6GD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };