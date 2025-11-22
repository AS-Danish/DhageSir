import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";
import { enableIndexedDbPersistence, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const clientCredentials = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
};

// Initialize Firebase app only once
const app = getApps().length === 0 ? initializeApp(clientCredentials) : getApp();

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db)
    .then(() => {
        console.log("🔥 Firebase persistence enabled successfully");
    })
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a a time.
            console.warn("Firebase persistence failed: Multiple tabs open");
        } else if (err.code == 'unimplemented') {
            // The current browser does not support all of the features required to enable persistence
            console.warn("Firebase persistence not supported in this browser");
        }
    });
}

// Export all Firebase services
export { app, auth, db, storage, RecaptchaVerifier };