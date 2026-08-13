export const ROLES = {
  ADMIN: 'ADMIN',
  INSTRUCTOR: 'INSTRUCTOR',
  LEGACY_INSTRUCTOR: 'TEACHER',
  STUDENT: 'STUDENT',
};

export const isInstructor = (role) =>
  role === ROLES.INSTRUCTOR || role === ROLES.LEGACY_INSTRUCTOR;

export const hasRole = (role, allowedRoles) =>
  allowedRoles.includes(role) ||
  (allowedRoles.includes(ROLES.INSTRUCTOR) && isInstructor(role));

export const roleHome = (role) => {
  if (role === ROLES.ADMIN) return '/admin';
  if (isInstructor(role)) return '/instructor';
  return '/student';
};
