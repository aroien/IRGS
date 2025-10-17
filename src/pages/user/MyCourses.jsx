// pages/user/Courses.jsx
import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  onSnapshot,
  updateDoc,
  doc
} from "firebase/firestore";
import { useAdmin } from "../../hooks/useAdmin";

// Simple SVG Icon Components
const PlayIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircleIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BookOpenIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const StarIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const SearchIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ChevronLeftIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

export default function UserCourses() {
  const { user } = useAdmin();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeModule, setActiveModule] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadCourses();
    if (user) {
      setupEnrollmentsListener();
    }
  }, [user]);

  async function loadCourses() {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "courses"));
      const coursesData = snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        duration: d.data().duration || "2 hours",
        level: d.data().level || "Beginner",
        rating: d.data().rating || 4.5,
        students: d.data().students || 0,
        modules: d.data().modules || []
      }));
      setCourses(coursesData);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
    }
  }

  function setupEnrollmentsListener() {
    const q = query(
      collection(db, "enrollments"),
      where("userId", "==", user.uid)
    );
    
    return onSnapshot(q, (snapshot) => {
      const enrollmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEnrollments(enrollmentsData);
    });
  }

  async function enrollInCourse(course) {
    if (!user) return;
    
    try {
      await addDoc(collection(db, "enrollments"), {
        userId: user.uid,
        userEmail: user.email,
        courseId: course.id,
        courseTitle: course.title,
        enrolledAt: new Date().toISOString(),
        progress: 0,
        completedModules: [],
        lastAccessed: new Date().toISOString()
      });
    } catch (error) {
      alert("Error enrolling in course: " + error.message);
    }
  }

  async function markModuleComplete(courseId, moduleIndex) {
    if (!user) return;

    try {
      const enrollment = enrollments.find(e => e.courseId === courseId);
      if (!enrollment) return;

      const completedModules = [...(enrollment.completedModules || []), moduleIndex];
      const progress = Math.round((completedModules.length / selectedCourse.modules.length) * 100);

      await updateDoc(doc(db, "enrollments", enrollment.id), {
        completedModules,
        progress,
        lastAccessed: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  }

  function openCourse(course) {
    const enrollment = enrollments.find(e => e.courseId === course.id);
    setSelectedCourse({
      ...course,
      enrollment
    });
    setActiveModule(0);
  }

  function closeCourse() {
    setSelectedCourse(null);
    setActiveModule(0);
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isEnrolled = enrollments.some(e => e.courseId === course.id);
    
    if (filter === "enrolled") return matchesSearch && isEnrolled;
    if (filter === "not-enrolled") return matchesSearch && !isEnrolled;
    return matchesSearch;
  });

  if (selectedCourse) {
    return (
      <CoursePlayer 
        course={selectedCourse}
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        onMarkComplete={markModuleComplete}
        onClose={closeCourse}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="h-6 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Available Courses</h1>
            <p className="text-gray-600">Expand your knowledge with our curated courses</p>
          </div>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0 w-full lg:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <SearchIcon className="w-4 h-4" />
              </div>
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Courses</option>
              <option value="enrolled">My Courses</option>
              <option value="not-enrolled">Not Enrolled</option>
            </select>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const enrollment = enrollments.find(e => e.courseId === course.id);
            const isEnrolled = !!enrollment;

            return (
              <div key={course.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                {/* Course Image/Thumbnail */}
                <div className="h-48 bg-gradient-to-br from-purple-500 to-blue-600 relative">
                  {isEnrolled && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Enrolled
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      {course.level}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{course.title}</h3>
                    <div className="flex items-center text-yellow-500">
                      <StarIcon className="w-4 h-4 fill-current" />
                      <span className="ml-1 text-sm font-semibold">{course.rating}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                  {/* Course Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {course.duration}
                    </div>
                    <div className="flex items-center">
                      <BookOpenIcon className="w-4 h-4 mr-1" />
                      {course.modules.length} modules
                    </div>
                    <div>{course.students} students</div>
                  </div>

                  {/* Progress Bar for enrolled courses */}
                  {isEnrolled && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{enrollment.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${enrollment.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => isEnrolled ? openCourse(course) : enrollInCourse(course)}
                    className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                      isEnrolled 
                        ? "bg-green-500 text-white hover:bg-green-600" 
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    {isEnrolled ? "Continue Learning" : "Enroll Now"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <BookOpenIcon className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-500 text-lg mb-2">No courses found</p>
            <p className="text-gray-400">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Course Player Component
function CoursePlayer({ course, activeModule, onModuleChange, onMarkComplete, onClose }) {
  const currentModule = course.modules[activeModule];
  const isModuleCompleted = course.enrollment?.completedModules?.includes(activeModule);

  return (
    <div className="min-h-screen bg-gray-900 pt-16">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white mb-2 flex items-center"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to Courses
              </button>
              <h1 className="text-2xl font-bold text-white">{course.title}</h1>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Progress</div>
              <div className="text-lg font-bold text-white">{course.enrollment?.progress || 0}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Video Player */}
          <div className="lg:w-2/3">
            <div className="bg-black rounded-lg overflow-hidden aspect-video mb-4">
              {currentModule?.videoUrl ? (
                <video
                  controls
                  className="w-full h-full"
                  poster={currentModule.thumbnail}
                >
                  <source src={currentModule.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <div className="text-center text-gray-400">
                    <PlayIcon className="w-16 h-16 mx-auto mb-4" />
                    <p>Video content coming soon</p>
                  </div>
                </div>
              )}
            </div>

            {/* Module Info */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    {currentModule?.title || "Module Title"}
                  </h2>
                  <p className="text-gray-400">
                    Module {activeModule + 1} of {course.modules.length}
                  </p>
                </div>
                {isModuleCompleted ? (
                  <div className="flex items-center text-green-500">
                    <CheckCircleIcon className="w-6 h-6 mr-2" />
                    Completed
                  </div>
                ) : (
                  <button
                    onClick={() => onMarkComplete(course.id, activeModule)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
              
              <p className="text-gray-300">
                {currentModule?.description || "Module description not available."}
              </p>
            </div>
          </div>

          {/* Course Navigation */}
          <div className="lg:w-1/3">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Course Content</h3>
              <div className="space-y-2">
                {course.modules.map((module, index) => {
                  const isCompleted = course.enrollment?.completedModules?.includes(index);
                  const isActive = index === activeModule;

                  return (
                    <button
                      key={index}
                      onClick={() => onModuleChange(index)}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        isActive 
                          ? "bg-purple-600 text-white" 
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {isCompleted ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-400 rounded-full mr-3"></div>
                          )}
                          <span className="font-medium">{module.title}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {module.duration || "10 min"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}