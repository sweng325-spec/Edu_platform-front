import React, { createContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth';
import { roleHome } from '../utils/roles';

export const AuthContext = createContext();

const getAuthErrorMessage = (error, fallback) => {
  if (error?.userMessage) return error.userMessage;
  if (error?.response?.data?.detail) return error.response.data.detail;
  if (error?.message) return error.message;
  return fallback;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user_data');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem('user_data');
      return null;
    }
  });

  const login = async (email, password) => {
    try {
      const response = await authApi.login({ email, password });
      const { access, refresh, user } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_data', JSON.stringify(user));

      setUser(user);
      return { user, home: roleHome(user?.role) };
    } catch (error) {
      throw new Error(getAuthErrorMessage(error, 'Invalid email or password.'));
    }
  };

  const register = async (username, email, password, role) => {
    try {
      const response = await authApi.register({ username, email, password, role });
      const { access, refresh, user } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_data', JSON.stringify(user));

      setUser(user);
      return { user, home: roleHome(user?.role) };
    } catch (error) {
      throw new Error(getAuthErrorMessage(error, 'Registration failed. Please try again.'));
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  useEffect(() => {
    const handleExpiredSession = () => logout();
    window.addEventListener('auth:expired', handleExpiredSession);
    return () => window.removeEventListener('auth:expired', handleExpiredSession);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), role: user?.role, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
