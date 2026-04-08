import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({ baseURL: '/api', timeout: 15000 });

api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('smartaccounts-auth');
    if (stored) {
      const { state } = JSON.parse(stored);
      if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
    }
  } catch {}
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || 'Something went wrong';
    if (err.response?.status === 401) {
      localStorage.removeItem('smartaccounts-auth');
      window.location.href = '/login';
      return Promise.reject(err);
    }
    if (err.response?.status !== 404) toast.error(msg);
    return Promise.reject(err);
  }
);

export default api;

export const authAPI = {
  register: (d) => api.post('/auth/register', d),
  login: (d) => api.post('/auth/login', d),
  me: () => api.get('/auth/me'),
  updateProfile: (d) => api.put('/auth/profile', d),
  changePassword: (d) => api.put('/auth/change-password', d),
  switchBusiness: (id) => api.put(`/auth/switch-business/${id}`),
};

export const businessAPI = {
  getAll: () => api.get('/businesses'),
  create: (d) => api.post('/businesses', d),
  update: (id, d) => api.put(`/businesses/${id}`, d),
  delete: (id) => api.delete(`/businesses/${id}`),
};

export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  get: (id) => api.get(`/transactions/${id}`),
  create: (d) => api.post('/transactions', d),
  update: (id, d) => api.put(`/transactions/${id}`, d),
  delete: (id) => api.delete(`/transactions/${id}`),
  summary: (params) => api.get('/transactions/summary', { params }),
};

export const invoiceAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  get: (id) => api.get(`/invoices/${id}`),
  create: (d) => api.post('/invoices', d),
  update: (id, d) => api.put(`/invoices/${id}`, d),
  delete: (id) => api.delete(`/invoices/${id}`),
  recordPayment: (id, d) => api.post(`/invoices/${id}/payment`, d),
  stats: (params) => api.get('/invoices/stats', { params }),
};

export const inventoryAPI = {
  getAll: (params) => api.get('/inventory', { params }),
  get: (id) => api.get(`/inventory/${id}`),
  create: (d) => api.post('/inventory', d),
  update: (id, d) => api.put(`/inventory/${id}`, d),
  delete: (id) => api.delete(`/inventory/${id}`),
  adjustStock: (id, d) => api.post(`/inventory/${id}/stock`, d),
  stats: (params) => api.get('/inventory/stats', { params }),
};

export const reportAPI = {
  dashboard: (params) => api.get('/reports/dashboard', { params }),
  pl: (params) => api.get('/reports/pl', { params }),
  monthlyTrend: (params) => api.get('/reports/monthly-trend', { params }),
  categoryBreakdown: (params) => api.get('/reports/category-breakdown', { params }),
  export: (params) => api.get('/reports/export', { params }),
};

export const categoryAPI = {
  getAll: (params) => api.get('/categories', { params }),
  create: (d) => api.post('/categories', d),
  update: (id, d) => api.put(`/categories/${id}`, d),
  delete: (id) => api.delete(`/categories/${id}`),
};
