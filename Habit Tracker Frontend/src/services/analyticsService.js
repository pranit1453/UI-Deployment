import api from './api';

const analyticsService = {
  async getAnalytics(startDate, endDate) {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/analytics', { params });
    return response.data;
  },

  async getDailyAnalytics(date) {
    const params = date ? { date } : {};
    const response = await api.get('/analytics/daily', { params });
    return response.data;
  },

  async getWeeklyAnalytics(weekStart) {
    const params = weekStart ? { weekStart } : {};
    const response = await api.get('/analytics/weekly', { params });
    return response.data;
  },

  async getMonthlyAnalytics(year, month) {
    const params = {};
    if (year) params.year = year;
    if (month) params.month = month;
    const response = await api.get('/analytics/monthly', { params });
    return response.data;
  },

  async getCategoryAnalytics(startDate, endDate) {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/analytics/categories', { params });
    return response.data;
  },

  async getStreakTrend(habitId, startDate, endDate) {
    const params = {};
    if (habitId) params.habitId = habitId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/analytics/streak-trend', { params });
    return response.data;
  },

  // Additional analytics methods for enhanced functionality
  async getHabitPerformance(habitId, period = '30d') {
    const response = await api.get(`/analytics/habits/${habitId}/performance`, { 
      params: { period } 
    });
    return response.data;
  },

  async getComparisonAnalytics(habitIds, startDate, endDate) {
    const response = await api.post('/analytics/compare', {
      habitIds,
      startDate,
      endDate
    });
    return response.data;
  },

  async exportAnalytics(format = 'csv', startDate, endDate) {
    const params = { format };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/analytics/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};

export default analyticsService;
