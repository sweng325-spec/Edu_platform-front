import { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { coursesApi } from '../api/courses';
import { AuthContext } from '../context/AuthContext';

export default function MyCoursesPage() {
  const { user } = useContext(AuthContext);
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const selectedCourseKey = query.get('course');

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    let mounted = true;

    const fetchMyCourses = async () => {
      setLoading(true);
      try {
        const response = await coursesApi.getmyCourses(user.id);
        const payload = response?.data;
        const nextCourses = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.results)
            ? payload.results
            : Array.isArray(payload?.courses)
              ? payload.courses
              : [];

        if (mounted) {
          setCourses(nextCourses);
        }
      } catch (error) {
        if (mounted) {
          setCourses([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchMyCourses();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const selectedCourse = Array.isArray(courses)
    ? courses.find((course) => String(course.slug || course.id) === String(selectedCourseKey))
    : undefined;

  if (selectedCourse) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-700">My courses</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{selectedCourse.title}</h1>
          </div>
          <Link to="/my-courses" className="inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
            Back to my courses
          </Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-emerald-100 bg-gradient-to-r from-[#123f30] via-[#1a5a41] to-[#2f7d59] p-6 text-white shadow-[0_18px_45px_-24px_rgba(17,74,54,0.8)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100">Active course</p>
          <h2 className="mt-3 text-3xl font-semibold">{selectedCourse.title}</h2>
          <p className="mt-3 max-w-2xl text-emerald-50/90">{selectedCourse.description}</p>

          <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm font-semibold text-emerald-50">Instructor: {selectedCourse.teacher_name || 'Daltex instructor'}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-700">Student area</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">My courses</h1>
        </div>
        <Link to="/dashboard" className="inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
          Go to dashboard
        </Link>
      </div>

      <div className="mt-6">
        {loading ? (
          <p className="text-slate-600 dark:text-slate-300">Loading your courses...</p>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300">
            You have not enrolled in any courses yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <div key={course.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">Enrolled course</p>
                <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">{course.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{course.description}</p>

                <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{course.teacher_name || 'Daltex instructor'}</span>
                  <Link
                    to={`/my-courses?course=${course.slug || course.id}`}
                    className="inline-flex rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
