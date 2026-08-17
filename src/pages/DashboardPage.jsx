import { useContext } from 'react';
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, Clock3, Flame, Leaf, Play, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const achievements = [
  { title: 'Irrigation expert', detail: 'Advanced drip systems', icon: '💧', color: 'bg-sky-50' },
  { title: 'Soil steward', detail: 'Healthy soil foundations', icon: '🌱', color: 'bg-emerald-50' },
  { title: 'Solar innovator', detail: 'Greenhouse essentials', icon: '☀️', color: 'bg-amber-50' },
];

export default function DashboardPage() {
  const { user } = useContext(AuthContext);
  const userName = user?.username || user?.name || user?.email?.split('@')[0] || 'Learner';

  return (
    <div className="space-y-7 pb-10">
      <section className="relative overflow-hidden px-6 py-9 text-[#123f30] sm:px-10 dark:text-[#e8f7ef]">
        <div className="mx-auto max-w-[1200px]">
          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#123f30]/15 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#123f30] dark:border-[#dfeee3]/20 dark:bg-slate-900/40 dark:text-[#e8f7ef]"><Leaf className="h-3.5 w-3.5" /> Daltex learning hub</span>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#123f30] dark:text-[#e8f7ef] sm:text-4xl">Good to see you, {userName}.</h1>
              <p className="mt-3 max-w-xl text-base leading-7 text-[#123f30]/80 dark:text-[#dfeee3]/90">A little progress today grows into expertise tomorrow. Let’s keep your learning moving.</p>
            </div>

            <div className="mt-[-8px] flex items-center gap-3 rounded-[22px] border border-[#123f30]/10 bg-[#edf5ef]/90 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-[#dfeee3]/10 dark:bg-[#dfeee3]/10">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#dfeee3] text-[#123f30] dark:bg-[#123f30] dark:text-[#dfeee3]"><Flame className="h-5 w-5" /></span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#123f30]/75 dark:text-[#e8f7ef]">Learning streak</p>
                <p className="mt-1 text-2xl font-semibold text-[#123f30] dark:text-[#e8f7ef]">14 days</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1200px] grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-[18px] border border-[#dbe7dc] bg-white p-4 shadow-[0_8px_20px_rgba(27,67,50,0.04)] dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><span className="rounded-2xl bg-[#e6f2e8] p-3 text-[#16623f] dark:bg-emerald-950 dark:text-emerald-300"><CheckCircle2 className="h-5 w-5" /></span><span className="text-sm font-semibold text-emerald-700">+2 this week</span></div><p className="mt-5 text-sm text-slate-500">Modules completed</p><p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">14 <span className="text-base font-medium text-slate-400">/ 20</span></p></div>
        <div className="rounded-[18px] border border-[#dbe7dc] bg-white p-4 shadow-[0_8px_20px_rgba(27,67,50,0.04)] dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><span className="rounded-2xl bg-[#eaf6ee] p-3 text-[#123f30] dark:bg-emerald-950 dark:text-emerald-300"><Clock3 className="h-5 w-5" /></span><span className="text-sm font-semibold text-[#123f30]">This season</span></div><p className="mt-5 text-sm text-slate-500">Practical hours</p><p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">45 <span className="text-base font-medium text-slate-400">hrs</span></p></div>
      </section>

      <section className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 lg:grid-cols-5">
        <article className="relative overflow-hidden rounded-[28px] bg-white p-6 shadow-[0_10px_30px_rgba(27,67,50,0.07)] ring-1 ring-[#dbe7dc] dark:bg-slate-900 dark:ring-slate-800 lg:col-span-3"><div className="absolute right-0 top-0 h-28 w-28 rounded-bl-[70px] bg-[#e6f2e8]" /><div className="relative"><span className="inline-flex rounded-full bg-[#e6f2e8] px-3 py-1 text-xs font-semibold text-[#16623f] dark:bg-emerald-950 dark:text-emerald-300">Continue learning</span><h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Soil Microbiology &amp; Health</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">Module 3: Discover how beneficial nematodes support organic pest management and healthy soil aeration.</p><div className="mt-7"><div className="mb-2 flex justify-between text-sm font-semibold text-slate-600 dark:text-slate-300"><span>Course progress</span><span className="text-emerald-700">75%</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full w-3/4 rounded-full bg-[#1b7049] progress-pattern" /></div></div><Link to="/my-courses?course=soil-microbiology-health" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#16623f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#104d32]"><Play className="h-4 w-4 fill-current" /> Continue lesson</Link></div></article>
        <aside className="rounded-[28px] bg-[#f4f8f3] p-6 dark:bg-slate-900 lg:col-span-2"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-700">Up next</p><h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Your learning plan</h2></div><CalendarDays className="h-6 w-6 text-[#16623f]" /></div><div className="mt-5 space-y-3"><div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800"></div></div><Link to="/learning-plan" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#16623f] hover:text-[#104d32]">My To-Do list <ArrowRight className="h-4 w-4" /></Link></aside>
      </section>

      <section className="mx-auto max-w-[1200px] rounded-[28px] border border-[#dbe7dc] bg-white p-6 shadow-[0_10px_30px_rgba(27,67,50,0.05)] dark:border-slate-800 dark:bg-slate-900"><div className="flex items-end justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-700">Keep growing</p><h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Recent achievements</h2></div><Trophy className="h-6 w-6 text-[#c4851b]" /></div><div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">{achievements.map((achievement) => <article key={achievement.title} className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 transition hover:border-emerald-200 hover:shadow-sm dark:border-slate-800"><span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${achievement.color} dark:bg-slate-800`}>{achievement.icon}</span><div><h3 className="text-sm font-semibold text-slate-800 dark:text-white">{achievement.title}</h3><p className="mt-1 text-xs text-slate-500">{achievement.detail}</p></div></article>)}</div><Link to="/courses" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#16623f] hover:text-[#104d32]"><BookOpen className="h-4 w-4" /> Discover a new course</Link></section>
    </div>
  );
}
