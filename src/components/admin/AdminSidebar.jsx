// src/components/admin/AdminSidebar.jsx
import { useState, useEffect } from "react";

const AdminSidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto-close sidebar on mobile when clicking outside or changing tabs
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      const handleClickOutside = (event) => {
        if (!event.target.closest('.sidebar') && !event.target.closest('.mobile-menu-button')) {
          setSidebarOpen(false);
        }
      };

      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobile, sidebarOpen, setSidebarOpen]);

  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: "📊", badge: null },
    { id: "users", name: "User Management", icon: "👥", badge: null },
    { id: "courses", name: "Course Management", icon: "📚", badge: null },
    { id: "instructors", name: "Instructors", icon: "👨‍🏫", badge: null },
    { id: "certificates", name: "Certificates", icon: "🏆", badge: null },
    { id: "announcements", name: "Announcements", icon: "📢", badge: null },
    { id: "analytics", name: "Analytics", icon: "📈", badge: null },
  ];

  const handleMenuItemClick = (itemId) => {
    setActiveTab(itemId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        sidebar fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-sm shadow-2xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:bg-white lg:backdrop-blur-none lg:shadow-lg
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isMobile ? 'border-r-0' : 'border-r border-gray-200'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
              A
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
              <p className="text-sm text-gray-600 hidden sm:block">Management Console</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuItemClick(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-600 border border-indigo-200 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-800 hover:shadow-sm"
              }`}
            >
              <span className={`text-lg transition-transform duration-200 group-hover:scale-110 ${
                activeTab === item.id ? 'scale-110' : ''
              }`}>
                {item.icon}
              </span>
              <span className="font-medium text-left flex-1">{item.name}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/60 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg">
              <span className="text-sm">AU</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">Admin User</p>
              <p className="text-xs text-gray-600 truncate">Super Administrator</p>
            </div>
            <button className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 right-6 z-50 lg:hidden mobile-menu-button w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          {sidebarOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      )}
    </>
  );
};

export default AdminSidebar;