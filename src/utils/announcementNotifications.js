const STORAGE_KEY = 'daltex.announcementSeen.v1';

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

function getUserBucket(userId) {
  const all = readAll();
  const key = String(userId);
  return { all, key, bucket: all[key] && typeof all[key] === 'object' ? all[key] : {} };
}

export function sortAnnouncementsByDate(announcements) {
  return [...announcements].sort((a, b) => {
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return dateB - dateA;
  });
}

export function getSeenAnnouncementIds(userId, courseId) {
  if (!userId || !courseId) return [];
  const { bucket } = getUserBucket(userId);
  const seen = bucket[String(courseId)];
  return Array.isArray(seen) ? seen.map(String) : [];
}

export function markAnnouncementsSeen(userId, courseId, announcementIds) {
  if (!userId || !courseId || !announcementIds?.length) return;
  const { all, key, bucket } = getUserBucket(userId);
  const courseKey = String(courseId);
  const existing = new Set(getSeenAnnouncementIds(userId, courseId));
  announcementIds.forEach((id) => {
    if (id != null) existing.add(String(id));
  });
  bucket[courseKey] = [...existing];
  all[key] = bucket;
  writeAll(all);
}

export function getUnseenAnnouncements(userId, courseId, announcements) {
  const seen = new Set(getSeenAnnouncementIds(userId, courseId));
  return sortAnnouncementsByDate(announcements).filter(
    (item) => item.id != null && !seen.has(String(item.id)),
  );
}

export function getLatestUnseenAnnouncement(userId, courseId, announcements) {
  const unseen = getUnseenAnnouncements(userId, courseId, announcements);
  return unseen[0] || null;
}

export function countUnseenAnnouncements(userId, courseId, announcements) {
  return getUnseenAnnouncements(userId, courseId, announcements).length;
}
