// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDrAZJSFUu_zN_2DteOC-hCjiH97LmomCc",
    authDomain: "expense-a7bc0.firebaseapp.com",
    projectId: "expense-a7bc0",
    storageBucket: "expense-a7bc0.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
};

// Initialize Firebase
let app;
let auth;
let db;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
}

// Enable offline persistence for Firestore
try {
    await db.enablePersistence();
    console.log('Offline persistence enabled');
} catch (err) {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
        console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
        // The current browser doesn't support persistence
        console.warn('Persistence not supported by browser');
    } else {
        console.error('Error enabling persistence:', err);
    }
}

export { auth, db }; 