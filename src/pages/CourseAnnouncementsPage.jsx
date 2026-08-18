import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bell, Megaphone, Plus } from 'lucide-react';
import { coursesApi } from '../api/courses';
import { AuthContext } from '../context/AuthContext';
import {
  markAnnouncementsSeen,
  sortAnnouncementsByDate,
} from '../utils/announcementNotifications';
import { courseWorkspace } from '../utils/courseWorkspace';
import { formatDate } from '../utils/format';
import { extractCoursesList } from '../utils/media';
import { isInstructor } from '../utils/roles';

export default function CourseAnnouncementsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const instructorView = isInstructor(user?.role);

  const backTo = instructorView
    ? `/instructor/courses/${courseId}`
    : `/my-courses/${courseId}`;

  const [course, setCourse] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [announcementForm, setAnnouncementForm] = useState({ title: '', body: '' });
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);

  const sortedAnnouncements = useMemo(
    () => sortAnnouncementsByDate(announcements),
    [announcements],
  );

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await coursesApi.getById(courseId);
        if (!mounted) return;
        setCourse(response.data);

        try {
          const announcementsRes = await coursesApi.getCourseAnnouncements(courseId);
          const remote = extractCoursesList(announcementsRes.data);
          if (remote.length) {
            setAnnouncements(remote);
          } else {
            setAnnouncements(courseWorkspace.getAnnouncements(courseId));
          }
        } catch {
          setAnnouncements(courseWorkspace.getAnnouncements(courseId));
        }
      } catch (err) {
        if (!mounted) return;
        setError(err.userMessage || 'Course could not be loaded.');
        setCourse(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [courseId]);

  useEffect(() => {
    if (instructorView || !user?.id || !sortedAnnouncements.length) return;
    markAnnouncementsSeen(
      user.id,
      courseId,
      sortedAnnouncements.map((item) => item.id),
    );
  }, [instructorView, user?.id, courseId, sortedAnnouncements]);

  const handleAddAnnouncement = (event) => {
    event.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.body.trim()) return;
    setSavingAnnouncement(true);
    try {
      courseWorkspace.addAnnouncement(courseId, {
        title: announcementForm.title,
        body: announcementForm.body,
        authorName: user?.username || user?.email || 'Instructor',
      });
      setAnnouncementForm({ title: '', body: '' });
      setIsAnnouncementOpen(false);
      setAnnouncements(courseWorkspace.getAnnouncements(courseId));
    } finally {
      setSavingAnnouncement(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm text-slate-500">Loading announcements...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <button
          type="button"
          onClick={() => navigate(backTo)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#16623f]"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-10 text-rose-800">
          {error || 'Course not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <Link
        to={backTo}
        className="inline-flex items-center gap-2 rounded-full border border-[#dbe7dc] bg-white px-4 py-2 text-sm font-semibold text-[#16623f] transition hover:bg-[#edf5ef] dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to course
      </Link>

      <section className="rounded-[28px] border border-amber-200/80 bg-gradient-to-br from-[#fff8eb] to-white p-6 shadow-[0_10px_30px_rgba(27,67,50,0.05)] dark:border-amber-900/40 dark:from-amber-950/20 dark:to-slate-900">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-amber-100 p-3 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <Megaphone className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-700 dark:text-amber-300">
                {course.title}
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                All announcements
              </h1>
            </div>
          </div>
          {instructorView && (
            <button
              type="button"
              onClick={() => setIsAnnouncementOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#16623f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#104d32]"
            >
              <Plus className="h-4 w-4" />
              Add announcement
            </button>
          )}
        </div>

        {instructorView && isAnnouncementOpen && (
          <form
            onSubmit={handleAddAnnouncement}
            className="mb-5 space-y-3 rounded-2xl border border-amber-200 bg-white p-4 dark:border-amber-900/50 dark:bg-slate-950/40"
          >
            <input
              required
              value={announcementForm.title}
              onChange={(event) =>
                setAnnouncementForm((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="Announcement title"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-800"
            />
            <textarea
              required
              rows={4}
              value={announcementForm.body}
              onChange={(event) =>
                setAnnouncementForm((current) => ({ ...current, body: event.target.value }))
              }
              placeholder="What should learners know?"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-800"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAnnouncementOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingAnnouncement}
                className="rounded-xl bg-[#16623f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#104d32] disabled:opacity-70"
              >
                {savingAnnouncement ? 'Posting...' : 'Post announcement'}
              </button>
            </div>
          </form>
        )}

        {sortedAnnouncements.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-amber-300 bg-white/70 px-4 py-8 text-center text-sm text-slate-500 dark:border-amber-900/40 dark:bg-slate-950/20 dark:text-slate-400">
            No announcements yet.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAnnouncements.map((item, index) => (
              <article
                key={item.id}
                className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm dark:border-amber-900/30 dark:bg-slate-950/40"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 rounded-xl bg-amber-50 p-2 text-amber-700 dark:bg-amber-950 dark:text-amber-200">
                    <Bell className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {item.title}
                        </h3>
                        {index === 0 && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                            Latest
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">{formatDate(item.created_at)}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {item.body || item.content || item.message}
                    </p>
                    <p className="mt-3 text-xs font-medium text-slate-500">
                      Posted by {item.authorName || item.author || 'Instructor'}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
