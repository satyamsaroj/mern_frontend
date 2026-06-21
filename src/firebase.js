
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDmveDMeBw-iiuD8QGQyT07xlJ76Yl9sjE",
  authDomain: "my-task-manager-4e73f.firebaseapp.com",
  projectId: "my-task-manager-4e73f",
  storageBucket: "my-task-manager-4e73f.firebasestorage.app",
  messagingSenderId: "347151286588",
  appId: "1:347151286588:web:1e838260ecbb6105a45e39",
  measurementId: "G-GTK7TY1SPR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export { app };