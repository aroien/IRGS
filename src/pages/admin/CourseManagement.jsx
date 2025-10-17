// src/pages/admin/CourseManagement.jsx
import { useState, useEffect } from "react";
import { db, storage } from "../../firebase";
import { collection, onSnapshot, doc, deleteDoc, addDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CourseCard = ({ course, onDelete, onEdit, loading }) => {
  const [imageLoaded, setImageLoaded] = useState(true);

  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Course Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
        {course.thumbnail && imageLoaded ? (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageLoaded(false)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <span className="text-4xl">📚</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
            course.level === 'beginner' ? 'bg-green-100 text-green-800' :
            course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {course.level}
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="bg-black/60 text-white px-2 py-1 rounded-lg text-sm font-medium">
            {course.price === 0 ? "FREE" : `$${course.price}`}
          </span>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="font-bold text-xl text-gray-800 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
            {course.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        </div>

        {/* Course Meta */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span>📦</span>
              <span>{course.modules?.length || 0} modules</span>
            </span>
            <span className="flex items-center space-x-1">
              <span>⏱️</span>
              <span>{course.duration || 'N/A'}</span>
            </span>
          </div>
          <span className="flex items-center space-x-1">
            <span>👥</span>
            <span>{course.enrolledStudents || 0}</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(course)}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 px-3 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            Edit
          </button>
          <button 
            onClick={() => onDelete(course.id)}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-2 px-3 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "",
    level: "beginner",
    duration: "",
    price: 0,
    instructor: "",
    thumbnail: null
  });
  const [courseModules, setCourseModules] = useState([]);
  const [currentModule, setCurrentModule] = useState({
    title: "",
    description: "",
    type: "video",
    content: "",
    duration: "",
    resources: []
  });

  // Fetch courses from Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "courses"),
      (snapshot) => {
        const coursesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCourses(coursesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching courses:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      // Validate required fields
      if (!courseForm.title || !courseForm.description || !courseForm.category) {
        alert("Please fill in all required fields: Title, Description, and Category");
        return;
      }

      // Upload thumbnail if exists
      let thumbnailUrl = "";
      if (courseForm.thumbnail && courseForm.thumbnail instanceof File) {
        const thumbnailRef = ref(storage, `courses/thumbnails/${Date.now()}-${courseForm.thumbnail.name}`);
        await uploadBytes(thumbnailRef, courseForm.thumbnail);
        thumbnailUrl = await getDownloadURL(thumbnailRef);
      } else if (editingCourse && courseForm.thumbnail) {
        // If editing and thumbnail is already a URL, keep it
        thumbnailUrl = courseForm.thumbnail;
      }

      // Prepare course data
      const courseData = {
        title: courseForm.title,
        description: courseForm.description,
        category: courseForm.category,
        level: courseForm.level,
        duration: courseForm.duration,
        price: parseFloat(courseForm.price) || 0,
        instructor: courseForm.instructor || "Admin",
        thumbnail: thumbnailUrl,
        modules: courseModules,
        updatedAt: new Date().toISOString(),
        status: "active",
        enrolledStudents: editingCourse ? (editingCourse.enrolledStudents || 0) : 0,
        rating: editingCourse ? (editingCourse.rating || 0) : 0,
        reviews: editingCourse ? (editingCourse.reviews || []) : []
      };

      if (editingCourse) {
        // Add createdAt for new courses
        if (!editingCourse.createdAt) {
          courseData.createdAt = new Date().toISOString();
        }
        await updateDoc(doc(db, "courses", editingCourse.id), courseData);
        alert("Course updated successfully!");
      } else {
        // For new courses, add createdAt
        courseData.createdAt = new Date().toISOString();
        await addDoc(collection(db, "courses"), courseData);
        alert("Course created successfully!");
      }

      resetForm();
      
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Error saving course: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setCourseForm({
      title: "",
      description: "",
      category: "",
      level: "beginner",
      duration: "",
      price: 0,
      instructor: "",
      thumbnail: null
    });
    setCourseModules([]);
    setCurrentModule({
      title: "",
      description: "",
      type: "video",
      content: "",
      duration: "",
      resources: []
    });
    setShowCourseForm(false);
    setEditingCourse(null);
    setActiveTab('overview');
  };

  const addModule = () => {
    if (currentModule.title && currentModule.description) {
      setCourseModules([...courseModules, { 
        ...currentModule, 
        id: Date.now().toString(),
        order: courseModules.length + 1
      }]);
      setCurrentModule({
        title: "",
        description: "",
        type: "video",
        content: "",
        duration: "",
        resources: []
      });
    } else {
      alert("Please fill in module title and description");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
    
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, "courses", courseId));
      alert("Course deleted successfully!");
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Error deleting course: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const editCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "",
      level: course.level || "beginner",
      duration: course.duration || "",
      price: course.price || 0,
      instructor: course.instructor || "",
      thumbnail: course.thumbnail || null
    });
    setCourseModules(course.modules || []);
    setShowCourseForm(true);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourseForm(prev => ({ ...prev, thumbnail: file }));
    }
  };

  const stats = {
    total: courses.length,
    published: courses.filter(c => c.status === 'active').length,
    draft: courses.filter(c => c.status === 'draft').length,
    totalStudents: courses.reduce((sum, course) => sum + (course.enrolledStudents || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 p-6 rounded-2xl h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-br from-gray-800 to-indigo-600 bg-clip-text text-transparent">
              Course Management
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Create, manage, and track your course offerings
            </p>
          </div>
          <button
            onClick={() => setShowCourseForm(true)}
            className="mt-4 lg:mt-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-3 font-medium"
          >
            <span className="text-lg">📚</span>
            Create New Course
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Courses", value: stats.total, icon: "📚", color: "from-blue-500 to-cyan-600" },
            { label: "Published", value: stats.published, icon: "✅", color: "from-green-500 to-emerald-600" },
            { label: "Draft", value: stats.draft, icon: "📝", color: "from-yellow-500 to-amber-600" },
            { label: "Total Students", value: stats.totalStudents, icon: "👥", color: "from-purple-500 to-pink-600" }
          ].map((stat, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <span className="text-2xl text-white">{stat.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Course Creation Modal */}
        {showCourseForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingCourse ? 'Edit Course' : 'Create New Course'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>
                
                {/* Form Tabs */}
                <div className="flex space-x-1 mt-4 bg-gray-100 p-1 rounded-lg">
                  {['overview', 'modules'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium capitalize transition-all duration-200 ${
                        activeTab === tab
                          ? 'bg-white text-gray-800 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveCourse} className="p-6 space-y-6">
                {activeTab === 'overview' && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Course Title *</label>
                        <input
                          type="text"
                          required
                          value={courseForm.title}
                          onChange={(e) => setCourseForm(prev => ({...prev, title: e.target.value}))}
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                          placeholder="e.g., Web Development Fundamentals"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                        <input
                          type="text"
                          required
                          value={courseForm.category}
                          onChange={(e) => setCourseForm(prev => ({...prev, category: e.target.value}))}
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                          placeholder="e.g., Programming, Design, Business"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                      <textarea
                        required
                        value={courseForm.description}
                        onChange={(e) => setCourseForm(prev => ({...prev, description: e.target.value}))}
                        rows="4"
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                        placeholder="Describe what students will learn in this course..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                        <select
                          value={courseForm.level}
                          onChange={(e) => setCourseForm(prev => ({...prev, level: e.target.value}))}
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                        <input
                          type="text"
                          value={courseForm.duration}
                          onChange={(e) => setCourseForm(prev => ({...prev, duration: e.target.value}))}
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                          placeholder="e.g., 4 weeks, 8 hours"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                        <input
                          type="number"
                          value={courseForm.price}
                          onChange={(e) => setCourseForm(prev => ({...prev, price: e.target.value}))}
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Course Thumbnail</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className="hidden"
                          id="thumbnail-upload"
                        />
                        <label htmlFor="thumbnail-upload" className="cursor-pointer">
                          <div className="text-4xl mb-2">🖼️</div>
                          <p className="text-gray-600">Click to upload thumbnail</p>
                          <p className="text-sm text-gray-400">Recommended: 1280x720px</p>
                          {courseForm.thumbnail && (
                            <p className="text-sm text-green-600 mt-2">
                              {courseForm.thumbnail.name || "Thumbnail selected"}
                            </p>
                          )}
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'modules' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800">Course Modules</h3>
                    
                    {/* Add Module Form */}
                    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Module Title *</label>
                          <input
                            type="text"
                            value={currentModule.title}
                            onChange={(e) => setCurrentModule(prev => ({...prev, title: e.target.value}))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                            placeholder="e.g., Introduction to HTML"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Module Type</label>
                          <select
                            value={currentModule.type}
                            onChange={(e) => setCurrentModule(prev => ({...prev, type: e.target.value}))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                          >
                            <option value="video">Video Lesson</option>
                            <option value="document">Document</option>
                            <option value="quiz">Quiz</option>
                            <option value="assignment">Assignment</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Module Description *</label>
                        <textarea
                          value={currentModule.description}
                          onChange={(e) => setCurrentModule(prev => ({...prev, description: e.target.value}))}
                          rows="2"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                          placeholder="Describe what this module covers..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                        <input
                          type="text"
                          value={currentModule.duration}
                          onChange={(e) => setCurrentModule(prev => ({...prev, duration: e.target.value}))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                          placeholder="e.g., 30 minutes"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addModule}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                      >
                        + Add Module
                      </button>
                    </div>

                    {/* Added Modules List */}
                    {courseModules.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800">Added Modules ({courseModules.length})</h4>
                        {courseModules.map((module, index) => (
                          <div key={module.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-4">
                              <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-medium">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium text-gray-800">{module.title}</div>
                                <div className="text-sm text-gray-500">
                                  {module.type} • {module.duration}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setCourseModules(courseModules.filter(m => m.id !== module.id))}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {actionLoading ? "Saving..." : (editingCourse ? "Update Course" : "Create Course")}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-500 text-white p-4 rounded-xl font-medium hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onDelete={handleDeleteCourse}
              onEdit={editCourse}
              loading={actionLoading}
            />
          ))}
        </div>

        {courses.length === 0 && !showCourseForm && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-indigo-600">📚</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-6">Create your first course to start your educational journey</p>
            <button
              onClick={() => setShowCourseForm(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
            >
              Create Your First Course
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;