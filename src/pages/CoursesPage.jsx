import { useContext, useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Leaf, Plus, Sparkles, UserRound } from 'lucide-react';
import { coursesApi } from '../api/courses';
import { AuthContext } from '../context/AuthContext';
import { isInstructor } from '../utils/roles';

const courseThemes = [
  'from-[#174f3b] via-[#286b4d] to-[#99be70]',
  'from-[#75542f] via-[#a47a42] to-[#d8b56f]',
  'from-[#24556a] via-[#3b7e87] to-[#a8ce9c]',
];

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const { user } = useContext(AuthContext);

  const fetchCourses = async () => {
    try {
      const res = await coursesApi.list();
      setCourses(res.data);
    } catch (error) {
      setFeedback({ type: 'error', text: error.userMessage || 'Courses could not be loaded.' });
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (event) => {
    event.preventDefault();
    setFeedback({ type: '', text: '' });
    try {
      await coursesApi.create({ title, description });
      setTitle('');
      setDescription('');
      setIsAddModalOpen(false);
      setFeedback({ type: 'success', text: 'Your course has been published.' });
      fetchCourses();
    } catch (error) {
      setFeedback({ type: 'error', text: error.userMessage || 'Failed to create course.' });
    }
  };

  const handleEnroll = async (courseId) => {
    setFeedback({ type: '', text: '' });
    try {
      const res = await coursesApi.enroll(courseId);
      setFeedback({ type: 'success', text: res.data.message || 'You are enrolled in this course.' });
    } catch (error) {
      setFeedback({ type: 'error', text: error.userMessage || 'Enrollment failed.' });
    }
  };

  return (
    <div className="mx-auto max-w-[1100px] space-y-8 pb-10">
      <section className="relative overflow-hidden px-6 py-9 text-[#123f30] sm:px-10">
        <div className="mx-auto max-w-[1200px]">
          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#123f30]/15 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#123f30]"><Leaf className="h-3.5 w-3.5" /> Daltex learning hub</span>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#123f30] sm:text-4xl">Cultivate skills that make an impact.</h1>
              <p className="mt-3 max-w-xl text-base leading-7 text-[#123f30]/80">Explore practical courses designed to help Daltex learners grow with confidence.</p>
            </div>
          </div>
        </div>
      </section>

      {feedback.text && <div className={`rounded-2xl border px-4 py-3 text-sm ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200' : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200'}`}>{feedback.text}</div>}

      {isInstructor(user?.role) && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#16623f] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#104d32]"
          >
            <Plus className="h-4 w-4" /> Add a course
          </button>
        </div>
      )}

      {isInstructor(user?.role) && isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border border-[#dbe7dc] bg-white p-6 shadow-[0_20px_50px_rgba(17,74,54,0.18)] dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-700">New course</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">Create a course</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-full border border-slate-200 px-2.5 py-1.5 text-sm text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Course title</label>
                <input aria-label="Course title" placeholder="Course title" required value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Description</label>
                <textarea aria-label="Course description" placeholder="What will students learn?" required value={description} onChange={(event) => setDescription(event.target.value)} rows="5" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16623f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#104d32]"><Sparkles className="h-4 w-4" /> Publish course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section>
        <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-700">Explore</p><h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Available courses</h2></div><span className="hidden items-center gap-2 text-sm text-slate-500 sm:inline-flex"><BookOpen className="h-4 w-4" /> {courses.length} learning paths</span></div>
        {courses.length === 0 ? <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900"><BookOpen className="mx-auto h-8 w-8 text-emerald-700" /><p className="mt-3 font-semibold text-slate-900 dark:text-white">No courses available yet</p><p className="mt-1 text-sm text-slate-500">New learning paths will appear here.</p></div> : <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{courses.map((course, index) => <article key={course.id} className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(27,67,50,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(27,67,50,0.14)] dark:border-slate-800 dark:bg-slate-900"><div className={`relative h-32 overflow-hidden bg-gradient-to-br ${courseThemes[index % courseThemes.length]} p-5`}><span className="absolute -bottom-10 -right-5 h-28 w-28 rounded-full border-[18px] border-white/15" /><span className="relative inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">Daltex Academy</span><BookOpen className="absolute bottom-4 right-5 h-8 w-8 text-white/80" /></div><div className="flex min-h-[236px] flex-col p-5"><div><h3 className="text-lg font-semibold leading-6 text-slate-900 dark:text-white">{course.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{course.description}</p></div><div className="mt-auto pt-5"><p className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400"><UserRound className="h-3.5 w-3.5 text-emerald-700" /> {course.teacher_name || 'Daltex instructor'}</p><div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">{user?.role === 'STUDENT' && <button onClick={() => handleEnroll(course.id)} className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-[#16623f] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#104d32]">Enroll <ArrowRight className="h-4 w-4" /></button>}</div></div></div></article>)}</div>}
      </section>
    </div>
  );
}
