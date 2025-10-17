import React from "react";
import { useState } from "react";
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import Navbar from '../../components/Navbar';

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    
    // Validation
    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    
    if (password.length < 6) {
      setError("Password should be at least 6 characters");
      return;
    }

    if (!email.includes('@')) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User registered:", userCredential.user);
      navigate("/");
    } catch (err) {
      console.error("Firebase error:", err);
      
      // Better error messages
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError("This email is already registered. Please use a different email or login.");
          break;
        case 'auth/invalid-email':
          setError("Invalid email address format.");
          break;
        case 'auth/weak-password':
          setError("Password is too weak. Please use a stronger password.");
          break;
        case 'auth/invalid-credential':
          setError("Authentication error. Please check your Firebase configuration.");
          break;
        default:
          setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 px-4 pt-16">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Create Account
        </h2>
        <p className="text-gray-600 text-center mb-6">Join us today!</p>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <div>
            <input
              type="email"
              placeholder="Email address"
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Password (min. 6 characters)"
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Confirm password"
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        
        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-600 font-semibold hover:text-purple-700 transition">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}