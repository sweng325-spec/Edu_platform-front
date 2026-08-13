import API from './axios';

export const authApi = {
  login: (credentials) => API.post('users/login/', credentials),
  register: (account) => API.post('users/register/', account),
};
