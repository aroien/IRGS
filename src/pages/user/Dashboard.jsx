// src/components/student/StudentDashboard.jsx - SIMPLIFIED VERSION
import { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      // Get user data
      try {
        const userQuery = query(collection(db, 'users'), where('__name__', '==', userId));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          setUser(userSnapshot.docs[0].data());
        }
      } catch (userError) {
        console.log('No user data found, using default');
        setUser({ displayName: 'Student', email: auth.currentUser?.email });
      }

      // Get enrolled courses - with error handling
      let coursesData = [];
      try {
        const enrollmentsQuery = query(
          collection(db, 'enrollments'),
          where('studentId', '==', userId)
        );
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        
        for (const enrollmentDoc of enrollmentsSnapshot.docs) {
          const enrollment = enrollmentDoc.data();
          try {
            const courseQuery = query(
              collection(db, 'courses'),
              where('__name__', '==', enrollment.courseId)
            );
            const courseSnapshot = await getDocs(courseQuery);
            if (!courseSnapshot.empty) {
              coursesData.push({
                id: enrollment.courseId,
                ...courseSnapshot.docs[0].data(),
                enrollmentDate: enrollment.enrolledAt,
                progress: enrollment.progress || 0
              });
            }
          } catch (courseError) {
            console.log('Course not found for enrollment:', enrollment.courseId);
          }
        }
      } catch (enrollmentError) {
        console.log('No enrollments found');
        // Create demo courses for testing
        coursesData = [
          {
            id: 'demo-course-1',
            title: 'GIS Fundamentals',
            description: 'Introduction to Geographic Information Systems',
            progress: 65,
            enrollmentDate: new Date().toISOString()
          },
          {
            id: 'demo-course-2', 
            title: 'Remote Sensing Basics',
            description: 'Learn satellite imagery analysis',
            progress: 30,
            enrollmentDate: new Date().toISOString()
          }
        ];
      }

      setEnrolledCourses(coursesData);

    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock recent activity since the collection might not exist
  const recentActivity = [
    { description: 'Started GIS Fundamentals course', timestamp: new Date().toISOString() },
    { description: 'Completed module 1: Introduction to GIS', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { description: 'Enrolled in Remote Sensing Basics', timestamp: new Date(Date.now() - 172800000).toISOString() }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-80">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.displayName || 'Student'}! 👋
          </h1>
          <p className="text-gray-600 mt-2">Continue your learning journey</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-600">Enrolled Courses</h3>
            <p className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-600">Completed</h3>
            <p className="text-2xl font-bold text-gray-900">
              {enrolledCourses.filter(course => course.progress === 100).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
            <h3 className="text-sm font-medium text-gray-600">In Progress</h3>
            <p className="text-2xl font-bold text-gray-900">
              {enrolledCourses.filter(course => course.progress > 0 && course.progress < 100).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
            <h3 className="text-sm font-medium text-gray-600">Certificates</h3>
            <p className="text-2xl font-bold text-gray-900">
              {enrolledCourses.filter(course => course.progress === 100).length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enrolled Courses */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
                <a href="/courses" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  Browse More Courses
                </a>
              </div>

              <div className="space-y-4">
                {enrolledCourses.map((course) => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        course.progress === 100 
                          ? 'bg-green-100 text-green-800'
                          : course.progress > 0
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {course.progress === 100 ? 'Completed' : `${course.progress}%`}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Enrolled {new Date(course.enrollmentDate).toLocaleDateString()}</span>
                      <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                        Continue Learning →
                      </button>
                    </div>
                  </div>
                ))}

                {enrolledCourses.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-6xl mb-4">📚</div>
                    <p className="text-gray-500 text-lg">No courses enrolled yet</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Browse our course catalog to get started
                    </p>
                    <a 
                      href="/courses"
                      className="inline-block mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                    >
                      Browse Courses
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a href="/courses" className="block text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900">Browse Courses</div>
                  <div className="text-sm text-gray-600">Discover new courses</div>
                </a>
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900">My Certificates</div>
                  <div className="text-sm text-gray-600">View earned certificates</div>
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900">Learning Path</div>
                  <div className="text-sm text-gray-600">Track your progress</div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}