// src/components/Layout.jsx
export default function Layout({ children, className = "" }) {
    return (
      <div className={`min-h-screen bg-gray-50 pt-20 ${className}`}>
        <div className="max-w-7xl mx-auto p-6">
          {children}
        </div>
      </div>
    );
  }