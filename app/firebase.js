// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage, ref } from "firebase/storage";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: NEXT_PUBLIC_API_KEY,
    authDomain: NEXT_PUBLIC_AUTH_DOMAIN,
    projectId: NEXT_PUBLIC_PROJECT_ID,
    storageBucket: NEXT_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: NEXT_PUBLIC_MESSAGING_SENDER_ID,
    appId: NEXT_PUBLIC_APP_ID,
    measurementId: NEXT_PUBLIC_MEASUREMENT_ID
};


// console.log("firebaseConfig", firebaseConfig)
// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);

export { auth, db, storage, googleProvider };