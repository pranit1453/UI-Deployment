import api from './api';

const habitService = {
  async getAllHabits() {
    const response = await api.get('/habits');
    return response.data;
  },

  async getHabitById(habitId) {
    const response = await api.get(`/habits/${habitId}`);
    return response.data;
  },

  async createHabit(data) {
    const response = await api.post('/habits', data);
    return response.data;
  },

  async updateHabit(habitId, data) {
    const response = await api.put(`/habits/${habitId}`, data);
    return response.data;
  },

  async toggleHabitStatus(habitId) {
    const response = await api.patch(`/habits/${habitId}/status`);
    return response.data;
  },

  async deleteHabit(habitId) {
    const response = await api.delete(`/habits/${habitId}`);
    return response.data;
  },

  // Habit Log Management
  async getHabitLogs(habitId, startDate, endDate) {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get(`/habits/${habitId}/logs`, { params });
    return response.data;
  },

  async getHabitLogByDate(habitId, date) {
    const response = await api.get(`/habits/${habitId}/logs/${date}`);
    return response.data;
  },

  async deleteHabitLog(habitId, date) {
    const response = await api.delete(`/habits/${habitId}/logs/${date}`);
    return response.data;
  },
};

export default habitService;
