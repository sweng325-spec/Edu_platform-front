import API from './axios';

export const coursesApi = {
  list: () => API.get('courses/'),
  getById: (courseId) => API.get(`courses/${courseId}/`),
  getTeacherMyCourses: () => API.get('courses/teachers/my-courses/'),
  create: (course) => {
    if (course instanceof FormData) {
      return API.post('courses/', course);
    }

    const formData = new FormData();
    formData.append('title', course.title ?? '');
    formData.append('description', course.description ?? '');
    if (course.image) {
      formData.append('image', course.image);
    }
    return API.post('courses/', formData);
  },
  enroll: (courseId) => API.post(`courses/${courseId}/enroll/`),
  getmyCourses: (studentId) => API.get(`courses/students/${studentId}/courses`),
  getCourseStudents: (courseId) => API.get(`courses/${courseId}/students/`),
  getCourseMaterials: (courseId) => API.get(`courses/${courseId}/materials/`),
  
  // Update or add file upload endpoint
  addCourseMaterial: (courseId, formData) =>
    API.post(`courses/${courseId}/materials/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  getCourseAnnouncements: (courseId) => API.get(`courses/${courseId}/announcements/`),
  // Add this inside your coursesApi object
  deleteCourseMaterial: (courseId, materialId) => 
    API.delete(`courses/materials/${materialId}/`),

  getFolders: (courseId) => 
    API.get(`courses/${courseId}/folders/`),
};
