// src/components/admin/CertificateManagement.jsx
import { useState } from "react";
import { db } from "../../firebase";
import { addDoc, updateDoc, doc } from "firebase/firestore";

const CertificateManagement = ({ certificates, courses, onCertificatesUpdate }) => {
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [certificateForm, setCertificateForm] = useState({
    studentName: "",
    studentEmail: "",
    courseId: "",
    issueDate: new Date().toISOString().split('T')[0],
    expirationDate: ""
  });

  const generateCertificate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const course = courses.find(c => c.id === certificateForm.courseId);
      
      const certificateData = {
        ...certificateForm,
        certificateId,
        courseTitle: course?.title || "Unknown Course",
        issuedAt: new Date().toISOString(),
        status: "active",
        verified: true
      };

      await addDoc(collection(db, "certificates"), certificateData);
      
      // Reset form
      setCertificateForm({
        studentName: "",
        studentEmail: "",
        courseId: "",
        issueDate: new Date().toISOString().split('T')[0],
        expirationDate: ""
      });
      setShowGenerateForm(false);
      
      await onCertificatesUpdate();
      alert(`Certificate generated successfully! ID: ${certificateId}`);
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Error generating certificate");
    } finally {
      setLoading(false);
    }
  };

  const revokeCertificate = async (certificateId, docId) => {
    if (!confirm("Are you sure you want to revoke this certificate?")) return;
    
    try {
      setLoading(true);
      await updateDoc(doc(db, "certificates", docId), {
        status: "revoked",
        revokedAt: new Date().toISOString()
      });
      await onCertificatesUpdate();
      alert("Certificate revoked successfully!");
    } catch (error) {
      console.error("Error revoking certificate:", error);
      alert("Error revoking certificate");
    } finally {
      setLoading(false);
    }
  };

  const verifyCertificate = async (docId) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "certificates", docId), {
        verified: true,
        verifiedAt: new Date().toISOString()
      });
      await onCertificatesUpdate();
      alert("Certificate verified successfully!");
    } catch (error) {
      console.error("Error verifying certificate:", error);
      alert("Error verifying certificate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Certificate Management</h1>
          <p className="text-gray-600 mt-2">Generate and manage course certificates</p>
        </div>
        <button
          onClick={() => setShowGenerateForm(true)}
          className="mt-4 lg:mt-0 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <span>🏆</span>
          Generate Certificate
        </button>
      </div>

      {/* Generate Certificate Form */}
      {showGenerateForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Generate New Certificate</h2>
          <form onSubmit={generateCertificate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  value={certificateForm.studentName}
                  onChange={(e) => setCertificateForm(prev => ({...prev, studentName: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                  placeholder="Enter student full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Email</label>
                <input
                  type="email"
                  required
                  value={certificateForm.studentEmail}
                  onChange={(e) => setCertificateForm(prev => ({...prev, studentEmail: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                  placeholder="student@example.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                required
                value={certificateForm.courseId}
                onChange={(e) => setCertificateForm(prev => ({...prev, courseId: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                <input
                  type="date"
                  required
                  value={certificateForm.issueDate}
                  onChange={(e) => setCertificateForm(prev => ({...prev, issueDate: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date (Optional)</label>
                <input
                  type="date"
                  value={certificateForm.expirationDate}
                  onChange={(e) => setCertificateForm(prev => ({...prev, expirationDate: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Certificate"}
              </button>
              <button
                type="button"
                onClick={() => setShowGenerateForm(false)}
                className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Certificates Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Issued Certificates</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificate ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {certificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm font-mono text-gray-900">{cert.certificateId}</code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{cert.studentName}</div>
                      <div className="text-sm text-gray-500">{cert.studentEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cert.courseTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(cert.issueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      cert.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {cert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {cert.status === 'active' && (
                      <button
                        onClick={() => revokeCertificate(cert.certificateId, cert.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        Revoke
                      </button>
                    )}
                    {!cert.verified && (
                      <button
                        onClick={() => verifyCertificate(cert.id)}
                        disabled={loading}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        Verify
                      </button>
                    )}
                    <button className="text-blue-600 hover:text-blue-900">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {certificates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">🏆</div>
            <p className="text-gray-500 text-lg">No certificates issued yet</p>
            <p className="text-gray-400 text-sm mt-1">Generate your first certificate using the form above</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateManagement;