// src/components/admin/InstructorManagement.jsx
import { useState } from "react";
import { db } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";

const InstructorManagement = ({ instructors, users, onInstructorsUpdate }) => {
  const [loading, setLoading] = useState(false);

  const promoteToInstructor = async (userId) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "users", userId), { 
        role: "instructor",
        instructorSince: new Date().toISOString()
      });
      await onInstructorsUpdate();
      alert("User promoted to instructor successfully!");
    } catch (error) {
      console.error("Error promoting to instructor:", error);
      alert("Error promoting user to instructor");
    } finally {
      setLoading(false);
    }
  };

  const demoteFromInstructor = async (userId) => {
    if (!confirm("Are you sure you want to demote this instructor? They will lose instructor privileges.")) return;
    
    try {
      setLoading(true);
      await updateDoc(doc(db, "users", userId), { 
        role: "student"
      });
      await onInstructorsUpdate();
      alert("Instructor demoted successfully!");
    } catch (error) {
      console.error("Error demoting instructor:", error);
      alert("Error demoting instructor");
    } finally {
      setLoading(false);
    }
  };

  const potentialInstructors = users.filter(user => 
    user.role === "student" && 
    !instructors.some(instructor => instructor.id === user.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Instructor Management</h1>
          <p className="text-gray-600 mt-2">Manage instructors and their permissions</p>
        </div>
        <div className="mt-4 lg:mt-0 text-sm text-gray-500">
          {instructors.length} Active Instructors
        </div>
      </div>

      {/* Current Instructors */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Current Instructors</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instructors.map((instructor) => (
              <div key={instructor.id} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {instructor.displayName?.charAt(0) || "I"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{instructor.displayName || "Unknown Instructor"}</h3>
                    <p className="text-sm text-gray-600">{instructor.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-medium ${
                      instructor.status === 'active' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {instructor.status}
                    </span>
                  </div>
                  {instructor.instructorSince && (
                    <div className="flex justify-between">
                      <span>Instructor Since:</span>
                      <span>{new Date(instructor.instructorSince).toLocaleDateString()}</span>
                    </div>
                  )}
                  {instructor.phone && (
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span>{instructor.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700 transition">
                    View Profile
                  </button>
                  <button 
                    onClick={() => demoteFromInstructor(instructor.id)}
                    disabled={loading}
                    className="flex-1 bg-yellow-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-yellow-700 transition disabled:opacity-50"
                  >
                    Demote
                  </button>
                </div>
              </div>
            ))}
          </div>

          {instructors.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">👨‍🏫</div>
              <p className="text-gray-500 text-lg">No instructors yet</p>
              <p className="text-gray-400 text-sm mt-1">Promote users to instructors from the list below</p>
            </div>
          )}
        </div>
      </div>

      {/* Potential Instructors */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Potential Instructors</h2>
          <p className="text-sm text-gray-600 mt-1">Users who can be promoted to instructors</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {potentialInstructors.slice(0, 6).map((user) => (
              <div key={user.id} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.displayName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{user.displayName || "Unknown User"}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>Current Role:</span>
                    <span className="font-medium capitalize">{user.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Joined:</span>
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button 
                  onClick={() => promoteToInstructor(user.id)}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>👨‍🏫</span>
                  Promote to Instructor
                </button>
              </div>
            ))}
          </div>

          {potentialInstructors.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No potential instructors found</p>
              <p className="text-gray-400 text-sm mt-1">All eligible users are already instructors</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorManagement;