// components/PrivateRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) return null; // or <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" />;

  return children || <Outlet />;
};

export default PrivateRoute;
