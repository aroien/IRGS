// src/components/shared/EnrollmentSystem.jsx
import { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, getDocs, addDoc, query, where, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function EnrollmentSystem() {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
    loadEnrollments();
  }, []);

  const loadCourses = async () => {
    try {
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadEnrollments = async () => {
    try {
      const userId = auth.currentUser.uid;
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('studentId', '==', userId)
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      const enrolledCourseIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);
      setEnrolledCourses(enrolledCourseIds);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    }
  };

  const enrollInCourse = async (courseId) => {
    setLoading(true);
    try {
      const userId = auth.currentUser.uid;
      
      // Check if already enrolled
      if (enrolledCourses.includes(courseId)) {
        alert('You are already enrolled in this course!');
        return;
      }

      // Create enrollment record
      await addDoc(collection(db, 'enrollments'), {
        studentId: userId,
        courseId: courseId,
        enrolledAt: new Date().toISOString(),
        status: 'active',
        progress: 0,
        lastAccessed: new Date().toISOString()
      });

      // Record activity
      await addDoc(collection(db, 'user_activity'), {
        userId: userId,
        type: 'enrollment',
        description: `Enrolled in course: ${courses.find(c => c.id === courseId)?.title}`,
        timestamp: new Date().toISOString()
      });

      alert('Successfully enrolled in the course!');
      loadEnrollments();
      
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Error enrolling in course: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openCourse = (courseId) => {
    // Navigate to course details page
    navigate(`/course/${courseId}`);
  };

  const isEnrolled = (courseId) => enrolledCourses.includes(courseId);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto mt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Course Catalog</h1>
          <p className="text-gray-600 mt-2">Browse and enroll in available courses</p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div 
              key={course.id} 
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => isEnrolled(course.id) && openCourse(course.id)}
            >
              {/* Course Image/Thumbnail */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
                <span className="text-white text-4xl">📚</span>
                {isEnrolled(course.id) && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Enrolled
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>🕒 {course.duration || 'Self-paced'}</span>
                    <span>👥 {course.enrolledCount || 0} students</span>
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    {course.level || 'Beginner'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">
                      {course.price === 0 || !course.price ? 'Free' : `$${course.price}`}
                    </span>
                  </div>
                  
                  {isEnrolled(course.id) ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCourse(course.id);
                      }}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                    >
                      Open Course
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        enrollInCourse(course.id);
                      }}
                      disabled={loading}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold transition-colors"
                    >
                      {loading ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  )}
                </div>

                {/* Progress for enrolled courses */}
                {isEnrolled(course.id) && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Your Progress</span>
                      <span>0%</span> {/* You can fetch actual progress from enrollments */}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <p className="text-gray-500 text-lg">No courses available yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Check back later for new courses
            </p>
          </div>
        )}
      </div>
    </div>
  );
}