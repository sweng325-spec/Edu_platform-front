import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useContext(AuthContext);
  const userName = user?.username || user?.name || user?.email?.split('@')[0] || 'Learner';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-28 md:pb-12">
        <section className="mb-8 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-800 relative">
              <img
                className="w-full h-full object-cover"
                alt="Student portrait"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBON10Iz6O_c3n-9JJxYZ_n6ZkXyim7MlO8moXuyH9ytnjlLPcjyz8bWO90actm8bik6na11IRxySJsR0T8uAoJ1LuNVmCr5eoPkuep01A-QfC7pI1m3Vr7TyP1lg92SzMqPZ1yyVzW8nxxc1wSXdvVHf9vI9J932Mig0xVj_-pVobC0YnJm0TNQcwzXYP5K0jVg_LBaC1-Hv2WA7c1TU8K2xTaxuZT5G8W-z3Nw59rz2pckj9CSoNu"
              />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold text-slate-950 dark:text-white">Hi, {userName}!</h1>
              <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">Ready to grow your skills today?</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl organic-shadow flex items-center gap-4 min-w-[250px] border border-slate-200 dark:border-slate-800">
            <div className="p-3 rounded-full bg-emerald-100 text-emerald-700">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500 dark:text-slate-400">AgriWallet Balance</p>
              <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">1,250 Seed Tokens</p>
            </div>
            <button className="text-emerald-700 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-all">
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 flex flex-col gap-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl organic-shadow p-6 border-t-4 border-emerald-600 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-emerald-700" style={{ fontSize: 220 }}>eco</span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600">trending_up</span>
                  Current Focus
                </h2>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-sm font-semibold">
                  Module 3 of 5
                </span>
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 aspect-video md:aspect-square rounded-3xl overflow-hidden relative">
                  <img
                    className="w-full h-full object-cover"
                    alt="Hands examining soil"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqqY01M6fmiCnusWn4DBRoPgfTOa7GzwfTT3qu_v--sAXRmon_CWx_13Xk-whb5zHHa6WgLTWzgTdAdxn98cqNK8BU9rijrWbJjhcaKZeiTF0fJd6sXsMk8MLLS6c-fG6GhTYiHQ40yr5VQWZxJUXapHY00EyARShc8bs5FNrWcZ3A8BLXRbzh6AXhtEA8VpVmiY-zpNFEGFjKE50JbXBIaUUUIrh_cNTgWvxvxfd9Lzky05vBMHT1"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <button className="bg-white/90 p-3 rounded-full text-emerald-700 hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined icon-filled" style={{ fontSize: 32 }}>play_arrow</span>
                    </button>
                  </div>
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 mb-1">Advanced Soil Science</p>
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Microbiome Management</h3>
                    <p className="text-base text-slate-600 dark:text-slate-400 line-clamp-2">
                      Understand the delicate balance of microorganisms necessary for sustainable crop yields and optimal soil health.
                    </p>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between text-sm font-semibold text-slate-500 mb-2">
                      <span>Progress</span>
                      <span className="text-emerald-700">65%</span>
                    </div>
                    <div className="h-3 w-full rounded-full inset-depth overflow-hidden bg-slate-200 dark:bg-slate-800">
                      <div className="h-full bg-emerald-600 rounded-full progress-pattern" style={{ width: '65%' }} />
                    </div>
                    <div className="flex justify-end mt-4">
                      <button className="bg-emerald-700 text-white px-6 py-2 rounded-2xl hover:bg-emerald-800 transition-all shadow-sm">
                        Continue Lesson
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl organic-shadow p-6">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-emerald-600">workspace_premium</span>
                Trophy Case
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-emerald-600 transition-all">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-emerald-700 text-3xl">compost</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white text-center">Soil Master</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">Level 3</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-emerald-600 transition-all">
                  <div className="w-16 h-16 rounded-full bg-[#e3c0a8] flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[#5a4230] text-3xl">precision_manufacturing</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white text-center">Tech Pioneer</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">Level 2</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-emerald-600 transition-all">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-emerald-900 text-3xl">water_drop</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white text-center">Water Wise</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">Level 1</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-slate-100 dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 opacity-80">
                  <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-slate-500 text-3xl">lock</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 text-center">Crop Whisperer</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">Locked</span>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 flex flex-col gap-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl organic-shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600">calendar_today</span>
                  To-Do List
                </h2>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-l-4 border-rose-500 bg-white dark:bg-slate-900">
                  <div className="flex flex-col items-center justify-center bg-rose-100 text-rose-700 rounded-2xl w-12 h-12 flex-shrink-0">
                    <span className="text-[10px] font-semibold">OCT</span>
                    <span className="text-lg font-bold leading-none">12</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Soil Sample Analysis Lab</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Due Tomorrow • 250 Tokens</p>
                  </div>
                </li>
                <li className="flex gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-l-4 border-emerald-600 bg-white dark:bg-slate-900">
                  <div className="flex flex-col items-center justify-center bg-emerald-100 text-emerald-700 rounded-2xl w-12 h-12 flex-shrink-0">
                    <span className="text-[10px] font-semibold">OCT</span>
                    <span className="text-lg font-bold leading-none">15</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Drone Mapping Quiz</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Module 2 • 100 Tokens</p>
                  </div>
                </li>
                <li className="flex gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-l-4 border-slate-300 bg-white dark:bg-slate-900">
                  <div className="flex flex-col items-center justify-center bg-slate-100 text-slate-600 rounded-2xl w-12 h-12 flex-shrink-0">
                    <span className="text-[10px] font-semibold">OCT</span>
                    <span className="text-lg font-bold leading-none">20</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Greenhouse Design Draft</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Final Project • 500 Tokens</p>
                  </div>
                </li>
              </ul>
              <button className="w-full mt-5 text-emerald-700 font-semibold hover:text-emerald-900 transition-all py-3 rounded-3xl bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700">
                View Full Calendar
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl organic-shadow p-6 border-t-4 border-emerald-900">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-900">bar_chart</span>
                Season Stats
              </h2>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm text-slate-500 mb-2">
                    <span>Modules Completed</span>
                    <span className="font-semibold text-slate-900 dark:text-white">12 / 20</span>
                  </div>
                  <div className="h-2 w-full rounded-full inset-depth overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-slate-500 mb-2">
                    <span>Practical Hours</span>
                    <span className="font-semibold text-slate-900 dark:text-white">45 hrs</span>
                  </div>
                  <div className="h-2 w-full rounded-full inset-depth overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <div className="h-full bg-emerald-900 rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-4 flex justify-between items-center">
                  <span className="text-sm text-slate-500">Current Streak</span>
                  <div className="flex items-center gap-1 text-amber-600 font-semibold">
                    <span className="material-symbols-outlined icon-filled text-amber-600">local_fire_department</span>
                    14 Days
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
