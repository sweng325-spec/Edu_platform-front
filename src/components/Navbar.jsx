import { useContext, useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { isInstructor } from '../utils/roles';

const navigationFor = (role) => {
  if (role === 'ADMIN') return [{ to: '/admin', label: 'Dashboard' }, { to: '/admin/users', label: 'Users' }, { to: '/admin/students', label: 'Students' }, { to: '/admin/instructors', label: 'Instructors' }, { to: '/admin/courses', label: 'Courses' }, { to: '/admin/enrollments', label: 'Enrollments' }, { to: '/admin/statistics', label: 'Statistics' }, { to: '/admin/settings', label: 'Settings' }];
  if (isInstructor(role)) return [{ to: '/instructor', label: 'Dashboard' }, { to: '/instructor/courses', label: 'My Courses' }, { to: '/instructor/lessons', label: 'Lessons' }, { to: '/instructor/assignments', label: 'Assignments' }, { to: '/instructor/quizzes', label: 'Quizzes' }, { to: '/instructor/students', label: 'Students' }, { to: '/instructor/performance', label: 'Performance' }];
  return [{ to: '/student', label: 'Dashboard' }, { to: '/courses', label: 'Browse Courses' }, { to: '/my-courses', label: 'My Courses' }, { to: '/assignments', label: 'Assignments' }, { to: '/quizzes', label: 'Quizzes' }];
};

export default function Navbar({ darkMode, setDarkMode }) {
  const { user, logout } = useContext(AuthContext);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/login');
  };

  if (!user) {
    return null;
  }
  const navItems = navigationFor(user.role);

  return (
    <div className="sticky top-0 z-50 bg-slate-50/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-2xl font-bold text-slate-950 dark:text-white">
            <span className="material-symbols-outlined text-3xl text-emerald-700">eco</span>
            Daltex Academy
          </div>

          <nav className="hidden max-w-[58%] items-center gap-1 overflow-x-auto text-sm font-semibold text-slate-600 dark:text-slate-300 md:flex">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={label}
                to={to}
                end
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md transition-all ${isActive ? 'text-emerald-700 dark:text-emerald-300 border-b-2 border-emerald-700' : 'hover:text-emerald-700 hover:bg-slate-100 dark:hover:bg-slate-800'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              aria-label="Toggle light and dark mode"
              title="Toggle theme"
              aria-pressed={darkMode}
            >
              <span className="material-symbols-outlined text-xl">
                {darkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            <button className="hidden md:inline-flex p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              <span className="material-symbols-outlined">notifications</span>
            </button>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <span className="material-symbols-outlined text-2xl">account_circle</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-3 w-44 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
                  <NavLink
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="block w-full px-4 py-3 text-left text-sm text-slate-900 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900"
                  >
                    Profile
                  </NavLink>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full border-t border-slate-100 px-4 py-3 text-left text-sm text-slate-900 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-100 dark:hover:bg-slate-900"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
