import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { roleHome, isInstructor } from '../utils/roles';
import { usersApi } from '../api/users';

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    current_password: '',
    new_password: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  if (!user) return null;

  const userRole = user.role || 'STUDENT';
  const dashboardPath = roleHome(userRole);
  const isUserInstructor = isInstructor(userRole);
  const formattedRole = userRole.charAt(0) + userRole.slice(1).toLowerCase();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // 1. Update basic profile info (username/email)
      // const profileResponse = await usersApi.updateUserProfile({
      //   username: formData.username,
      //   email: formData.email,
      // });

      // 2. Optional: Update password if fields are filled
      if (formData.new_password) {
        if (!formData.old_password) {
          throw new Error('Current password is required to set a new password.');
        }
        await usersApi.updatePassword({
          old_password: formData.old_password,
          new_password: formData.new_password,
        });
      }

      // Update global auth context with new user info if returned
      if (setUser && profileResponse.data) {
        setUser((prev) => ({ ...prev, ...profileResponse.data }));
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setFormData((prev) => ({ ...prev, old_password: '', new_password: '' }));
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || err.message || 'Failed to update profile.',
      });
    } finally {
      setLoading(false);
    }
  };

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
          <div className="flex items-center gap-3">
            <Link
              to={dashboardPath}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200"
            >
              <span className="material-symbols-outlined text-sm">dashboard</span>
              Dashboard
            </Link>
          </div>
        </div>

        {/* Feedback Messages */}
        {message.text && (
          <div className={`mx-6 mt-6 p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'}`}>
            {message.text}
          </div>
        )}

        {/* Form / Details Grid */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Username Field */}
            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Username
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full mt-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              ) : (
                <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                  {user.username || 'Not provided'}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full mt-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              ) : (
                <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                  {user.email || 'Not provided'}
                </p>
              )}
            </div>

            {/* Role Card (Read-only) */}
            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Account Role</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <span className="material-symbols-outlined text-sm">
                  {isUserInstructor ? 'menu_book' : 'verified'}
                </span>
                {formattedRole}
              </div>
            </div>

            {/* User ID Card (Read-only) */}
            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">User ID</p>
              <p className="mt-1 text-base font-mono font-medium text-slate-700 dark:text-slate-300">
                #{user.id || 'N/A'}
              </p>
            </div>

          </div>

          {/* Conditional Password Update Fields */}
          {isEditing && (
            <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20 space-y-4">
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">Change Password (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    name="old_password"
                    value={formData.old_password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">New Password</label>
                  <input
                    type="password"
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-700 text-white hover:bg-emerald-800 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-700 text-white hover:bg-emerald-800 transition"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}