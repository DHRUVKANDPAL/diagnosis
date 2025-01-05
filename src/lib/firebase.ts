// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCTsTuxUYzQblg0WtjoSBGP1cOO_a_UyX0",
  authDomain: "diagnosis-f5bcd.firebaseapp.com",
  projectId: "diagnosis-f5bcd",
  storageBucket: "diagnosis-f5bcd.firebasestorage.app",
  messagingSenderId: "800140047264",
  appId: "1:800140047264:web:4d1496c47a18f634862ac5",
  measurementId: "G-FHSHYW4KNW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);

export async function uploadFile(file: File, setProgress: (progress: number) => void) {
   return new Promise((resolve, reject) => {
      try {
         const storageRef = ref(storage, file.name);
         const uploadTask = uploadBytesResumable(storageRef, file);
         uploadTask.on('state_changed',
            (snapshot) => {
               const progress = Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
               if(setProgress)setProgress(progress);
               switch (snapshot.state) {
                  case 'paused':
                     console.log('Upload is paused');
                     break;
                  case 'running':
                     console.log('Upload is running');
                     break;
               }
            },
            (error) => {
               console.error(error);
               reject(error);
            },
            () => {
               getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                  resolve(downloadURL);
               });
            }
         );
      } catch (error) {
         console.error(error);
         reject(error);
      }
   });
}