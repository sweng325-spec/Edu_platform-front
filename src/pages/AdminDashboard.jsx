import { useState, useEffect } from 'react';
import { usersApi } from '../api/users';
import StatCard from '../components/StatCard';
import UserRow from '../components/UserRow';
import { Users, GraduationCap, DollarSign, BookOpen, ClipboardCheck, ChartNoAxesCombined } from 'lucide-react';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);

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

  useEffect(() => {
    fetchAnalytics();
    fetchUsers();
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
    </div>
  );
}
