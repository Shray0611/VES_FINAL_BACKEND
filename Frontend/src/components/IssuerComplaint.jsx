import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const IssuerComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        setComplaints(data);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setError(err.message || "An error occurred while fetching complaints");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

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

      <div className="complaints-list">
        {complaints.map((complaint) => (
          <div key={complaint._id} className="complaint-item">
            <div className="complaint-header">
              <span className={`status ${complaint.status}`}>
                {complaint.status}
              </span>
              <span className="date">
                {new Date(complaint.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="user-email">
              From: {complaint.userId?.email || "Unknown User"}
            </p>
            <p className="message">{complaint.message}</p>
            <div className="certificate-info">
              <p>Certificate ID: {complaint.certificateId?._id || "N/A"}</p>
              <p>Student Name: {getStudentName(complaint)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssuerComplaints;
