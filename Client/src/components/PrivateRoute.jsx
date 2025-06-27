
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen'; 

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) return <LoadingScreen />; 
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children || <Outlet />;
}

export default PrivateRoute;
