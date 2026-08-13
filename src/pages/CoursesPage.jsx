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
  const [price, setPrice] = useState('');
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
      await coursesApi.create({ title, description, price });
      setTitle('');
      setDescription('');
      setPrice('');
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
      <section className="relative overflow-hidden rounded-[28px] bg-[#123f30] px-6 py-9 text-white shadow-[0_18px_45px_-24px_rgba(17,74,54,0.8)] sm:px-10">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#9acb75]/20 blur-2xl" />
        <div className="absolute bottom-0 right-12 h-32 w-32 rounded-t-full border-x border-t border-white/10" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#d9edc7]"><Leaf className="h-3.5 w-3.5" /> Learning library</span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Cultivate skills that make an impact.</h1>
          <p className="mt-3 text-base leading-7 text-white/75">Explore practical courses designed to help Daltex learners grow with confidence.</p>
        </div>
      </section>

      {feedback.text && <div className={`rounded-2xl border px-4 py-3 text-sm ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200' : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200'}`}>{feedback.text}</div>}

      {isInstructor(user?.role) && (
        <section className="rounded-[28px] border border-[#dbe7dc] bg-white p-6 shadow-[0_10px_30px_rgba(27,67,50,0.05)] dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="mb-6 flex items-start gap-3"><span className="rounded-2xl bg-[#e6f2e8] p-3 text-[#16623f] dark:bg-emerald-950 dark:text-emerald-300"><Plus className="h-5 w-5" /></span><div><h2 className="text-xl font-semibold text-slate-900 dark:text-white">Create a new course</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Share a new learning path with your students.</p></div></div>
          <form onSubmit={handleCreateCourse} className="grid grid-cols-1 gap-4 md:grid-cols-6">
            <input aria-label="Course title" placeholder="Course title" required value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 md:col-span-3" />
            <input aria-label="Course price" type="number" step="0.01" placeholder="Price ($)" required value={price} onChange={(event) => setPrice(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 md:col-span-3" />
            <input aria-label="Course description" placeholder="What will students learn?" required value={description} onChange={(event) => setDescription(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 md:col-span-4" />
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16623f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#104d32] md:col-span-2"><Sparkles className="h-4 w-4" /> Publish course</button>
          </form>
        </section>
      )}

      <section>
        <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-700">Explore</p><h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Available courses</h2></div><span className="hidden items-center gap-2 text-sm text-slate-500 sm:inline-flex"><BookOpen className="h-4 w-4" /> {courses.length} learning paths</span></div>
        {courses.length === 0 ? <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900"><BookOpen className="mx-auto h-8 w-8 text-emerald-700" /><p className="mt-3 font-semibold text-slate-900 dark:text-white">No courses available yet</p><p className="mt-1 text-sm text-slate-500">New learning paths will appear here.</p></div> : <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{courses.map((course, index) => <article key={course.id} className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(27,67,50,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(27,67,50,0.14)] dark:border-slate-800 dark:bg-slate-900"><div className={`relative h-32 overflow-hidden bg-gradient-to-br ${courseThemes[index % courseThemes.length]} p-5`}><span className="absolute -bottom-10 -right-5 h-28 w-28 rounded-full border-[18px] border-white/15" /><span className="relative inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">Daltex Academy</span><BookOpen className="absolute bottom-4 right-5 h-8 w-8 text-white/80" /></div><div className="flex min-h-[236px] flex-col p-5"><div><h3 className="text-lg font-semibold leading-6 text-slate-900 dark:text-white">{course.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{course.description}</p></div><div className="mt-auto pt-5"><p className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400"><UserRound className="h-3.5 w-3.5 text-emerald-700" /> {course.teacher_name || 'Daltex instructor'}</p><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800"><span className="text-lg font-semibold text-[#123f30] dark:text-emerald-300">${course.price}</span>{user?.role === 'STUDENT' && <button onClick={() => handleEnroll(course.id)} className="inline-flex items-center gap-1 rounded-xl bg-[#16623f] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#104d32]">Enroll <ArrowRight className="h-4 w-4" /></button>}</div></div></div></article>)}</div>}
      </section>
    </div>
  );
}
