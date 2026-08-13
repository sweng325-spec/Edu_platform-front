import { BarChart3, BookOpen, ClipboardCheck, GraduationCap, Plus, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';

const actions = [
  { to: '/instructor/courses', label: 'Manage courses', detail: 'Create and update your courses', icon: BookOpen },
  { to: '/instructor/assignments', label: 'Review submissions', detail: 'Grade work and share feedback', icon: ClipboardCheck },
  { to: '/instructor/students', label: 'View your students', detail: 'Monitor learners in your courses', icon: UsersRound },
];

export default function InstructorDashboard() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-7 pb-10">
      <section className="relative overflow-hidden px-6 py-9 text-[#123f30] sm:px-10">
        <div className="mx-auto max-w-[1200px]">
          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#123f30]/15 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#123f30]"><GraduationCap className="h-3.5 w-3.5" /> Instructor workspace</span>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#123f30] sm:text-4xl">Lead learning with confidence.</h1>
              <p className="mt-3 max-w-xl text-base leading-7 text-[#123f30]/80">Manage the courses you own, support your students, and keep your teaching momentum strong.</p>
            </div>

            <div className="mt-[-6px] flex items-center gap-3 rounded-[22px] border border-[#123f30]/10 bg-[#edf5ef]/90 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-[#dfeee3]/10 dark:bg-[#dfeee3]/10">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#dfeee3] text-[#123f30] dark:bg-[#123f30] dark:text-[#dfeee3]"><BarChart3 className="h-5 w-5" /></span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#123f30]/75 dark:text-[#e8f7ef]">Performance</p>
                <p className="mt-1 text-2xl font-semibold text-[#123f30] dark:text-[#e8f7ef]">92%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">{actions.map(({ to, label, detail, icon: Icon }) => <Link key={to} to={to} className="group rounded-[25px] border border-[#dbe7dc] bg-white p-5 shadow-[0_10px_30px_rgba(27,67,50,0.05)] transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"><span className="inline-flex rounded-2xl bg-[#e6f2e8] p-3 text-[#16623f] dark:bg-emerald-950 dark:text-emerald-300"><Icon className="h-5 w-5" /></span><h2 className="mt-5 font-semibold text-slate-900 dark:text-white">{label}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{detail}</p></Link>)}</section>
      <section className="rounded-[28px] border border-[#dbe7dc] bg-white p-6 shadow-[0_10px_30px_rgba(27,67,50,0.05)] dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-3"><span className="rounded-2xl bg-[#e6f2e8] p-3 text-[#16623f] dark:bg-emerald-950 dark:text-emerald-300"><BarChart3 className="h-5 w-5" /></span><div><h2 className="text-xl font-semibold text-slate-900 dark:text-white">Course performance</h2><p className="mt-1 text-sm text-slate-500">Use your performance workspace to review progress for students enrolled in your courses.</p></div></div><Link to="/instructor/performance" className="mt-5 inline-flex rounded-xl bg-[#16623f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#104d32]">Open performance</Link></section>
    </div>
  );
}
