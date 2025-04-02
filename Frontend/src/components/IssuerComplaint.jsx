import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const IssuerComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  console.log("IssuerComplaints component is being rendered");

  useEffect(() => {
    console.log("IssuerComplaints component mounted");

    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log(
          "Fetching complaints with token:",
          token ? "Token exists" : "No token"
        );

        if (!token) {
          setError("Authentication required. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/certificates/issuer/complaints",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Response status:", response.status);

        if (response.status === 403) {
          setError(
            "You don't have permission to view complaints. Only admin users can view complaints."
          );
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log("Fetched complaints data:", data);

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch complaints");
        }

        // Add a complaint ID to each complaint
        const complaintsWithId = data.map((complaint, index) => ({
          ...complaint,
          complaintId: `#COMP-${789 + index}`,
        }));

        setComplaints(complaintsWithId);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setError(err.message || "An error occurred while fetching complaints");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const handleViewReport = (complaint) => {
    setSelectedComplaint(complaint);
  };

  const closeReport = () => {
    setSelectedComplaint(null);
  };

  // Format date to display in the table
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  // Helper function to safely access nested properties
  const getStudentName = (complaint) => {
    try {
      return complaint.certificateId?.studentData?.name || "Unknown Student";
    } catch (e) {
      return "Unknown Student";
    }
  };

  return (
    <div className="issuer-complaints">
      <div className="admin-header">
        <h2>Received Complaints</h2>
        <div className="admin-nav">
          <Link to="/admin/certificates" className="btn">
            Certificates
          </Link>
          <Link to="/generate" className="btn">
            Create Certificate
          </Link>
          <Link to="/issuer/complaints" className="btn active">
            View Complaints
          </Link>
        </div>
      </div>

      {loading && <p className="loading">Loading complaints...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && complaints.length === 0 && (
        <p className="no-data">No complaints have been received yet.</p>
      )}

      {!loading && !error && complaints.length > 0 && (
        <div className="complaints-table-container">
          <table className="complaints-table">
            <thead>
              <tr>
                <th>Sr.No</th>
                <th>Complaint ID</th>
                <th>Email ID</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint, index) => (
                <tr key={complaint._id}>
                  <td>{index + 1}</td>
                  <td>{complaint.complaintId}</td>
                  <td>{complaint.userId?.email || "Unknown"}</td>
                  <td>{formatDate(complaint.createdAt)}</td>
                  <td>
                    <button
                      className="view-report-btn"
                      onClick={() => handleViewReport(complaint)}
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedComplaint && (
        <div className="complaint-modal-overlay">
          <div className="complaint-report-modal">
            <div className="modal-header">
              <h3>Complaint Report - {selectedComplaint.complaintId}</h3>
              <button className="close-btn" onClick={closeReport}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="report-section">
                <h4>Complaint Details</h4>
                <div className="report-field">
                  <span className="field-label">Status:</span>
                  <span className={`status ${selectedComplaint.status}`}>
                    {selectedComplaint.status}
                  </span>
                </div>
                <div className="report-field">
                  <span className="field-label">Date Submitted:</span>
                  <span>{formatDate(selectedComplaint.createdAt)}</span>
                </div>
                <div className="report-field">
                  <span className="field-label">Reported By:</span>
                  <span>
                    {selectedComplaint.userId?.email || "Unknown User"}
                  </span>
                </div>
              </div>

              <div className="report-section">
                <h4>Message</h4>
                <p className="complaint-message">{selectedComplaint.message}</p>
              </div>

              <div className="report-section">
                <h4>Certificate Information</h4>
                <div className="report-field">
                  <span className="field-label">Certificate ID:</span>
                  <span>{selectedComplaint.certificateId?._id || "N/A"}</span>
                </div>
                <div className="report-field">
                  <span className="field-label">Student Name:</span>
                  <span>{getStudentName(selectedComplaint)}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="status-btn" disabled>
                {selectedComplaint.status === "open"
                  ? "Mark as Resolved"
                  : "Reopen"}
              </button>
              <button className="cancel-btn" onClick={closeReport}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuerComplaints;
