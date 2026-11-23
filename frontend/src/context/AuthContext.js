import React, { createContext, useContext, useState } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('leavetrack_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const userData = response.data;
    localStorage.setItem('leavetrack_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('leavetrack_user');
    setUser(null);
    window.location.href = '/login';
  };

  const isRole = (role) => {
    return user && user.role === role;
  };

  const isAdmin = () => isRole('ROLE_ADMIN');
  const isManager = () => isRole('ROLE_MANAGER') || isRole('ROLE_ADMIN');
  const isEmployee = () => isRole('ROLE_EMPLOYEE');

  return (
    <AuthContext.Provider value={{ user, login, logout, isRole, isAdmin, isManager, isEmployee }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
