import api from './api';

const categoryService = {
  async getAllCategories() {
    const response = await api.get('/categories');
    return response.data;
  },

  async getCategoryById(categoryId) {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data;
  },

  async createCategory(data) {
    const response = await api.post('/categories', data);
    return response.data;
  },

  async updateCategory(categoryId, data) {
    const response = await api.put(`/categories/${categoryId}`, data);
    return response.data;
  },

  async deleteCategory(categoryId) {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  },
};

export default categoryService;
