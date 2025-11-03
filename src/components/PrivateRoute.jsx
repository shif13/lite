// frontend/src/components/PrivateRoute.jsx - UPDATED
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../context/UserContext';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading: authLoading } = useAuth();
  const { userData, loading: userLoading, isAdmin } = useUser();

  // Show loading while checking auth
  if (authLoading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check admin-only routes
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;