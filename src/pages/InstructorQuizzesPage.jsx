import { useContext, useEffect, useState } from 'react';
import {
  CalendarDays,
  Clock3,
  HelpCircle,
  Plus,
  Send,
  Trash2,
  X,
  CheckCircle2,
  PencilLine,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { coursesApi } from '../api/courses';
import { quizzesApi } from '../api/quizzes';
import { extractCoursesList } from '../utils/media';
import {
  buildQuizPayload,
  emptyQuestion,
  emptyQuizForm,
  formatDeadline,
  makeChoiceId,
  validateQuizForm,
} from '../utils/quizzes';
import { quizStorage } from '../utils/quizStorage';

export default function InstructorQuizzesPage() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(emptyQuizForm);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishingId, setPublishingId] = useState(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      try {
        const coursesRes = await coursesApi.getTeacherMyCourses();
        const courseList = extractCoursesList(coursesRes?.data);
        setCourses(courseList);

        const allQuizzes = courseList.flatMap((c) =>
          quizStorage.getQuizzesByCourse(c.id).map((q) => ({
            ...q,
            courseTitle: c.title,
          }))
        );
        setQuizzes(allQuizzes);
        setError(null);
      } catch (err) {
        setError(err.userMessage || 'Failed to load quizzes');
        setCourses([]);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyQuizForm());
    setIsModalOpen(true);
  };

  const openEditModal = (quiz) => {
    setEditingId(quiz.id);
    setForm({
      title: quiz.title,
      description: quiz.description || '',
      courseId: String(quiz.courseId),
      deadline: quiz.deadline ? quiz.deadline.slice(0, 16) : '',
      timeLimitMinutes: quiz.timeLimitMinutes || 30,
      questions: (quiz.questions || []).map((q) => ({
        ...q,
        choices: q.choices.map((c) => ({ ...c })),
      })),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyQuizForm());
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const updateQuestion = (questionId, field, value) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((q) =>
        q.id === questionId ? { ...q, [field]: value } : q
      ),
    }));
  };

  const updateChoice = (questionId, choiceId, field, value) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          choices: q.choices.map((c) => {
            if (c.id !== choiceId) {
              if (field === 'isCorrect' && value) return { ...c, isCorrect: false };
              return c;
            }
            return { ...c, [field]: value };
          }),
        };
      }),
    }));
  };

  const addQuestion = () => {
    setForm((current) => ({
      ...current,
      questions: [...current.questions, emptyQuestion()],
    }));
  };

  const removeQuestion = (questionId) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.filter((q) => q.id !== questionId),
    }));
  };

  const addChoice = (questionId) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              choices: [...q.choices, { id: makeChoiceId(), text: '', isCorrect: false }],
            }
          : q
      ),
    }));
  };

  const removeChoice = (questionId, choiceId) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((q) =>
        q.id === questionId
          ? { ...q, choices: q.choices.filter((c) => c.id !== choiceId) }
          : q
      ),
    }));
  };

  const refreshQuizzes = (courseList) => {
    const list = courseList || courses;
    const allQuizzes = list.flatMap((c) =>
      quizStorage.getQuizzesByCourse(c.id).map((q) => ({
        ...q,
        courseTitle: c.title,
      }))
    );
    setQuizzes(allQuizzes);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateQuizForm(form);
    if (validationErrors.length) {
      setError(validationErrors.join(' '));
      return;
    }

    setSaving(true);
    setError(null);

    const payload = buildQuizPayload({
      ...form,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : '',
      createdBy: user?.id,
    });

    try {
      if (editingId) {
        await quizzesApi.update(editingId, payload);
      } else {
        await quizzesApi.create(payload);
      }
      refreshQuizzes();
      closeModal();
    } catch (err) {
      setError(err.userMessage || 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (quiz) => {
    setPublishingId(quiz.id);
    setError(null);

    try {
      let studentIds = [];
      try {
        const studentsRes = await coursesApi.getCourseStudents(quiz.courseId);
        const students = extractCoursesList(studentsRes?.data);
        studentIds = students.map((s) => s.id);
      } catch {
        studentIds = [];
      }

      await quizzesApi.publish(quiz.id, {
        courseTitle: quiz.courseTitle,
        studentIds,
      });

      refreshQuizzes();
      window.dispatchEvent(new Event('announcements-seen'));
    } catch (err) {
      setError(err.userMessage || 'Failed to publish quiz');
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm('Delete this quiz? This cannot be undone.')) return;
    try {
      await quizzesApi.delete(quizId);
      refreshQuizzes();
    } catch (err) {
      setError(err.userMessage || 'Failed to delete quiz');
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <section className="rounded-[30px] bg-[#123f30] px-6 py-8 text-white shadow-[0_18px_45px_-24px_rgba(17,74,54,0.8)] sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#d9edc7]">Instructor area</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Quizzes</h1>
        <p className="mt-2 max-w-xl text-sm text-emerald-50/90">
          Create multiple-choice quizzes with a timer. Students receive a notification when you publish.
        </p>
      </section>

      <section className="rounded-[28px] border border-[#dbe7dc] bg-white p-6 shadow-[0_10px_30px_rgba(27,67,50,0.05)] dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-700">Your quizzes</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">Manage course quizzes</h2>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#16623f] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-16px_rgba(17,74,54,0.9)] transition hover:bg-[#104d32]"
          >
            <Plus className="h-4 w-4" />
            Create quiz
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600 dark:border-slate-700 dark:border-t-emerald-400" />
          </div>
        ) : quizzes.length === 0 ? (
          <div className="rounded-[24px] border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <HelpCircle className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              No quizzes yet. Create one for your students.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <article
                key={quiz.id}
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-emerald-700">
                      {quiz.courseTitle}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{quiz.title}</h3>
                    {quiz.description && (
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{quiz.description}</p>
                    )}
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {(quiz.questions || []).length} question{(quiz.questions || []).length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
                      <CalendarDays className="h-4 w-4 text-emerald-700" />
                      {formatDeadline(quiz.deadline)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
                      <Clock3 className="h-4 w-4 text-amber-600" />
                      {quiz.timeLimitMinutes} min
                    </span>
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                        quiz.published
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {quiz.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
                  {!quiz.published && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditModal(quiz)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <PencilLine className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePublish(quiz)}
                        disabled={publishingId === quiz.id}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
                      >
                        <Send className="h-4 w-4" />
                        {publishingId === quiz.id ? 'Publishing...' : 'Publish'}
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(quiz.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4">
          <div className="my-8 w-full max-w-3xl rounded-[28px] bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                {editingId ? 'Edit quiz' : 'Create quiz'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Quiz title
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="e.g. Module 3 Review"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Description (optional)
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="Brief instructions for students"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Course
                  <select
                    name="courseId"
                    value={form.courseId}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">Select course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Deadline
                  <input
                    type="datetime-local"
                    name="deadline"
                    value={form.deadline}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Time limit (minutes)
                  <input
                    type="number"
                    name="timeLimitMinutes"
                    min="1"
                    value={form.timeLimitMinutes}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </label>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-500">Questions</p>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="inline-flex items-center gap-1 rounded-lg text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    <Plus className="h-4 w-4" />
                    Add question
                  </button>
                </div>

                {form.questions.map((question, qIndex) => (
                  <div
                    key={question.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Question {qIndex + 1}
                      </p>
                      {form.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(question.id)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                      placeholder="Enter question text"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />

                    <div className="mt-3 space-y-2">
                      {question.choices.map((choice) => (
                        <div key={choice.id} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={choice.isCorrect}
                            onChange={() => updateChoice(question.id, choice.id, 'isCorrect', true)}
                            className="h-4 w-4 accent-emerald-600"
                            title="Mark as correct answer"
                          />
                          <input
                            type="text"
                            value={choice.text}
                            onChange={(e) =>
                              updateChoice(question.id, choice.id, 'text', e.target.value)
                            }
                            placeholder="Choice text"
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          />
                          {question.choices.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeChoice(question.id, choice.id)}
                              className="text-slate-400 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addChoice(question.id)}
                        className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
                      >
                        + Add choice
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#16623f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#104d32] disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {saving ? 'Saving...' : editingId ? 'Save changes' : 'Save draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
