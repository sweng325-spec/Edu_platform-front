import { BarChart3, BookOpen, ClipboardCheck, GraduationCap, Plus, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';

const actions = [
  { to: '/instructor/courses', label: 'Manage courses', detail: 'Create and update your courses', icon: BookOpen },
  { to: '/instructor/assignments', label: 'Review submissions', detail: 'Grade work and share feedback', icon: ClipboardCheck },
  { to: '/instructor/students', label: 'View your students', detail: 'Monitor learners in your courses', icon: UsersRound },
];

export default function InstructorDashboard() {
  return (
    <div className="mx-auto max-w-[1100px] space-y-7 pb-10">
      <section className="relative overflow-hidden rounded-[30px] bg-[#123f30] px-6 py-9 text-white shadow-[0_18px_45px_-24px_rgba(17,74,54,0.8)] sm:px-10"><div className="absolute -right-12 -top-16 h-64 w-64 rounded-full border-[30px] border-[#b8dc8d]/20" /><div className="relative"><span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#d9edc7]"><GraduationCap className="h-3.5 w-3.5" /> Instructor workspace</span><h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Lead learning with confidence.</h1><p className="mt-3 max-w-xl leading-7 text-white/75">Manage the courses you own, support your students, and keep your teaching momentum strong.</p><Link to="/instructor/courses" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#b8dc8d] px-5 py-3 text-sm font-semibold text-[#123f30] transition hover:bg-[#d9edc7]"><Plus className="h-4 w-4" /> Manage my courses</Link></div></section>
      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">{actions.map(({ to, label, detail, icon: Icon }) => <Link key={to} to={to} className="group rounded-[25px] border border-[#dbe7dc] bg-white p-5 shadow-[0_10px_30px_rgba(27,67,50,0.05)] transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"><span className="inline-flex rounded-2xl bg-[#e6f2e8] p-3 text-[#16623f] dark:bg-emerald-950 dark:text-emerald-300"><Icon className="h-5 w-5" /></span><h2 className="mt-5 font-semibold text-slate-900 dark:text-white">{label}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{detail}</p></Link>)}</section>
      <section className="rounded-[28px] border border-[#dbe7dc] bg-white p-6 shadow-[0_10px_30px_rgba(27,67,50,0.05)] dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-3"><span className="rounded-2xl bg-[#e6f2e8] p-3 text-[#16623f] dark:bg-emerald-950 dark:text-emerald-300"><BarChart3 className="h-5 w-5" /></span><div><h2 className="text-xl font-semibold text-slate-900 dark:text-white">Course performance</h2><p className="mt-1 text-sm text-slate-500">Use your performance workspace to review progress for students enrolled in your courses.</p></div></div><Link to="/instructor/performance" className="mt-5 inline-flex rounded-xl bg-[#16623f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#104d32]">Open performance</Link></section>
    </div>
  );
}
