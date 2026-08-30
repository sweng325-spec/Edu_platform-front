export const makeQuestionId = () =>
  `q-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export const makeChoiceId = () =>
  `c-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export const emptyQuestion = () => ({
  id: makeQuestionId(),
  text: '',
  choices: [
    { id: makeChoiceId(), text: '', isCorrect: true },
    { id: makeChoiceId(), text: '', isCorrect: false },
  ],
});

export const emptyQuizForm = () => ({
  title: '',
  description: '',
  courseId: '',
  deadline: '',
  timeLimitMinutes: 30,
  questions: [emptyQuestion()],
});

export function normalizeQuiz(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: raw.id,
    courseId: raw.course_id ?? raw.courseId,
    courseTitle: raw.course_title ?? raw.courseTitle ?? '',
    title: raw.title ?? '',
    description: raw.description ?? '',
    timeLimitMinutes: raw.time_limit_minutes ?? raw.timeLimitMinutes ?? 30,
    deadline: raw.deadline ?? raw.deadline_date ?? '',
    published: Boolean(raw.published ?? raw.is_published),
    publishedAt: raw.published_at ?? raw.publishedAt ?? null,
    createdAt: raw.created_at ?? raw.createdAt ?? null,
    createdBy: raw.created_by ?? raw.createdBy ?? null,
    questions: (raw.questions || []).map(normalizeQuestion),
  };
}

export function normalizeQuestion(raw) {
  return {
    id: raw.id,
    text: raw.text ?? raw.question_text ?? '',
    choices: (raw.choices || raw.options || []).map((c) => ({
      id: c.id,
      text: c.text ?? c.choice_text ?? '',
      isCorrect: Boolean(c.is_correct ?? c.isCorrect),
    })),
  };
}

export function extractQuizzesList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.quizzes)) return payload.quizzes;
  return [];
}

export function buildQuizPayload(form) {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    courseId: form.courseId,
    deadline: form.deadline,
    timeLimitMinutes: Number(form.timeLimitMinutes) || 30,
    questions: form.questions.map((q) => ({
      id: q.id,
      text: q.text.trim(),
      choices: q.choices.map((c) => ({
        id: c.id,
        text: c.text.trim(),
        isCorrect: c.isCorrect,
      })),
    })),
  };
}

export function validateQuizForm(form) {
  const errors = [];
  if (!form.title.trim()) errors.push('Quiz title is required.');
  if (!form.courseId) errors.push('Select a course.');
  if (!form.deadline) errors.push('Deadline is required.');
  if (!form.timeLimitMinutes || Number(form.timeLimitMinutes) < 1) {
    errors.push('Time limit must be at least 1 minute.');
  }
  if (!form.questions.length) errors.push('Add at least one question.');

  form.questions.forEach((q, i) => {
    if (!q.text.trim()) errors.push(`Question ${i + 1} needs text.`);
    const filledChoices = q.choices.filter((c) => c.text.trim());
    if (filledChoices.length < 2) {
      errors.push(`Question ${i + 1} needs at least 2 choices.`);
    }
    const correctCount = q.choices.filter((c) => c.isCorrect && c.text.trim()).length;
    if (correctCount !== 1) {
      errors.push(`Question ${i + 1} must have exactly one correct answer.`);
    }
  });

  return errors;
}

export function formatDeadline(value) {
  if (!value) return 'No deadline';
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return value;
  }
}

export function getQuizStatus(quiz, attempt) {
  const now = Date.now();
  const deadline = quiz.deadline ? new Date(quiz.deadline).getTime() : null;

  if (attempt?.submittedAt) return 'completed';
  if (deadline && now > deadline) return 'expired';
  if (attempt && !attempt.submittedAt) return 'in_progress';
  return 'available';
}

export function formatTimeRemaining(expiresAt) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return '0:00';
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
