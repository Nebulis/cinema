import firebase from "firebase/app";
import "firebase/auth";

const config = {
  apiKey: "AIzaSyCYC4F66N57djADFvaz5i30cAaYVzWqq1o",
  authDomain: "recipes-ebe53.firebaseapp.com",
  databaseURL: "https://recipes-ebe53.firebaseio.com",
  messagingSenderId: "322081152196",
  projectId: "recipes-ebe53",
  storageBucket: "recipes-ebe53.appspot.com"
};

firebase.initializeApp(config);

const provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export const login = () => {
  return firebase
    .auth()
    .setPersistence(firebase.auth.Auth.Persistence.NONE)
    .then(() => firebase.auth().signInWithPopup(provider))
    .catch(error => {
      console.error(error);
    });
};

export const logout = () => {
  return firebase.auth().signOut();
};
