import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://160.60.60.32:8000/api/',
});

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (typeof data === 'string') return data;
  if (data?.detail) return data.detail;
  if (data?.message) return data.message;
  if (data?.error) return data.error;

  if (data?.errors) {
    if (Array.isArray(data.errors)) return data.errors.join(' ');
    if (typeof data.errors === 'object') {
      return Object.values(data.errors)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .join(' ');
    }
  }

  if (data && typeof data === 'object') {
    const stringValue = Object.values(data).find((value) => typeof value === 'string');
    if (stringValue) return stringValue;

    const nestedValue = Object.values(data).find((value) => Array.isArray(value) && value.length);
    if (nestedValue) return nestedValue.join(' ');
  }

  if (error?.message) return error.message;
  return 'Something went wrong. Please try again.';
};

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    error.userMessage = getErrorMessage(error);
    if (error?.response?.status === 401 && localStorage.getItem('access_token')) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);

export default API;
