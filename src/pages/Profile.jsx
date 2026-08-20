import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { roleHome, isInstructor } from '../utils/roles';

export default function Profile() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return null;
  }

  const userRole = user.role || 'STUDENT';
  const dashboardPath = roleHome(userRole);
  const isUserInstructor = isInstructor(userRole);

  // Format role label nicely (e.g. "STUDENT" -> "Student")
  const formattedRole = userRole.charAt(0) + userRole.slice(1).toLowerCase();

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-8">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        
        {/* Header Banner */}
        <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-sm dark:bg-emerald-950/50 dark:text-emerald-300">
              <span className="material-symbols-outlined text-2xl">
                {isUserInstructor ? 'menu_book' : 'school'}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-950 dark:text-white">User Profile</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage your account details authorized by Daltex Academy
              </p>
            </div>
          </div>
          <Link
            to={dashboardPath}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
          >
            <span className="material-symbols-outlined text-sm">dashboard</span>
            Go to dashboard
          </Link>
        </div>

        {/* User Details Grid */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Username Card */}
            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Username</p>
              <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                {user.username || 'Not provided'}
              </p>
            </div>

            {/* Email Card */}
            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Email Address</p>
              <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                {user.email || 'Not provided'}
              </p>
            </div>

            {/* Role Card */}
            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Account Role</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <span className="material-symbols-outlined text-sm">
                  {isUserInstructor ? 'menu_book' : 'verified'}
                </span>
                {formattedRole}
              </div>
            </div>

            {/* User ID Card */}
            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">User ID</p>
              <p className="mt-1 text-base font-mono font-medium text-slate-700 dark:text-slate-300">
                #{user.id || 'N/A'}
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}