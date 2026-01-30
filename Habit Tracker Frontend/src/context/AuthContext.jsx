import { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    const userObj = data.user || {
      userId: data.userId,
      username: data.username,
      role: data.role,
    };
    setUser(userObj);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Resolve user from state or localStorage so role is correct immediately after login (before state flushes)
  const resolvedUser = user ?? authService.getCurrentUser();
  const role = (resolvedUser?.role ?? resolvedUser?.Role ?? '').toUpperCase();

  const value = {
    user: resolvedUser,
    role,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!localStorage.getItem('token'),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
