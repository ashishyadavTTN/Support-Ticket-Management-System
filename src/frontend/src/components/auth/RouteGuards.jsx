import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDefaultRoute } from '../../constants/roles';
import { getReturnPath } from '../../utils/navigation';
import SkeletonList from '../ui/Skeleton';
export function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 p-6">
      <div className="w-full max-w-md">
        <SkeletonList count={1} />
      </div>
    </div>
  );
}

export function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, isInitializing, user } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children || <Outlet />;
}

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isInitializing, user } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    const returnPath = getReturnPath(location.state?.from);
    const redirectTo = returnPath || getDefaultRoute(user.role);
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export function RoleRedirect() {
  const { user } = useAuth();
  return <Navigate to={getDefaultRoute(user.role)} replace />;
}

export function PermissionRoute({ permission, children }) {
  const { isAuthenticated, isInitializing, user } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role === 'admin') {
    return children;
  }

  const permissions = user.permissions || {};
  if (!permissions[permission]) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
