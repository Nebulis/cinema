import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  setPersistence,
  browserSessionPersistence,
  getAuth
} from "firebase/auth";

const config = {
  apiKey: "AIzaSyCYC4F66N57djADFvaz5i30cAaYVzWqq1o",
  authDomain: "recipes-ebe53.firebaseapp.com",
  databaseURL: "https://recipes-ebe53.firebaseio.com",
  messagingSenderId: "322081152196",
  projectId: "recipes-ebe53",
  storageBucket: "recipes-ebe53.appspot.com"
};

initializeApp(config);
const auth = getAuth();
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export const login = () => {
  return setPersistence(auth, browserSessionPersistence)
    .then(() => signInWithPopup(auth, provider))
    .catch(error => {
      console.error(error);
    });
};

export const logout = () => {
  return signOut(auth);
};
