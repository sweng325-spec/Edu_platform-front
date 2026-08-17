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
  return {
    id: task.id,
    title: task.title || 'Untitled',
    deadline_date: task.deadline_date || '',
    expected_duration_hours:
      task.expected_duration_hours === null || task.expected_duration_hours === undefined
        ? ''
        : String(task.expected_duration_hours),
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
    const parsed = Number(expected_duration_hours);
    payload.expected_duration_hours = Number.isFinite(parsed) ? parsed : null;
  }

  if (typeof completed === 'boolean') {
    payload.completed = completed;
  }

  return payload;
}

export function formatDurationHours(value) {
  if (value === '' || value === null || value === undefined) return '—';
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return String(value);
  if (parsed === 1) return '1 hr';
  if (parsed < 1) {
    const minutes = Math.round(parsed * 60);
    return `${minutes} min`;
  }
  return `${parsed} hrs`;
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
  expected_duration_hours: '0.25',
  subtasks: [],
};
