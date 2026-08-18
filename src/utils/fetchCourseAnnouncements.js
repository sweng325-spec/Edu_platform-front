import { coursesApi } from '../api/courses';
import { courseWorkspace } from './courseWorkspace';
import { extractCoursesList } from './media';

export async function fetchCourseAnnouncements(courseId) {
  try {
    const announcementsRes = await coursesApi.getCourseAnnouncements(courseId);
    const remote = extractCoursesList(announcementsRes.data);
    if (remote.length) {
      return remote;
    }
    return courseWorkspace.getAnnouncements(courseId);
  } catch {
    return courseWorkspace.getAnnouncements(courseId);
  }
}

export async function fetchAnnouncementsForCourses(courses) {
  if (!courses?.length) return {};

  const entries = await Promise.all(
    courses.map(async (course) => {
      const announcements = await fetchCourseAnnouncements(course.id);
      return [String(course.id), announcements];
    }),
  );

  return Object.fromEntries(entries);
}
