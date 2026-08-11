import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [message, setMessage] = useState({ type: '', text: '' });
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      await register(username, email, password, role);
      navigate('/courses');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Registration failed.' });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-gray-200/70 bg-white shadow-[0_25px_80px_-20px_rgba(15,23,42,0.25)] dark:border-gray-800 dark:bg-gray-900">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-fuchsia-600 via-violet-600 to-indigo-600 p-10 text-white">
            <div>
              <div className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur">
                Start learning today
              </div>
              <h2 className="mt-6 text-3xl font-semibold leading-tight">Build your future with courses that inspire real growth.</h2>
              <p className="mt-4 text-sm text-indigo-100/90">Create your account to unlock lessons, track progress, and connect with expert-led education.</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm font-medium">What you get</p>
              <ul className="mt-3 space-y-2 text-sm text-indigo-100">
                <li>• Instant access to your dashboard</li>
                <li>• Flexible student or teacher experience</li>
                <li>• Secure and modern onboarding</li>
              </ul>
            </div>
          </div>

          <div className="p-8 sm:p-10 lg:p-12">
            <div className="mb-8 text-center lg:text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-fuchsia-500">Create Account</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">Join the platform</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Set up your profile and start exploring courses.</p>
            </div>

            {message.text && (
              <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${message.type === 'success' ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400' : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-fuchsia-900"
                  placeholder="Choose a username"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-fuchsia-900"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-fuchsia-900"
                  placeholder="Create a strong password"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-fuchsia-900"
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-3 font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:translate-y-[-1px] hover:shadow-fuchsia-500/30"
              >
                Register
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-fuchsia-600 transition hover:text-fuchsia-500 dark:text-fuchsia-400">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}