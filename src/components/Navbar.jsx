// components/Navbar.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAdmin } from "../hooks/useAdmin";

export default function Navbar() {
  const { user, isAdmin, loading } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("adminUID");
      setIsProfileOpen(false);
      setIsMobileMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Searching for: ${searchQuery}`);
      // You can implement actual search functionality here
      navigate(`/search?q=${searchQuery}`);
    }
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/courses", label: "Courses" },
  ];

  return (
    <nav className="w-full bg-white/98 backdrop-blur-md text-gray-800 shadow-sm px-4 sm:px-8 py-4 flex justify-between items-center fixed top-0 left-0 z-50 border-b border-gray-200">
      {/* Logo and Mobile Menu Button */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden bg-white/95 p-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-gray-100 transition "
        >
          {isMobileMenuOpen ? (
            <span className="text-xl">✕</span>
          ) : (
            <span className="text-xl">☰</span>
          )}
        </button>

        {/* Logo */}
        <Link to="/" className="text-xl sm:text-2xl font-bold text-purple-600">
          IRGS
        </Link>
      </div>

      {/* Desktop Navigation Links - Hidden on mobile */}
      <div className="hidden lg:flex gap-8 font-medium text-lg items-center absolute left-1/2 transform -translate-x-1/2">
        {navLinks.map((link) => (
          <Link 
            key={link.path}
            to={link.path} 
            className={`hover:text-purple-600 transition-all duration-300 hover:scale-105 ${
              location.pathname === link.path ? 'text-purple-600 font-semibold' : 'text-gray-700'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right Section - Search & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search Bar - Hidden on small mobile */}
        <form onSubmit={handleSearch} className="hidden sm:block relative">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-32 md:w-48 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600"
          >
            🔍
          </button>
        </form>

        {/* Admin Panel Button (Only for admins) */}
        {!loading && (isAdmin || localStorage.getItem("isAdmin") === "true") && (
          <Link 
            to="/admin" 
            className="hidden sm:block bg-green-600 text-white px-3 sm:px-4 py-2 rounded-full hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-sm"
          >
            Admin
          </Link>
        )}

        {/* User Authentication Section */}
        {!loading && user ? (
          // User is logged in - Show profile dropdown
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:block">Profile</span>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-purple-300 rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                  {isAdmin && (
                    <p className="text-xs text-green-600 font-medium">Administrator</p>
                  )}
                </div>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                  onClick={() => setIsProfileOpen(false)}
                >
                  📊 Dashboard
                </Link>
                <Link
                  to="/courses"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                  onClick={() => setIsProfileOpen(false)}
                >
                  📚 My Courses
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          // User is not logged in - Show auth buttons
          <div className="flex gap-2 sm:gap-3">
            <Link
              to="/login"
              className="hidden sm:block px-3 sm:px-4 py-2 text-gray-700 hover:text-purple-600 transition font-medium text-sm sm:text-base"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 sm:px-6 py-2 rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-sm"
            >
              <span className="hidden sm:inline">Sign Up</span>
              <span className="sm:hidden">Join</span>
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay with Better Background */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-gray-900/20 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div className={`
        lg:hidden fixed top-0 left-0 h-full w-80 max-w-full bg-white/95 backdrop-blur-md shadow-xl z-50 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 bg-white/95 border-b border-gray-200/60">
          <div className="flex items-center justify-between mb-6">
            <Link 
              to="/" 
              className="text-2xl font-bold text-purple-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              IRGS
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-gray-100/50 transition"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mb-6">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white/80 backdrop-blur-sm"
            />
          </form>
        </div>

        <div className="p-6 bg-white/95">
          {/* Mobile Navigation Links */}
          <div className="space-y-4 mb-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block py-3 px-4 rounded-lg text-lg font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-600 border-l-4 border-purple-600 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50/80 hover:text-purple-600 hover:translate-x-2'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Admin Panel */}
          {!loading && (isAdmin || localStorage.getItem("isAdmin") === "true") && (
            <Link 
              to="/admin" 
              className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-lg text-center hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold mb-6"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Admin Panel
            </Link>
          )}

          {/* Mobile Authentication Section */}
          {!loading && user ? (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100/80 rounded-lg border border-gray-200/60">
                <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                {isAdmin && (
                  <p className="text-xs text-green-600 font-medium mt-1">Administrator</p>
                )}
              </div>
              <Link
                to="/dashboard"
                className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-gray-50/80 rounded-lg transition-all duration-200 hover:translate-x-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>📊</span>
                <span>Dashboard</span>
              </Link>
              <Link
                to="/courses"
                className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-gray-50/80 rounded-lg transition-all duration-200 hover:translate-x-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>📚</span>
                <span>My Courses</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full text-left py-3 px-4 text-red-600 hover:bg-red-50/80 rounded-lg transition-all duration-200 hover:translate-x-2"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full text-center px-4 py-3 text-gray-700 border border-gray-300/80 rounded-lg hover:border-purple-600 hover:text-purple-600 transition-all duration-300 hover:shadow-md font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block w-full text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(isProfileOpen || isMobileMenuOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsProfileOpen(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </nav>
  );
}