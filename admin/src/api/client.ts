import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

export const dashboardApi = {
  stats: () => api.get('/admin/dashboard/stats').then((r) => r.data),
};

export const crudApi = (resource: string) => ({
  list: () => api.get(`/admin/${resource}`).then((r) => r.data),
  get: (id: string) => api.get(`/admin/${resource}/${id}`).then((r) => r.data),
  create: (data: unknown) => api.post(`/admin/${resource}`, data).then((r) => r.data),
  update: (id: string, data: unknown) =>
    api.patch(`/admin/${resource}/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/admin/${resource}/${id}`).then((r) => r.data),
});
