import api from '../api/axios';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const recipeService = {
  getAll: () => api.get('/recipes'),
  getById: (id) => api.get(`/recipes/${id}`),
  create: (data) => api.post('/recipes', data),
};

export const mealPlanService = {
  getWeekly: (startDate, endDate) => api.get('/meals', { params: { startDate, endDate } }),
  addMeal: (data) => api.post('/meals', data),
  removeMeal: (id) => api.delete(`/meals/${id}`),
};

export const shoppingListService = {
  generate: (data) => api.post('/shopping-list/generate', data),
  get: () => api.get('/shopping-list'),
  toggle: (id, status) => api.patch(`/shopping-list/${id}`, { comprado: status }),
  delete: (id) => api.delete(`/shopping-list/${id}`),
  clear: () => api.delete('/shopping-list/clear'),
};

export const ingredientService = {
  getAll: () => api.get('/ingredients'),
};
