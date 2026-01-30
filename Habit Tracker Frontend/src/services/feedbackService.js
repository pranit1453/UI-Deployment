import api from './api';

const feedbackService = {
  async submit(data) {
    const response = await api.post('/feedback', data);
    return response.data;
  },
};

export default feedbackService;
