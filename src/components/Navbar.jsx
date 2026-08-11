import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Wallet, BookOpen, Shield, LogOut, Sun, Moon, GraduationCap } from 'lucide-react';

export default function Navbar({ darkMode, setDarkMode }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="flex items-center justify-between border-b border-[#dfe4df] bg-[#f9f9f8] px-4 py-4 text-[#012d1d] transition-colors sm:px-6 lg:px-8">
      <Link to="/" className="flex items-center gap-2 text-[20px] font-semibold tracking-tight text-[#012d1d] transition hover:text-[#0e6c4a]">
        <GraduationCap className="h-6 w-6" />
        Terraform Edu
      </Link>

      <div className="flex items-center gap-3 sm:gap-5">
        {user && (
          <>
            <Link to="/courses" className="flex items-center text-sm font-medium text-[#414844] transition hover:text-[#0e6c4a]">
              <BookOpen className="w-4 h-4 mr-1" /> Courses
            </Link>

            <Link to="/wallet" className="flex items-center text-sm font-medium text-[#414844] transition hover:text-[#0e6c4a]">
              <Wallet className="w-4 h-4 mr-1" /> Wallet
            </Link>

            {user.role === 'ADMIN' && (
              <Link to="/admin" className="flex items-center text-sm font-semibold text-[#0e6c4a] transition hover:text-[#012d1d]">
                <Shield className="w-4 h-4 mr-1" /> Admin
              </Link>
            )}
          </>
        )}

        <button
          onClick={() => setDarkMode(!darkMode)}
          aria-label={darkMode ? 'Use light theme' : 'Use dark theme'}
          className="rounded-md bg-[#edf5ef] p-2 text-[#414844] transition hover:bg-[#dcecdf] hover:text-[#012d1d]"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {user ? (
          <button
            onClick={handleLogout}
            className="flex items-center rounded-md bg-[#012d1d] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0e6c4a]"
          >
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-[#0e6c4a] transition hover:text-[#012d1d]">
              Login
            </Link>
            <Link to="/register" className="rounded-md bg-[#0e6c4a] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f5d44]">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
