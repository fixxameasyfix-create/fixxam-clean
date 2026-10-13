import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, initializeAuth, type Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyCAnnP7nWUHV8BPCVctwb90ZWU96QvHWyg",
  authDomain: "fixxam-clean.firebaseapp.com",
  projectId: "fixxam-clean",
  storageBucket: "fixxam-clean.firebasestorage.app",
  messagingSenderId: "209267641975",
  appId: "1:209267641975:web:3434b3d7097a6889d2c072",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth: Auth;

if (Platform.OS === 'web') {
  // A WEB - kada ka yi amfani da getReactNativePersistence
  auth = getAuth(app);
} else {
  // A MOBILE KAWAI
  try {
    const { getReactNativePersistence } = require("firebase/auth");
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (e: any) {
    if (e?.code === 'auth/already-initialized') {
      auth = getAuth(app);
    } else {
      auth = getAuth(app);
    }
  }
}

const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app, "us-central1");

export { app, auth, db, storage, functions };
export default app;