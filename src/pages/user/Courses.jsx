// pages/user/Courses.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // ADD THESE IMPORTS
import { db } from "../../firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  onSnapshot,
  updateDoc,
  doc,
  getDoc // ADD THIS IMPORT
} from "firebase/firestore";
import { useAdmin } from "../../hooks/useAdmin";

// SVG Icon Components
const PlayIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
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

const VideoIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const FileTextIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export default function UserCourses() {
  const { courseId } = useParams(); // Get course ID from URL
  const navigate = useNavigate(); // For navigation
  const { user } = useAdmin();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeModule, setActiveModule] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("video");

  useEffect(() => {
    if (courseId) {
      // If we have a courseId from URL, load that specific course
      loadSpecificCourse(courseId);
    } else {
      // Otherwise load all courses (for the courses list view)
      loadCourses();
    }
    
    if (user) {
      setupEnrollmentsListener();
    }
  }, [courseId, user]);

  // Load specific course by ID from URL
  const loadSpecificCourse = async (id) => {
    try {
      setLoading(true);
      const courseDoc = await getDoc(doc(db, "courses", id));
      if (courseDoc.exists()) {
        const courseData = {
          id: courseDoc.id,
          ...courseDoc.data(),
          modules: courseDoc.data().modules || generateSampleModules(courseDoc.data().title)
        };
        
        // Check if user is enrolled
        const enrollment = enrollments.find(e => e.courseId === id);
        if (enrollment || user?.isAdmin) {
          // Allow access if enrolled or admin
          setSelectedCourse({
            ...courseData,
            enrollment
          });
        } else {
          // If not enrolled, redirect to courses page
          navigate('/courses');
        }
      } else {
        navigate('/courses');
      }
    } catch (error) {
      console.error('Error loading course:', error);
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

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
        modules: d.data().modules || generateSampleModules(d.data().title)
      }));
      setCourses(coursesData);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
    }
  }

  // Generate sample modules if none exist
  function generateSampleModules(courseTitle) {
    return [
      {
        title: "Introduction to " + courseTitle,
        description: "Get started with the fundamentals and understand the core concepts.",
        duration: "15 min",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        content: `
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Welcome to ${courseTitle}!</h2>
          <p class="text-gray-600 mb-4">This course will take you from beginner to advanced level in understanding ${courseTitle}.</p>
          <h3 class="text-xl font-semibold text-gray-800 mb-3">What You'll Learn:</h3>
          <ul class="list-disc list-inside text-gray-600 space-y-2 mb-4">
            <li>Fundamental concepts and principles</li>
            <li>Practical applications and examples</li>
            <li>Advanced techniques and best practices</li>
            <li>Real-world projects and case studies</li>
          </ul>
          <h3 class="text-xl font-semibold text-gray-800 mb-3">Course Requirements:</h3>
          <p class="text-gray-600">Basic computer knowledge and enthusiasm to learn!</p>
        `,
        resources: [
          { name: "Course Syllabus", type: "pdf", url: "#" },
          { name: "Setup Guide", type: "doc", url: "#" }
        ]
      },
      {
        title: "Setting Up Your Environment",
        description: "Learn how to set up your development environment and tools.",
        duration: "20 min",
        videoUrl: "",
        content: `
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Setting Up Your Development Environment</h2>
          <p class="text-gray-600 mb-4">Proper setup is crucial for success in this course.</p>
          <h3 class="text-xl font-semibold text-gray-800 mb-3">Required Tools:</h3>
          <ol class="list-decimal list-inside text-gray-600 space-y-2 mb-4">
            <li>Code Editor (VS Code recommended)</li>
            <li>Web Browser (Chrome/Firefox)</li>
            <li>Node.js (LTS version)</li>
          </ol>
          <h3 class="text-xl font-semibold text-gray-800 mb-3">Installation Steps:</h3>
          <p class="text-gray-600 mb-2">Follow these steps to get everything set up:</p>
          <pre class="bg-gray-800 text-white p-4 rounded-lg mb-4 overflow-x-auto"><code>npm install -g required-packages</code></pre>
          <p class="text-gray-600">Verify your installation by running:</p>
          <pre class="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto"><code>node --version</code></pre>
        `,
        resources: [
          { name: "Installation Guide", type: "pdf", url: "#" },
          { name: "VS Code Extensions", type: "doc", url: "#" }
        ]
      },
      {
        title: "Core Concepts Deep Dive",
        description: "Deep dive into the fundamental concepts with practical examples.",
        duration: "30 min",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        content: `
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Core Concepts Explained</h2>
          <p class="text-gray-600 mb-4">Let's explore the fundamental concepts that form the foundation of ${courseTitle}.</p>
          <h3 class="text-xl font-semibold text-gray-800 mb-3">Key Principles:</h3>
          <div class="bg-gray-100 p-4 rounded-lg my-4">
            <h4 class="font-bold text-gray-800">Principle 1: Simplicity</h4>
            <p class="text-gray-600 mt-2">Keep your code simple and readable. Complex solutions often lead to maintenance issues.</p>
          </div>
          <div class="bg-gray-100 p-4 rounded-lg my-4">
            <h4 class="font-bold text-gray-800">Principle 2: Efficiency</h4>
            <p class="text-gray-600 mt-2">Write efficient code that performs well and uses resources wisely.</p>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-3">Practical Example:</h3>
          <pre class="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto">
            <code>function calculateTotal(items) {
  return items.reduce((total, item) => total + item.price, 0);
}</code>
          </pre>
        `,
        resources: [
          { name: "Cheat Sheet", type: "pdf", url: "#" },
          { name: "Practice Exercises", type: "zip", url: "#" }
        ]
      }
    ];
  }

  function setupEnrollmentsListener() {
    if (!user) return;
    
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
      
      // If we're viewing a specific course, update its enrollment data
      if (courseId && selectedCourse) {
        const enrollment = enrollmentsData.find(e => e.courseId === courseId);
        if (enrollment) {
          setSelectedCourse(prev => ({
            ...prev,
            enrollment
          }));
        }
      }
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
      alert(`Successfully enrolled in ${course.title}!`);
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

  // Use navigation for opening courses
  function openCourse(course) {
    navigate(`/course/${course.id}`);
  }

  // Use navigation for closing course view
  function closeCourse() {
    navigate('/courses');
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isEnrolled = enrollments.some(e => e.courseId === course.id);
    
    if (filter === "enrolled") return matchesSearch && isEnrolled;
    if (filter === "not-enrolled") return matchesSearch && !isEnrolled;
    return matchesSearch;
  });

  // Show course player if we have a selected course (from URL or state)
  if (selectedCourse) {
    return (
      <CoursePlayer 
        course={selectedCourse}
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        onMarkComplete={markModuleComplete}
        onClose={closeCourse}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
    );
  }

  // Show loading state
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Show course list (default view when no courseId in URL)
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full lg:w-64"
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
              <CourseCard 
                key={course.id}
                course={course}
                enrollment={enrollment}
                isEnrolled={isEnrolled}
                onEnroll={enrollInCourse}
                onOpen={openCourse}
              />
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

// Course Card Component
function CourseCard({ course, enrollment, isEnrolled, onEnroll, onOpen }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
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

        {isEnrolled && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{enrollment?.progress || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${enrollment?.progress || 0}%` }}
              ></div>
            </div>
          </div>
        )}

        <button
          onClick={() => isEnrolled ? onOpen(course) : onEnroll(course)}
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
}

// Course Player Component with Split Layout
function CoursePlayer({ course, activeModule, onModuleChange, onMarkComplete, onClose, viewMode, onViewModeChange }) {
  const currentModule = course.modules[activeModule];
  const isModuleCompleted = course.enrollment?.completedModules?.includes(activeModule);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900 flex items-center transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Back to Courses
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-800">{course.title}</h1>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Progress</div>
              <div className="text-lg font-bold text-gray-800">{course.enrollment?.progress || 0}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Left Side - Course Navigation */}
          <div className="xl:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Course Content</h3>
                <p className="text-sm text-gray-600">{course.modules.length} modules</p>
              </div>
              
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="p-4 space-y-2">
                  {course.modules.map((module, index) => {
                    const isCompleted = course.enrollment?.completedModules?.includes(index);
                    const isActive = index === activeModule;

                    return (
                      <button
                        key={index}
                        onClick={() => onModuleChange(index)}
                        className={`w-full text-left p-3 rounded-lg transition-all border ${
                          isActive 
                            ? "bg-purple-50 border-purple-200 text-purple-700" 
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs mt-0.5 ${
                              isCompleted 
                                ? "bg-green-500 text-white" 
                                : isActive
                                ? "bg-purple-600 text-white"
                                : "bg-gray-200 text-gray-600"
                            }`}>
                              {isCompleted ? "✓" : index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-medium text-sm leading-tight ${
                                isActive ? "text-purple-800" : "text-gray-800"
                              }`}>
                                {module.title}
                              </h4>
                              <div className="flex items-center mt-1 text-xs text-gray-500">
                                <ClockIcon className="w-3 h-3 mr-1" />
                                {module.duration}
                                {module.videoUrl && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <VideoIcon className="w-3 h-3 mr-1" />
                                    Video
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          {isCompleted && (
                            <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content Area */}
          <div className="xl:w-3/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Module Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {currentModule?.title || "Module Title"}
                    </h2>
                    <p className="text-gray-600">
                      Module {activeModule + 1} of {course.modules.length}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                    {/* View Mode Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => onViewModeChange("video")}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          viewMode === "video" 
                            ? "bg-white text-gray-800 shadow-sm" 
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        <VideoIcon className="w-4 h-4 mr-2" />
                        Video
                      </button>
                      <button
                        onClick={() => onViewModeChange("content")}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          viewMode === "content" 
                            ? "bg-white text-gray-800 shadow-sm" 
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        <FileTextIcon className="w-4 h-4 mr-2" />
                        Content
                      </button>
                    </div>
                    
                    {!isModuleCompleted && (
                      <button
                        onClick={() => onMarkComplete(course.id, activeModule)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6">
                {viewMode === "video" && currentModule?.videoUrl ? (
                  <div className="bg-black rounded-lg overflow-hidden aspect-video mb-6">
                    <video
                      controls
                      className="w-full h-full"
                      poster={currentModule.thumbnail}
                    >
                      <source src={currentModule.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : viewMode === "video" && !currentModule?.videoUrl ? (
                  <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center mb-6">
                    <div className="text-center text-gray-400">
                      <VideoIcon className="w-16 h-16 mx-auto mb-4" />
                      <p className="text-lg">No video available for this module</p>
                      <p className="text-sm mt-2">Switch to content view or check back later</p>
                    </div>
                  </div>
                ) : null}

                {/* Module Description */}
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">About this module</h3>
                  <p className="text-gray-600 mb-6">{currentModule?.description}</p>

                  {/* Module Content */}
                  {viewMode === "content" && currentModule?.content && (
                    <div 
                      className="module-content"
                      dangerouslySetInnerHTML={{ __html: currentModule.content }}
                    />
                  )}

                  {/* Resources */}
                  {currentModule?.resources && currentModule.resources.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Resources</h4>
                      <div className="grid gap-3">
                        {currentModule.resources.map((resource, index) => (
                          <a
                            key={index}
                            href={resource.url}
                            className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <FileTextIcon className="w-5 h-5 text-gray-400 mr-3" />
                            <span className="text-gray-700">{resource.name}</span>
                            <span className="ml-auto text-sm text-gray-500 uppercase">
                              {resource.type}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between">
                  <button
                    onClick={() => onModuleChange(activeModule - 1)}
                    disabled={activeModule === 0}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      activeModule === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>
                  
                  <button
                    onClick={() => onModuleChange(activeModule + 1)}
                    disabled={activeModule === course.modules.length - 1}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      activeModule === course.modules.length - 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    Next Module
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton Component
function LoadingSkeleton() {
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

// Empty State Component
function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <BookOpenIcon className="w-16 h-16 mx-auto" />
      </div>
      <p className="text-gray-500 text-lg mb-2">No courses found</p>
      <p className="text-gray-400">Try adjusting your search or filter</p>
    </div>
  );
}