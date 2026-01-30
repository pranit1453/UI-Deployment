import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Protects routes by role. USER-only vs ADMIN-only.
 * - allowedRoles: ['USER'] | ['ADMIN']
 * - redirectPath: where to send users who are authenticated but wrong role
 */
const RoleProtectedRoute = ({ children, allowedRoles, redirectPath }) => {
  const { user, role, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const resolvedRole = role || (user?.role ?? user?.Role ?? '').toUpperCase();
  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const hasAccess = allowed.some((r) => String(r).toUpperCase() === resolvedRole);

  if (!hasAccess) {
    return <Navigate to={redirectPath || '/'} replace />;
  }

  return children;
};

export const UserRoute = ({ children }) => (
  <RoleProtectedRoute allowedRoles={['USER']} redirectPath="/admin">
    {children}
  </RoleProtectedRoute>
);

export const AdminRoute = ({ children }) => (
  <RoleProtectedRoute allowedRoles={['ADMIN']} redirectPath="/dashboard">
    {children}
  </RoleProtectedRoute>
);

export default RoleProtectedRoute;
