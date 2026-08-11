import React, { createContext, useState } from 'react';
import API from '../api/axios';

export const AuthContext = createContext();

const getAuthErrorMessage = (error, fallback) => {
  if (error?.userMessage) return error.userMessage;
  if (error?.response?.data?.detail) return error.response.data.detail;
  if (error?.message) return error.message;
  return fallback;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_data');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password) => {
    try {
      const response = await API.post('users/login/', { email, password });
      const { access, refresh, user } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_data', JSON.stringify(user));

      setUser(user);
      return user;
    } catch (error) {
      throw new Error(getAuthErrorMessage(error, 'Invalid email or password.'));
    }
  };

  const register = async (username, email, password, role) => {
    try {
      const response = await API.post('users/register/', { username, email, password, role });
      const { access, refresh, user } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_data', JSON.stringify(user));

      setUser(user);
      return user;
    } catch (error) {
      throw new Error(getAuthErrorMessage(error, 'Registration failed. Please try again.'));
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};