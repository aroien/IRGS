// src/components/shared/ModernUI.jsx
import { useState, useEffect } from 'react';

// Modern Loading Component
export function ModernLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-4 border-indigo-600 rounded-full animate-ping"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading amazing content...</p>
      </div>
    </div>
  );
}

// Modern Card Component
export function ModernCard({ children, className = '', hover = true }) {
  return (
    <div className={`
      bg-white rounded-2xl shadow-sm border border-gray-100 
      ${hover ? 'hover:shadow-lg hover:scale-[1.02]' : ''}
      transition-all duration-300 backdrop-blur-sm bg-white/80
      ${className}
    `}>
      {children}
    </div>
  );
}

// Animated Stats Card
export function StatsCard({ title, value, change, icon, color = 'blue' }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <ModernCard hover={true}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {change && (
              <p className={`text-sm mt-1 ${
                change > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {change > 0 ? '↗' : '↘'} {Math.abs(change)}%
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-r ${colors[color]} text-white`}>
            {icon}
          </div>
        </div>
      </div>
    </ModernCard>
  );
}

// Modern Button Component
export function ModernButton({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  ...props 
}) {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 focus:ring-4 focus:outline-none';
  
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-200',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-200 border border-gray-200',
    danger: 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 focus:ring-red-200'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${
        loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

// Glass Morphism Navigation
export function GlassNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${scrolled 
        ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200' 
        : 'bg-transparent'
      }
    `}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">IRGS</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Institute
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {['Home', 'Courses', 'Dashboard', 'Admin'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-indigo-600 transition-colors">
              🔔
            </button>
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <span className="text-indigo-600 font-semibold">U</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Animated Feature Cards
export function FeatureCard({ title, description, icon, delay = 0 }) {
  return (
    <ModernCard className="group">
      <div className="p-6">
        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </ModernCard>
  );
}

// Gradient Background Component
export function GradientBackground({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {children}
    </div>
  );
}

// Modern Form Input
export function ModernInput({ label, type = 'text', ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type={type}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
        {...props}
      />
    </div>
  );
}