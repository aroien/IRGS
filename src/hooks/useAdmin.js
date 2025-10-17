import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export function useAdmin() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setError(null);
      
      if (user) {
        try {
          // Check if user has admin privileges
          const adminDocRef = doc(db, 'admins', user.uid);
          
          // Use real-time listener for admin status
          const unsubscribeAdmin = onSnapshot(adminDocRef, 
            (docSnapshot) => {
              if (docSnapshot.exists()) {
                const adminData = docSnapshot.data();
                if (adminData.isAdmin) {
                  setIsAdmin(true);
                  setAdminData(adminData);
                } else {
                  setIsAdmin(false);
                  setAdminData(null);
                }
              } else {
                setIsAdmin(false);
                setAdminData(null);
              }
              setLoading(false);
            },
            (error) => {
              console.error('Error checking admin status:', error);
              setError('Failed to verify admin privileges');
              setIsAdmin(false);
              setAdminData(null);
              setLoading(false);
            }
          );

          return () => unsubscribeAdmin();
        } catch (error) {
          console.error('Error in admin check:', error);
          setError('Error checking admin status');
          setIsAdmin(false);
          setAdminData(null);
          setLoading(false);
        }
      } else {
        // No user signed in
        setIsAdmin(false);
        setAdminData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Function to manually refresh admin status
  const refreshAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setAdminData(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        if (adminData.isAdmin) {
          setIsAdmin(true);
          setAdminData(adminData);
        } else {
          setIsAdmin(false);
          setAdminData(null);
        }
      } else {
        setIsAdmin(false);
        setAdminData(null);
      }
    } catch (error) {
      console.error('Error refreshing admin status:', error);
      setError('Failed to refresh admin status');
      setIsAdmin(false);
      setAdminData(null);
    } finally {
      setLoading(false);
    }
  };

  return { 
    user, 
    isAdmin, 
    adminData, 
    loading, 
    error,
    refreshAdminStatus 
  };
}

// Alternative simpler version without real-time updates:
export function useSimpleAdmin() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          setIsAdmin(adminDoc.exists() && adminDoc.data().isAdmin === true);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, isAdmin, loading };
}