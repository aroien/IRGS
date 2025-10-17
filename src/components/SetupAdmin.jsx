// components/AdminSetup.jsx - For first-time setup
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function AdminSetup() {
  const [email, setEmail] = useState('admin@irgs.com');
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const createAdmin = async () => {
    setLoading(true);
    
    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 2. Add to pre-approved admins by adding to Firestore
      await setDoc(doc(db, 'admins', user.uid), {
        email: email,
        isAdmin: true,
        role: 'super-admin',
        createdAt: new Date().toISOString(),
        permissions: ['all']
      });

      setResult(`✅ Admin created successfully!
      
Email: ${email}
Password: ${password}
UID: ${user.uid}

You can now login at /admin-login`);

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setResult('❌ Email already exists. Please use a different email.');
      } else if (error.code === 'auth/weak-password') {
        setResult('❌ Password should be at least 6 characters.');
      } else {
        setResult(`❌ Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4">Admin Setup</h2>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>
        </div>

        <button
          onClick={createAdmin}
          disabled={loading}
          className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 disabled:opacity-50 mb-4"
        >
          {loading ? 'Creating Admin...' : 'Create Admin Account'}
        </button>

        {result && (
          <div className={`p-4 rounded-lg whitespace-pre-line ${
            result.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {result}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          <p>💡 This creates a secure admin account with:</p>
          <ul className="list-disc list-inside mt-2">
            <li>Firebase Authentication</li>
            <li>Firestore admin permissions</li>
            <li>Secure session management</li>
          </ul>
        </div>
      </div>
    </div>
  );
}