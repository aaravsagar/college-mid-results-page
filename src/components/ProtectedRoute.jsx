import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requireAdmin = false, classId = null }) {
  const { currentUser, isAdmin, canAccessClass } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  if (classId && !canAccessClass(classId)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;