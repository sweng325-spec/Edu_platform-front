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
    <div className="sticky top-0 z-50 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-2xl font-bold text-slate-950 dark:text-white">
            <span className="material-symbols-outlined text-3xl text-emerald-700">eco</span>
            AgriGrow
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md transition-all ${isActive ? 'text-emerald-700 dark:text-emerald-300 border-b-2 border-emerald-700' : 'hover:text-emerald-700 hover:bg-slate-100 dark:hover:bg-slate-800'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
              <span className="text-sm font-semibold">1,250</span>
            </div>
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
    </div>
  );
}
