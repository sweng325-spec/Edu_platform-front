import { useState, useEffect } from 'react';
import { usersApi } from '../api/users';
import { coursesApi } from '../api/courses';
import StatCard from '../components/StatCard';
import UserRow from '../components/UserRow';
import { Users, GraduationCap, DollarSign, BookOpen, ClipboardCheck, ChartNoAxesCombined, Trash2 } from 'lucide-react';
import { extractCoursesList } from '../utils/media';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const [courseError, setCourseError] = useState('');

  const fetchAnalytics = async () => {
    try {
      const res = await usersApi.getAdminAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await usersApi.listAdminUsers();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const res = await coursesApi.list();
      setCourses(extractCoursesList(res.data));
    } catch (err) {
      console.error(err);
    } finally {
      setCoursesLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchUsers();
    fetchCourses();
  }, []);

  const handleToggleStatus = async (userId, newStatus) => {
    try {
      await usersApi.setUserStatus(userId, newStatus);
      fetchUsers();
      fetchAnalytics();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user status');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course? This action cannot be undone.')) return;
    setCourseError('');
    setDeletingCourseId(courseId);
    try {
      await coursesApi.delete(courseId);
      setCourses((current) => current.filter((c) => c.id !== courseId));
      fetchAnalytics();
    } catch (err) {
      setCourseError(err.userMessage || err.response?.data?.error || 'Failed to delete course.');
    } finally {
      setDeletingCourseId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-700">Platform management</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">Admin dashboard</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Monitor learners, instructors, courses, enrollments, performance, and platform activity.</p>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard title="Total Students" value={analytics.users.total_students} icon={Users} color="blue" />
          <StatCard title="Total Instructors" value={analytics.users.total_teachers ?? analytics.users.total_instructors ?? '—'} icon={GraduationCap} color="purple" />
          <StatCard title="Total Courses" value={analytics.academics.total_courses} icon={BookOpen} color="indigo" />
          <StatCard title="Active Courses" value={analytics.academics.active_courses ?? '—'} icon={ClipboardCheck} color="emerald" />
          <StatCard title="Total Enrollments" value={analytics.academics.total_enrollments ?? analytics.enrollments?.total ?? '—'} icon={ChartNoAxesCombined} color="blue" />
          <StatCard title="Platform Volume" value={`$${analytics.financials.total_platform_volume}`} icon={DollarSign} color="emerald" />
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">User Management</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-500 uppercase">
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <UserRow key={u.id} user={u} onToggleStatus={handleToggleStatus} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Course Management</h3>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{courses.length} courses</span>
        </div>

        {courseError && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
            {courseError}
          </div>
        )}

        {coursesLoading ? (
          <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">No courses on the platform yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Instructor</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr
                    key={course.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">{course.title}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{course.teacher_name || '—'}</td>
                    <td className="py-3 px-4 text-sm text-right">
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        disabled={deletingCourseId === course.id}
                        className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deletingCourseId === course.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
