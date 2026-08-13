import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { hasRole, roleHome } from '../utils/roles';

export default function RoleRoute({ allowedRoles, children }) {
  const { user, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return hasRole(user?.role, allowedRoles)
    ? children
    : <Navigate to="/access-denied" replace state={{ from: location, home: roleHome(user?.role) }} />;
}
