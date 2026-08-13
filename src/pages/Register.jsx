import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, UserRound, GraduationCap, BriefcaseBusiness } from 'lucide-react';

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
      const { home } = await register(username, email, password, role);
      navigate(home, { replace: true });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Registration failed.' });
    }
  };

  const inputClass = 'block w-full rounded-md border border-[#c1c8c2] bg-[#f3f4f3] py-3 pl-10 pr-3 text-[#191c1c] shadow-inner transition focus:border-[#012d1d] focus:outline-none focus:ring-1 focus:ring-[#0e6c4a]';
  const labelClass = 'mb-1 block text-[14px] font-semibold uppercase tracking-[0.05em] text-[#191c1c]';

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
              <span className="text-[24px] font-semibold tracking-tight">Daltex Academy</span>
            </div>
            <div className="max-w-md">
              <h1 className="mb-4 text-[48px] font-semibold leading-tight tracking-[-0.02em]">Grow your career with Daltex</h1>
              <p className="text-[18px] leading-7 text-white/90">
                Learn the practical skills, tools, and standards that shape modern agriculture at Daltex.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center bg-[#f9f9f8] px-4 py-8 sm:px-8 md:px-10 lg:px-12 xl:px-14">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <div className="mb-3 flex items-center justify-center gap-2 text-[#012d1d] lg:justify-start">
                <GraduationCap className="h-6 w-6" />
                <span className="text-[20px] font-semibold">Daltex Academy</span>
              </div>
              <h2 className="mb-2 text-[32px] font-semibold text-[#012d1d]">Create your account</h2>
              <p className="text-[16px] text-[#414844]">Start learning the skills that move Daltex forward.</p>
            </div>

            {message.text && (
              <div className={`mb-5 rounded-md border px-4 py-3 text-sm ${message.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="username">Full Name</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><UserRound className="h-4 w-4 text-[#717973]" /></div>
                  <input id="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} placeholder="Your full name" />
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="email">Email Address</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Mail className="h-4 w-4 text-[#717973]" /></div>
                  <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="student@example.com" />
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="password">Password</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Lock className="h-4 w-4 text-[#717973]" /></div>
                  <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="Create a strong password" />
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="role">I am joining as</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><BriefcaseBusiness className="h-4 w-4 text-[#717973]" /></div>
                  <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className={`${inputClass} appearance-none`}>
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Instructor</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="flex w-full justify-center rounded-md border border-transparent bg-[#0e6c4a] px-4 py-3 text-[14px] font-semibold uppercase tracking-[0.05em] text-white shadow-sm transition hover:bg-[#0f5d44] focus:outline-none focus:ring-2 focus:ring-[#0e6c4a] focus:ring-offset-2">
                Create account
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[16px] text-[#414844]">
                Already have an account? <Link to="/login" className="font-semibold text-[#0e6c4a] transition hover:text-[#012d1d]">Log in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
