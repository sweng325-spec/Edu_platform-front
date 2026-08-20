import { useContext, useEffect, useState } from 'react';
import { CalendarDays, Clock3, PencilLine, Trash2, CheckCircle2, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { todosApi } from '../api/todos';
import {
  buildTodoPayload,
  emptyTodoForm,
  extractTodosList,
  formatDeadline,
  formatDurationHours,
  normalizeTodo,
} from '../utils/todos';

const makeId = () => `subtask-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export default function LearningPlanPage() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyTodoForm);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchTodos = async () => {
      try {
        setLoading(true);
        const response = await todosApi.getAllTodos();
        const normalizedTasks = extractTodosList(response.data).map(normalizeTodo);
        setTasks(normalizedTasks);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch todos:', err);
        setError(err.userMessage || 'Failed to load your todos');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [user]);

  const completedCount = tasks.filter((task) => task?.completed).length;

  const openAddTaskModal = () => {
    setEditingId(null);
    setForm(emptyTodoForm);
    setSubtaskInput('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyTodoForm);
    setSubtaskInput('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const addSubtaskToForm = () => {
    const trimmed = subtaskInput.trim();
    if (!trimmed) return;

    setForm((current) => ({
      ...current,
      subtasks: [...current.subtasks, { id: makeId(), title: trimmed, completed: false }],
    }));
    setSubtaskInput('');
  };

  const toggleFormSubtask = (subtaskId) => {
    setForm((current) => ({
      ...current,
      subtasks: current.subtasks.map((subtask) =>
        subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
      ),
    }));
  };

  const removeFormSubtask = (subtaskId) => {
    setForm((current) => ({
      ...current,
      subtasks: current.subtasks.filter((subtask) => subtask.id !== subtaskId),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedTitle = form.title.trim();
    if (!trimmedTitle) return;

    const taskData = buildTodoPayload({
      title: trimmedTitle,
      deadline_date: form.deadline_date,
      expected_duration_hours: form.expected_duration_hours,
      subtasks: form.subtasks,
    });

    try {
      if (editingId) {
        const response = await todosApi.updateTodo(editingId, taskData);
        setTasks((current) =>
          current.map((task) => (task.id === editingId ? normalizeTodo(response.data) : task))
        );
      } else {
        const response = await todosApi.createTodo(taskData);
        setTasks((current) => [normalizeTodo(response.data), ...current]);
      }
      setError(null);
      closeModal();
    } catch (err) {
      console.error('Failed to save todo:', err);
      setError(err.userMessage || 'Failed to save your todo');
    }
  };

  const toggleTask = async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      const response = await todosApi.updateTodo(taskId, {
        completed: !task.completed,
      });
      setTasks((current) =>
        current.map((t) => (t.id === taskId ? normalizeTodo(response.data) : t))
      );
      setError(null);
    } catch (err) {
      console.error('Failed to update todo:', err);
      setError(err.userMessage || 'Failed to update your todo');
    }
  };

  const toggleSubtask = async (taskId, subtaskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      const updatedSubtasks = (task.subtasks || []).map((subtask) =>
        subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
      );
      const allSubtasksComplete =
        updatedSubtasks.length > 0 && updatedSubtasks.every((subtask) => subtask.completed);

      const response = await todosApi.updateTodo(
        taskId,
        buildTodoPayload({
          title: task.title,
          deadline_date: task.deadline_date,
          expected_duration_hours: task.expected_duration_hours,
          subtasks: updatedSubtasks,
          completed: allSubtasksComplete,
        })
      );
      setTasks((current) =>
        current.map((t) => (t.id === taskId ? normalizeTodo(response.data) : t))
      );
      setError(null);
    } catch (err) {
      console.error('Failed to update subtask:', err);
      setError(err.userMessage || 'Failed to update your subtask');
    }
  };

  const editTask = (task) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      deadline_date: task.deadline_date || '',
      expected_duration_hours: task.expected_duration_hours || '',
      subtasks: (task.subtasks || []).map((subtask) => ({ ...subtask })),
    });
    setSubtaskInput('');
    setIsModalOpen(true);
  };

  const deleteTask = async (taskId) => {
    try {
      await todosApi.deleteTodo(taskId);
      setTasks((current) => current.filter((task) => task.id !== taskId));
      if (editingId === taskId) {
        closeModal();
      }
      setError(null);
    } catch (err) {
      console.error('Failed to delete todo:', err);
      setError(err.userMessage || 'Failed to delete your todo');
    }
  };

  const removeSubtaskFromTask = async (taskId, subtaskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      const updatedSubtasks = (task.subtasks || []).filter((subtask) => subtask.id !== subtaskId);
      const response = await todosApi.updateTodo(
        taskId,
        buildTodoPayload({
          title: task.title,
          deadline_date: task.deadline_date,
          expected_duration_hours: task.expected_duration_hours,
          subtasks: updatedSubtasks,
          completed: task.completed,
        })
      );
      setTasks((current) =>
        current.map((t) => (t.id === taskId ? normalizeTodo(response.data) : t))
      );
      setError(null);
    } catch (err) {
      console.error('Failed to remove subtask:', err);
      setError(err.userMessage || 'Failed to remove subtask');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <section className="rounded-[30px] bg-[#123f30] px-6 py-8 text-white shadow-[0_18px_45px_-24px_rgba(17,74,54,0.8)] sm:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#d9edc7]">Weekly plan</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">My To-Do List</h1>
        </div>
      </section>

      <section className="rounded-[28px] border border-[#dbe7dc] bg-white p-6 shadow-[0_10px_30px_rgba(27,67,50,0.05)] dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-700">Tasks</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">This week’s schedule</h2>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              {completedCount}/{tasks.length} complete
            </span>
            <button
              type="button"
              onClick={openAddTaskModal}
              className="inline-flex items-center justify-center rounded-xl bg-[#16623f] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-16px_rgba(17,74,54,0.9)] transition hover:bg-[#104d32]"
            >
              Add a task
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600 dark:border-slate-700 dark:border-t-emerald-400"></div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Loading your tasks...</p>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-[24px] border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <p className="text-sm text-slate-500 dark:text-slate-400">No tasks yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((item) => (
              <article
                key={item.id}
                className={`rounded-[24px] border p-5 transition ${
                  item.completed
                    ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/20'
                    : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60'
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={Boolean(item.completed)}
                      onChange={() => toggleTask(item.id)}
                      className="mt-1 h-5 w-5 cursor-pointer accent-emerald-600"
                    />

                    <div className="max-w-2xl">
                      <h3 className={`text-lg font-semibold ${item.completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
                      <CalendarDays className="h-4 w-4 text-emerald-700" />
                      {formatDeadline(item.deadline_date)}
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
                      <Clock3 className="h-4 w-4 text-amber-600" />
                      {formatDurationHours(item.expected_duration_hours)}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => editTask(item)}
                        className="inline-flex items-center justify-center rounded-full bg-slate-200 p-2 text-slate-700 transition hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                        aria-label={`Edit ${item.title}`}
                      >
                        <PencilLine className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTask(item.id)}
                        className="inline-flex items-center justify-center rounded-full bg-red-100 p-2 text-red-600 transition hover:bg-red-200 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
                        aria-label={`Delete ${item.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/60">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">Subtasks</p>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {(item.subtasks || []).filter((subtask) => subtask.completed).length}/{(item.subtasks || []).length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(item.subtasks || []).length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">No subtasks yet.</p>
                    ) : (
                      (item.subtasks || []).map((subtask) => (
                        <div key={subtask.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/80">
                          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                            <input
                              type="checkbox"
                              checked={Boolean(subtask.completed)}
                              onChange={() => toggleSubtask(item.id, subtask.id)}
                              className="h-4 w-4 accent-emerald-600"
                            />
                            <span className={subtask.completed ? 'line-through text-slate-400' : ''}>{subtask.title}</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => removeSubtaskFromTask(item.id, subtask.id)}
                            className="text-slate-400 transition hover:text-red-500"
                            aria-label={`Remove ${subtask.title}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                {editingId ? 'Edit task' : 'Add a task'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Task title
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="e.g. Finish the assignment review"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Deadline
                  <input
                    type="date"
                    name="deadline_date"
                    value={form.deadline_date}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Duration (hours)
                  <input
                    type="number"
                    name="expected_duration_hours"
                    min="0"
                    step="0.25"
                    value={form.expected_duration_hours}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="0.25"
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-800 dark:bg-emerald-950/20">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Subtasks</p>

                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={subtaskInput}
                    onChange={(event) => setSubtaskInput(event.target.value)}
                    placeholder="Add a subtask"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={addSubtaskToForm}
                    className="rounded-xl bg-[#16623f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#104d32]"
                  >
                    Add
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {form.subtasks.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No subtasks added yet.</p>
                  ) : (
                    form.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 dark:bg-slate-800">
                        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                          <input
                            type="checkbox"
                            checked={Boolean(subtask.completed)}
                            onChange={() => toggleFormSubtask(subtask.id)}
                            className="h-4 w-4 accent-emerald-600"
                          />
                          <span className={subtask.completed ? 'line-through text-slate-400' : ''}>{subtask.title}</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => removeFormSubtask(subtask.id)}
                          className="text-slate-400 transition hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#16623f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#104d32]"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {editingId ? 'Save changes' : 'Save task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}