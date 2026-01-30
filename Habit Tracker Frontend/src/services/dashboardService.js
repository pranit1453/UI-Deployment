import api from './api';

const dashboardService = {
  async getDashboard(date = null) {
    const params = date ? { date } : {};
    const response = await api.get('/dashboard', { params });
    return response.data;
  },
};

export default dashboardService;
