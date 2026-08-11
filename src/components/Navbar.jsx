import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Wallet, BookOpen, Shield, LogOut, Sun, Moon } from 'lucide-react';

export default function Navbar({ darkMode, setDarkMode }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center transition-colors">
      <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
        EduPlatform
      </Link>

      <div className="flex items-center space-x-6">
        {user && (
          <>
            <Link to="/courses" className="flex items-center text-gray-700 dark:text-gray-200 hover:text-indigo-600">
              <BookOpen className="w-4 h-4 mr-1" /> Courses
            </Link>

            <Link to="/wallet" className="flex items-center text-gray-700 dark:text-gray-200 hover:text-indigo-600">
              <Wallet className="w-4 h-4 mr-1" /> Wallet
            </Link>

            {user.role === 'ADMIN' && (
              <Link to="/admin" className="flex items-center text-rose-600 font-semibold hover:text-rose-700">
                <Shield className="w-4 h-4 mr-1" /> Admin
              </Link>
            )}
          </>
        )}

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {user ? (
          <button
            onClick={handleLogout}
            className="flex items-center bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm"
          >
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </button>
        ) : (
          <div className="space-x-3">
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium">
              Login
            </Link>
            <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}