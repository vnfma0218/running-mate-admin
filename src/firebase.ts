// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { Firestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDdXvt49Q2CoteuyHz4WTn6_XN7LsTaBi8',
  authDomain: 'running-mate-c7ed4.firebaseapp.com',
  projectId: 'running-mate-c7ed4',
  storageBucket: 'running-mate-c7ed4.appspot.com',
  messagingSenderId: '867750963476',
  appId: '1:867750963476:web:51000eafad3bfdef0bfa01',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { auth, db, Firestore }
