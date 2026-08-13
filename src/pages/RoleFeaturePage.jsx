import { Link, useLocation } from 'react-router-dom';

const pageNames = {
  '/admin/users': 'User management', '/admin/students': 'Student management', '/admin/instructors': 'Instructor management',
  '/admin/courses': 'Course management', '/admin/enrollments': 'Enrollment management', '/admin/statistics': 'Platform statistics', '/admin/settings': 'Platform settings',
  '/instructor/lessons': 'Lessons', '/instructor/assignments': 'Assignments', '/instructor/quizzes': 'Quizzes', '/instructor/students': 'Students', '/instructor/performance': 'Performance',
  '/my-courses': 'My courses', '/assignments': 'Assignments', '/quizzes': 'Quizzes', '/progress': 'Progress', '/notifications': 'Notifications', '/profile': 'Profile',
};

export default function RoleFeaturePage() {
  const { pathname } = useLocation();
  const title = pageNames[pathname] || 'Learning workspace';
  return <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"><h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1><p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">This workspace is reserved for your role. Data and actions are authorized by the Django API before they are shown or saved.</p><Link to="/dashboard" className="mt-6 inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Go to dashboard</Link></section>;
}
