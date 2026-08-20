import { BarChart3, BookOpen, ClipboardCheck, GraduationCap, CheckCircle2, ArrowRight, CalendarDays, Clock3 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { todosApi } from '../api/todos';
import {
  extractTodosList,
  formatDeadline,
  formatDurationHours,
  normalizeTodo,
} from '../utils/todos';

const actions = [
  { to: '/instructor/courses', label: 'Manage courses', detail: 'Create and update your courses', icon: BookOpen },
  { to: '/instructor/assignments', label: 'Review submissions', detail: 'Grade work and share feedback', icon: ClipboardCheck },
];

export default function InstructorDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [loadingTodos, setLoadingTodos] = useState(true);
  const [errorTodos, setErrorTodos] = useState(null);

  // Fetch todos from backend
  useEffect(() => {
    if (!user) return;

    const fetchTodos = async () => {
      try {
        setLoadingTodos(true);
        const response = await todosApi.getAllTodos();
        const normalizedTodos = extractTodosList(response.data).map(normalizeTodo).slice(0, 3);
        setTodos(normalizedTodos);
        setErrorTodos(null);
      } catch (err) {
        console.error('Failed to fetch todos:', err);
        setErrorTodos(null); // Don't show error, just silently fail
        setTodos([]);
      } finally {
        setLoadingTodos(false);
      }
    };

    fetchTodos();
  }, [user]);

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

      {/* Moved To-Do List up to the top for maximum visibility */}
      <section className="rounded-[28px] border border-[#dbe7dc] bg-white p-6 shadow-[0_10px_30px_rgba(27,67,50,0.05)] dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-2xl bg-[#e6f2e8] p-3 text-[#16623f] dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">My To-Do List</h2>
            <p className="mt-1 text-sm text-slate-500">Keep track of your upcoming tasks and deadlines</p>
          </div>
        </div>

        {loadingTodos ? (
          <div className="flex justify-center py-8">
            <div className="text-center">
              <div className="h-6 w-6 animate-spin rounded-full border-3 border-slate-200 border-t-emerald-600 dark:border-slate-700 dark:border-t-emerald-400"></div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Loading tasks...</p>
            </div>
          </div>
        ) : todos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <p className="text-sm text-slate-500 dark:text-slate-400">No tasks yet. Start by creating your first to-do!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todos.map((task) => (
              <div
                key={task.id}
                className={`rounded-[18px] border p-4 transition ${
                  task.completed
                    ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/20'
                    : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 h-5 w-5 rounded border-2 flex-shrink-0 ${
                        task.completed
                          ? 'border-emerald-600 bg-emerald-600'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    />
                    <div>
                      <h3
                        className={`font-medium ${
                          task.completed
                            ? 'line-through text-slate-500 dark:text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {task.title}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                          <CalendarDays className="h-3 w-3 text-emerald-700 dark:text-emerald-400" />
                          {formatDeadline(task.deadline_date)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                          <Clock3 className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                          {formatDurationHours(task.expected_duration_hours)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link
          to="/instructor/todos"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#16623f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#104d32]"
        >
          Manage All Tasks
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Action cards (without the student view card) */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {actions.map(({ to, label, detail, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-[25px] border border-[#dbe7dc] bg-white p-5 shadow-[0_10px_30px_rgba(27,67,50,0.05)] transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <span className="inline-flex rounded-2xl bg-[#e6f2e8] p-3 text-[#16623f] dark:bg-emerald-950 dark:text-emerald-300">
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="mt-5 font-semibold text-slate-900 dark:text-white">{label}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">{detail}</p>
          </Link>
        ))}
      </section>

      <section className="rounded-[28px] border border-[#dbe7dc] bg-white p-6 shadow-[0_10px_30px_rgba(27,67,50,0.05)] dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-[#e6f2e8] p-3 text-[#16623f] dark:bg-emerald-950 dark:text-emerald-300">
            <BarChart3 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Course performance</h2>
            <p className="mt-1 text-sm text-slate-500">Use your performance workspace to review progress for students enrolled in your courses.</p>
          </div>
        </div>
        <Link to="/instructor/performance" className="mt-5 inline-flex rounded-xl bg-[#16623f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#104d32]">Open performance</Link>
      </section>
    </div>
  );
}