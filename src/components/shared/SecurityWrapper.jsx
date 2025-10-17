// src/components/shared/SecurityWrapper.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

// Security Context
const SecurityContext = createContext();

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}

// Security Provider
export function SecurityProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [securityLog, setSecurityLog] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await loadUserSecurityData(user.uid);
        logSecurityEvent('USER_LOGIN', `User ${user.email} logged in`);
      } else {
        setUser(null);
        setUserRole(null);
        setPermissions([]);
        logSecurityEvent('USER_LOGOUT', 'User logged out');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserSecurityData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRole(userData.role);
        setPermissions(getPermissionsForRole(userData.role));
        
        // Real-time updates for user security data
        const unsubscribe = onSnapshot(doc(db, 'users', userId), (doc) => {
          const updatedData = doc.data();
          setUserRole(updatedData.role);
          setPermissions(getPermissionsForRole(updatedData.role));
        });

        return unsubscribe;
      }
    } catch (error) {
      console.error('Error loading user security data:', error);
      logSecurityEvent('SECURITY_ERROR', `Failed to load security data: ${error.message}`);
    }
  };

  const getPermissionsForRole = (role) => {
    const permissionsMap = {
      admin: [
        'VIEW_DASHBOARD', 'MANAGE_USERS', 'MANAGE_COURSES', 'MANAGE_ENROLLMENTS',
        'VIEW_ANALYTICS', 'MANAGE_CERTIFICATES', 'SYSTEM_CONFIG', 'SECURITY_ACCESS'
      ],
      instructor: [
        'VIEW_DASHBOARD', 'MANAGE_COURSES', 'VIEW_ENROLLMENTS', 'MANAGE_CONTENT',
        'VIEW_ANALYTICS', 'ISSUE_CERTIFICATES'
      ],
      student: [
        'VIEW_DASHBOARD', 'BROWSE_COURSES', 'ENROLL_COURSES', 'VIEW_PROGRESS',
        'ACCESS_CONTENT', 'VIEW_CERTIFICATES'
      ]
    };
    return permissionsMap[role] || [];
  };

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions) => {
    return requiredPermissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (requiredPermissions) => {
    return requiredPermissions.every(permission => hasPermission(permission));
  };

  const logSecurityEvent = (eventType, description, severity = 'INFO') => {
    const event = {
      timestamp: new Date().toISOString(),
      eventType,
      description,
      severity,
      userId: user?.uid,
      userEmail: user?.email,
      ipAddress: '127.0.0.1' // In real app, get from request
    };
    
    setSecurityLog(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events
    
    // In production, also log to your security monitoring service
    console.log(`🔐 SECURITY: ${eventType} - ${description}`);
  };

  const value = {
    user,
    userRole,
    permissions,
    loading,
    securityLog,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    logSecurityEvent
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

// Protected Route Component
export function ProtectedRoute({ 
  children, 
  requiredPermissions = [], 
  requireAll = true,
  fallback = <AccessDenied />
}) {
  const { hasAnyPermission, hasAllPermissions, loading } = useSecurity();

  if (loading) {
    return <ModernLoading />;
  }

  const hasAccess = requireAll 
    ? hasAllPermissions(requiredPermissions)
    : hasAnyPermission(requiredPermissions);

  if (!hasAccess) {
    return fallback;
  }

  return children;
}

// Access Denied Component
export function AccessDenied() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">🚫</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <button
          onClick={() => window.history.back()}
          className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 font-semibold transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

// Security Audit Log Component
export function SecurityAuditLog() {
  const { securityLog, userRole } = useSecurity();

  if (!hasPermission('SECURITY_ACCESS')) {
    return <AccessDenied />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Security Audit Log</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {securityLog.map((event, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {new Date(event.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {event.eventType}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{event.description}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    event.severity === 'HIGH' 
                      ? 'bg-red-100 text-red-800'
                      : event.severity === 'MEDIUM'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {event.severity}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {event.userEmail || 'System'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {securityLog.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No security events logged yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Usage example in App.jsx:
/*
function App() {
  return (
    <SecurityProvider>
      <GradientBackground>
        <GlassNavbar />
        <Routes>
          <Route path="/admin" element={
            <ProtectedRoute requiredPermissions={['VIEW_DASHBOARD', 'MANAGE_USERS']}>
              <AdminDashboard />
            </ProtectedRoute>
          }/>
          <Route path="/student" element={
            <ProtectedRoute requiredPermissions={['VIEW_DASHBOARD']}>
              <StudentDashboard />
            </ProtectedRoute>
          }/>
        </Routes>
      </GradientBackground>
    </SecurityProvider>
  );
}
*/