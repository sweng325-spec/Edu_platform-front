export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://160.60.60.31:8000/api/';

export function getApiOrigin() {
  return API_BASE_URL.replace(/\/api\/?$/, '');
}

export function resolveMediaUrl(path) {
  if (!path) return null;

  const value = String(path).trim();
  if (!value) return null;

  if (/^https?:\/\//i.test(value) || value.startsWith('blob:') || value.startsWith('data:')) {
    return value;
  }

  const origin = getApiOrigin();
  return `${origin}${value.startsWith('/') ? value : `/${value}`}`;
}

export function extractCoursesList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.courses)) return payload.courses;
  return [];
}

export function getCourseImageUrl(course) {
  if (!course || typeof course !== 'object') return null;
  return resolveMediaUrl(
    course.image ||
      course.image_url ||
      course.cover ||
      course.cover_image ||
      course.thumbnail ||
      null
  );
}
