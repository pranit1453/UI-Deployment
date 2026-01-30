import api from './api';

const reminderService = {
  async toggleReminder(habitId, enabled) {
    const response = await api.post(`/reminders/toggle/${habitId}`, enabled);
    return response.data;
  },

  async sendMissedAlerts() {
    const response = await api.post('/reminders/send-missed-alerts');
    return response.data;
  },

  async updateReminderTime(habitId, timeString) {
    const response = await api.put(`/reminders/update-time/${habitId}`, timeString);
    return response.data;
  },

  // Additional reminder management methods
  async getReminderSettings(habitId) {
    const response = await api.get(`/reminders/${habitId}`);
    return response.data;
  },

  async getAllReminders() {
    const response = await api.get('/reminders');
    return response.data;
  },

  async bulkUpdateReminders(reminderUpdates) {
    const response = await api.put('/reminders/bulk-update', reminderUpdates);
    return response.data;
  },
};

export default reminderService;
