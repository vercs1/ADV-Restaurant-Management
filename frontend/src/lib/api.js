import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      const status = error.response?.status;
      const url = `${error.config?.baseURL}${error.config?.url}`;
      
      if (error.response) {
        console.error(`[API Error] ${status} - ${url}`);
      } else if (error.request) {
        console.error('[API Error] No response - Is the backend running?');
      }
    }
    return Promise.reject(error);
  }
);

export const menuAPI = {
  getAll: (params = {}) => api.get('/menus', { params }),
  getById: (id) => api.get(`/menus/${id}`),
  create: (data) => api.post('/menus', data),
  update: (id, data) => api.put(`/menus/${id}`, data),
  delete: (id) => api.delete(`/menus/${id}`),
  getCategories: () => api.get('/menus/categories'),
};

export const orderAPI = {
  getAll: (params = {}) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
};

export const orderItemAPI = {
  getByOrderId: (orderId) => api.get(`/order-items/order/${orderId}`),
  getById: (id) => api.get(`/order-items/${id}`),
  create: (data) => api.post('/order-items', data),
  update: (id, data) => api.put(`/order-items/${id}`, data),
  delete: (id) => api.delete(`/order-items/${id}`),
};

export default api;
