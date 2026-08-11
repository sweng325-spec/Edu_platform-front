import React, { useState, useContext } from 'react';
import { Mail, Lock, GraduationCap, School, CircleUserRound } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Invalid email or password.' });
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-[#f9f9f8] px-3 py-4 sm:px-6 lg:px-0 lg:py-0">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[24px] border border-[#dfe4df] bg-white shadow-[0_20px_70px_-25px_rgba(1,45,29,0.28)] lg:flex-row">
        <div className="relative hidden overflow-hidden bg-[#edf5ef] lg:flex lg:w-1/2">
          <div className="absolute inset-0">
            <div
              className="h-full w-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCPK6VVpLmReBrQm-JqOtIjW6knZtOh_cW3IqGi0ZZdVm9eCsICggHefi6LyP2n5TCHWDp2FF6V2J1sLS1jpjeoEamDG7y2yNxlwMIOZDzf4D-1lQR0yYf7nJiaUZjD5hkanU0x3iPhJip3dkXFl_uxKW07rtCtH4s5OG8hOXSzdeQJGRcXwvKbGQWqL3jrDPYbGutDuD1lKGqPlZWKw6cMWrimIdVYmNuBDEaIAUV_WWBhfoXxmICm')",
              }}
            />
            <div className="absolute inset-0 bg-[#1b4332]/20" />
          </div>
          <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8" />
              <span className="text-[24px] font-semibold tracking-tight">Terraform Edu</span>
            </div>
            <div className="max-w-md">
              <h1 className="mb-4 text-[48px] font-semibold leading-tight tracking-[-0.02em]">
                Cultivating the Future of Agriculture
              </h1>
              <p className="text-[18px] leading-7 text-white/90">
                Join our platform to learn modern, sustainable farming techniques backed by cutting-edge technology.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center bg-[#f9f9f8] px-4 py-8 sm:px-8 md:px-10 lg:px-12 xl:px-14">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <div className="mb-3 flex items-center justify-center gap-2 text-[#012d1d] lg:justify-start">
                <GraduationCap className="h-6 w-6" />
                <span className="text-[20px] font-semibold">Terraform Edu</span>
              </div>
              <h2 className="mb-2 text-[32px] font-semibold text-[#012d1d]">Welcome back</h2>
              <p className="text-[16px] text-[#414844]">Log in to access your courses and dashboard.</p>
            </div>

            {message.text && (
              <div className={`mb-5 rounded-md border px-4 py-3 text-sm ${message.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                {message.text}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-[14px] font-semibold uppercase tracking-[0.05em] text-[#191c1c]" htmlFor="email">
                  Email Address
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-[#717973]" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="block w-full rounded-md border border-[#c1c8c2] bg-[#f3f4f3] py-3 pl-10 pr-3 text-[#191c1c] shadow-inner transition focus:border-[#012d1d] focus:outline-none focus:ring-1 focus:ring-[#0e6c4a]"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-[14px] font-semibold uppercase tracking-[0.05em] text-[#191c1c]" htmlFor="password">
                    Password
                  </label>
                  <button type="button" className="text-[14px] font-semibold text-[#0e6c4a] transition hover:text-[#012d1d]">
                    Forgot password?
                  </button>
                </div>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-[#717973]" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-md border border-[#c1c8c2] bg-[#f3f4f3] py-3 pl-10 pr-3 text-[#191c1c] shadow-inner transition focus:border-[#012d1d] focus:outline-none focus:ring-1 focus:ring-[#0e6c4a]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center text-[16px] text-[#414844]" htmlFor="remember-me">
                  <input className="mr-2 h-4 w-4 cursor-pointer rounded border-[#c1c8c2] text-[#0e6c4a] focus:ring-[#0e6c4a]" id="remember-me" name="remember-me" type="checkbox" />
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-[#0e6c4a] px-4 py-3 text-[14px] font-semibold uppercase tracking-[0.05em] text-white shadow-sm transition hover:bg-[#0f5d44] focus:outline-none focus:ring-2 focus:ring-[#0e6c4a] focus:ring-offset-2"
              >
                Log in
              </button>
            </form>

            <div className="mt-8 relative">
              <div aria-hidden="true" className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#c1c8c2]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[#f9f9f8] px-2 text-[12px] uppercase tracking-[0.2em] text-[#414844]">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="inline-flex w-full items-center justify-center rounded-md border border-[#c1c8c2] bg-white px-4 py-2 text-[14px] font-semibold text-[#191c1c] transition hover:bg-[#f3f4f3]"
              >
                <School className="mr-2 h-4 w-4" />
                Institution
              </button>
              <button
                type="button"
                className="inline-flex w-full items-center justify-center rounded-md border border-[#c1c8c2] bg-white px-4 py-2 text-[14px] font-semibold text-[#191c1c] transition hover:bg-[#f3f4f3]"
              >
                <CircleUserRound className="mr-2 h-4 w-4" />
                Google
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-[16px] text-[#414844]">
                New to Terraform Edu?{' '}
                <Link to="/register" className="font-semibold text-[#0e6c4a] transition hover:text-[#012d1d]">
                  Join as Student
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}