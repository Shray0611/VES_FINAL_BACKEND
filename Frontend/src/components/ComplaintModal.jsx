import React, { useState } from "react";

const ComplaintModal = ({ certificateId, onClose, onSubmit }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError("Please enter a complaint message");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSubmit({ certificateId, message });
      onClose();
    } catch (err) {
      console.error("Complaint submission error:", err);
      setError(err.message || "Failed to submit complaint. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="complaint-modal">
        <h3>File Complaint</h3>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue..."
            required
          />
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Complaint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintModal;
