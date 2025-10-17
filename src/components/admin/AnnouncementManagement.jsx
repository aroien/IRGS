// src/components/admin/AnnouncementManagement.jsx
import { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";

const AnnouncementManagement = ({ announcements, onAnnouncementsUpdate }) => {
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
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

  const updateAnnouncement = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateDoc(doc(db, "announcements", editingAnnouncement.id), {
        ...announcementForm,
        updatedAt: new Date().toISOString()
      });

      setAnnouncementForm({
        title: "",
        message: "",
        type: "info",
        priority: "medium",
        expiresAt: "",
        isActive: true
      });
      setEditingAnnouncement(null);
      setShowAnnouncementForm(false);
      
      await onAnnouncementsUpdate();
      alert("Announcement updated successfully!");
    } catch (error) {
      console.error("Error updating announcement:", error);
      alert("Error updating announcement");
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
      alert(`Announcement ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error("Error updating announcement status:", error);
      alert("Error updating announcement status");
    } finally {
      setLoading(false);
    }
  };

  const deleteAnnouncement = async (announcementId) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

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

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      priority: announcement.priority,
      expiresAt: announcement.expiresAt || "",
      isActive: announcement.isActive
    });
    setShowAnnouncementForm(true);
  };

  const handleFormSubmit = (e) => {
    if (editingAnnouncement) {
      updateAnnouncement(e);
    } else {
      createAnnouncement(e);
    }
  };

  const cancelForm = () => {
    setShowAnnouncementForm(false);
    setEditingAnnouncement(null);
    setAnnouncementForm({
      title: "",
      message: "",
      type: "info",
      priority: "medium",
      expiresAt: "",
      isActive: true
    });
  };

  const getPriorityBadge = (priority) => {
    const priorityClasses = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800"
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityClasses[priority] || priorityClasses.medium}`}>
        {priority}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeClasses = {
      info: "bg-blue-100 text-blue-800",
      warning: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
      success: "bg-green-100 text-green-800"
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeClasses[type] || typeClasses.info}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Announcement Management</h2>
        <button
          onClick={() => setShowAnnouncementForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Create Announcement
        </button>
      </div>

      {/* Announcement Form */}
      {showAnnouncementForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter announcement title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  required
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter announcement message"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={announcementForm.type}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="urgent">Urgent</option>
                    <option value="success">Success</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={announcementForm.priority}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration Date
                </label>
                <input
                  type="datetime-local"
                  value={announcementForm.expiresAt}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingAnnouncement ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No announcements found. Create your first announcement!
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {announcement.title}
                </h3>
                <div className="flex space-x-2">
                  {getTypeBadge(announcement.type)}
                  {getPriorityBadge(announcement.priority)}
                </div>
              </div>
              
              <p className="text-gray-600 mb-3">{announcement.message}</p>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="space-x-4">
                  <span>Created: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                  {announcement.expiresAt && (
                    <span>Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</span>
                  )}
                  <span className={`px-2 py-1 rounded-full ${announcement.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {announcement.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleAnnouncementStatus(announcement.id, announcement.isActive)}
                    className={`font-medium ${announcement.isActive ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}`}
                  >
                    {announcement.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(announcement.id)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementManagement;