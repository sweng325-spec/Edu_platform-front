import React, { useContext, useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const navItems = [
  { to: '/courses', label: 'Courses' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/wallet', label: 'Wallet' },
];

export default function Navbar() {
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

  return (
    <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 flex justify-center">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={label}
                  to={to}
                  className={({ isActive }) =>
                    `transition-all ${isActive ? 'text-emerald-700 dark:text-emerald-300 border-b-2 border-emerald-700 pb-1' : 'hover:text-emerald-700'}`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm transition hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined text-2xl">account_circle</span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-3 w-44 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm text-slate-900 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
