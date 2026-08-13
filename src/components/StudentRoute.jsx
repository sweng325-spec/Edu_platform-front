import RoleRoute from './RoleRoute';
import { ROLES } from '../utils/roles';

export default function StudentRoute({ children }) {
  return <RoleRoute allowedRoles={[ROLES.STUDENT]}>{children}</RoleRoute>;
}
