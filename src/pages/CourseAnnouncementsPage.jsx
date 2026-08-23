import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bell, Check, CheckCheck } from 'lucide-react';
import { coursesApi } from '../api/courses';
import { AuthContext } from '../context/AuthContext';
import { formatDate } from '../utils/format';
import { extractCoursesList } from '../utils/media';
import { isInstructor } from '../utils/roles';

export default function CourseAnnouncementsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const instructorView = isInstructor(user?.role);

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch full list of announcements from server
  const fetchAnnouncements = async () => {
    try {
      const res = await coursesApi.getCourseAnnouncements(courseId);
      const list = extractCoursesList(res.data);
      setAnnouncements(list);
    } catch (err) {
      console.error('Failed to load announcements', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [courseId]);

  // 1. Mark ALL announcements as read (Students only)
  const handleMarkAllAsRead = async () => {
    if (instructorView) return;
    try {
      await coursesApi.updateCourseNotifications(courseId);
      // Force is_read to true so the white background and checkmarks apply instantly
      setAnnouncements((prev) =>
        prev.map((item) => ({
          ...item,
          is_read: true,
        }))
      );
    } catch (err) {
      console.error('Failed to mark all announcements as read', err);
    }
  };

  // 2. Mark a SPECIFIC announcement as read when clicking the check icon (Students only)
  const handleAnnouncementClick = async (e, announcementId, currentReadStatus) => {
    e.stopPropagation();
    if (instructorView || currentReadStatus) return;
    
    try {
      await coursesApi.updateOneCourseNotifcation(announcementId);

      // Update local state for that single item
      setAnnouncements((prev) =>
        prev.map((item) =>
          item.id === announcementId
            ? { ...item, is_read: true }
            : item
        )
      );
    } catch (err) {
      console.error('Failed to mark announcement as read', err);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-sm text-slate-500">Loading announcements...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#16623f] dark:text-emerald-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back to course details
      </button>

      {/* Header and Student-only "Mark All as Read" button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">All Course Announcements</h1>
          <p className="text-sm text-slate-500">Stay up to date with updates from your instructor.</p>
        </div>

        {!instructorView && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <CheckCheck className="h-4 w-4 text-emerald-600" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
            No announcements found.
          </div>
        ) : (
          announcements.map((item) => {
            // Explicitly evaluate using item.is_read from the backend database response
            const isRead = Boolean(item.is_read);
            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-5 transition shadow-sm ${
                  isRead
                    ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60'
                    : 'border-amber-300 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/10'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className={`mt-1 rounded-xl p-2 ${isRead ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200'}`}>
                      <Bell className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                        {!isRead && !instructorView && (
                          <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                            New
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {item.body || item.content || item.message}
                      </p>
                      <p className="mt-3 text-xs text-slate-400">
                        Posted on {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Individual Read Action Button / Checkmark (Students only) */}
                  {!instructorView && (
                    <button
                      type="button"
                      onClick={(e) => handleAnnouncementClick(e, item.id, isRead)}
                      className="group/btn p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title={isRead ? "Read" : "Click to mark as read"}
                    >
                      {isRead ? (
                        <CheckCheck className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Check className="h-5 w-5 text-slate-300 group-hover/btn:text-emerald-600" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}