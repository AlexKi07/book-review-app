import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/unauthorized');
      return;
    }

    const fetchUsers = async () => {
      const token = localStorage.getItem('access_token');

      try {
        const res = await fetch('http://localhost:5000/users/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch users');

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, navigate]);

  const handleBanUser = async (userId) => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`http://localhost:5000/users/users/${userId}/ban`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to ban user');

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_banned: true } : u))
      );
    } catch (err) {
      console.error('Ban failed:', err);
    }
  };

  const handleUnbanUser = async (userId) => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`http://localhost:5000/users/users/${userId}/unban`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to unban user');

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_banned: false } : u))
      );
    } catch (err) {
      console.error('Unban failed:', err);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-lg">Loading users...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Tab.Group>
        <Tab.List className="flex space-x-1 bg-blue-900/20 p-1 rounded">
          <Tab className="px-4 py-2 rounded ui-selected:bg-white ui-selected:text-blue-700">
            User Management
          </Tab>
        </Tab.List>

        <Tab.Panels className="mt-4">
          <Tab.Panel>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow rounded">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border">Username</th>
                    <th className="py-2 px-4 border">Email</th>
                    <th className="py-2 px-4 border">Status</th>
                    <th className="py-2 px-4 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="py-2 px-4 border">{user.username}</td>
                      <td className="py-2 px-4 border">{user.email}</td>
                      <td className="py-2 px-4 border">
                        {user.is_banned ? 'Banned' : 'Active'}
                      </td>
                      <td className="py-2 px-4 border space-x-2">
                        {!user.is_banned ? (
                          <button
                            onClick={() => handleBanUser(user.id)}
                            className="text-red-600 hover:underline"
                          >
                            Ban
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnbanUser(user.id)}
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
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
