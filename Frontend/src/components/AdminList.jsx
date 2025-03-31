import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminList() {
  const [admins, setAdmins] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/list`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Ensure response has data array
        if (res.data?.success && Array.isArray(res.data.data)) {
          setAdmins(res.data.data);
        } else {
          // throw new Error('Invalid data format');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  if (loading) return <div>Loading admins...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div>
      <h2>Admin Accounts</h2>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {admins.length > 0 ? (
            admins.map(admin => (
              <tr key={admin._id}>
                <td>{admin.email}</td>
                <td>{new Date(admin.createdAt).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2">No admin accounts found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}