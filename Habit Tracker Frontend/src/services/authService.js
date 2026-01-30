import api from './api';

const authService = {
  async register(data) {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      const user = response.data.user || {
        userId: response.data.userId,
        username: response.data.username,
        role: response.data.role,
      };
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(data) {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  async sendVerificationEmail(email) {
    const response = await api.post('/auth/send-verification-email', { email });
    return response.data;
  },

  async verifyEmail(email, otp) {
    const response = await api.post('/auth/verify-email', { email, otp });
    return response.data;
  },

  logout() {
    // Only clear remembered username if user didn't check Remember Me
    // This ensures username persists across sessions when Remember Me was enabled
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
};

export default authService;
