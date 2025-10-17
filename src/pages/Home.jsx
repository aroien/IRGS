import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import background from '../assets/hero-bg.png';
import profile from '../assets/profile.jpg';

export default function Home() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Searching for: ${searchQuery}`);
      // You can implement actual search functionality here
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsProfileOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      

      {/* Main Content with proper spacing for fixed navbar */}
      <div className=""> {/* This prevents content from being hidden behind navbar */}
        
        {/* Hero Section with Banner Image */}
        <section
          id="home"
          className="relative min-h-screen flex items-center justify-center text-center px-6 overflow-hidden"
        style={{marginTop:0}}
        >
          {/* Background Image with Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${background})`,

            }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
          </div>
          
          {/* Hero Content */}
          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white leading-tight">
              Institute of GIS <br /> and Remote Sensing
              <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Experiences
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto leading-relaxed">
              We build stunning, high-performance Argis with modern technologies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="#projects"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-8 py-4 rounded-full shadow-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl text-lg"
              >
                View My Work
              </a>
              <a
                href="#about"
                className="border-2 border-white text-white font-semibold px-8 py-4 rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:-translate-y-1 text-lg"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section
          id="about"
          className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-50 to-white text-gray-800 px-6 py-20"
        >
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              About Us
            </h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-left">
                <p className="text-xl mb-6 leading-relaxed">
                  We are professonal working on ARGIS
                </p>
                <p className="text-xl mb-8 leading-relaxed">
                  My expertise includes GIS, Remote Sensing, ARGIS technologies. 
                  I believe in clean, maintainable maps and creating experiences that 
                  users love.
                </p>
                <div className="flex flex-wrap gap-4">
                  <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-medium">ARGIS</span>
                  <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">GIS</span>
                  <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">Remote Sensing</span>
                  <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-medium">Maps</span>
                </div>
              </div>
              <div className="relative">
                <div className="w-80 h-80 mx-auto bg-gradient-to-br from-purple-200 to-blue-800 rounded-full overflow-hidden shadow-2xl">
                  <img 
                    src={profile}
                    alt="Developer"
                    className="w-full h-full object-cover mix-blend-overlay"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section
          id="projects"
          className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-tr from-gray-900 to-gray-800 text-white px-6 py-20"
        >
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-5xl font-bold mb-4">Featured Projects</h2>
            <p className="text-xl mb-12 text-gray-300 max-w-2xl mx-auto">
              Here are some of my recent projects that showcase my skills and passion for development.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Project 1 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:transform hover:-translate-y-2 transition-all duration-300 border border-white/20">
                <div className="w-full h-48 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl mb-4"></div>
                <h3 className="text-2xl font-bold mb-2">AR</h3>
                <p className="text-gray-300 mb-4">A modern online shopping experience with React and Node.js</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">React</span>
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">Node.js</span>
                  <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">MongoDB</span>
                </div>
              </div>

              {/* Project 2 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:transform hover:-translate-y-2 transition-all duration-300 border border-white/20">
                <div className="w-full h-48 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl mb-4"></div>
                <h3 className="text-2xl font-bold mb-2">Task Management App</h3>
                <p className="text-gray-300 mb-4">Productivity app with real-time collaboration features</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">Vue.js</span>
                  <span className="bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full text-sm">Firebase</span>
                  <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm">PWA</span>
                </div>
              </div>

              {/* Project 3 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:transform hover:-translate-y-2 transition-all duration-300 border border-white/20">
                <div className="w-full h-48 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl mb-4"></div>
                <h3 className="text-2xl font-bold mb-2">Social Media Dashboard</h3>
                <p className="text-gray-300 mb-4">Analytics dashboard for social media management</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm">React</span>
                  <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm">D3.js</span>
                  <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-sm">GraphQL</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Signup Section */}
        <section
          id="signup"
          className="min-h-[70vh] flex flex-col justify-center items-center bg-gradient-to-br from-purple-50 to-blue-50 text-gray-900 px-6 py-20"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Stay Connected
            </h2>
            <p className="text-xl mb-8 text-gray-600 max-w-xl mx-auto">
              Join my newsletter to get updates on my latest projects, tutorials, and web development insights.
            </p>
            
            <form className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-2xl border border-gray-100">
              <div className="mb-6">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-6 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 text-lg transition-all duration-300"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl text-lg"
              >
                Subscribe Now
              </button>
              <p className="text-sm text-gray-500 mt-4">
                No spam ever. Unsubscribe at any time.
              </p>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
              IRGS
            </div>
            <p className="text-gray-400 mb-8">
              Building the future, one line of code at a time.
            </p>
            <div className="flex justify-center gap-6 mb-8">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                GitHub
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                LinkedIn
              </a>
            </div>
            <p className="text-gray-500 text-sm">
              © 2025 IRGS. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      {/* Close dropdown when clicking outside */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </div>
  );
}