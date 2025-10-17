// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { db, storage } from "../../firebase";
import { 
  collection, getDocs, addDoc, doc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Components
import AdminSidebar from "../../components/admin/AdminSidebar";
import DashboardOverview from "../../components/admin/DashboardOverview";
import UserManagement from "./UserManagement";
import CourseManagement from "../../components/admin/CourseManagement";
import CertificateManagement from "../../components/admin/CertificateManagement";
import AnnouncementManagement from "../../components/admin/AnnouncementManagement";
import InstructorManagement from "../../components/admin/InstructorManagement";
import AnalyticsDashboard from "../../components/admin/AnalyticsDashboard";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Initialize stats with default values to prevent undefined errors
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalCertificates: 0,
    activeUsers: 0,
    totalInstructors: 0,
    pendingEnrollments: 0,
    revenue: 0
  });

  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    loadInitialData();
    setupRealtimeListeners();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [usersData, coursesData, instructorsData, certificatesData, announcementsData] = await Promise.all([
        loadUsers(),
        loadCourses(),
        loadInstructors(),
        loadCertificates(),
        loadAnnouncements()
      ]);
      
      // Update stats after all data is loaded
      updateStats(usersData, coursesData, certificatesData, instructorsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListeners = () => {
    // Users listener
    const usersUnsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      updateStats(usersData, courses, certificates, instructors);
    });

    // Courses listener
    const coursesUnsubscribe = onSnapshot(collection(db, "courses"), (snapshot) => {
      const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(coursesData);
      updateStats(users, coursesData, certificates, instructors);
    });

    // Certificates listener
    const certificatesUnsubscribe = onSnapshot(collection(db, "certificates"), (snapshot) => {
      const certificatesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCertificates(certificatesData);
      updateStats(users, courses, certificatesData, instructors);
    });

    return () => {
      usersUnsubscribe();
      coursesUnsubscribe();
      certificatesUnsubscribe();
    };
  };

  const updateStats = (usersData = [], coursesData = [], certificatesData = [], instructorsData = []) => {
    const activeUsers = usersData.filter(user => user.status === 'active').length;
    const instructorUsers = usersData.filter(user => user.role === 'instructor');
    
    setStats({
      totalUsers: usersData.length,
      totalCourses: coursesData.length,
      totalCertificates: certificatesData.length,
      activeUsers,
      totalInstructors: instructorUsers.length,
      pendingEnrollments: 0, // You can calculate this from enrollments
      revenue: 0 // Add revenue calculation if you have payments
    });
  };

  const loadUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      return usersData;
    } catch (error) {
      console.error("Error loading users:", error);
      return [];
    }
  };

  const loadCourses = async () => {
    try {
      const snapshot = await getDocs(collection(db, "courses"));
      const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(coursesData);
      return coursesData;
    } catch (error) {
      console.error("Error loading courses:", error);
      return [];
    }
  };

  const loadInstructors = async () => {
    try {
      const q = query(collection(db, "users"), where("role", "==", "instructor"));
      const snapshot = await getDocs(q);
      const instructorsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInstructors(instructorsData);
      return instructorsData;
    } catch (error) {
      console.error("Error loading instructors:", error);
      return [];
    }
  };

  const loadCertificates = async () => {
    try {
      const snapshot = await getDocs(collection(db, "certificates"));
      const certificatesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCertificates(certificatesData);
      return certificatesData;
    } catch (error) {
      console.error("Error loading certificates:", error);
      return [];
    }
  };

  const loadAnnouncements = async () => {
    try {
      const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const announcementsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAnnouncements(announcementsData);
      return announcementsData;
    } catch (error) {
      console.error("Error loading announcements:", error);
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center mt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }
  

  return (
    <div className="flex h-screen bg-gray-50 mt-20">
      {/* Sidebar */}
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <main className="p-4 lg:p-8">
          {activeTab === "dashboard" && (
            <DashboardOverview 
              stats={stats} 
              recentUsers={users.slice(0, 5)} 
            />
          )}

          {activeTab === "users" && (
            <UserManagement 
              users={users} 
              onUsersUpdate={loadUsers}
            />
          )}

          {activeTab === "courses" && (
            <CourseManagement 
              courses={courses}
              onCoursesUpdate={loadCourses}
            />
          )}

          {activeTab === "instructors" && (
            <InstructorManagement 
              instructors={instructors}
              users={users}
              onInstructorsUpdate={loadInstructors}
            />
          )}

          {activeTab === "certificates" && (
            <CertificateManagement 
              certificates={certificates}
              courses={courses}
              onCertificatesUpdate={loadCertificates}
            />
          )}

          {activeTab === "announcements" && (
            <AnnouncementManagement 
              announcements={announcements}
              onAnnouncementsUpdate={loadAnnouncements}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsDashboard 
              stats={stats}
              users={users}
              courses={courses}
            />
          )}
        </main>
      </div>
    </div>
  );
}