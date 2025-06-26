import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

function AdminRoute({ children }) {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) return <LoadingScreen />;
  if (!isAuthenticated || !user?.is_admin) return <Navigate to="/login" replace />;

  return children || <Outlet />;
}

export default AdminRoute;
