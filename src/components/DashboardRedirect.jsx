import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { roleHome } from '../utils/roles';

export default function DashboardRedirect() {
  const { user } = useContext(AuthContext);
  return <Navigate to={roleHome(user?.role)} replace />;
}
