import api from './api';

const habitLogService = {
  async logHabit(habitId, data) {
    // Backend expects: { status: 'DONE' | 'SKIPPED' | 'PENDING', remarks?: string, logDate?: DateOnly }
    const logData = {
      status: data.status,
      remarks: data.remarks || null,
      logDate: data.date || null,
    };
    const response = await api.post(`/habits/${habitId}/logs`, logData);
    return response.data;
  },

  async getHabitLog(habitId, date) {
    // date should be in YYYY-MM-DD format
    const response = await api.get(`/habits/${habitId}/logs/${date}`);
    return response.data;
  },

  async deleteHabitLog(habitId, date) {
    // date should be in YYYY-MM-DD format
    const response = await api.delete(`/habits/${habitId}/logs/${date}`);
    return response.data;
  },
};

export default habitLogService;
