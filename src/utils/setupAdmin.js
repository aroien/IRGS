// src/utils/setupAdmin.js
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export async function createAdminUser(email, password) {
  try {
    // 1. Create the user in Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 2. Add admin privileges in Firestore
    await setDoc(doc(db, 'admins', user.uid), {
      email: email,
      isAdmin: true,
      role: 'super-admin',
      createdAt: new Date().toISOString(),
      permissions: ['all']
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('User UID:', user.uid);
    console.log('Email:', email);
    return user;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

// Usage example:
// createAdminUser('admin@yourdomain.com', 'admin123');