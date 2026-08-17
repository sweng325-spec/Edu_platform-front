const STORAGE_KEY = 'daltex.courseWorkspace.v1';

const emptyWorkspace = () => ({
  announcements: [],
  materials: [],
  students: [],
});

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getCourseBucket(courseId) {
  const all = readAll();
  const key = String(courseId);
  return { all, key, bucket: { ...emptyWorkspace(), ...(all[key] || {}) } };
}

function saveCourseBucket(courseId, bucket) {
  const { all, key } = getCourseBucket(courseId);
  all[key] = bucket;
  writeAll(all);
  return bucket;
}

const makeId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export const courseWorkspace = {
  getAnnouncements(courseId) {
    return getCourseBucket(courseId).bucket.announcements;
  },

  addAnnouncement(courseId, { title, body, authorName }) {
    const { bucket } = getCourseBucket(courseId);
    const announcement = {
      id: makeId('announcement'),
      title: title.trim(),
      body: body.trim(),
      authorName: authorName || 'Instructor',
      created_at: new Date().toISOString(),
    };
    bucket.announcements = [announcement, ...bucket.announcements];
    saveCourseBucket(courseId, bucket);
    return announcement;
  },

  getMaterials(courseId) {
    return getCourseBucket(courseId).bucket.materials;
  },

  addMaterial(courseId, { title, description, link }) {
    const { bucket } = getCourseBucket(courseId);
    const material = {
      id: makeId('material'),
      title: title.trim(),
      description: (description || '').trim(),
      link: (link || '').trim(),
      created_at: new Date().toISOString(),
    };
    bucket.materials = [material, ...bucket.materials];
    saveCourseBucket(courseId, bucket);
    return material;
  },

  getStudents(courseId) {
    return getCourseBucket(courseId).bucket.students;
  },

  recordEnrollment(courseId, student) {
    if (!courseId || !student?.id) return null;
    const { bucket } = getCourseBucket(courseId);
    const already = bucket.students.some((item) => String(item.id) === String(student.id));
    if (already) return bucket.students.find((item) => String(item.id) === String(student.id));

    const entry = {
      id: student.id,
      username: student.username || student.name || student.email || 'Student',
      email: student.email || '',
      enrolled_at: new Date().toISOString(),
    };
    bucket.students = [entry, ...bucket.students];
    saveCourseBucket(courseId, bucket);
    return entry;
  },
};
