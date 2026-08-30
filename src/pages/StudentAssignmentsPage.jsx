import { useContext, useEffect, useState } from 'react';
import { CalendarDays, FileText, CheckCircle2, Upload, Download } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { coursesApi } from '../api/courses';
import { extractCoursesList } from '../utils/media';
import { assignmentStorage } from '../utils/assignmentStorage';

export default function StudentAssignmentsPage() {
  const { user } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, submitted, graded
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  
  // Submission form state
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const coursesRes = await coursesApi.getmyCourses(user.id);
      const courses = extractCoursesList(coursesRes?.data);
      const courseIds = courses.map((c) => String(c.id || c.course || c.courseId));
      const courseMap = Object.fromEntries(
        courses.map((c) => [String(c.id || c.course || c.courseId), c.title || c.course_title || 'Course'])
      );

      const rawAssignments = assignmentStorage.getAssignmentsForCourses(courseIds);

      const enriched = rawAssignments.map((assignment) => {
        const submission = assignmentStorage.getSubmission(assignment.id, user.id);
        let status = 'upcoming';
        if (submission) {
          status = submission.status === 'graded' ? 'graded' : 'submitted';
        } else if (new Date(assignment.deadline) < new Date()) {
          status = 'missing';
        }
        return {
          ...assignment,
          courseTitle: courseMap[String(assignment.courseId)] || 'Course',
          submission,
          status,
        };
      });

      setAssignments(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleStudentFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const fileObjectURL = URL.createObjectURL(file);
      setFileUrl(fileObjectURL);
    }
  };

  const handleSubmitWork = (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    assignmentStorage.submitAssignment(selectedAssignment.id, user.id, { 
      fileUrl: fileUrl || '#', 
      fileName: fileName || 'Completed_Assignment.pdf', 
      notes 
    });
    setSelectedAssignment(null);
    setFileUrl('');
    setFileName('');
    setNotes('');
    loadData();
  };

  const filteredAssignments = assignments.filter((a) => {
    if (activeTab === 'upcoming') return a.status === 'upcoming' || a.status === 'missing';
    if (activeTab === 'submitted') return a.status === 'submitted';
    if (activeTab === 'graded') return a.status === 'graded';
    return true;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <section className="rounded-[30px] bg-[#123f30] px-6 py-8 text-white shadow-[0_18px_45px_-24px_rgba(17,74,54,0.8)] sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#d9edc7]">Student area</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Assignments</h1>
        <p className="mt-2 max-w-xl text-sm text-emerald-50/90">
          Download assignment files from your instructors, complete them, and re-upload your finished work.
        </p>
      </section>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        {['upcoming', 'submitted', 'graded'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${
              activeTab === tab
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="rounded-[24px] border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <FileText className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-3 text-sm text-slate-500">No assignments found in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <article key={assignment.id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">{assignment.courseTitle}</span>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{assignment.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{assignment.description}</p>
                  
                  {/* Instructor Attachment Download Button */}
                  {assignment.attachmentUrl && (
                    <div className="mt-2">
                      <a
                        href={assignment.attachmentUrl}
                        download={assignment.attachmentName}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 underline hover:text-emerald-800 dark:text-emerald-400"
                      >
                        <Download className="h-4 w-4" /> Download Assignment Prompt ({assignment.attachmentName})
                      </a>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4 text-emerald-600" /> Due: {new Date(assignment.deadline).toLocaleString()}
                    </span>
                    <span>Max Points: {assignment.maxPoints || 100}</span>
                  </div>

                  {assignment.submission?.status === 'graded' && (
                    <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                      <p className="font-semibold">Grade: {assignment.submission.grade} / {assignment.maxPoints || 100}</p>
                      {assignment.submission.feedback && <p className="mt-1 italic">Feedback: "{assignment.submission.feedback}"</p>}
                    </div>
                  )}
                </div>

                <div>
                  {assignment.status === 'upcoming' || assignment.status === 'missing' ? (
                    <button
                      onClick={() => setSelectedAssignment(assignment)}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                    >
                      <Upload className="h-4 w-4" /> Upload Finished Work
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      <CheckCircle2 className="h-4 w-4" /> Submitted ({assignment.submission?.fileName})
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-xl dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Submit: {selectedAssignment.title}</h2>
            <form onSubmit={handleSubmitWork} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Upload Completed PDF</label>
                <input
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={handleStudentFileChange}
                  className="mt-1 w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {fileName && <p className="mt-1 text-xs text-emerald-600">File ready: {fileName}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Comments / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Optional notes for instructor..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                >
                  Send to Instructor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}