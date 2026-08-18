import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  FolderOpen,
  Link2,
  Plus,
  Trash2,
  Upload,
  Video,
} from 'lucide-react';
import { coursesApi } from '../api/courses';
import { AuthContext } from '../context/AuthContext';
import { courseWorkspace } from '../utils/courseWorkspace';
import { formatDate } from '../utils/format';
import { extractCoursesList, resolveMediaUrl } from '../utils/media';
import { isInstructor } from '../utils/roles';

export default function CourseMaterialsFolderPage() {
  const { courseId, folderType } = useParams(); // folderType represents folderId here
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const instructorView = isInstructor(user?.role);

  const backTo = instructorView
    ? `/instructor/courses/${courseId}`
    : `/my-courses/${courseId}`;

  const [course, setCourse] = useState(null);
  const [folder, setFolder] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [materialForm, setMaterialForm] = useState({
    title: '',
    description: '',
    link: '',
    material_type: 'VIDEO',
  });
  const [file, setFile] = useState(null);
  const [savingMaterial, setSavingMaterial] = useState(false);
  const [isMaterialOpen, setIsMaterialOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [materialToDelete, setMaterialToDelete] = useState(null);

  const fetchMaterials = async () => {
    try {
      const foldersRes = await coursesApi.getFolders(courseId);
      const foldersList = extractCoursesList(foldersRes.data);
      const foundFolder = foldersList.find((f) => String(f.id) === String(folderType));
      
      if (foundFolder && Array.isArray(foundFolder.materials)) {
        setMaterials(foundFolder.materials);
        return;
      }

      const materialsRes = await coursesApi.getCourseMaterials(courseId);
      const remote = extractCoursesList(materialsRes.data);
      if (remote.length) {
        setMaterials(remote);
      } else {
        setMaterials(courseWorkspace.getMaterials(courseId));
      }
    } catch {
      setMaterials(courseWorkspace.getMaterials(courseId));
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

        let foundFolder = null;
        try {
          const foldersRes = await coursesApi.getFolders(courseId);
          const foldersList = extractCoursesList(foldersRes.data);
          foundFolder = foldersList.find((f) => String(f.id) === String(folderType));
          
          if (foundFolder && Array.isArray(foundFolder.materials)) {
            setMaterials(foundFolder.materials);
          }
        } catch {
          foundFolder = courseWorkspace
            .getFolders(courseId)
            .find((f) => String(f.id) === String(folderType));
        }

        setFolder(foundFolder || { id: folderType, title: 'Folder Contents', name: 'Folder Contents' });

        if (!foundFolder || !Array.isArray(foundFolder.materials)) {
          await fetchMaterials();
        }
      } catch (err) {
        if (!mounted) return;
        setError(err.userMessage || 'Folder could not be loaded.');
        setCourse(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [courseId, folderType]);

  const filteredMaterials = useMemo(() => {
    if (!materials.length) return [];
    return materials.filter((item) => {
      const itemFolderId = String(item.folder_id || item.folder || item.folderName || '');
      if (!itemFolderId) return true;
      return itemFolderId === String(folderType);
    });
  }, [materials, folderType]);

  const handleAddMaterial = async (event) => {
    event.preventDefault();
    if (!materialForm.title.trim()) return;

    setSavingMaterial(true);
    try {
      const formData = new FormData();
      formData.append('folder_id', folderType);
      formData.append('title', materialForm.title.trim());
      formData.append('description', materialForm.description.trim());
      formData.append('material_type', materialForm.material_type);

      if (materialForm.link.trim()) {
        formData.append('link', materialForm.link.trim());
      }
      if (file) {
        formData.append('file', file);
      }

      await coursesApi.addCourseMaterial(courseId, formData);
      await fetchMaterials();

      setMaterialForm({ title: '', description: '', link: '', material_type: 'VIDEO' });
      setFile(null);
      setIsMaterialOpen(false);
    } catch (err) {
      try {
        courseWorkspace.addMaterial(courseId, {
          folder_id: folderType,
          ...materialForm,
          file_name: file?.name,
        });
        setMaterials(courseWorkspace.getMaterials(courseId));
        setMaterialForm({ title: '', description: '', link: '', material_type: 'VIDEO' });
        setFile(null);
        setIsMaterialOpen(false);
      } catch (localErr) {
        alert(err?.response?.data?.detail || err?.userMessage || 'Failed to upload course material.');
      }
    } finally {
      setSavingMaterial(false);
    }
  };

  const confirmDeleteMaterial = async () => {
    if (!materialToDelete) return;

    const materialId = materialToDelete.id;
    setDeletingId(materialId);
    setMaterialToDelete(null);

    try {
      if (coursesApi.deleteCourseMaterial) {
        await coursesApi.deleteCourseMaterial(courseId, materialId);
      }
      await fetchMaterials();
    } catch (err) {
      try {
        courseWorkspace.removeMaterial(courseId, materialId);
        setMaterials(courseWorkspace.getMaterials(courseId));
      } catch {
        alert(err?.response?.data?.detail || err?.userMessage || 'Failed to delete material.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading folder contents...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <button
          type="button"
          onClick={() => navigate(backTo)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#16623f] dark:text-emerald-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-10 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error || 'Course not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <Link
        to={backTo}
        className="inline-flex items-center gap-2 rounded-full border border-[#dbe7dc] bg-white px-4 py-2 text-sm font-semibold text-[#16623f] transition hover:bg-[#edf5ef] dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to course
      </Link>

      <section className="rounded-[28px] border border-[#dbe7dc] bg-white p-6 shadow-[0_10px_30px_rgba(27,67,50,0.05)] dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-[#e6f2e8] p-3 text-[#16623f] dark:bg-emerald-950 dark:text-emerald-300">
              <FolderOpen className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-400">
                {course.title}
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                {folder?.name || folder?.title || 'Folder'}
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Upload and view folder resources</p>
            </div>
          </div>
          {instructorView && (
            <button
              type="button"
              onClick={() => setIsMaterialOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#16623f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#104d32] dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Upload material
            </button>
          )}
        </div>

        {instructorView && isMaterialOpen && (
          <form
            onSubmit={handleAddMaterial}
            className="mb-5 space-y-3 rounded-2xl border border-[#dbe7dc] bg-[#f4f8f3] p-4 dark:border-slate-700 dark:bg-slate-950/40"
          >
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                Material type
              </label>
              <select
                value={materialForm.material_type}
                onChange={(event) =>
                  setMaterialForm((current) => ({ ...current, material_type: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="VIDEO">Video</option>
                <option value="PDF">Document / PDF</option>
              </select>
            </div>

            <input
              required
              value={materialForm.title}
              onChange={(event) =>
                setMaterialForm((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="Material title"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
            />
            <textarea
              rows={3}
              value={materialForm.description}
              onChange={(event) =>
                setMaterialForm((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Short description"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
            />
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                Attach file
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:rounded-xl file:border-0 file:bg-[#16623f] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#104d32] dark:file:bg-emerald-600"
              />
            </div>
            <input
              type="url"
              value={materialForm.link}
              onChange={(event) =>
                setMaterialForm((current) => ({ ...current, link: event.target.value }))
              }
              placeholder="External URL / Link (optional)"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsMaterialOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingMaterial}
                className="rounded-xl bg-[#16623f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#104d32] disabled:opacity-70 dark:bg-emerald-600 dark:hover:bg-emerald-700"
              >
                {savingMaterial ? 'Uploading...' : 'Save material'}
              </button>
            </div>
          </form>
        )}

        {filteredMaterials.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center dark:border-slate-700 dark:bg-slate-800/40">
            <FolderOpen className="mx-auto h-7 w-7 text-emerald-700 dark:text-emerald-400" />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No items uploaded inside this folder yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMaterials.map((item) => {
              const resourceUrl = resolveMediaUrl(item.file || item.file_url || item.link);
              const isVideo = String(item.material_type || '').toUpperCase() === 'VIDEO';

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          {isVideo ? (
                            <Video className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                          ) : (
                            <FileText className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                          )}
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {item.title}
                          </h3>
                        </div>
                        {item.description && (
                          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {item.description}
                          </p>
                        )}
                        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{formatDate(item.created_at)}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {resourceUrl && (
                          <a
                            href={resourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#16623f] shadow-sm dark:bg-slate-900 dark:text-emerald-300"
                          >
                            {item.file || item.file_url ? (
                              <Upload className="h-3.5 w-3.5" />
                            ) : (
                              <Link2 className="h-3.5 w-3.5" />
                            )}
                            Open
                          </a>
                        )}

                        {instructorView && (
                          <button
                            type="button"
                            onClick={() => setMaterialToDelete(item)}
                            disabled={deletingId === item.id}
                            className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {deletingId === item.id ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </div>
                    </div>

                    {isVideo && resourceUrl && (
                      <div className="mt-2 overflow-hidden rounded-xl bg-black">
                        <video controls className="max-h-80 w-full">
                          <source src={resourceUrl} />
                          Your browser does not support playing this video.
                        </video>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {materialToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-[#dbe7dc] bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Delete Material
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-white">"{materialToDelete.title}"</span>? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setMaterialToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteMaterial}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}