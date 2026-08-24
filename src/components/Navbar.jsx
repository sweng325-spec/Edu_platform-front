import { useContext, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { coursesApi } from '../api/courses';
import { extractCoursesList } from '../utils/media';
import { isInstructor } from '../utils/roles';

const navigationFor = (role) => {
  if (role === 'ADMIN') return [{ to: '/admin', label: 'Dashboard' }, { to: '/admin/users', label: 'Users' }, { to: '/admin/students', label: 'Students' }, { to: '/admin/instructors', label: 'Instructors' }, { to: '/admin/courses', label: 'Courses' }, { to: '/admin/enrollments', label: 'Enrollments' }, { to: '/admin/statistics', label: 'Statistics' }, { to: '/admin/settings', label: 'Settings' }];
  if (isInstructor(role)) return [{ to: '/instructor', label: 'Dashboard' }, { to: '/instructor/courses', label: 'My Courses' }, { to: '/instructor/assignments', label: 'Assignments' }, { to: '/instructor/quizzes', label: 'Quizzes' }, { to: '/instructor/performance', label: 'Performance' }];
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
  const userIsInstructor = isInstructor(user?.role);

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
    if (!user?.id || userIsInstructor) {
      setCourseNotifications([]);
      return undefined;
    }

    let mounted = true;

    // Fetch all unread notifications across enrolled courses
    const loadUnreadNotifications = async () => {
      try {
        const response = await coursesApi.getmyCourses(user.id);
        const courses = extractCoursesList(response?.data);

        // Fetch announcements/user-notifications for each course
        const notificationsPromises = courses.map(async (course) => {
          try {
            const res = await coursesApi.getCourseAnnouncements(course.id || course.course);
            const list = extractCoursesList(res?.data);
            // Filter unread items only
            return list
              .filter((item) => !item.is_read)
              .map((item) => ({
                id: item.id,
                courseId: course.id || course.course,
                courseTitle: course.title || course.course_title,
                title: item.title,
              }));
          } catch {
            return [];
          }
        });

        const results = await Promise.all(notificationsPromises);
        const unreadList = results.flat();

        if (mounted) {
          setCourseNotifications(unreadList);
        }
      } catch {
        if (mounted) setCourseNotifications([]);
      }
    };

    loadUnreadNotifications();

    const handleAnnouncementsSeen = () => {
      loadUnreadNotifications();
    };

    window.addEventListener('announcements-seen', handleAnnouncementsSeen);

    return () => {
      mounted = false;
      window.removeEventListener('announcements-seen', handleAnnouncementsSeen);
    };
  }, [user?.id, userIsInstructor]);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/login');
  };

  if (!user) {
    return null;
  }
  const navItems = navigationFor(user.role);
  const displayName = user.username || user.name || user.email?.split('@')[0] || 'Account';

  // Total unread notifications count
  const unreadCount = courseNotifications.length;

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

            {/* Notifications Icon and Counter */}
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen((open) => !open)}
                className="relative hidden md:inline-flex p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                aria-label="Course announcements"
              >
                <span className="material-symbols-outlined">notifications</span>
                {!userIsInstructor && unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && !userIsInstructor && (
                <div className="absolute right-0 top-full mt-3 w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
                  <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Unread Announcements ({unreadCount})
                    </p>
                  </div>
                  {unreadCount === 0 ? (
                    <p className="px-4 py-5 text-sm text-slate-500 dark:text-slate-400">
                      No new announcements.
                    </p>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {courseNotifications.map((notif) => (
                        <Link
                          key={notif.id}
                          to={`/my-courses/${notif.courseId}/announcements`}
                          onClick={() => setNotificationsOpen(false)}
                          className="block border-b border-slate-100 px-4 py-3 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                            {notif.courseTitle}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                            {notif.title}
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
                className="relative flex items-center gap-2.5 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 shadow-sm transition hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                title={userIsInstructor ? 'Instructor Account' : 'Student Account'}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm dark:bg-emerald-900 dark:text-emerald-200">
                  <span className="material-symbols-outlined text-xl">
                    {userIsInstructor ? 'menu_book' : 'school'}
                  </span>
                </span>
                <span className="max-w-[120px] truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {displayName}
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-3 w-48 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      {userIsInstructor ? 'Instructor View' : 'Student View'}
                    </p>
                  </div>
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