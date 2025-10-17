// src/utils/initializeFirestore.js
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export async function initializeFirestoreData() {
  try {
    // Check if users collection exists, if not create a demo admin user
    const usersSnapshot = await getDocs(collection(db, 'users'));
    if (usersSnapshot.empty) {
      await addDoc(collection(db, 'users'), {
        displayName: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString()
      });
      console.log('Demo admin user created');
    }

    // Check if courses collection exists
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    if (coursesSnapshot.empty) {
      console.log('No courses found. You can create your first course in the admin panel.');
    }

  } catch (error) {
    console.error('Error initializing Firestore data:', error);
  }
}