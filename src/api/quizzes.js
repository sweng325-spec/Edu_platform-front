import API from './axios';
import { coursesApi } from './courses';
import { extractCoursesList } from '../utils/media';
import { quizStorage } from '../utils/quizStorage';
import { extractQuizzesList, normalizeQuiz } from '../utils/quizzes';

async function tryApi(fn, fallback) {
  try {
    const response = await fn();
    return response?.data ?? response;
  } catch {
    return fallback();
  }
}

export const quizzesApi = {
  getByCourse: async (courseId) => {
    const remote = await tryApi(
      () => API.get(`courses/${courseId}/quizzes/`),
      () => quizStorage.getQuizzesByCourse(courseId)
    );
    return extractQuizzesList(remote).map(normalizeQuiz);
  },

  getById: async (quizId) => {
    const local = quizStorage.getQuizById(quizId);
    const remote = await tryApi(
      () => API.get(`courses/quizzes/${quizId}/`),
      () => local
    );
    return normalizeQuiz(remote) || local;
  },

  getForStudent: async (studentId) => {
    let courseIds = [];
    try {
      const res = await coursesApi.getmyCourses(studentId);
      const courses = extractCoursesList(res?.data);
      courseIds = courses.map((c) => c.id || c.course);
    } catch {
      courseIds = [];
    }

    const remote = await tryApi(
      () => API.get(`courses/students/${studentId}/quizzes/`),
      () => quizStorage.getQuizzesForCourses(courseIds)
    );

    const quizzes = extractQuizzesList(remote).map(normalizeQuiz);
    if (quizzes.length) return quizzes;
    return quizStorage.getQuizzesForCourses(courseIds).map(normalizeQuiz);
  },

  create: async (quizData) => {
    const remote = await tryApi(
      () => API.post(`courses/${quizData.courseId}/quizzes/`, {
        title: quizData.title,
        description: quizData.description,
        due_date: quizData.deadline,
        time_limit_minutes: quizData.timeLimitMinutes,
        max_attempts: quizData.maxAttempts || 1,
        is_published: quizData.published ?? false,
        questions: quizData.questions,
      }),
      () => quizStorage.createQuiz(quizData)
    );
    return normalizeQuiz(remote) || quizStorage.createQuiz(quizData);
  },

  update: async (quizId, quizData) => {
    const remote = await tryApi(
      () => API.patch(`courses/quizzes/${quizId}/`, quizData),
      () => quizStorage.updateQuiz(quizId, quizData)
    );
    return normalizeQuiz(remote) || quizStorage.updateQuiz(quizId, quizData);
  },

  delete: async (quizId) => {
    await tryApi(
      () => API.delete(`courses/quizzes/${quizId}/`),
      () => {
        quizStorage.deleteQuiz(quizId);
        return null;
      }
    );
    quizStorage.deleteQuiz(quizId);
  },

  publish: async (quizId, { courseTitle, studentIds }) => {
    await tryApi(
      () => API.post(`courses/quizzes/${quizId}/publish/`),
      () => null
    );

    const quiz = quizStorage.publishQuiz(quizId, { courseTitle, studentIds });

    if (quiz) {
      studentIds.forEach(async (studentId) => {
        try {
          await coursesApi.postCourseAnnouncements(quiz.courseId, {
            title: `New quiz: ${quiz.title}`,
            content: `A new quiz "${quiz.title}" is available. Deadline: ${quiz.deadline}`,
            notification_type: 'QUIZ',
            quiz_id: quiz.id,
            student_id: studentId,
          });
        } catch {
          // Local notification already created in quizStorage
        }
      });
    }

    return quiz;
  },

  startAttempt: async (quizId, studentId) => {
    const remote = await tryApi(
      () => API.post(`courses/quizzes/${quizId}/start/`),
      () => quizStorage.startAttempt(quizId, studentId)
    );
    return remote || quizStorage.startAttempt(quizId, studentId);
  },

  submitAttempt: async (attemptId, answers) => {
    const remote = await tryApi(
      () => API.post(`courses/quizzes/attempts/${attemptId}/submit/`, { answers }),
      () => quizStorage.submitAttempt(attemptId, answers)
    );
    return remote || quizStorage.submitAttempt(attemptId, answers);
  },

  getAttempt: async (quizId, studentId) => {
    const remote = await tryApi(
      () => API.get(`courses/quizzes/${quizId}/attempt/`),
      () => quizStorage.getAttempt(quizId, studentId)
    );
    return remote || quizStorage.getAttempt(quizId, studentId);
  },

  getStudentNotifications: (studentId) =>
    quizStorage.getNotificationsForStudent(studentId),

  markNotificationRead: async (notificationId) => {
    quizStorage.markNotificationRead(notificationId);
    try {
      await coursesApi.updateOneCourseNotifcation(notificationId);
    } catch {
      // Local-only notification
    }
  },

  getQuizForStudent: (quizId) => quizStorage.stripCorrectAnswers(quizStorage.getQuizById(quizId)),
};