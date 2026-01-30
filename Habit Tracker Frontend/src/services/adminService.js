import api from './api';

const adminService = {
  async getUserCount() {
    const response = await api.get('/admin/users/count');
    return response.data;
  },

  async getUsers() {
    const response = await api.get('/admin/users');
    return response.data;
  },

  async getUsersDetailed() {
    const response = await api.get('/admin/users/detailed');
    return response.data;
  },

  async getStatistics() {
    const response = await api.get('/admin/statistics');
    return response.data;
  },

  async getFeedback() {
    const response = await api.get('/admin/feedback');
    return response.data;
  },
};

export default adminService;
