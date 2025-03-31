import { useState } from 'react';
import axios from 'axios';

export default function CreateAdminForm({ onAdminCreated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication token missing');
      }

      if (!email.endsWith('@ves.ac.in')) {
        throw new Error('Only VES domain emails allowed');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      const response = await axios.post(
        `${
          import.meta.env.VITE_API_URL || 'http://localhost:5000'
        }/api/admin/create`,
        { email, password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        onAdminCreated();
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      console.error(
        'Admin creation failed:',
        err.response?.data || err.message
      );
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Failed to create admin account'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-creation-form">
      <h3>Create New Admin Account</h3>

      {error && <div className="error-message">Error: {error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email (VES domain only):</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter VES domain email"
            required
            pattern="^[a-zA-Z0-9._%+-]+@ves\.ac\.in$"
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            minLength="8"
            required
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="submit-button">
          {isSubmitting ? 'Creating...' : 'Create Admin'}
        </button>
      </form>
    </div>
  );
}
