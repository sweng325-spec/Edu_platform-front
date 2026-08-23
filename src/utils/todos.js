/** Helpers to map between backend Todo shape and UI state. */

export function extractTodosList(responseData) {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.results)) return responseData.results;
  return [];
}

export function normalizeSubtask(subtask = {}) {
  return {
    id: subtask.id ?? `subtask-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    title: (subtask.title ?? subtask.text ?? '').toString(),
    completed: Boolean(subtask.completed),
  };
}

export function normalizeTodo(task = {}) {
  // Convert stored hours from backend to minutes for UI entry/display
  const hours = task.expected_duration_hours;
  const minutes = hours !== null && hours !== undefined && hours !== '' ? Math.round(Number(hours) * 60) : '';

  return {
    id: task.id,
    title: task.title || 'Untitled',
    deadline_date: task.deadline_date || '',
    expected_duration_hours: minutes !== '' ? String(minutes) : '',
    completed: Boolean(task.completed),
    subtasks: Array.isArray(task.subtasks) ? task.subtasks.map(normalizeSubtask) : [],
  };
}

export function buildTodoPayload({
  title,
  deadline_date,
  expected_duration_hours,
  completed,
  subtasks = [],
}) {
  const payload = {
    title: title.trim(),
    subtasks: subtasks
      .map((subtask) => ({
        title: (subtask.title ?? subtask.text ?? '').toString().trim(),
        completed: Boolean(subtask.completed),
      }))
      .filter((subtask) => subtask.title),
  };

  if (deadline_date) {
    payload.deadline_date = deadline_date;
  } else {
    payload.deadline_date = null;
  }

  if (
    expected_duration_hours === '' ||
    expected_duration_hours === null ||
    expected_duration_hours === undefined
  ) {
    payload.expected_duration_hours = null;
  } else {
    const parsedMinutes = Number(expected_duration_hours);
    // Convert minutes back to hours for backend storage (e.g. 30 mins -> 0.5 hours)
    payload.expected_duration_hours = Number.isFinite(parsedMinutes) ? parsedMinutes / 60 : null;
  }

  if (typeof completed === 'boolean') {
    payload.completed = completed;
  }

  return payload;
}

export function formatDurationHours(value) {
  if (value === '' || value === null || value === undefined) return '—';
  const totalMinutes = Number(value);
  if (!Number.isFinite(totalMinutes) || totalMinutes === 0) return '—';
  
  if (totalMinutes < 60) {
    return `${totalMinutes} mins`;
  }
  
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs} hrs`;
}

export function formatDeadline(value) {
  if (!value) return 'No deadline';
  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

export const emptyTodoForm = {
  title: '',
  deadline_date: '',
  expected_duration_hours: '15',
  subtasks: [],
};