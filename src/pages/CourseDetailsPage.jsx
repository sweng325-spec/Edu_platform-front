import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  ChevronRight,
  Folder,
  Megaphone,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { coursesApi } from '../api/courses';
import { AuthContext } from '../context/AuthContext';
import {
  markAnnouncementsSeen,
  sortAnnouncementsByDate,
} from '../utils/announcementNotifications';
import { courseWorkspace } from '../utils/courseWorkspace';
import { formatDate } from '../utils/format';
import { extractCoursesList, getCourseImageUrl } from '../utils/media';
import { isInstructor, ROLES } from '../utils/roles';

export default function CourseDetailsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const instructorView = isInstructor(user?.role);
  const isAdmin = user?.role === ROLES.ADMIN;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [folders, setFolders] = useState([]);
  const [students, setStudents] = useState([]);

  // Course management (edit/delete) state
  const isOwner = Boolean(user?.id) && String(course?.teacher) === String(user.id);
  const canEditCourse = isOwner;
  const canDeleteCourse = isOwner || isAdmin;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState('');
  const [savingCourse, setSavingCourse] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState(false);
  const [courseFeedback, setCourseFeedback] = useState({ type: '', text: '' });

  // Announcement Form State
  const [announcementForm, setAnnouncementForm] = useState({ title: '', body: '' });
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);

  // Folder Form State
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [folderFormTitle, setFolderFormTitle] = useState('');
  const [savingFolder, setSavingFolder] = useState(false);

  const backTo = instructorView ? '/instructor/courses' : '/my-courses';
  const materialsBase = instructorView
    ? `/instructor/courses/${courseId}/materials`
    : `/my-courses/${courseId}/materials`;
  const announcementsPath = instructorView
    ? `/instructor/courses/${courseId}/announcements`
    : `/my-courses/${courseId}/announcements`;

  const sortedAnnouncements = useMemo(
    () => sortAnnouncementsByDate(announcements),
    [announcements],
  );
  const latestAnnouncement = sortedAnnouncements[0] || null;

  const loadWorkspace = () => {
    setAnnouncements(courseWorkspace.getAnnouncements(courseId));
    setMaterials(courseWorkspace.getMaterials(courseId));
    setFolders(courseWorkspace.getFolders(courseId));
    setStudents(courseWorkspace.getStudents(courseId));
  };

  const fetchAnnouncements = async () => {
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
  };

  const fetchMaterials = async () => {
    try {
      const materialsRes = await coursesApi.getCourseMaterials(courseId);
      const remote = extractCoursesList(materialsRes.data);
      setMaterials(remote.length ? remote : courseWorkspace.getMaterials(courseId));
    } catch {
      setMaterials(courseWorkspace.getMaterials(courseId));
    }

    // Fetch Folders from API Endpoint
    try {
      const foldersRes = await coursesApi.getFolders(courseId);
      const remoteFolders = extractCoursesList(foldersRes.data);
      if (remoteFolders.length) {
        setFolders(remoteFolders);
      } else {
        setFolders(courseWorkspace.getFolders(courseId));
      }
    } catch (err) {
      console.error('Failed to fetch folders from backend, loading workspace fallback:', err);
      setFolders(courseWorkspace.getFolders(courseId));
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await coursesApi.getById(courseId);
        if (!mounted) return;
        setCourse(response.data);

        await fetchAnnouncements();
        await fetchMaterials();

        try {
          const studentsRes = await coursesApi.getCourseStudents(courseId);
          const remote = extractCoursesList(studentsRes.data);
          if (remote.length) {
            setStudents(remote);
          } else {
            setStudents(courseWorkspace.getStudents(courseId));
          }
        } catch {
          setStudents(courseWorkspace.getStudents(courseId));
        }
      } catch (err) {
        if (!mounted) return;
        setError(err.userMessage || 'Course details could not be loaded.');
        setCourse(null);
        loadWorkspace();
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
    if (instructorView || !user?.id || !latestAnnouncement?.id) return;
    markAnnouncementsSeen(user.id, courseId, [latestAnnouncement.id]);
  }, [instructorView, user?.id, courseId, latestAnnouncement?.id]);

  const imageUrl = useMemo(() => getCourseImageUrl(course), [course]);

  // OPTIMIZED ANNOUNCEMENT HANDLER
  const handleAddAnnouncement = async (event) => {
    event.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.body.trim()) return;
    setSavingAnnouncement(true);

    const newAnnouncementData = {
      id: Date.now().toString(),
      title: announcementForm.title,
      body: announcementForm.body,
      content: announcementForm.body,
      created_at: new Date().toISOString(),
      authorName: user?.username || user?.email || 'Instructor',
    };

    try {
      await coursesApi.postCourseAnnouncements(courseId, {
        title: announcementForm.title,
        content: announcementForm.body,
        body: announcementForm.body,
      });
    } catch (err) {
      console.error('Backend post failed, syncing to local workspace fallback', err);
    } finally {
      courseWorkspace.addAnnouncement(courseId, newAnnouncementData);
      setAnnouncements((prev) => [newAnnouncementData, ...prev]);
      setAnnouncementForm({ title: '', body: '' });
      setIsAnnouncementOpen(false);
      setSavingAnnouncement(false);
      fetchAnnouncements();
    }
  };

  // API DRIVEN FOLDER CREATION
  const handleAddFolder = async (event) => {
    event.preventDefault();
    const trimmedTitle = folderFormTitle.trim();
    if (!trimmedTitle) return;

    setSavingFolder(true);

    const fallbackFolder = {
      id: Date.now().toString(),
      title: trimmedTitle,
      name: trimmedTitle,
    };

    try {
      const res = await coursesApi.createFolder(courseId, {
        name: trimmedTitle,
        title: trimmedTitle,
      });

      const createdFolder = {
        id: res?.data?.id || fallbackFolder.id,
        title: res?.data?.name || res?.data?.title || fallbackFolder.title,
        name: res?.data?.name || res?.data?.title || fallbackFolder.name,
        ...res?.data,
      };

      courseWorkspace.addFolder(courseId, createdFolder);
      setFolders((prev) => [...prev, createdFolder]);
    } catch (err) {
      console.error('Failed to create folder via API, creating local fallback:', err);
      courseWorkspace.addFolder(courseId, fallbackFolder);
      setFolders(courseWorkspace.getFolders(courseId));
    } finally {
      setFolderFormTitle('');
      setIsFolderOpen(false);
      setSavingFolder(false);
      fetchMaterials(); // Re-sync folders list after post
    }
  };

  const openEditModal = () => {
    setEditTitle(course?.title || '');
    setEditDescription(course?.description || '');
    setEditImage(null);
    setEditImagePreview('');
    setCourseFeedback({ type: '', text: '' });
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    if (editImagePreview) {
      URL.revokeObjectURL(editImagePreview);
    }
    setEditImage(null);
    setEditImagePreview('');
  };

  const handleEditImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (editImagePreview) {
      URL.revokeObjectURL(editImagePreview);
    }
    setEditImage(file);
    setEditImagePreview(file ? URL.createObjectURL(file) : '');
  };

  const handleUpdateCourse = async (event) => {
    event.preventDefault();
    setSavingCourse(true);
    setCourseFeedback({ type: '', text: '' });

    try {
      const res = await coursesApi.update(courseId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        image: editImage,
      });
      setCourse((current) => ({ ...current, ...res.data }));
      closeEditModal();
      setCourseFeedback({ type: 'success', text: 'Course updated successfully.' });
    } catch (err) {
      setCourseFeedback({ type: 'error', text: err.userMessage || 'Failed to update course.' });
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm('Delete this course? This action cannot be undone.')) return;
    setDeletingCourse(true);
    setCourseFeedback({ type: '', text: '' });

    try {
      await coursesApi.delete(courseId);
      navigate(backTo, { replace: true });
    } catch (err) {
      setCourseFeedback({ type: 'error', text: err.userMessage || 'Failed to delete course.' });
      setDeletingCourse(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm text-slate-500">Loading course details...</p>
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
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-10 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
          {error || 'Course not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      {/* NAVIGATION BACK */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 rounded-full border border-[#dbe7dc] bg-white px-4 py-2 text-sm font-semibold text-[#16623f] transition hover:bg-[#edf5ef] dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-300"
        >
          <ArrowLeft className="h-4 w-4" />
          {instructorView ? 'Back to my courses' : 'Back to my courses'}
        </Link>

        {(canEditCourse || canDeleteCourse) && (
          <div className="flex items-center gap-2">
            {canEditCourse && (
              <button
                type="button"
                onClick={openEditModal}
                className="inline-flex items-center gap-2 rounded-xl border border-[#dbe7dc] bg-white px-4 py-2 text-sm font-semibold text-[#16623f] transition hover:bg-[#edf5ef] dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-300"
              >
                <Pencil className="h-4 w-4" /> Edit course
              </button>
            )}
            {canDeleteCourse && (
              <button
                type="button"
                onClick={handleDeleteCourse}
                disabled={deletingCourse}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-rose-900 dark:bg-slate-900 dark:text-rose-300"
              >
                <Trash2 className="h-4 w-4" /> {deletingCourse ? 'Deleting...' : 'Delete course'}
              </button>
            )}
          </div>
        )}
      </div>

      {courseFeedback.text && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            courseFeedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
              : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
          }`}
        >
          {courseFeedback.text}
        </div>
      )}

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border border-[#dbe7dc] bg-white p-6 shadow-[0_20px_50px_rgba(17,74,54,0.18)] dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-700">Edit course</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">Update course details</h2>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-full border border-slate-200 px-2.5 py-1.5 text-sm text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCourse} className="space-y-4" encType="multipart/form-data">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Course title</label>
                <input
                  aria-label="Course title"
                  placeholder="Course title"
                  required
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Description</label>
                <textarea
                  aria-label="Course description"
                  placeholder="What will students learn?"
                  required
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  rows="5"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Course image (optional)</label>
                <input
                  aria-label="Course image"
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-emerald-800 dark:border-slate-700 dark:bg-slate-800"
                />
                {(editImagePreview || imageUrl) && (
                  <img
                    src={editImagePreview || imageUrl}
                    alt="Course preview"
                    className="mt-3 h-36 w-full rounded-2xl object-cover"
                  />
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCourse}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16623f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#104d32] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Sparkles className="h-4 w-4" /> {savingCourse ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER HERO BANNER */}
      <section className="overflow-hidden rounded-[30px] border border-[#dbe7dc] bg-white shadow-[0_18px_45px_-28px_rgba(17,74,54,0.55)] dark:border-slate-800 dark:bg-slate-900">
        <div className="relative h-48 bg-gradient-to-br from-[#174f3b] via-[#286b4d] to-[#99be70] sm:h-56">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={course.title}
              className="absolute inset-0 h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d2b20]/85 via-[#0d2b20]/35 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#d9edc7]">Course details</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{course.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/85 sm:text-base">{course.description}</p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm backdrop-blur-sm">
              <UserRound className="h-4 w-4" />
              {course.teacher_name || 'Daltex instructor'}
            </p>
          </div>
        </div>
      </section>

      {/* ANNOUNCEMENTS SECTION */}
      <section className="rounded-[28px] border border-amber-200/80 bg-gradient-to-br from-[#fff8eb] to-white p-6 shadow-[0_10px_30px_rgba(27,67,50,0.05)] dark:border-amber-900/40 dark:from-amber-950/20 dark:to-slate-900">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-amber-100 p-3 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <Megaphone className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-700 dark:text-amber-300">
                Announcements
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Course updates</h2>
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
          <form onSubmit={handleAddAnnouncement} className="mb-5 space-y-3 rounded-2xl border border-amber-200 bg-white p-4 dark:border-amber-900/50 dark:bg-slate-950/40">
            <input
              required
              value={announcementForm.title}
              onChange={(event) => setAnnouncementForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Announcement title"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-800"
            />
            <textarea
              required
              rows={4}
              value={announcementForm.body}
              onChange={(event) => setAnnouncementForm((current) => ({ ...current, body: event.target.value }))}
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

        {!latestAnnouncement ? (
          <div className="rounded-2xl border border-dashed border-amber-300 bg-white/70 px-4 py-8 text-center text-sm text-slate-500 dark:border-amber-900/40 dark:bg-slate-950/20 dark:text-slate-400">
            No announcements yet.
          </div>
        ) : (
          <div className="space-y-4">
            <article className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm dark:border-amber-900/30 dark:bg-slate-950/40">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 rounded-xl bg-amber-50 p-2 text-amber-700 dark:bg-amber-950 dark:text-amber-200">
                  <Bell className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {latestAnnouncement.title}
                      </h3>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                        Latest
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {formatDate(latestAnnouncement.created_at)}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {latestAnnouncement.body ||
                      latestAnnouncement.content ||
                      latestAnnouncement.message}
                  </p>
                  <p className="mt-3 text-xs font-medium text-slate-500">
                    Posted by{' '}
                    {latestAnnouncement.authorName || latestAnnouncement.author || 'Instructor'}
                  </p>
                </div>
              </div>
            </article>

            {sortedAnnouncements.length > 1 && (
              <Link
                to={announcementsPath}
                className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800 transition hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-200"
              >
                See rest of announcements
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        )}
      </section>

      {/* LOWER CONTENT GRID: MATERIALS & STUDENTS */}
      <div className={`grid gap-6 ${instructorView ? 'lg:grid-cols-5' : 'lg:grid-cols-1'}`}>
        {/* MATERIALS SECTION */}
        <section className={`rounded-[28px] border border-[#dbe7dc] bg-white p-6 shadow-[0_10px_30px_rgba(27,67,50,0.05)] dark:border-slate-800 dark:bg-slate-900 ${instructorView ? 'lg:col-span-3' : ''}`}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-[#e6f2e8] p-3 text-[#16623f] dark:bg-emerald-950 dark:text-emerald-300">
                <Folder className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-700">Materials</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Course folders</h2>
              </div>
            </div>
            {instructorView && (
              <button
                type="button"
                onClick={() => setIsFolderOpen((open) => !open)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#16623f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#104d32]"
              >
                <Plus className="h-4 w-4" />
                Add folder
              </button>
            )}
          </div>

          {instructorView && isFolderOpen && (
            <form onSubmit={handleAddFolder} className="mb-5 space-y-3 rounded-2xl border border-[#dbe7dc] bg-[#f4f8f3] p-4 dark:border-slate-700 dark:bg-slate-950/40">
              <input
                required
                value={folderFormTitle}
                onChange={(e) => setFolderFormTitle(e.target.value)}
                placeholder="Folder name (e.g. Week 1 Lectures)"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-800"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFolderOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFolder}
                  className="rounded-xl bg-[#16623f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#104d32] disabled:opacity-70"
                >
                  {savingFolder ? 'Creating...' : 'Create folder'}
                </button>
              </div>
            </form>
          )}

          {folders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
              No folders created yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {folders.map((folder) => (
                <Link
                  key={folder.id}
                  to={`${materialsBase}/${folder.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-emerald-300 hover:bg-[#f4f8f3] dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-emerald-800 dark:hover:bg-slate-800"
                >
                  <span className="rounded-2xl bg-[#dfeee3] p-3 text-[#16623f] transition group-hover:bg-[#cce5d4] dark:bg-emerald-950 dark:text-emerald-300">
                    <Folder className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {folder.name || folder.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">Open folder contents</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:text-[#16623f]" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ENROLLED LEARNERS SECTION */}
        {instructorView && (
          <section className="rounded-[28px] border border-[#dbe7dc] bg-white p-6 shadow-[0_10px_30px_rgba(27,67,50,0.05)] dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <span className="rounded-2xl bg-[#e6f2e8] p-3 text-[#16623f] dark:bg-emerald-950 dark:text-emerald-300">
                <UsersRound className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-700">Learners</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                  Students enrolled ({students.length})
                </h2>
              </div>
            </div>

            {students.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
                No students enrolled in this course yet.
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dfeee3] text-[#16623f] dark:bg-emerald-950 dark:text-emerald-300">
                      <UserRound className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900 dark:text-white">
                        {student.username || student.name || 'Student'}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {student.email || formatDate(student.enrolled_at) || 'Enrolled learner'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}