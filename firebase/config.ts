import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getApp,
  getApps,
  initializeApp,
} from "firebase/app";

import {
  getAuth,
  initializeAuth,
  type Auth,
} from "firebase/auth";

import {
  getFirestore,
} from "firebase/firestore";

import {
  getFunctions,
} from "firebase/functions";

import {
  getStorage,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCAnnP7nWUHV8BPCVctwb90ZWU96QvHWyg",
  authDomain: "fixxam-clean.firebaseapp.com",
  projectId: "fixxam-clean",
  storageBucket: "fixxam-clean.firebasestorage.app",
  messagingSenderId: "209267641975",
  appId: "1:209267641975:web:3434b3d7097a6889d2c072",
};

const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

/**
 * Firebase 12.x has a TypeScript typing issue
 * around getReactNativePersistence.
 *
 * The function exists at runtime in React Native.
 */
const getReactNativePersistence =
  (
    require("firebase/auth") as {
      getReactNativePersistence: (
        storage: typeof AsyncStorage,
      ) => unknown;
    }
  ).getReactNativePersistence;

let auth: Auth;

try {
  auth = initializeAuth(app, {
    persistence:
      getReactNativePersistence(
        AsyncStorage,
      ) as Parameters<typeof initializeAuth>[1] extends {
        persistence?: infer P;
      }
        ? P
        : never,
  });
} catch (error: unknown) {
  if (
    error instanceof Error &&
    "code" in error &&
    (error as { code?: string }).code ===
      "auth/already-initialized"
  ) {
    auth = getAuth(app);
  } else {
    throw error;
  }
}

const db = getFirestore(app);

const storage = getStorage(app);

const functions = getFunctions(
  app,
  "us-central1",
);

export {
  app,
  auth,
  db,
  storage,
  functions,
};

export default app;