// src/components/admin/UserManagement.jsx
import { useState } from "react";
import { db } from "../../firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";

const UserManagement = ({ users, onUsersUpdate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userEditData, setUserEditData] = useState({});
  const [loading, setLoading] = useState(false);

  const filteredUsers = users.filter(user =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateUserRole = async (userId, newRole) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "users", userId), { role: newRole });
      await onUsersUpdate();
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Error updating user role");
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, status) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "users", userId), { status });
      await onUsersUpdate();
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Error updating user status");
    } finally {
      setLoading(false);
    }
  };

  const editUser = (user) => {
    setSelectedUser(user);
    setUserEditData({
      displayName: user.displayName || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "student",
      status: user.status || "active"
    });
  };

  const saveUserEdit = async () => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      await updateDoc(doc(db, "users", selectedUser.id), userEditData);
      setSelectedUser(null);
      await onUsersUpdate();
    } catch (error) {
      console.error("Error saving user edit:", error);
      alert("Error updating user");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      setLoading(true);
      await deleteDoc(doc(db, "users", userId));
      await onUsersUpdate();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all users and their permissions</p>
        </div>
        <div className="mt-4 lg:mt-0 relative w-full lg:w-64">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
        </div>
      </div>

      {/* User Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Edit User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={userEditData.displayName}
                    onChange={(e) => setUserEditData(prev => ({...prev, displayName: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={userEditData.email}
                    onChange={(e) => setUserEditData(prev => ({...prev, email: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={userEditData.phone}
                    onChange={(e) => setUserEditData(prev => ({...prev, phone: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={userEditData.role}
                    onChange={(e) => setUserEditData(prev => ({...prev, role: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                    <option value="superAdmin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={userEditData.status}
                    onChange={(e) => setUserEditData(prev => ({...prev, status: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveUserEdit}
                    disabled={loading}
                    className="flex-1 bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.displayName?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{user.displayName || "No Name"}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {user.status}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Role:</span>
                <span className="font-medium capitalize">{user.role}</span>
              </div>
              {user.phone && (
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Joined:</span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => editUser(user)}
                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700 transition flex items-center justify-center gap-1"
              >
                <span>✏️</span>
                Edit
              </button>
              <select
                value={user.role}
                onChange={(e) => updateUserRole(user.id, e.target.value)}
                disabled={loading}
                className="flex-1 bg-gray-100 py-2 px-3 rounded-lg text-sm border-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
                <option value="superAdmin">Super Admin</option>
              </select>
              <button
                onClick={() => updateUserStatus(user.id, user.status === 'active' ? 'suspended' : 'active')}
                disabled={loading}
                className={`flex-1 py-2 px-3 rounded-lg text-sm transition flex items-center justify-center gap-1 disabled:opacity-50 ${
                  user.status === 'active' 
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <span>{user.status === 'active' ? '🔒' : '🔓'}</span>
                {user.status === 'active' ? 'Suspend' : 'Activate'}
              </button>
              <button
                onClick={() => deleteUser(user.id)}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-red-700 transition flex items-center justify-center gap-1 disabled:opacity-50"
              >
                <span>🗑️</span>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <p className="text-gray-500 text-lg">No users found</p>
          <p className="text-gray-400 text-sm mt-1">
            {searchTerm ? 'Try a different search term' : 'No users registered yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserManagement;