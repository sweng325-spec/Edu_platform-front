import API from './axios';

export const coursesApi = {
  list: () => API.get('courses/'),
  create: (course) => API.post('courses/', course),
  enroll: (courseId) => API.post(`courses/${courseId}/enroll/`),
};
