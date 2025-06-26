import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [reportedReviews, setReportedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/unauthorized');
      return;
    }

    const fetchData = async () => {
      const token = localStorage.getItem('access_token');

      try {
        const [usersRes, reviewsRes] = await Promise.all([
          fetch('http://localhost:5000/api/users', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
          }),
          fetch('http://localhost:5000/api/reported-reviews', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
          }),
        ]);

        if (!usersRes.ok || !reviewsRes.ok) throw new Error('Failed to fetch admin data');

        setUsers(await usersRes.json());
        setReportedReviews(await reviewsRes.json());
      } catch (err) {
        console.error('Admin fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleBanUser = async (userId) => {
    const token = localStorage.getItem('access_token');

    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/ban`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to ban user');

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_banned: true } : u))
      );
    } catch (err) {
      console.error('Ban failed:', err);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-lg">Loading admin data...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Tab.Group>
        <Tab.List className="flex space-x-1 bg-blue-900/20 p-1 rounded">
          <Tab className="px-4 py-2 rounded ui-selected:bg-white ui-selected:text-blue-700">
            User Management
          </Tab>
          <Tab className="px-4 py-2 rounded ui-selected:bg-white ui-selected:text-blue-700">
            Reported Content
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
                      <td className="py-2 px-4 border">
                        {!user.is_banned && (
                          <button
                            onClick={() => handleBanUser(user.id)}
                            className="text-red-600 hover:underline"
                          >
                            Ban
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Tab.Panel>

          <Tab.Panel>
            {reportedReviews.length === 0 ? (
              <p>No reported reviews.</p>
            ) : (
              reportedReviews.map((review) => (
                <div key={review.id} className="mb-4 p-4 bg-white rounded shadow">
                  <p className="font-semibold">{review.user.username}'s review</p>
                  <p className="text-gray-600">{review.content}</p>
                  <div className="mt-2 flex space-x-4">
                    <button className="text-red-600 hover:underline">Delete</button>
                    <button className="text-blue-600 hover:underline">Dismiss</button>
                  </div>
                </div>
              ))
            )}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
