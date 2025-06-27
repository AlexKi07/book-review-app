import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = user?.access_token;
  
      if (!token) {
        toast.error("No token found. Please log in again.");
        navigate('/login');
        return;
      }
  
      try {
        const res = await fetch('http://localhost:5000/users/users', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
  
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to fetch users');
        }
  
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        toast.error(`Failed to fetch users: ${err.message}`);
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };
  
    if (user && !user.is_admin) {
      navigate('/unauthorized');
      return;
    }
  
    if (user?.is_admin) {
      fetchUsers(); 
    }
  }, [user, navigate]);
  

  const handleBanUser = async (userId) => {
    const token = user?.access_token || JSON.parse(localStorage.getItem('user'))?.access_token;
    try {
      const res = await fetch(`http://localhost:5000/users/users/${userId}/ban`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Ban failed');
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_banned: true } : u))
      );
      toast.success('User banned successfully');
    } catch (err) {
      toast.error(`Ban failed: ${err.message}`);
    }
  };

  const handleUnbanUser = async (userId) => {
    const token = user?.access_token || JSON.parse(localStorage.getItem('user'))?.access_token;
    try {
      const res = await fetch(`http://localhost:5000/users/users/${userId}/unban`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Unban failed');
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_banned: false } : u))
      );
      toast.success('User unbanned successfully');
    } catch (err) {
      toast.error(`Unban failed: ${err.message}`);
    }
  };

  if (loading) return <div className="p-6">Loading users...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <Tab.Group>
        <Tab.List className="mb-4 space-x-4">
          <Tab className="px-4 py-2 rounded bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400">
            User Management
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <table className="w-full border">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Username</th>
                  <th className="border px-4 py-2">Email</th>
                  <th className="border px-4 py-2">Status</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="border px-4 py-2">{u.username}</td>
                    <td className="border px-4 py-2">{u.email}</td>
                    <td className="border px-4 py-2">
                      {u.is_banned ? 'Banned' : 'Active'}
                    </td>
                    <td className="border px-4 py-2">
                      {!u.is_banned ? (
                        <button
                          onClick={() => handleBanUser(u.id)}
                          className="text-red-600 hover:underline"
                        >
                          Ban
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnbanUser(u.id)}
                          className="text-green-600 hover:underline"
                        >
                          Unban
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
