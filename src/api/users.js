import API from './axios';

export const usersApi = {
  getAdminAnalytics: () => API.get('users/admin/analytics/'),
  listAdminUsers: () => API.get('users/admin/users/'),
  setUserStatus: (userId, is_active) =>
    API.patch(`users/admin/users/${userId}/status/`, { is_active }),

  getUserProfile: (userId) => API.get(`users/profile/`),
  updatePassword: (data) => API.post('users/change-password/', data),
};
