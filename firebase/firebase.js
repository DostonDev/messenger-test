import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDyti61CWKxuh3QjNauLBzQHyaam1YBeb8",
  authDomain: "chat-clones.firebaseapp.com",
  projectId: "chat-clones",
  storageBucket: "chat-clones.appspot.com",
  messagingSenderId: "74960444303",
  appId: "1:74960444303:web:28939d5ae641c9a4c109fa"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
