import { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { coursesApi } from '../api/courses';
import { AuthContext } from '../context/AuthContext';

const pageNames = {
  '/admin/users': 'User management', '/admin/students': 'Student management', '/admin/instructors': 'Instructor management',
  '/admin/courses': 'Course management', '/admin/enrollments': 'Enrollment management', '/admin/statistics': 'Platform statistics', '/admin/settings': 'Platform settings',
  '/instructor/lessons': 'Lessons', '/instructor/assignments': 'Assignments', '/instructor/quizzes': 'Quizzes', '/instructor/students': 'Students', '/instructor/performance': 'Performance',
  '/my-courses': 'My courses', '/assignments': 'Assignments', '/quizzes': 'Quizzes', '/progress': 'Progress', '/notifications': 'Notifications', '/profile': 'Profile',
};

const courseDetails = {
  'soil-microbiology-health': {
    title: 'Soil Microbiology & Health',
    subtitle: 'Module 3: Discover how beneficial nematodes support organic pest management and healthy soil aeration.',
    progress: '75%',
    nextLesson: 'Continue with Module 4: Healthy Root Systems',
    accent: 'bg-emerald-600',
  },
};

export default function RoleFeaturePage() {
  const { pathname, search } = useLocation();
  const { user } = useContext(AuthContext);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const query = new URLSearchParams(search);
  const selectedCourse = courseDetails[query.get('course')];
  const title = pageNames[pathname] || 'Learning workspace';

  useEffect(() => {
    if (pathname !== '/my-courses' || !user?.id) return;

    let isMounted = true;
    const fetchMyCourses = async () => {
      setLoading(true);
      try {
        const response = await coursesApi.getmyCourses(user.id);
        if (isMounted) setMyCourses(response.data || []);
      } catch (error) {
        if (isMounted) setMyCourses([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMyCourses();
    return () => {
      isMounted = false;
    };
  }, [pathname, user?.id]);

  if (selectedCourse) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-700">My courses</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
          </div>
          <Link to="/dashboard" className="inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Go to dashboard</Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-emerald-100 bg-gradient-to-r from-[#123f30] via-[#1a5a41] to-[#2f7d59] p-6 text-white shadow-[0_18px_45px_-24px_rgba(17,74,54,0.8)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100">Active course</p>
          <h2 className="mt-3 text-3xl font-semibold">{selectedCourse.title}</h2>
          <p className="mt-3 max-w-2xl text-emerald-50/90">{selectedCourse.subtitle}</p>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm font-medium text-emerald-50/90">
              <span>Course progress</span>
              <span>{selectedCourse.progress}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-[75%] rounded-full bg-[#b8dc8d]" />
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm font-semibold text-emerald-50">{selectedCourse.nextLesson}</p>
          </div>
        </div>
      </section>
    );
  }

  if (pathname === '/my-courses') {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-700">My Courses</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
          </div>
          <Link to="/dashboard" className="inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Go to dashboard</Link>
        </div>

        <div className="mt-6">
          {loading ? (
            <p className="text-slate-600 dark:text-slate-300">Loading your courses...</p>
          ) : myCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300">
              You have not enrolled in any courses yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {myCourses.map((course) => (
                <div key={course.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">Enrolled course</p>
                  <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">{course.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{course.description}</p>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
                    <span className="text-sm text-slate-500 dark:text-slate-400">{course.teacher_name || 'Daltex instructor'}</span>
                    <Link to={`/my-courses/${course.id}`} className="inline-flex rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Open</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
      <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">This workspace is reserved for your role. Data and actions are authorized by the Django API before they are shown or saved.</p>
      <Link to="/dashboard" className="mt-6 inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Go to dashboard</Link>
    </section>
  );
}
