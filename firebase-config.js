// Firebase Configuration
// Configured for worksheets-app-76ee9

const firebaseConfig = {
    apiKey: "AIzaSyDq6Wjv8tts2dm-8q4tsC7fT2HS-aO2a7c",
    authDomain: "worksheets-app-76ee9.firebaseapp.com",
    projectId: "worksheets-app-76ee9",
    storageBucket: "worksheets-app-76ee9.firebasestorage.app",
    messagingSenderId: "371230982221",
    appId: "1:371230982221:web:d1da320f7fa61e72b55c04",
    measurementId: "G-5R8B7ZJJLF"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Export for use in other files
window.firebaseAuth = auth;
window.firebaseDb = db;

console.log('Firebase initialized successfully');
