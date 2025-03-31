import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminList from './AdminList';
import CreateAdminForm from './CreateAdminForm';

export default function SuperAdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Check if response contains superadmin data
        if (!res.data.success || res.data.data.role !== 'superadmin') {
          throw new Error('Not a superadmin');
        }

        setUser(res.data.data);
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/superadmin/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>SuperAdmin Dashboard</h1>

      <section>
        <CreateAdminForm onAdminCreated={() => setRefreshKey(k => k + 1)} />
      </section>

      <section>
        <AdminList key={refreshKey} />
      </section>
    </div>
  );
}
