// src/pages/admin/AnnouncementManagement.jsx
import { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";

const AnnouncementManagement = ({ announcements, onAnnouncementsUpdate }) => {
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: "",
    type: "info",
    priority: "medium",
    expiresAt: "",
    isActive: true
  });

  const createAnnouncement = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const announcementData = {
        ...announcementForm,
        createdAt: new Date().toISOString(),
        createdBy: "admin",
        isActive: true
      };

      await addDoc(collection(db, "announcements"), announcementData);
      
      // Reset form
      setAnnouncementForm({
        title: "",
        message: "",
        type: "info",
        priority: "medium",
        expiresAt: "",
        isActive: true
      });
      setShowAnnouncementForm(false);
      
      await onAnnouncementsUpdate();
      alert("Announcement created successfully!");
    } catch (error) {
      console.error("Error creating announcement:", error);
      alert("Error creating announcement");
    } finally {
      setLoading(false);
    }
  };

  const toggleAnnouncementStatus = async (announcementId, currentStatus) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "announcements", announcementId), {
        isActive: !currentStatus,
        updatedAt: new Date().toISOString()
      });
      await onAnnouncementsUpdate();
    } catch (error) {
      console.error("Error updating announcement:", error);
      alert("Error updating announcement");
    } finally {
      setLoading(false);
    }
  };

  const deleteAnnouncement = async (announcementId) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    
    try {
      setLoading(true);
      await deleteDoc(doc(db, "announcements", announcementId));
      await onAnnouncementsUpdate();
      alert("Announcement deleted successfully!");
    } catch (error) {
      console.error("Error deleting announcement:", error);
      alert("Error deleting announcement");
    } finally {
      setLoading(false);
    }
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Announcement Management</h1>
          <p className="text-gray-600 mt-2">Create and manage platform announcements</p>
        </div>
        <button
          onClick={() => setShowAnnouncementForm(true)}
          className="mt-4 lg:mt-0 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <span>📢</span>
          Create Announcement
        </button>
      </div>

      {/* Announcement Form */}
      {showAnnouncementForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Create New Announcement</h2>
          <form onSubmit={createAnnouncement} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm(prev => ({...prev, title: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                placeholder="Enter announcement title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                required
                value={announcementForm.message}
                onChange={(e) => setAnnouncementForm(prev => ({...prev, message: e.target.value}))}
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                placeholder="Enter announcement message..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={announcementForm.type}
                  onChange={(e) => setAnnouncementForm(prev => ({...prev, type: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="info">Information</option>
                  <option value="warning">Warning</option>
                  <option value="urgent">Urgent</option>
                  <option value="success">Success</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={announcementForm.priority}
                  onChange={(e) => setAnnouncementForm(prev => ({...prev, priority: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date (Optional)</label>
              <input
                type="datetime-local"
                value={announcementForm.expiresAt}
                onChange={(e) => setAnnouncementForm(prev => ({...prev, expiresAt: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Announcement"}
              </button>
              <button
                type="button"
                onClick={() => setShowAnnouncementForm(false)}
                className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Announcements */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Active Announcements ({announcements.filter(a => a.isActive).length})
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {announcements.filter(a => a.isActive).map((announcement) => (
            <div key={announcement.id} className={`p-4 rounded-lg border-l-4 ${getTypeStyles(announcement.type)}`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{announcement.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityStyles(announcement.priority)}`}>
                    {announcement.priority} priority
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{announcement.message}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Type: {announcement.type}</span>
                  {announcement.expiresAt && (
                    <span>Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleAnnouncementStatus(announcement.id, announcement.isActive)}
                    disabled={loading}
                    className="text-yellow-600 hover:text-yellow-800 text-sm font-medium disabled:opacity-50"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(announcement.id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {announcements.filter(a => a.isActive).length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📢</div>
              <p className="text-gray-500">No active announcements</p>
              <p className="text-gray-400 text-sm mt-1">Create an announcement to notify your users</p>
            </div>
          )}
        </div>
      </div>

      {/* Inactive Announcements */}
      {announcements.filter(a => !a.isActive).length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Inactive Announcements ({announcements.filter(a => !a.isActive).length})
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {announcements.filter(a => !a.isActive).map((announcement) => (
              <div key={announcement.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{announcement.title}</h3>
                  <span className="text-xs text-gray-500">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{announcement.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Type: {announcement.type}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleAnnouncementStatus(announcement.id, announcement.isActive)}
                      disabled={loading}
                      className="text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50"
                    >
                      Activate
                    </button>
                    <button
                      onClick={() => deleteAnnouncement(announcement.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementManagement;