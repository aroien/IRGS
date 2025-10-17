// pages/admin/AdminLogin.jsx - ENHANCED VERSION
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Pre-defined admin emails
const ADMIN_EMAILS = [
  "admin@irgs.com",
  "super@irgs.com", 
  "administrator@irgs.com",
  "admin@irgs.edu",
  "superadmin@irgs.com"
];

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const navigate = useNavigate();

  // Check if user is already logged in as admin
  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    const adminUser = localStorage.getItem("adminUser");
    
    if (isAdmin === "true" && adminUser) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!email || !password) {
      setError("❌ Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      console.log("🔐 Attempting admin login with:", email);
      
      // 1. Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("✅ Firebase auth success, UID:", user.uid);

      // 2. Check pre-approved admin emails
      const isPreApprovedAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
      console.log("🔍 Pre-approved admin check:", isPreApprovedAdmin);

      if (isPreApprovedAdmin) {
        // Grant immediate admin access for pre-approved emails
        console.log("🎯 Pre-approved admin, granting access");
        
        // Ensure admin document exists in Firestore
        try {
          await setDoc(doc(db, 'users', user.uid), {
            email: email,
            displayName: "Administrator",
            role: "admin",
            status: "active",
            isAdmin: true,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          }, { merge: true });
        } catch (firestoreError) {
          console.log("Note: Could not update Firestore, but proceeding with login");
        }

        // Set admin session
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("adminUser", email);
        localStorage.setItem("adminUID", user.uid);
        localStorage.setItem("adminLoginTime", new Date().toISOString());
        
        navigate("/admin");
        return;
      }

      // 3. Check Firestore for admin role
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        console.log("📊 Firestore user check - exists:", userDoc.exists());
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("👤 User role:", userData.role);
          
          if (userData.role === 'admin' || userData.isAdmin === true) {
            console.log("✅ Firestore admin confirmed");
            
            // Update last login
            await setDoc(doc(db, 'users', user.uid), {
              lastLogin: new Date().toISOString()
            }, { merge: true });

            localStorage.setItem("isAdmin", "true");
            localStorage.setItem("adminUser", email);
            localStorage.setItem("adminUID", user.uid);
            localStorage.setItem("adminLoginTime", new Date().toISOString());
            
            navigate("/admin");
          } else {
            throw new Error("User exists but is not an admin");
          }
        } else {
          throw new Error("No user record found");
        }
      } catch (firestoreError) {
        console.log("❌ Firestore admin check failed:", firestoreError);
        setError("❌ Access denied. Administrator privileges required.");
        // Sign out non-admin users
        await auth.signOut();
        localStorage.clear();
      }

    } catch (error) {
      console.error("💥 Login error:", error.code, error.message);
      handleLoginError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginError = (error) => {
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        setError("❌ Invalid email or password");
        break;
      case 'auth/user-not-found':
        setError("❌ No administrator account found with this email");
        break;
      case 'auth/invalid-email':
        setError("❌ Invalid email format");
        break;
      case 'auth/too-many-requests':
        setError("❌ Too many failed attempts. Account temporarily disabled.");
        break;
      case 'auth/network-request-failed':
        setError("❌ Network error. Please check your connection.");
        break;
      default:
        setError(`❌ Login failed: ${error.message}`);
    }
  };

  // Create first admin account
  const createFirstAdmin = async () => {
    setLoading(true);
    setError("");
    
    const adminEmail = "admin@irgs.com";
    const adminPassword = "Admin123!";

    try {
      console.log("🚀 Creating first admin account...");
      
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      const user = userCredential.user;
      
      // Create user document with admin role
      await setDoc(doc(db, 'users', user.uid), {
        email: adminEmail,
        displayName: "System Administrator",
        role: "admin",
        status: "active",
        isAdmin: true,
        createdAt: new Date().toISOString(),
        createdBy: "system"
      });

      console.log("✅ Admin account created successfully!");
      
      // Auto-fill login form
      setEmail(adminEmail);
      setPassword(adminPassword);
      
      setSetupStep(2);
      setError("");
      
    } catch (error) {
      console.error("❌ Admin creation error:", error);
      if (error.code === 'auth/email-already-in-use') {
        setError("✅ Admin account already exists. You can login directly.");
        setEmail(adminEmail);
        setShowSetup(false);
      } else {
        setError(`❌ Setup failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (testEmail, testPassword) => {
    setEmail(testEmail);
    setPassword(testPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 pt-16">
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-96 border border-white/20">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Admin Portal</h2>
          <p className="text-gray-600 mt-2 text-sm">Secure Administrator Access</p>
        </div>
        
        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Email
            </label>
            <input
              type="email"
              placeholder="admin@irgs.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white/50"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white/50"
              required
            />
          </div>
          
          {error && (
            <div className={`p-3 rounded-lg text-sm font-medium ${
              error.includes('✅') 
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Securing Access...
              </div>
            ) : (
              "🔐 Secure Admin Login"
            )}
          </button>
        </form>

        {/* Quick Setup Section */}
        {!showSetup ? (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-800 mb-2">First Time Setup?</p>
            <button
              onClick={() => setShowSetup(true)}
              className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition text-sm font-medium"
            >
              🛠️ Setup Admin Account
            </button>
          </div>
        ) : (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-3">
              {setupStep === 1 ? "Step 1: Create Admin Account" : "Step 2: Login with Credentials"}
            </h3>
            
            {setupStep === 1 && (
              <div className="space-y-3">
                <p className="text-sm text-yellow-700">
                  This will create the main administrator account with full system access.
                </p>
                <button
                  onClick={createFirstAdmin}
                  disabled={loading}
                  className="w-full bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition text-sm font-medium"
                >
                  {loading ? "Creating..." : "Create Admin Account"}
                </button>
              </div>
            )}
            
            {setupStep === 2 && (
              <div className="space-y-3">
                <p className="text-sm text-green-700">
                  ✅ Admin account created! Use these credentials to login:
                </p>
               
                <button
                  onClick={handleLogin}
                  className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition text-sm font-medium"
                >
                  Login Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* Demo Credentials (Remove in production) */}
        

        {/* Navigation */}
        <div className="mt-6 text-center space-y-2">
          <Link to="/" className="block text-blue-600 hover:text-blue-700 text-sm font-medium">
            ← Back to Home
          </Link>
          <Link to="/login" className="block text-gray-600 hover:text-gray-700 text-sm">
            User Login →
          </Link>
        </div>
      </div>
    </div>
  );
}