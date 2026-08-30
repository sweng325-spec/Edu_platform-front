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
  update: (courseId, course) => {
    if (course instanceof FormData) {
      return API.patch(`courses/${courseId}/`, course);
    }

    const formData = new FormData();
    if (course.title !== undefined) formData.append('title', course.title ?? '');
    if (course.description !== undefined) formData.append('description', course.description ?? '');
    if (course.image) {
      formData.append('image', course.image);
    }
    return API.patch(`courses/${courseId}/`, formData);
  },
  delete: (courseId) => API.delete(`courses/${courseId}/`),
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
  getCourseAnnouncements: (courseId) => API.get(`courses/${courseId}/notifications/`),
  postCourseAnnouncements: (courseId, announcementData) => API.post(`courses/${courseId}/notifications/`, announcementData),
  updateCourseNotifications: (courseId) => API.patch(`courses/${courseId}/notifications/read-all/`),
  updateOneCourseNotifcation: (notificationId) => API.patch(`courses/notifications/${notificationId}/read/`),
  // Add this inside your coursesApi object
  deleteCourseMaterial: (courseId, materialId) => 
    API.delete(`courses/materials/${materialId}/`),

  getFolders: (courseId) => 
    API.get(`courses/${courseId}/folders/`),

  // Add this inside your coursesApi object
  createFolder: (courseId, folderData) =>
  API.post(`courses/${courseId}/folders/`, folderData),
};
