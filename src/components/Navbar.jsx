import { useContext, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { coursesApi } from '../api/courses';
import { getLatestUnseenAnnouncement } from '../utils/announcementNotifications';
import { fetchAnnouncementsForCourses } from '../utils/fetchCourseAnnouncements';
import { extractCoursesList } from '../utils/media';
import { isInstructor } from '../utils/roles';

const navigationFor = (role) => {
  if (role === 'ADMIN') return [{ to: '/admin', label: 'Dashboard' }, { to: '/admin/users', label: 'Users' }, { to: '/admin/students', label: 'Students' }, { to: '/admin/instructors', label: 'Instructors' }, { to: '/admin/courses', label: 'Courses' }, { to: '/admin/enrollments', label: 'Enrollments' }, { to: '/admin/statistics', label: 'Statistics' }, { to: '/admin/settings', label: 'Settings' }];
  if (isInstructor(role)) return [{ to: '/instructor', label: 'Dashboard' }, { to: '/instructor/courses', label: 'My Courses' }, { to: '/instructor/lessons', label: 'Lessons' }, { to: '/instructor/assignments', label: 'Assignments' }, { to: '/instructor/quizzes', label: 'Quizzes' }, { to: '/instructor/students', label: 'Students' }, { to: '/instructor/performance', label: 'Performance' }];
  return [{ to: '/student', label: 'Dashboard' }, { to: '/courses', label: 'Browse Courses' }, { to: '/my-courses', label: 'My Courses' }, { to: '/assignments', label: 'Assignments' }, { to: '/quizzes', label: 'Quizzes' }];
};

export default function Navbar({ darkMode, setDarkMode }) {
  const { user, logout } = useContext(AuthContext);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [courseNotifications, setCourseNotifications] = useState([]);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user?.id || isInstructor(user.role)) {
      setCourseNotifications([]);
      return undefined;
    }

    let mounted = true;

    const loadNotifications = async () => {
      try {
        const response = await coursesApi.getmyCourses(user.id);
        const courses = extractCoursesList(response?.data);
        const announcementsMap = await fetchAnnouncementsForCourses(courses);

        if (!mounted) return;

        const notifications = courses
          .map((course) => {
            const announcements = announcementsMap[String(course.id)] || [];
            const unseen = getLatestUnseenAnnouncement(user.id, course.id, announcements);
            if (!unseen) return null;
            return {
              courseId: course.id,
              courseTitle: course.title,
              announcement: unseen,
            };
          })
          .filter(Boolean);

        setCourseNotifications(notifications);
      } catch {
        if (mounted) setCourseNotifications([]);
      }
    };

    loadNotifications();
    return () => {
      mounted = false;
    };
  }, [user?.id, user?.role]);

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

            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen((open) => !open)}
                className="relative hidden md:inline-flex p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                aria-label="Course announcements"
              >
                <span className="material-symbols-outlined">notifications</span>
                {courseNotifications.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                    {courseNotifications.length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
                  <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Announcements</p>
                  </div>
                  {courseNotifications.length === 0 ? (
                    <p className="px-4 py-5 text-sm text-slate-500 dark:text-slate-400">
                      No new announcements.
                    </p>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {courseNotifications.map(({ courseId, courseTitle, announcement }) => (
                        <Link
                          key={`${courseId}-${announcement.id}`}
                          to={`/my-courses/${courseId}`}
                          onClick={() => setNotificationsOpen(false)}
                          className="block border-b border-slate-100 px-4 py-3 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                            {courseTitle}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                            {announcement.title}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

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
