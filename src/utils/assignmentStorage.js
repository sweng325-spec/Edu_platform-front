const STORAGE_KEY = 'daltex.assignments.v1';

const makeId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { assignments: [], submissions: [] };
    const parsed = JSON.parse(raw);
    return {
      assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [],
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
    };
  } catch {
    return { assignments: [], submissions: [] };
  }
}

function writeAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const assignmentStorage = {
  getAssignmentsByCourse(courseId) {
    return readAll().assignments.filter((a) => String(a.courseId) === String(courseId));
  },

  getAssignmentsForCourses(courseIds) {
    const ids = new Set(courseIds.map(String));
    return readAll().assignments.filter(
      (a) => a.published && ids.has(String(a.courseId))
    );
  },

  createAssignment(assignment) {
    const data = readAll();
    const newAssignment = {
      id: makeId('assignment'),
      published: false,
      createdAt: new Date().toISOString(),
      ...assignment, // expects title, description, deadline, maxPoints, attachmentUrl, attachmentName
    };
    data.assignments = [newAssignment, ...data.assignments];
    writeAll(data);
    return newAssignment;
  },

  publishAssignment(assignmentId) {
    const data = readAll();
    const index = data.assignments.findIndex((a) => String(a.id) === String(assignmentId));
    if (index === -1) return null;

    data.assignments[index] = {
      ...data.assignments[index],
      published: true,
      publishedAt: new Date().toISOString(),
    };
    writeAll(data);
    return data.assignments[index];
  },

  deleteAssignment(assignmentId) {
    const data = readAll();
    data.assignments = data.assignments.filter((a) => String(a.id) !== String(assignmentId));
    data.submissions = data.submissions.filter((s) => String(s.assignmentId) !== String(assignmentId));
    writeAll(data);
  },

  getSubmissionsForAssignment(assignmentId) {
    return readAll().submissions.filter((s) => String(s.assignmentId) === String(assignmentId));
  },

  getSubmission(assignmentId, studentId) {
    return (
      readAll().submissions.find(
        (s) =>
          String(s.assignmentId) === String(assignmentId) &&
          String(s.studentId) === String(studentId)
      ) || null
    );
  },

  submitAssignment(assignmentId, studentId, { fileUrl, fileName, notes }) {
    const data = readAll();
    const existingIndex = data.submissions.findIndex(
      (s) =>
        String(s.assignmentId) === String(assignmentId) &&
        String(s.studentId) === String(studentId)
    );

    const submission = {
      id: existingIndex >= 0 ? data.submissions[existingIndex].id : makeId('sub'),
      assignmentId: String(assignmentId),
      studentId: String(studentId),
      fileUrl: fileUrl || '',
      fileName: fileName || 'Completed_Assignment.pdf',
      notes: notes || '',
      submittedAt: new Date().toISOString(),
      grade: existingIndex >= 0 ? data.submissions[existingIndex].grade : null,
      feedback: existingIndex >= 0 ? data.submissions[existingIndex].feedback : '',
      status: 'submitted',
    };

    if (existingIndex >= 0) {
      data.submissions[existingIndex] = submission;
    } else {
      data.submissions.unshift(submission);
    }

    writeAll(data);
    return submission;
  },

  gradeSubmission(submissionId, { grade, feedback }) {
    const data = readAll();
    const index = data.submissions.findIndex((s) => String(s.id) === String(submissionId));
    if (index === -1) return null;

    data.submissions[index] = {
      ...data.submissions[index],
      grade: Number(grade),
      feedback: feedback || '',
      status: 'graded',
    };
    writeAll(data);
    return data.submissions[index];
  }
};