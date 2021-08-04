import './style.css'

import firebase from 'firebase/app'
import 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBayxDYyjcglnz61-YHgdz0h1YVkrL4cBI",
  authDomain: "karaoke-b9361.firebaseapp.com",
  projectId: "karaoke-b9361",
  storageBucket: "karaoke-b9361.appspot.com",
  messagingSenderId: "152169262096",
  appId: "1:152169262096:web:0f944cd70bfd4f6efdee95",
  measurementId: "G-FP6G8017CV"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

const firestore = firebase.firestore()


