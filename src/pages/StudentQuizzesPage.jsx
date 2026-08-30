import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock3, HelpCircle, Trophy, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { coursesApi } from '../api/courses';
import { quizzesApi } from '../api/quizzes';
import { extractCoursesList } from '../utils/media';
import { formatDeadline, getQuizStatus } from '../utils/quizzes';
import { quizStorage } from '../utils/quizStorage';

const statusLabels = {
  available: { text: 'Available', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  in_progress: { text: 'In progress', className: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  completed: { text: 'Completed', className: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' },
  expired: { text: 'Expired', className: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
};

export default function StudentQuizzesPage() {
  const { user } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      setLoading(true);
      try {
        // 1. Fetch student's enrolled courses from your working backend endpoint
        const coursesRes = await coursesApi.getmyCourses(user.id);
        const courses = extractCoursesList(coursesRes?.data);
        
        let allEnrolledQuizzes = [];

        // 2. Loop through each enrolled course to fetch its quizzes using your backend route: /api/quizzes/courses/{id}/quizzes/
        for (const course of courses) {
          const courseId = course.id || course.course;
          const courseTitle = course.title || course.course_title || 'Course';

          try {
            const quizRes = await quizzesApi.getByCourse(courseId);
            const courseQuizzes = Array.isArray(quizRes?.data) ? quizRes.data : (quizRes?.data?.results || []);

            // Map backend attributes to frontend expectations
            const formattedQuizzes = courseQuizzes
              .filter((q) => q.is_published) // Only show published quizzes to students
              .map((q) => ({
                id: q.id,
                courseId: q.course,
                courseTitle: courseTitle,
                title: q.title,
                description: q.description,
                deadline: q.due_date,
                timeLimitMinutes: q.time_limit_minutes || 30, // fallback if null
                maxAttempts: q.max_attempts,
                totalPoints: q.total_points,
                published: q.is_published,
              }));

            allEnrolledQuizzes.push(...formattedQuizzes);
          } catch (err) {
            console.warn(`Could not fetch quizzes for course ${courseId}`, err);
          }
        }

        // 3. Enrich quizzes with student attempts stored locally or via API
        const enriched = allEnrolledQuizzes.map((quiz) => {
          const attempt = quizStorage.getAttempt(quiz.id, user.id);
          return {
            ...quiz,
            status: getQuizStatus(quiz, attempt),
            attempt,
          };
        });

        enriched.sort((a, b) => {
          const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          return dateA - dateB;
        });

        setQuizzes(enriched);
        setError(null);
      } catch (err) {
        setError(err.userMessage || 'Failed to load quizzes');
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <section className="rounded-[30px] bg-[#123f30] px-6 py-8 text-white shadow-[0_18px_45px_-24px_rgba(17,74,54,0.8)] sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#d9edc7]">Student area</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Quizzes</h1>
        <p className="mt-2 max-w-xl text-sm text-emerald-50/90">
          All quizzes from your enrolled courses. Complete them before the deadline.
        </p>
      </section>

      <section className="rounded-[28px] border border-[#dbe7dc] bg-white p-6 shadow-[0_10px_30px_rgba(27,67,50,0.05)] dark:border-slate-800 dark:bg-slate-900">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600 dark:border-slate-700 dark:border-t-emerald-400" />
          </div>
        ) : quizzes.length === 0 ? (
          <div className="rounded-[24px] border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <HelpCircle className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              No published quizzes available yet. Check back when your instructor publishes one.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => {
              const statusInfo = statusLabels[quiz.status] || statusLabels.available;
              const canTake = quiz.status === 'available' || quiz.status === 'in_progress';

              return (
                <article
                  key={quiz.id}
                  className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:border-emerald-200 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-emerald-800"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-emerald-700">
                        {quiz.courseTitle}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{quiz.title}</h3>
                      {quiz.description && (
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{quiz.description}</p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
                          <CalendarDays className="h-4 w-4 text-emerald-700" />
                          Due {formatDeadline(quiz.deadline)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
                          <Clock3 className="h-4 w-4 text-amber-600" />
                          {quiz.timeLimitMinutes} min
                        </span>
                        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${statusInfo.className}`}>
                          {statusInfo.text}
                        </span>
                      </div>

                      {quiz.status === 'completed' && quiz.attempt && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <Trophy className="h-4 w-4" />
                          Score: {quiz.attempt.score}% ({quiz.attempt.correctCount}/{quiz.attempt.totalQuestions} correct)
                        </div>
                      )}
                    </div>

                    <div className="flex items-center">
                      {canTake ? (
                        <Link
                          to={`/quizzes/${quiz.id}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#16623f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#104d32]"
                        >
                          {quiz.status === 'in_progress' ? 'Continue quiz' : 'Start quiz'}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      ) : quiz.status === 'completed' ? (
                        <Link
                          to={`/quizzes/${quiz.id}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200"
                        >
                          View results
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      ) : (
                        <span className="text-sm text-slate-500 dark:text-slate-400">Deadline passed</span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}