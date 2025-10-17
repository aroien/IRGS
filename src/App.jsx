// src/App.jsx - UPDATED WITH ALL ADMIN COMPONENTS
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SecurityProvider } from './components/shared/SecurityWrapper';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SetupAdmin from './components/SetupAdmin';
import Register from './pages/auth/Register';  
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/AdminDashboard'; // Main admin dashboard
import UserCourses from './pages/user/Courses';
import AdminLogin from './pages/admin/AdminLogin';
import ProtectedAdmin from './components/ProtectedAdmin';
import ProtectedRoute from './components/ProtectedRoute';

// Import admin components
import UserManagement from './pages/admin/UserManagement';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import StudentDashboard from './pages/user/Dashboard';
import EnrollmentSystem from './components/shared/EnrollmentSystem';
import CourseManagement from './pages/admin/CourseManagement';
import InstructorManagement from './pages/admin/InstructorManagement';
import CertificateManagement from './pages/admin/CertificateManagement';
import AnnouncementManagement from './pages/admin/AnnouncementManagement';
import AdminSidebar from './components/admin/AdminSidebar'
function App() {
  return (
    <SecurityProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              
              {/* User Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              
              {/* Course Routes */}
              <Route path="/courses" element={
                <ProtectedRoute>
                  <EnrollmentSystem /> {/* Course catalog & enrollment */}
                </ProtectedRoute>
              } />
              <Route path="/course/:courseId" element={
                <ProtectedRoute>
                  <UserCourses /> {/* Course details page */}
                </ProtectedRoute>
              } />
              <Route path="/my-courses" element={
                <ProtectedRoute>
                  <StudentDashboard /> {/* Student's enrolled courses */}
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/setup-admin" element={<SetupAdmin />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              
              {/* Main Admin Dashboard */}
              <Route path="/admin" element={
                <ProtectedAdmin>
                  <AdminDashboard /> {/* Main admin dashboard with sidebar */}
                </ProtectedAdmin>
              } />
              
              {/* Admin Sub-routes */}
              <Route path="/admin/users" element={
                <ProtectedAdmin>
                  <UserManagement />
                </ProtectedAdmin>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedAdmin>
                  <AnalyticsDashboard />
                </ProtectedAdmin>
              } />
              <Route path="/admin/courses" element={
                <ProtectedAdmin>
                  <CourseManagement />
                </ProtectedAdmin>
              } />
              <Route path="/admin/instructors" element={
                <ProtectedAdmin>
                  <InstructorManagement />
                </ProtectedAdmin>
              } />
              <Route path="/admin/certificates" element={
                <ProtectedAdmin>
                  <CertificateManagement />
                </ProtectedAdmin>
              } />
              <Route path="/admin/announcements" element={
                <ProtectedAdmin>
                  <AnnouncementManagement />
                </ProtectedAdmin>
              } />
              
              {/* 404 Fallback */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-xl text-gray-600 mb-8">Page not found</p>
                    <a 
                      href="/"
                      className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-semibold transition-colors"
                    >
                      Go Home
                    </a>
                  </div>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </SecurityProvider>
  );
}

export default App;