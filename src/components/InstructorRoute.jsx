import RoleRoute from './RoleRoute';
import { ROLES } from '../utils/roles';

export default function InstructorRoute({ children }) {
  return <RoleRoute allowedRoles={[ROLES.INSTRUCTOR]}>{children}</RoleRoute>;
}
