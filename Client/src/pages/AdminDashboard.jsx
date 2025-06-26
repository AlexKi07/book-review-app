import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [reportedReviews, setReportedReviews] = useState([]);

  useEffect(() => {
    // Fetch admin data
    const fetchData = async () => {
      const usersRes = await fetch('/api/admin/users');
      const reviewsRes = await fetch('/api/admin/reported-reviews');
      setUsers(await usersRes.json());
      setReportedReviews(await reviewsRes.json());
    };
    fetchData();
  }, []);

  const handleBanUser = async (userId) => {
    await fetch(`/api/admin/users/${userId}/ban`, { method: 'POST' });
    setUsers(users.map(u => u.id === userId ? {...u, is_banned: true} : u));
  };

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
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border">Username</th>
                    <th className="py-2 px-4 border">Email</th>
                    <th className="py-2 px-4 border">Status</th>
                    <th className="py-2 px-4 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
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
            {reportedReviews.map(review => (
              <div key={review.id} className="mb-4 p-4 bg-white rounded shadow">
                <p className="font-semibold">{review.user.username}'s review</p>
                <p className="text-gray-600">{review.content}</p>
                <div className="mt-2 flex space-x-4">
                  <button className="text-red-600 hover:underline">Delete</button>
                  <button className="text-blue-600 hover:underline">Dismiss</button>
                </div>
              </div>
            ))}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}