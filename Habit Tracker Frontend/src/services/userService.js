import api from './api';

const userService = {
  async getProfile() {
    const response = await api.get('/users/me');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  async toggleEmailNotifications(enabled) {
    const response = await api.post('/users/toggle-notifications', enabled);
    return response.data;
  },
};

export default userService;
