import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useContext(AuthContext);
  const userName = user?.username || user?.name || user?.email?.split('@')[0] || 'Alex';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
      <main className="flex-grow w-full max-w-[1100px] mx-auto px-4 md:px-8 py-10">
        <section className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-950 dark:text-white mb-2">
            Welcome back, {userName}
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400">
            Here's your latest progress in agricultural technology.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgba(27,67,50,0.05)] border-t-4 border-emerald-600 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-900 px-3 py-1 text-sm font-semibold">
                  Active Course
                </span>
                <button className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-2 transition">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white mb-4">
                Soil Microbiology &amp; Health
              </h2>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mb-6">
                Module 3: Understanding beneficial nematodes and their role in organic pest management and soil aeration.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <span>Progress</span>
                <span className="text-emerald-700">75%</span>
              </div>
              <div className="h-4 w-full rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-inner">
                <div className="h-full rounded-full bg-emerald-600 progress-pattern" style={{ width: '75%' }} />
              </div>
              <div className="mt-6 flex justify-end">
                <button className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition">
                  Continue Learning
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgba(27,67,50,0.05)] flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-2xl">
                <span className="material-symbols-outlined">eco</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-1">
                  AgriCredits
                </p>
                <p className="text-3xl font-semibold text-slate-900 dark:text-white">1,250</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgba(27,67,50,0.05)] flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-100 flex items-center justify-center text-2xl">
                <span className="material-symbols-outlined">library_add_check</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-1">
                  Completed Modules
                </p>
                <p className="text-3xl font-semibold text-slate-900 dark:text-white">14</p>
              </div>
            </div>

            <Link
              to="/courses"
              className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-xl text-sm font-semibold transition shadow-sm"
            >
              View my to-do list
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </Link>
          </div>

          <div className="md:col-span-12">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-5">
              Recent Achievements
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-6 hide-scrollbar snap-x">
              <div className="min-w-[160px] bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center gap-3 snap-center hover:-translate-y-1 transition-transform cursor-pointer relative">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-3xl">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Irrigation Expert</span>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-52 bg-slate-900 text-white text-xs p-2 rounded-xl text-center shadow-lg">
                  Completed Advanced Drip Systems module with 95% accuracy.
                </div>
              </div>
              <div className="min-w-[160px] bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center gap-3 snap-center hover:-translate-y-1 transition-transform cursor-pointer relative">
                <div className="w-16 h-16 rounded-full bg-slate-800 text-white flex items-center justify-center text-3xl">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>psychiatry</span>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Seed Saver</span>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-52 bg-slate-900 text-white text-xs p-2 rounded-xl text-center shadow-lg">
                  Successfully harvested and cataloged 5 heirloom seed varieties.
                </div>
              </div>
              <div className="min-w-[160px] bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center gap-3 snap-center hover:-translate-y-1 transition-transform cursor-pointer relative">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-3xl">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>solar_power</span>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Solar Innovator</span>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-52 bg-slate-900 text-white text-xs p-2 rounded-xl text-center shadow-lg">
                  Designed a theoretical solar-powered automated greenhouse.
                </div>
              </div>
              <div className="min-w-[160px] bg-slate-100 dark:bg-slate-800 rounded-3xl p-5 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center gap-3 snap-center opacity-70">
                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center text-3xl">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Next Milestone</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgba(27,67,50,0.05)] border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Your Notes</h3>
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                <p className="bg-slate-50 dark:bg-slate-800 rounded-3xl p-4">Review your soil sample report before the next lab session.</p>
                <p className="bg-slate-50 dark:bg-slate-800 rounded-3xl p-4">Schedule a field check for the irrigation system on Friday.</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgba(27,67,50,0.05)] border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Season Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-slate-500 mb-2">
                    <span>Modules Completed</span>
                    <span className="font-semibold text-slate-900 dark:text-white">12 / 20</span>
                  </div>
                  <div className="h-2 w-full rounded-full inset-depth overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-emerald-600" style={{ width: '60%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-slate-500 mb-2">
                    <span>Practical Hours</span>
                    <span className="font-semibold text-slate-900 dark:text-white">45 hrs</span>
                  </div>
                  <div className="h-2 w-full rounded-full inset-depth overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-emerald-900" style={{ width: '75%' }} />
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-4 flex justify-between items-center text-sm text-slate-500">
                  <span>Current Streak</span>
                  <span className="font-semibold text-amber-600">14 Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="flex justify-around items-center px-4 py-3">
          <Link
            to="/courses"
            className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 active:scale-95 p-2 rounded-2xl"
          >
            <span className="material-symbols-outlined mb-1">potted_plant</span>
            <span className="text-[10px] leading-tight">Learn</span>
          </Link>
          <Link
            to="/dashboard"
            className="flex flex-col items-center justify-center bg-emerald-100 text-emerald-700 rounded-full px-4 py-2 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined mb-1">dashboard</span>
            <span className="text-[10px] leading-tight">Dashboard</span>
          </Link>
          <Link
            to="/wallet"
            className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 active:scale-95 p-2 rounded-2xl"
          >
            <span className="material-symbols-outlined mb-1">account_balance_wallet</span>
            <span className="text-[10px] leading-tight">Wallet</span>
          </Link>
          <Link
            to="/dashboard"
            className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 active:scale-95 p-2 rounded-2xl"
          >
            <span className="material-symbols-outlined mb-1">person</span>
            <span className="text-[10px] leading-tight">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
