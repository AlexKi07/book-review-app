function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-700">
        Welcome to your dashboard! Here you can see a summary of your activity and manage your books.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Books Summary</h2>
          <p>You have 0 books added.</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Profile Info</h2>
          <p>Edit your account or see your details here.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
