import React, { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import ComplaintModal from "./ComplaintModal";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const CertificateList = () => {
  const [certificates, setCertificates] = useState([]);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loadingCertificates, setLoadingCertificates] = useState(true);

  useEffect(() => {
    // Get user role from token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }

    const fetchCertificates = async () => {
      setLoadingCertificates(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await fetch("http://localhost:5000/api/certificates", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Failed to load certificates");

        console.log("Fetched certificates:", data.length);
        setCertificates(data);
      } catch (err) {
        console.error("Error fetching certificates:", err);
        setError(err.message);
      } finally {
        setLoadingCertificates(false);
      }
    };

    fetchCertificates();
  }, []);

  const handlePreview = async (certificateId) => {
    try {
      setLoadingPreview(true);
      setError("");
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/certificates/${certificateId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Preview failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleDownload = (certificateId) => {
    if (previewUrl) {
      saveAs(previewUrl, `certificate-${certificateId}.png`);
    }
  };

  const closePreview = () => {
    setPreviewUrl(null);
    URL.revokeObjectURL(previewUrl);
  };

  const handleComplaintSubmit = async ({ certificateId, message }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/certificates/complaints",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ certificateId, message }),
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          throw new Error(data.error || "Failed to submit complaint");
        } else {
          const text = await response.text();
          console.error("Server response:", text);
          throw new Error("Server error occurred. Please try again later.");
        }
      }

      const data = await response.json();
      alert("Complaint submitted successfully");
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <div className="certificate-list">
      <h2>Your Certificates</h2>
      {error && <p className="error">{error}</p>}

      {userRole === "admin" && (
        <div className="actions-bar">
          <Link to="/issuer/complaints" className="view-complaints-link">
            View Complaints
          </Link>
        </div>
      )}

      {previewUrl && (
        <div className="preview-modal">
          <div className="preview-content">
            <img src={previewUrl} alt="Certificate Preview" />
            <div className="preview-actions">
              <button onClick={closePreview}>Close Preview</button>
              <button onClick={() => handleDownload()}>Download</button>
            </div>
          </div>
        </div>
      )}

      {loadingCertificates ? (
        <p className="loading-message">Loading certificates...</p>
      ) : certificates.length === 0 ? (
        <p className="no-certificates">No certificates found</p>
      ) : (
        <div className="certificates">
          {certificates.map((cert) => (
            <div key={cert._id} className="certificate-item">
              <h3>{cert.studentData.name}'s Certificate</h3>
              <p>Issued: {new Date(cert.createdAt).toLocaleDateString()}</p>
              <div className="certificate-actions">
                <button
                  onClick={() => handlePreview(cert._id)}
                  disabled={loadingPreview}
                >
                  {loadingPreview ? "Loading..." : "Preview"}
                </button>
                <button onClick={() => setSelectedCertificate(cert._id)}>
                  File Complaint
                </button>
                <button onClick={() => handleDownload(cert._id)}>
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedCertificate && (
        <ComplaintModal
          certificateId={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
          onSubmit={handleComplaintSubmit}
        />
      )}
    </div>
  );
};

export default CertificateList;
