import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5105/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');

  // 👇 Skip token for public auth routes
  const publicRoutes = [
    '/auth/login',
    '/auth/signup',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
    '/auth/send-verification-email',
    '/feedback',
  ];

  const isPublic = publicRoutes.some(route =>
    config.url?.includes(route)
  );

  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle auth errors

api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    const publicRoutes = [
      '/auth/login',
      '/auth/signup',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/verify-email',
      '/auth/send-verification-email',
      '/feedback',
    ];

    const isPublic = publicRoutes.some(route => url.includes(route));

    if (status === 401 && !isPublic) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.replace('/login');
    }

    if (status === 403) {
      const user = (() => {
        try {
          return JSON.parse(localStorage.getItem('user') || '{}');
        } catch { return {}; }
      })();
      const role = (user?.role ?? user?.Role ?? '').toUpperCase();
      if (url.includes('/admin')) {
        window.location.replace('/dashboard');
      } else if (role === 'ADMIN') {
        window.location.replace('/admin');
      } else {
        window.location.replace('/');
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);


export default api;
