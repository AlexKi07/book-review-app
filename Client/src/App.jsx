import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar'; // Make sure you have this


import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/BookList";
import Profile from "./pages/Profile";
import BookDetail from "./pages/BookDetail";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import UsersManagement from "./pages/UsersManagement";
import BooksManagement from "./pages/BooksManagement";
import HomePage from "./pages/HomePage";
import ContactPage from "./pages/ContactPage";

import Layout from "./components/Layout";
import FooterPage from "./pages/FooterPage";
import AdminLayout from "./components/AdminLayout";
import EditProfileForm from "./components/EditProfileForm";

import "./index.css";
import BookList from "./pages/BookList";

function App() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
<>  
  <Navbar isLoggedIn={isAuthenticated} user={user} onLogout={logout} />

  <Routes>
    {/* Public Routes */}
    <Route path="/login" element={<LoginForm />} />
    <Route path="/register" element={<RegisterForm />} />
    <Route path="/" element={<HomePage />} />


    {/* Protected User Routes */}
    <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/edit-profile" element={<EditProfileForm />} />
      <Route path="/books" element={<BookList />} />
      <Route path="/books/:id" element={<BookDetail />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/contact" element={<ContactPage />} />
    </Route>

    {/* Admin Routes with AdminLayout */}
    <Route
      path="/admin"
      element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }
    >
      <Route index element={<AdminDashboard />} />
      <Route path="users" element={<UsersManagement />} />
      <Route path="books" element={<BooksManagement />} />
    </Route>

    {/* Catch-all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
  <FooterPage />
  <ToastContainer position="top-center" autoClose={3000} /> 
  
</>
  );
}

export default App;
