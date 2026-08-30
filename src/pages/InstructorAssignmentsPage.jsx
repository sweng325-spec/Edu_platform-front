import { useContext, useEffect, useState } from 'react';
import { Plus, CalendarDays, Trash2, CheckSquare, Users, FileText, Download } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { coursesApi } from '../api/courses';
import { extractCoursesList } from '../utils/media';
import { assignmentStorage } from '../utils/assignmentStorage';

export default function InstructorAssignmentsPage() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [gradingAssignment, setGradingAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [maxPoints, setMaxPoints] = useState(100);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  // Grade state
  const [grades, setGrades] = useState({});
  const [feedbackNotes, setFeedbackNotes] = useState({});

  useEffect(() => {
    if (!user?.id) return;
    const loadCourses = async () => {
      try {
        const res = await coursesApi.getInstructorCourses(user.id);
        const list = extractCoursesList(res?.data);
        setCourses(list);
        if (list.length > 0) {
          const firstId = String(list[0].id || list[0].course);
          setSelectedCourseId(firstId);
          loadAssignments(firstId);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadCourses();
  }, [user?.id]);

  const loadAssignments = (courseId) => {
    const list = assignmentStorage.getAssignmentsByCourse(courseId);
    setAssignments(list);
  };

  const handleCourseChange = (e) => {
    const cId = e.target.value;
    setSelectedCourseId(cId);
    loadAssignments(cId);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachmentName(file.name);
      // Create a local object URL so students can download it immediately
      const fileObjectURL = URL.createObjectURL(file);
      setAttachmentUrl(fileObjectURL);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    assignmentStorage.createAssignment({
      courseId: selectedCourseId,
      title,
      description,
      deadline,
      maxPoints: Number(maxPoints),
      attachmentUrl,
      attachmentName: attachmentName || 'Assignment_Prompt.pdf',
    });
    setTitle('');
    setDescription('');
    setDeadline('');
    setAttachmentUrl('');
    setAttachmentName('');
    setShowCreateModal(false);
    loadAssignments(selectedCourseId);
  };

  const handlePublish = (id) => {
    assignmentStorage.publishAssignment(id);
    loadAssignments(selectedCourseId);
  };

  const handleDelete = (id) => {
    assignmentStorage.deleteAssignment(id);
    loadAssignments(selectedCourseId);
  };

  const openGradingModal = (assignment) => {
    setGradingAssignment(assignment);
    const subs = assignmentStorage.getSubmissionsForAssignment(assignment.id);
    setSubmissions(subs);
    
    const gMap = {};
    const fMap = {};
    subs.forEach(s => {
      gMap[s.id] = s.grade ?? '';
      fMap[s.id] = s.feedback ?? '';
    });
    setGrades(gMap);
    setFeedbackNotes(fMap);
  };

  const handleSaveGrade = (subId) => {
    assignmentStorage.gradeSubmission(subId, {
      grade: grades[subId],
      feedback: feedbackNotes[subId],
    });
    alert('Grade saved successfully!');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <section className="rounded-[30px] bg-[#123f30] px-6 py-8 text-white shadow-[0_18px_45px_-24px_rgba(17,74,54,0.8)] sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#d9edc7]">Instructor area</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Manage Assignments</h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#123f30] shadow-sm transition hover:bg-emerald-50"
          >
            <Plus className="h-4 w-4" /> Create Assignment
          </button>
        </div>
      </section>

      {/* Course Selector Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select Course:</label>
        <select
          value={selectedCourseId}
          onChange={handleCourseChange}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          {courses.map((c) => {
            const id = String(c.id || c.course);
            return (
              <option key={id} value={id}>
                {c.title || c.course_title}
              </option>
            );
          })}
        </select>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="rounded-[24px] border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <CheckSquare className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-3 text-sm text-slate-500">No assignments created for this course yet.</p>
          </div>
        ) : (
          assignments.map((assignment) => {
            const submissionCount = assignmentStorage.getSubmissionsForAssignment(assignment.id).length;
            return (
              <article key={assignment.id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{assignment.title}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${assignment.published ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {assignment.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{assignment.description}</p>
                    
                    {assignment.attachmentUrl && (
                      <div className="mt-2">
                        <a
                          href={assignment.attachmentUrl}
                          download={assignment.attachmentName}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 underline hover:text-emerald-800 dark:text-emerald-400"
                        >
                          <FileText className="h-4 w-4" /> Download Prompt: {assignment.attachmentName}
                        </a>
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" /> Due: {new Date(assignment.deadline).toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {submissionCount} Submissions</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openGradingModal(assignment)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                    >
                      Grade Submissions
                    </button>
                    {!assignment.published && (
                      <button
                        onClick={() => handlePublish(assignment.id)}
                        className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-xl dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Assignment</h2>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Description / Instructions</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Attach Assignment PDF</label>
                <input type="file" accept="application/pdf" onChange={handleFileChange} className="mt-1 w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100" />
                {attachmentName && <p className="mt-1 text-xs text-emerald-600">Selected file: {attachmentName}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Deadline</label>
                  <input type="datetime-local" required value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Max Points</label>
                  <input type="number" required value={maxPoints} onChange={(e) => setMaxPoints(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
                <button type="submit" className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Save Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {gradingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-xl dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Submissions for: {gradingAssignment.title}</h2>
            <div className="mt-4 space-y-4">
              {submissions.length === 0 ? (
                <p className="text-sm text-slate-500">No student submissions received yet.</p>
              ) : (
                submissions.map((sub) => (
                  <div key={sub.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                    <p className="text-xs font-semibold text-emerald-600">Student ID: {sub.studentId}</p>
                    <div className="mt-1">
                      <a href={sub.fileUrl} download={sub.fileName} className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 underline hover:text-blue-800">
                        <Download className="h-4 w-4" /> Download Completed File: {sub.fileName}
                      </a>
                    </div>
                    {sub.notes && <p className="mt-1 text-xs italic text-slate-500">Notes: "{sub.notes}"</p>}
                    
                    <div className="mt-3 flex items-center gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500">Grade (Max {gradingAssignment.maxPoints || 100})</label>
                        <input
                          type="number"
                          value={grades[sub.id] ?? ''}
                          onChange={(e) => setGrades({ ...grades, [sub.id]: e.target.value })}
                          className="mt-1 w-24 rounded-lg border border-slate-200 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] uppercase font-bold text-slate-500">Feedback</label>
                        <input
                          type="text"
                          value={feedbackNotes[sub.id] ?? ''}
                          onChange={(e) => setFeedbackNotes({ ...feedbackNotes, [sub.id]: e.target.value })}
                          placeholder="Optional feedback..."
                          className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <button
                        onClick={() => handleSaveGrade(sub.id)}
                        className="mt-4 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setGradingAssignment(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}